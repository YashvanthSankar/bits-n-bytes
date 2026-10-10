import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { Appearance, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { preferenceStorage } from '../services/preferences';
import { useTheme } from './useTheme';
import { AppText } from '../components/ui';

type Mode = 'system' | 'light' | 'dark';
const labels: Record<string, [string, string, string, string]> = {
  en: ['Appearance', 'System', 'Light', 'Dark'], hi: ['दिखावट', 'सिस्टम', 'हल्का', 'गहरा'],
  ta: ['தோற்றம்', 'சாதனம்', 'ஒளி', 'இருள்'], fr: ['Apparence', 'Système', 'Clair', 'Sombre'],
  de: ['Darstellung', 'System', 'Hell', 'Dunkel'], es: ['Apariencia', 'Sistema', 'Claro', 'Oscuro'],
};
const Context = createContext<{ mode: Mode; busy: boolean; error: boolean; select: (mode: Mode) => Promise<void> } | null>(null);
const apply = (mode: Mode) => Appearance.setColorScheme(mode === 'system' ? 'unspecified' : mode);

export function AppearancePreferenceProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<Mode>('system'); const [busy, setBusy] = useState(true); const [error, setError] = useState(false);
  const locked = useRef(true);
  useEffect(() => {
    let alive = true;
    void preferenceStorage.getItem('gudtour.appearance').then(value => {
      if (!alive) return;
      const saved = value === 'light' || value === 'dark' ? value : 'system';
      apply(saved); setMode(saved);
    }).catch(() => { if (alive) setError(true); }).finally(() => { if (alive) { locked.current = false; setBusy(false); } });
    return () => { alive = false; };
  }, []);
  async function select(next: Mode) {
    if (locked.current) return;
    locked.current = true; setBusy(true); setError(false);
    try { await preferenceStorage.setItem('gudtour.appearance', next); apply(next); setMode(next); }
    catch { setError(true); }
    finally { locked.current = false; setBusy(false); }
  }
  return <Context.Provider value={{mode,busy,error,select}}>{children}</Context.Provider>;
}

export function AppearanceSetting() {
  const preference = useContext(Context); const { i18n, t } = useTranslation(); const theme = useTheme();
  if (!preference) return null;
  const text = labels[i18n.language.split('-')[0]!] ?? labels.en!;
  return <View style={{gap:8}}>
    <AppText variant="heading">{text[0]}</AppText>
    <View accessibilityRole="radiogroup" accessibilityLabel={text[0]} style={{gap:4,padding:4,flexDirection:'row',backgroundColor:theme.muted,borderRadius:16}}>
      {(['system','light','dark'] as const).map((mode,index)=><Pressable key={mode} accessibilityRole="radio" accessibilityState={{checked:preference.mode===mode,disabled:preference.busy}} disabled={preference.busy} onPress={()=>void preference.select(mode)} style={({pressed})=>({flex:1,minHeight:48,padding:8,borderRadius:12,alignItems:'center',justifyContent:'center',backgroundColor:preference.mode===mode?theme.surface:'transparent',opacity:pressed||preference.busy?.6:1})}><AppText variant="caption" style={{fontWeight:preference.mode===mode?'700':'400',textAlign:'center'}}>{text[index+1]}</AppText></Pressable>)}
    </View>
    {preference.error && <AppText accessibilityLiveRegion="polite">{t('saveError')}</AppText>}
  </View>;
}
