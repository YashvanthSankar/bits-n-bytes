export const NATIVE_AUTH_CALLBACK = 'gudtour://auth/callback';
/** Expo Go development redirects must be exact server-configured destinations. */
export function isExpoGoCallback(value: string): boolean {
  try {
    const url = new URL(value);
    return ['exp:', 'exps:'].includes(url.protocol) && !!url.hostname && !url.hostname.includes('*') && !url.username && !url.password
      && url.pathname === '/--/auth/callback' && !url.search && !url.hash && url.href === value;
  } catch { return false; }
}
export function runtimeAuthCallback(generatedUrl: string): string {
  if (isExpoGoCallback(generatedUrl)) return generatedUrl;
  if (/^exps?:/.test(generatedUrl)) throw new Error('Invalid Expo Go callback');
  return NATIVE_AUTH_CALLBACK;
}
export function allowedAuthRedirect(redirectTo: string, expoGoRedirects = ''): string {
  if (redirectTo === NATIVE_AUTH_CALLBACK) return redirectTo;
  const allowed = expoGoRedirects.split(',').map(value => value.trim()).filter(isExpoGoCallback);
  if (!isExpoGoCallback(redirectTo) || !allowed.includes(redirectTo)) throw new Error('Invalid authentication redirect');
  return redirectTo;
}
