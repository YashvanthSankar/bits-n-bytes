import { describe, expect, it } from 'vitest';
import { dictionaries } from '../src/i18n/resources';
import { colors } from '../src/theme/tokens';

function luminance(hex: string) {
  const channels = hex.slice(1).match(/../g)!.map((c) => parseInt(c, 16) / 255)
    .map((c) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
}
function contrast(a: string, b: string) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
describe('readable six-language foundations', () => {
  it.each(Object.keys(dictionaries) as (keyof typeof dictionaries)[])('%s has every entry key with content', (code) => {
    expect(Object.keys(dictionaries[code]).sort()).toEqual(Object.keys(dictionaries.en).sort());
    expect(Object.values(dictionaries[code]).every((text) => text.trim().length > 0)).toBe(true);
  });
  it.each(['light', 'dark'] as const)('%s text/action colors meet 4.5:1 contrast', (mode) => {
    const theme = colors[mode];
    for (const background of [theme.background, theme.surface, theme.muted]) {
      expect(contrast(theme.text, background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(theme.secondary, background)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast(theme.onAccent, theme.accent)).toBeGreaterThanOrEqual(4.5);
  });
  it.each(['light','dark'] as const)('%s glass icons remain readable over extreme map backgrounds',(mode)=>{
    const theme=colors[mode];const rgba=theme.glassSurface;
    const opacity=parseInt(rgba.slice(7,9),16)/255;
    const foreground=rgba.slice(1,7).match(/../g)!.map(c=>parseInt(c,16));
    for(const r of [0,255])for(const g of [0,255])for(const b of [0,255]){
      const composite='#'+[r,g,b].map((value,i)=>Math.round(value*(1-opacity)+foreground[i]!*opacity).toString(16).padStart(2,'0')).join('');
      expect(contrast(theme.text,composite)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
