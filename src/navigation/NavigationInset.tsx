import { createContext, useContext } from 'react';

/** Measured fixed chrome; entry/report screens outside the tabs reserve no space. */
export const NavigationInset = createContext<number | null>(null);
export function useNavigationInset() { return useContext(NavigationInset); }
