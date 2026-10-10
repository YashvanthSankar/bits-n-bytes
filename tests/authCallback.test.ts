import { expect, it, vi } from 'vitest';
import { codeFromCallback, consumeAuthCode } from '../src/services/authCallback';
it('rejects foreign, duplicate, missing and error callbacks', () => {
  expect(codeFromCallback('gudtour://auth/callback?code=one')).toBe('one');
  for (const url of ['evil://auth/callback?code=one', 'gudtour://auth/other?code=one', 'gudtour://auth/callback?code=one&code=two', 'gudtour://auth/callback', 'gudtour://auth/callback?code=one&error=denied']) expect(() => codeFromCallback(url)).toThrow();
});
it('browser and Router share one authorization exchange', async () => {
  const exchange = vi.fn(async () => ({ signingIn: true }));
  const first = consumeAuthCode('simultaneous-test-code', exchange);
  const second = consumeAuthCode('simultaneous-test-code', exchange);
  expect(first).toBe(second); await first; expect(exchange).toHaveBeenCalledTimes(1);
});
it('accepts Expo Go codes only for the exact callback used to start login', () => {
  const callback = 'exp://192.168.1.12:8081/--/auth/callback';
  expect(codeFromCallback(callback + '?code=one', callback)).toBe('one');
  for (const url of ['exp://192.168.1.13:8081/--/auth/callback?code=one', callback.replace(':8081', ':8082') + '?code=one', 'gudtour://auth/callback?code=one', callback + '?code=one&code=two', callback + '?code=one#error']) expect(() => codeFromCallback(url, callback)).toThrow();
});
