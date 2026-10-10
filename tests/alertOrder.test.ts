import { expect, it } from 'vitest';
import { compareAlerts } from '../src/domain/alertOrder';
it('prioritizes critical emergencies over newer low-severity events with deterministic ties', () => {
 const items = [{id:'z',severity:'LOW' as const,publishedAt:100},{id:'b',severity:'CRITICAL' as const,publishedAt:1},{id:'a',severity:'CRITICAL' as const,publishedAt:1}];
 expect(items.sort(compareAlerts).map(item=>item.id)).toEqual(['a','b','z']);
});
