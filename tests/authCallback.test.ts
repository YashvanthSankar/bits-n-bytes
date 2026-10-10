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
