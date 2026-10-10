import { useAuthActions } from '@convex-dev/auth/react';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ErrorState, LoadingState, Screen } from '../../components/ui';
import { useLocationSession } from '../../session/LocationSession';
import { consumeAuthCode } from '../../services/authCallback';

export default function AuthCallback() {
  const { code } = useLocalSearchParams<{ code?: string | string[] }>(); const { signIn } = useAuthActions();
  const { setSignedOut } = useLocationSession();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    if (typeof code !== 'string') return;
    void consumeAuthCode(code, value => signIn('google', { code: value }))
      .then(() => { if (alive) { setSignedOut(false); router.replace('/location'); } })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [code, signIn, setSignedOut]);
  return <Screen>{failed || typeof code !== 'string' ? <ErrorState onRetry={() => router.replace('/login')} /> : <LoadingState />}</Screen>;
}
