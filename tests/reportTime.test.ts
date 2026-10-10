import { expect, it } from 'vitest';
import { observationTime } from '../src/domain/reportTime';
import { DAY, MINUTE } from '../src/domain/policy';
const now = new Date(2026,9,10,14,30,0,0).getTime();
it('uses the selected relative age from the submission time',()=>{
  expect(observationTime('NOW','TODAY','',now)).toBe(now);
  expect(observationTime('MINUTES_15','TODAY','',now)).toBe(now-15*MINUTE);
  expect(observationTime('MINUTES_30','TODAY','',now)).toBe(now-30*MINUTE);
});
it('accepts an explicit local date/time including exactly 24 hours',()=>{
  expect(observationTime('EARLIER','TODAY','13:30',now)).toBe(now-60*MINUTE);
  expect(observationTime('EARLIER','YESTERDAY','14:30',now)).toBe(now-DAY);
});
it.each(['24:00','13:60','1:30','09','aa:bb',''])('rejects malformed or impossible local time %s',value=>{
  expect(observationTime('EARLIER','TODAY',value,now)).toBeNull();
});
it('rejects future and older-than-24-hour observations',()=>{
  expect(observationTime('EARLIER','TODAY','14:31',now)).toBeNull();
  expect(observationTime('EARLIER','YESTERDAY','14:29',now)).toBeNull();
});
