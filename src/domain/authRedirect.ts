/** Only the exact native callback may receive an OAuth exchange code. */
export const NATIVE_AUTH_CALLBACK = 'gudtour://auth/callback';
export function allowedAuthRedirect(redirectTo: string): string {
  if (redirectTo !== NATIVE_AUTH_CALLBACK) throw new Error('Invalid authentication redirect');
  return NATIVE_AUTH_CALLBACK;
}
