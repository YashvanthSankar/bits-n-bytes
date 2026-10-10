import { NATIVE_AUTH_CALLBACK } from '../domain/authRedirect';

/** The auth browser and Router may both see a redirect; consume the verifier once. */
let last: { code: string; result: Promise<unknown> } | undefined;
export function consumeAuthCode(code: string, exchange: (code: string) => Promise<unknown>): Promise<unknown> {
  if (!code || code.length > 2048) return Promise.reject(new Error('Invalid authorization code'));
  if (last?.code === code) return last.result;
  const result = Promise.resolve().then(() => exchange(code));
  last = { code, result };
  return result;
}
export function codeFromCallback(url: string): string {
  const parsed = new URL(url);
  if (`${parsed.protocol}//${parsed.host}${parsed.pathname}` !== NATIVE_AUTH_CALLBACK || parsed.hash || parsed.searchParams.has('error')) throw new Error('Invalid authorization callback');
  const codes = parsed.searchParams.getAll('code');
  if (codes.length !== 1 || !codes[0]) throw new Error('Missing authorization code');
  return codes[0];
}
