import { useConvexAuth, useMutation } from 'convex/react';
import { useEffect } from 'react';
import { api } from '../../convex/_generated/api';

/** Refresh own server-configured access after login/session restore; never blocks tourist entry. */
export function AuthorityAccessSync() {
  const { isAuthenticated } = useConvexAuth(); const sync = useMutation(api.authorityAccess.sync);
  useEffect(() => { if (isAuthenticated) void sync({}).catch(() => { /* Explicit settings refresh can retry and display an error. */ }); }, [isAuthenticated, sync]);
  return null;
}
