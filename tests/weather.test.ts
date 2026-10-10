import { expect, it, vi } from 'vitest';
import { convexTest } from 'convex-test';
import schema from '../convex/schema';
import { internal } from '../convex/_generated/api';
import { fetchConditions, normalizeConditions, resolveWeatherLocation, WeatherFailure } from '../convex/providers/accuWeather';
const modules=import.meta.glob('../convex/**/*.ts');
const point={latitude:13.08,longitude:80.27};
const sample={EpochTime:Math.floor(Date.now()/1000),WeatherText:'Rain',HasPrecipitation:true,PrecipitationType:'Rain',Temperature:{Metric:{Value:29,Unit:'C'}},Wind:{Speed:{Metric:{Value:12,Unit:'km/h'}}},Precip1hr:{Metric:{Value:2,Unit:'mm'}}};
it('keeps missing and wrong-unit weather values unknown',()=>{
 const [result]=normalizeConditions([sample],1);expect(result).toMatchObject({temperatureC:29,windKmh:12,gustKmh:null,precipitation1hMm:2,hasPrecipitation:true});
 expect(normalizeConditions([{...sample,Temperature:{Metric:{Value:84,Unit:'F'}},HasPrecipitation:undefined}],1)[0]).toMatchObject({temperatureC:null,hasPrecipitation:null});
 for(const value of [[],{},[{WeatherText:'Rain'}],Array(25).fill(sample)])expect(()=>normalizeConditions(value,24)).toThrow();
});
it('uses fixed provider URLs, Bearer headers and explicit provider geography',async()=>{
 const fetcher=vi.fn<(url:string,init:RequestInit)=>Promise<Response>>().mockResolvedValue(new Response(JSON.stringify({Key:'206671',EnglishName:'Chennai',Type:'City',GeoPosition:{Latitude:13.08,Longitude:80.27}})));
 expect(await resolveWeatherLocation(point,{apiKey:'test-only',fetcher})).toMatchObject({locationKey:'206671',providerPoint:point,resolution:'City'});
 expect(fetcher.mock.calls[0]![0]).toContain('https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?q=13.08,80.27');expect(fetcher.mock.calls[0]![0]).not.toContain('test-only');expect(fetcher.mock.calls[0]![1].headers).toEqual({Authorization:'Bearer test-only'});
});
it('preserves current observations when history is unavailable and honors quota delay',async()=>{
 const fetcher=vi.fn<(url:string,init:RequestInit)=>Promise<Response>>().mockResolvedValueOnce(new Response(JSON.stringify([sample]))).mockResolvedValueOnce(new Response(null,{status:403}));
 expect(await fetchConditions('206671',{apiKey:'test-only',fetcher})).toMatchObject({current:{temperatureC:29},history:[],historyAvailability:'CONFIGURATION'});
 const throttled=async()=>new Response(null,{status:429,headers:{'Retry-After':'120'}});
 await expect(resolveWeatherLocation(point,{apiKey:'test-only',fetcher:throttled})).rejects.toMatchObject({code:'QUOTA',retryAfterMs:120000});
 await expect(resolveWeatherLocation(point,{apiKey:undefined})).rejects.toBeInstanceOf(WeatherFailure);
});
it('coalesces concurrent cache misses and rejects stale worker results',async()=>{
 const t=convexTest(schema,modules);const first=await t.mutation(internal.weather.claim,{point});expect(first.status).toBe('CLAIMED');if(first.status!=='CLAIMED')throw Error('Expected claim');
 expect((await t.mutation(internal.weather.claim,{point})).status).toBe('WAITING');expect((await t.run(ctx=>ctx.db.query('providerUsage').collect()))[0]!.calls).toBe(3);
 const data={locationKey:'206671',providerPoint:point,locality:'Chennai',resolution:'City',current:normalizeConditions([sample],1)[0]!,history:[],historyAvailability:'UNAVAILABLE'};
 expect(await t.mutation(internal.weather.finish,{id:first.id,generation:first.generation,data})).toBe(true);
 expect((await t.mutation(internal.weather.claim,{point})).status).toBe('CACHED');
 expect(await t.mutation(internal.weather.finish,{id:first.id,generation:first.generation,data:{...data,locality:'Late'}})).toBe(false);
});
it('enforces an independent provider budget without limiting incident submission',async()=>{
 const t=convexTest(schema,modules);await t.run(ctx=>ctx.db.insert('providerUsage',{provider:'ACCUWEATHER',day:new Date().toISOString().slice(0,10),calls:100}));
 expect(await t.mutation(internal.weather.claim,{point})).toMatchObject({status:'QUOTA',cache:null});expect(await t.run(ctx=>ctx.db.query('weatherCache').collect())).toEqual([]);
});
it('expires temporary observations rather than retaining full weather payloads indefinitely',async()=>{
 const t=convexTest(schema,modules);await t.run(ctx=>ctx.db.insert('weatherCache',{key:'expired',requestedPoint:point,expiresAt:Date.now()-1,leaseUntil:0,generation:1,nextAttemptAt:0}));
 await t.mutation(internal.weather.cleanup,{});expect(await t.run(ctx=>ctx.db.query('weatherCache').collect())).toEqual([]);
});
