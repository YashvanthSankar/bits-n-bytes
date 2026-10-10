import { useMutation } from 'convex/react';
import { randomUUID } from 'expo-crypto';
import { POLICY } from '../../domain/policy';
import { api } from '../../../convex/_generated/api';
import { currentIndiaFix } from '../../services/location';
import { useLocationSession } from '../../session/LocationSession';

export function useReportLocation(requirements: { maxAgeMs: number; maxAccuracyM: number } = POLICY.entryFix) {
  const update = useMutation(api.locations.update); const { setFix } = useLocationSession();
  return async () => {
    try {
      const value = await currentIndiaFix(async ({ fix, backgroundPermission }) => {
        await update({ requestId: randomUUID(), fix, foregroundPermission: 'granted', backgroundPermission, source: 'FOREGROUND' });
      }, requirements);
      setFix(value.fix); return value.fix;
    } catch (error) { setFix(null); throw error; }
  };
}
