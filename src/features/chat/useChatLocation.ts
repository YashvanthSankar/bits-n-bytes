import { useCallback, useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { randomUUID } from 'expo-crypto';
import { api } from '../../../convex/_generated/api';
import type { LocationFix } from '../../contracts/domain';
import { validateFix } from '../../domain/eligibility';
import { POLICY } from '../../domain/policy';
import { currentIndiaFix, LocationFailure } from '../../services/location';
import { useLocationSession } from '../../session/LocationSession';

/** Reuse admitted fixes; overlapping focus/send/refresh requests share one capture. */
export function useChatLocation() {
  const { fix, setFix } = useLocationSession();
  const latest = useRef(fix);
  useEffect(() => { latest.current = fix; }, [fix]);
  const pending = useRef<Promise<LocationFix> | null>(null);
  const update = useMutation(api.locations.update);
  return useCallback((force = false, requestPermission = false) => {
    if (pending.current) return pending.current;
    if (!force && validateFix(latest.current, Date.now(), POLICY.chatFix).ok) return Promise.resolve(latest.current!);
    const task = (async () => {
      try {
        const value = await currentIndiaFix(async ({ fix, backgroundPermission }) => {
          await update({ requestId: randomUUID(), fix, foregroundPermission: 'granted', backgroundPermission, source: 'FOREGROUND' });
        }, POLICY.chatFix, { preferRecent: true, requestPermission });
        latest.current = value.fix; setFix(value.fix); return value.fix;
      } catch (error) {
        if (error instanceof LocationFailure && ['outside', 'uncertain', 'denied', 'disabled'].includes(error.reason)) { latest.current = null; setFix(null); }
        throw error;
      }
    })();
    pending.current = task;
    void task.finally(() => { if (pending.current === task) pending.current = null; }).catch(() => {});
    return task;
  }, [setFix, update]);
}
