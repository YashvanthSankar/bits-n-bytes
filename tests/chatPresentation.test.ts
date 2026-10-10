import { expect, it } from 'vitest';
import { chatGroups } from '../src/features/chat/presentation';
const start = new Date(2026, 9, 10, 12).getTime();
const message = (id: string, alias = 'Traveler 1', createdAt = start, own = false) => ({ id, alias, createdAt, own, expiresAt: createdAt + 86400000 });
it('groups adjacent same-sender messages and shows the timestamp only at the end', () => {
  const grouped = chatGroups([message('1'), message('2', undefined, start + 1000), message('3', 'Traveler 2')]);
  expect(grouped.map(({groupStart,groupEnd}) => [groupStart,groupEnd])).toEqual([[true,false],[false,true],[true,true]]);
});
it('keeps a different sender, a long pause and a new day separate', () => {
  const midnight = new Date(2026, 9, 11).getTime();
  for (const pair of [[message('1'),message('2','Traveler 2')], [message('1'),message('2',undefined,start+300001)], [message('1',undefined,midnight-1000),message('2',undefined,midnight)]]) {
    expect(chatGroups(pair).every(item=>item.groupStart && item.groupEnd)).toBe(true);
  }
});
it('does not combine nonadjacent aliases or reverse the original message order', () => {
  const result=chatGroups([message('1'),message('2','Traveler 2'),message('3')]);
  expect(result.map(item=>item.id)).toEqual(['1','2','3']);
  expect(result.every(item=>item.groupStart && item.groupEnd)).toBe(true);
});
