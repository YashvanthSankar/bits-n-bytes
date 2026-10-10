import { expect, it, vi } from 'vitest';
import { translateInstruction, translationIntegrity } from '../convex/providers/googleTranslation';
const input = {text:'Leave Gate 3 before 18:00. Do not cross the bridge.',source:'en' as const,target:'fr' as const};
it('sends only original text/language to the fixed provider and decodes escaped plain text',async()=>{
 const fetcher=vi.fn<(url: string, init: RequestInit) => Promise<Response>>().mockResolvedValue(new Response(JSON.stringify({data:{translations:[{translatedText:'Quittez Gate 3 avant 18:00. N&#39;empruntez pas le pont.'}]}})));
 const result=await translateInstruction({...input,protectedTerms:['Gate 3']},{apiKey:'synthetic-key',fetcher});
 expect(fetcher.mock.calls[0]![0]).toBe('https://translation.googleapis.com/language/translate/v2');
 expect(JSON.parse(fetcher.mock.calls[0]![1]!.body as string)).toEqual({q:input.text,source:'en',target:'fr',format:'text'});
 expect(result.text).toContain("N'empruntez");expect(result.issues).toEqual([]);expect(result.requiresHumanReview).toBe(true);
});
it('flags changed numbers and missing protected place names rather than approving fluency',()=>{
 expect(translationIntegrity('Gate 3 before 18:00','Gate 4 before 19:00',['Gate 3']).issues).toEqual(['NUMBERS_CHANGED','PROTECTED_TERM_CHANGED']);
});
it('returns the exact original without a paid request for the same language',async()=>{
 const fetcher=vi.fn<(url: string, init: RequestInit) => Promise<Response>>();expect((await translateInstruction({...input,target:'en'},{apiKey:undefined,fetcher})).text).toBe(input.text);expect(fetcher).not.toHaveBeenCalled();
});
it.each(['network','http','shape'])('sanitizes %s failures without exposing provider or credential details',async mode=>{
 const fetcher=vi.fn<(url: string, init: RequestInit) => Promise<Response>>();if(mode==='network')fetcher.mockRejectedValue(new Error('credential synthetic-key'));else fetcher.mockResolvedValue(new Response(mode==='shape'?'{}':'private provider error',{status:mode==='http'?429:200}));
 await expect(translateInstruction(input,{apiKey:'synthetic-key',fetcher})).rejects.toThrow(mode==='shape'?'INVALID_RESPONSE':'PROVIDER_UNAVAILABLE');
});
