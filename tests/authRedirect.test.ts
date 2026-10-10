import { expect, it } from 'vitest';
import { allowedAuthRedirect, NATIVE_AUTH_CALLBACK } from '../src/domain/authRedirect';

it('accepts only the exact native OAuth callback', () => {
  expect(allowedAuthRedirect(NATIVE_AUTH_CALLBACK)).toBe(NATIVE_AUTH_CALLBACK);
  for (const bad of ['https://example.com', 'gudtour://auth/callback.evil', 'gudtour://auth/callback?next=evil', 'gudtour://evil', '/']) {
    expect(() => allowedAuthRedirect(bad)).toThrow();
  }
});

it('allows only exact configured Expo Go callbacks while preserving installed builds', () => {
  const callback = 'exp://192.168.1.12:8081/--/auth/callback';
  expect(allowedAuthRedirect(callback, callback)).toBe(callback);
  expect(allowedAuthRedirect(NATIVE_AUTH_CALLBACK, callback)).toBe(NATIVE_AUTH_CALLBACK);
  for (const bad of [callback.replace(':8081', ':8082'), callback.replace('192.168.1.12', 'evil.example'), callback + '?next=evil', callback + '/evil', 'https://evil.example/--/auth/callback']) expect(() => allowedAuthRedirect(bad, callback)).toThrow();
  expect(() => allowedAuthRedirect(callback)).toThrow();
  expect(() => allowedAuthRedirect(callback, 'exp://*:8081/--/auth/callback')).toThrow();
});
it('selects the runtime-generated Expo Go URL and the stable installed scheme', async () => {
  const { runtimeAuthCallback } = await import('../src/domain/authRedirect');
  expect(runtimeAuthCallback('exp://192.168.1.12:8081/--/auth/callback')).toBe('exp://192.168.1.12:8081/--/auth/callback');
  expect(runtimeAuthCallback('gudtour://auth/callback')).toBe(NATIVE_AUTH_CALLBACK);
  expect(() => runtimeAuthCallback('exp://host/other')).toThrow();
});
