import { expect, it, vi } from 'vitest';
import { assessIncident, parseChoice, QUALIFICATIONS } from '../convex/providers/jev';
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
