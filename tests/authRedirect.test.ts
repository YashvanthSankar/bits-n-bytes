import { expect, it } from 'vitest';
import { allowedAuthRedirect, NATIVE_AUTH_CALLBACK } from '../src/domain/authRedirect';

it('accepts only the exact native OAuth callback', () => {
  expect(allowedAuthRedirect(NATIVE_AUTH_CALLBACK)).toBe(NATIVE_AUTH_CALLBACK);
  for (const bad of ['https://example.com', 'gudtour://auth/callback.evil', 'gudtour://auth/callback?next=evil', 'gudtour://evil', '/']) {
    expect(() => allowedAuthRedirect(bad)).toThrow();
  }
});
