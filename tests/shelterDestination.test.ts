import { expect, it } from 'vitest';
import { coordinates, shelterCopyText, shelterMapsUrl, shelterPhoneUrl } from '../src/domain/shelterDestination';

it('uses a universal destination URL without a key or private tourist origin', () => {
  const url = new URL(shelterMapsUrl({ latitude: 13.0827, longitude: 80.2707 }));
  expect(url.origin).toBe('https://www.google.com'); expect(url.pathname).toBe('/maps/dir/');
  expect([...url.searchParams]).toEqual([['api', '1'], ['destination', '13.0827,80.2707']]);
});
it('copies the displayed shelter address and exact destination rather than the tourist position', () => {
  expect(shelterCopyText({ name: 'Test shelter', address: 'East entrance', point: { latitude: 13.08, longitude: 80.27 } })).toBe('Test shelter\nEast entrance\n13.08,80.27');
  expect(() => coordinates({ latitude: NaN, longitude: 80 })).toThrow('Invalid destination');
  expect(() => shelterMapsUrl({ latitude: 91, longitude: 80 })).toThrow('Invalid destination');
});
it('only creates a dialer URL from a validated public phone number', () => {
  expect(shelterPhoneUrl('+91 (98765) 43210')).toBe('tel:+919876543210');
  for (const phone of ['', 'javascript:alert(1)', '+91;secret', 'tel:123456789', '123']) expect(shelterPhoneUrl(phone)).toBeNull();
});
