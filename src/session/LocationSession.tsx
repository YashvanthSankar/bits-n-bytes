import { createContext, useContext, useState, type PropsWithChildren } from 'react';
import type { LocationFix } from '../contracts/domain';

const Context = createContext<{ fix: LocationFix | null; setFix: (fix: LocationFix | null) => void; signedOut: boolean; setSignedOut: (value: boolean) => void } | null>(null);
/** Current fix stays in memory; no travel history or unencrypted location cache. */
export function LocationSession({ children }: PropsWithChildren) {
  const [fix, setFix] = useState<LocationFix | null>(null);
  const [signedOut, setSignedOut] = useState(false);
  return <Context.Provider value={{ fix, setFix, signedOut, setSignedOut }}>{children}</Context.Provider>;
}
export function useLocationSession() {
  const value = useContext(Context);
  if (!value) throw new Error('LocationSession is required');
  return value;
}
