import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { randomUUID } from 'expo-crypto';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../../../convex/_generated/api';
import { ActionButton, AppText, LoadingState, Screen } from '../../components/ui';
import { Choice } from '../../components/Choice';
import { ReadBoundary } from '../../components/ReadBoundary';
import { useLanguage } from '../../i18n/LanguageProvider';
import { languageNames } from '../../i18n/resources';
import { LANGUAGE_CODES, type LanguageCode } from '../../contracts/domain';
import { apiErrorCode, errorTranslationKey } from '../../domain/apiError';
import { useTheme } from '../../theme/useTheme';
import { useLocationSession } from '../../session/LocationSession';

function Settings() {
  const { t, i18n }=useTranslation(); const theme=useTheme(); const { language,changeLanguage }=useLanguage();
  const { isAuthenticated }=useConvexAuth(); const { fix,setFix,setSignedOut }=useLocationSession(); const { signOut }=useAuthActions();
  const own=useQuery(api.profiles.me,isAuthenticated?{}:'skip'); const save=useMutation(api.profiles.setLanguage);
  const setDemo=useMutation(api.profiles.setDemoEnabled);
  const syncAccess=useMutation(api.authorityAccess.sync);
  const [busy,setBusy]=useState(false); const [error,setError]=useState<string|null>(null); const running=useRef(false);
  const [uncertain,setUncertain]=useState(false);
  const pending=useRef<{requestId:string;expectedRevision:number;language:LanguageCode}|null>(null);
  async function select(code:LanguageCode) {
    if(running.current || !own?.profile) return; running.current=true;setBusy(true);setError(null);
    try {
      pending.current??={requestId:randomUUID(),expectedRevision:own.profile.revision,language:code};
      const selected=pending.current.language;
      await save(pending.current); pending.current=null;setUncertain(false);
      await changeLanguage(selected);
    } catch(err) {if(apiErrorCode(err)){pending.current=null;setUncertain(false);}else setUncertain(pending.current!==null);setError(errorTranslationKey(err));}
    finally {running.current=false;setBusy(false);}
  }
  async function refreshAccess() {
    if (running.current || uncertain) return; running.current=true;setBusy(true);setError(null);
    try { await syncAccess({}); } catch(err) {setError(errorTranslationKey(err));}
    finally {running.current=false;setBusy(false);}
  }
  async function toggleDemo() {
    if(running.current || uncertain || !own?.profile)return;running.current=true;setBusy(true);setError(null);
    try {await setDemo({enabled:!own.profile.demoEnabled});}catch(err){setError(errorTranslationKey(err));}
    finally{running.current=false;setBusy(false);}
  }
  async function logout() {
    if (running.current) return;
    running.current=true; setBusy(true); setError(null);
    setSignedOut(true);
    try { await signOut(); setFix(null); router.replace('/login'); }
    catch { setSignedOut(false); setError('serviceUnavailable'); }
    finally { running.current=false; setBusy(false); }
  }
  return <Screen>
    <AppText variant="title" accessibilityRole="header">{t('navSettings')}</AppText>
    {!isAuthenticated ? <ActionButton title={t('locationAction')} onPress={()=>router.replace('/location')} /> : own===undefined ? <LoadingState /> : <>
      <View style={{gap:8}}><AppText variant="heading">{t('profileTitle')}</AppText><AppText>{own.profile?.alias}</AppText><AppText variant="caption">{t('profilePrivacy')}</AppText>
        <ActionButton title={t('profileTitle')} variant="secondary" onPress={()=>router.push('/profile')} disabled={busy} />
        {own.role === 'AUTHORITY' && <AppText style={{color:theme.accent}}>{t('authorityReady')}</AppText>}
        {own.role === 'AUTHORITY' && <ActionButton title={t('authorityTitle')} variant="secondary" onPress={()=>router.push('/authority')} disabled={busy} />}
        <ActionButton title={t('refreshAccountAccess')} variant="secondary" onPress={()=>void refreshAccess()} disabled={busy || uncertain} />
      </View>
      <View style={{gap:8}}><AppText variant="heading">DEMO</AppText><AppText>{t('demoModeHelp')}</AppText>
        <ActionButton title={t(own.profile?.demoEnabled ? 'disableDemoMode' : 'enableDemoMode')} variant="secondary" disabled={busy || uncertain} onPress={()=>void toggleDemo()} />
      </View>
      <View style={{gap:8}}><AppText variant="heading">{t('languageTitle')}</AppText>
        {LANGUAGE_CODES.map(code=><Choice key={code} label={`${languageNames[code].native} · ${languageNames[code].english}`} selected={language===code} disabled={busy || uncertain} onPress={()=>void select(code)} />)}
        {busy && <LoadingState />}
        {error && <AppText style={{color:theme.danger}} accessibilityLiveRegion="polite">{t(error)}</AppText>}
        {uncertain && !busy && <ActionButton title={t('retry')} onPress={()=>{if(pending.current)void select(pending.current.language);}} />}
      </View>
      <View style={{gap:8}}><AppText variant="heading">{t('locationCaptured')}</AppText>
        <AppText>{t('locationPrivacy')}</AppText>
        {fix && <AppText variant="caption">{new Date(fix.observedAt).toLocaleString(i18n.language)} · ±{Math.ceil(fix.accuracyM)} m</AppText>}
        <ActionButton title={t('locationAction')} variant="secondary" onPress={()=>router.replace('/location')} disabled={busy} />
      </View>
      <View style={{paddingTop:16,borderTopWidth:1,borderTopColor:theme.border}}>
        <ActionButton title={t('signOut')} variant="danger" onPress={()=>void logout()} busy={busy} disabled={busy} />
      </View>
    </>}
  </Screen>;
}
export default function SettingsScreen() {return <ReadBoundary><Settings /></ReadBoundary>;}
