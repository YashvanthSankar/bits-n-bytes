import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import type { LanguageCode } from '../contracts/domain';
import { preferenceStorage } from '../services/preferences';
import { dictionaries, isLanguageCode } from './resources';

const i18n = createInstance();
void i18n.use(initReactI18next).init({
  lng: 'en', fallbackLng: 'en', initAsync: false,
  resources: Object.fromEntries(Object.entries(dictionaries).map(([code, translation]) => [code, { translation }])),
  interpolation: { escapeValue: false }, react: { useSuspense: false },
});
const KEY = 'gudtour.preferred-language';
const LanguageContext = createContext<{
  language: LanguageCode; ready: boolean; changeLanguage: (code: LanguageCode) => Promise<void>;
} | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    void (async () => {
      let saved: string | null = null;
      try { saved = await preferenceStorage.getItem(KEY); } catch { /* Display a usable language chooser even if storage fails. */ }
      const system = getLocales()[0]?.languageCode;
      const selected = isLanguageCode(saved) ? saved : isLanguageCode(system) ? system : 'en';
      if (!alive) return;
      await i18n.changeLanguage(selected);
      if (!alive) return;
      setLanguage(selected); setReady(true);
    })();
    return () => { alive = false; };
  }, []);
  async function changeLanguage(code: LanguageCode) {
    await preferenceStorage.setItem(KEY, code);
    await i18n.changeLanguage(code);
    setLanguage(code);
  }
  return <I18nextProvider i18n={i18n}><LanguageContext.Provider value={{ language, ready, changeLanguage }}>{children}</LanguageContext.Provider></I18nextProvider>;
}
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('LanguageProvider is required');
  return context;
}
