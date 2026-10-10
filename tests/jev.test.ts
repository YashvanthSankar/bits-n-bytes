import { expect, it, vi } from 'vitest';
import { assessIncident, decisionEvidence, parseChoice, QUALIFICATIONS } from '../convex/providers/jev';
const answer=(options:readonly string[],choice:string,p=1,confidence=0.4)=>({type:'choice',choice,confidence,probabilities:Object.fromEntries(options.map(option=>[option,option===choice?p:(1-p)/(options.length-1)]))});
it('reads selected option probability independently from confidence',()=>{
 expect(parseChoice(answer(QUALIFICATIONS,'NOTIFIABLE_EMERGENCY',0.91,0.2),QUALIFICATIONS)).toMatchObject({optionProbability:0.91,confidence:0.2});
 for(const bad of [answer(['NOTIFIABLE_EMERGENCY'],'NOTIFIABLE_EMERGENCY'),{...answer(QUALIFICATIONS,'NOT_QUALIFIED'),confidence:2},{...answer(QUALIFICATIONS,'NOT_QUALIFIED'),choice:'NOTIFIABLE_EMERGENCY'},answer(QUALIFICATIONS,'NOT_QUALIFIED',NaN)])expect(()=>parseChoice(bad,QUALIFICATIONS)).toThrow();
});
it('chains support into the final judgment and rejects wrong models/malformed distributions',async()=>{
 const fetcher=vi.fn<(url:string,init:RequestInit)=>Promise<Response>>().mockImplementation(async(_,init)=>{
  const body=JSON.parse(init.body as string);const answers=Object.fromEntries(Object.entries(body.questions as Record<string,{criteria:Record<string,string>}>).map(([key,q])=>[key,answer(Object.keys(q.criteria),key==='qualification'?'INSUFFICIENT_EVIDENCE':'UNKNOWN')]));
  return new Response(JSON.stringify({model:'jev-1.13',answers,usage:{input_tokens:100,output_tokens:30}}));
 });
 const result=await assessIncident({missingInputs:['weather']},{apiKey:'test-only',fetcher});expect(result).toMatchObject({qualification:'INSUFFICIENT_EVIDENCE',severity:'UNKNOWN',inputTokens:200,outputTokens:60});expect(fetcher).toHaveBeenCalledTimes(2);
 expect(JSON.parse(JSON.parse(fetcher.mock.calls[1]![1].body as string).state)).toHaveProperty('judgments');
 await expect(assessIncident({}, {apiKey:'test-only',fetcher:async()=>new Response(JSON.stringify({model:'other',answers:{}}))})).rejects.toMatchObject({code:'INVALID_RESPONSE'});
});
it('does not make a second call after invalid supporting evidence output',async()=>{
 const fetcher=vi.fn<(url:string,init:RequestInit)=>Promise<Response>>().mockResolvedValue(new Response(JSON.stringify({model:'jev-1.13',answers:{}})));
 await expect(assessIncident({}, {apiKey:'test-only',fetcher})).rejects.toMatchObject({code:'INVALID_RESPONSE'});expect(fetcher).toHaveBeenCalledTimes(1);
});

it('does not send a previous assessment label or suppression control as model evidence',async()=>{
 const fetcher=vi.fn<(url:string,init:RequestInit)=>Promise<Response>>().mockImplementation(async(_,init)=>{
  const body=JSON.parse(init.body as string);
  const answers=Object.fromEntries(Object.entries(body.questions as Record<string,{criteria:Record<string,string>}>).map(([key,q])=>[key,answer(Object.keys(q.criteria),key==='qualification'?'NOTIFIABLE_EMERGENCY':'UNKNOWN')]));
  return new Response(JSON.stringify({model:'jev-1.13',answers}));
 });
 await assessIncident({incident:{priorQualification:'NOT_QUALIFIED',suppressionUntil:123,counts:{recent:2},samples:[{description:'Current dangerous flood'}]}},{apiKey:'test-only',fetcher});
 for(const call of fetcher.mock.calls){const state=JSON.parse(JSON.parse(call[1].body as string).state);expect(state.evidence.incident).toEqual({counts:{recent:2},samples:[{description:'Current dangerous flood'}]});}
});


it('projects equivalent authority evidence identically regardless of operational audience, retaining source boundaries', () => {
 const notice = { noticeId: 'notice-1', revision: 2, title: 'Flood warning', description: 'Water entering homes', instruction: 'Move to designated shelter', issuedAt: 100, expiresAt: 200, geometry: { type: 'circle', radiusM: 1000 }, urgency: 'Immediate', certainty: 'Observed' };
 const incident = { hazard: 'FLOOD', samples: [{ description: 'Water entering homes now' }] };
 const demo = { incident: { ...incident, audience: 'DEMO' }, demoAuthorityNotices: { evidenceLabel: 'DEMO test', partial: true, checkedAt: 150, items: [{ ...notice, issuer: 'DEMO authority', sourceKind: 'DEMO_AUTHORITY_TEST_NOTICE', evidenceLabel: 'DEMO test' }] } };
 const live = { incident: { ...incident, audience: 'LIVE' }, authorityNotices: { partial: true, checkedAt: 150, items: [{ ...notice, issuer: 'Approved agency', sourceKind: 'AUTHORITY_NOTICE' }] } };
 expect(decisionEvidence(demo)).toEqual(decisionEvidence(live));
 expect(decisionEvidence(demo)).toMatchObject({ authorityNotices: { partial: true, items: [{ ...notice, sourceClass: 'APP_AUTHORITY_NOTICE' }] } });
 expect(demo.incident.audience).toBe('DEMO'); // Original routing/provenance is untouched.
});

it('sends the neutral notice evidence in both Jev stages without promising verification', async () => {
 const fetcher = vi.fn<(url: string, init: RequestInit) => Promise<Response>>().mockImplementation(async (_, init) => {
  const body = JSON.parse(init.body as string);
  const answers = Object.fromEntries(Object.entries(body.questions as Record<string, { criteria: Record<string, string> }>).map(([key, q]) => [key, answer(Object.keys(q.criteria), key === 'qualification' ? 'INSUFFICIENT_EVIDENCE' : 'UNKNOWN')]));
  return new Response(JSON.stringify({ model: 'jev-1.13', answers }));
 });
 await assessIncident({ incident: { audience: 'DEMO', hazard: 'FLOOD' }, demoAuthorityNotices: { items: [{ title: 'Flood', issuer: 'DEMO authority', sourceKind: 'DEMO_AUTHORITY_TEST_NOTICE' }] } }, { apiKey: 'test-only', fetcher });
 for (const call of fetcher.mock.calls) {
  const body = JSON.parse(call[1].body as string), state = JSON.parse(body.state);
  expect(state.evidence.authorityNotices.items).toEqual([{ title: 'Flood', sourceClass: 'APP_AUTHORITY_NOTICE' }]);
  expect(body.state).not.toContain('DEMO');
  expect(body.state).not.toContain('demoAuthorityNotices');
  expect(JSON.stringify(body.questions)).toContain('not proof of SACHET origin');
 }
});


it('preserves both notice sources and applies the same evidence standard in both assessment stages', async () => {
 const fetcher = vi.fn<(url: string, init: RequestInit) => Promise<Response>>().mockImplementation(async (_, init) => {
  const body = JSON.parse(init.body as string);
  const answers = Object.fromEntries(Object.entries(body.questions as Record<string, { criteria: Record<string, string> }>).map(([key, q]) => [key, answer(Object.keys(q.criteria), key === 'qualification' ? 'INSUFFICIENT_EVIDENCE' : 'UNKNOWN')]));
  return new Response(JSON.stringify({ model: 'jev-1.13', answers }));
 });
 const official = { items: [{ noticeId: 'sachet-1', headline: 'Flood warning', sentAt: 100, expires: 200, exactGeometryMatched: true }], partial: false };
 const authority = { items: [{ noticeId: 'authority-1', title: 'Flood warning', issuedAt: 100, expiresAt: 200, urgency: 'Immediate', certainty: 'Observed' }], partial: false };
 await assessIncident({ incident: { hazard: 'FLASH_FLOOD' }, official, authorityNotices: authority }, { apiKey: 'test-only', fetcher });
 for (const call of fetcher.mock.calls) {
  const body = JSON.parse(call[1].body as string), state = JSON.parse(body.state);
  expect(state.evidence.official).toEqual(official);
  expect(state.evidence.authorityNotices.items[0]).toMatchObject(authority.items[0]!);
  for (const q of Object.values(body.questions) as { instructions: string }[]) {
   expect(q.instructions).toContain('equal evidentiary standing');
   expect(q.instructions).toContain('Neither source type has an automatic priority, discount or veto');
   expect(q.instructions).toContain('Copied or relayed versions');
   expect(q.instructions).toContain('unresolved material conflict remains uncertainty');
  }
 }
});
