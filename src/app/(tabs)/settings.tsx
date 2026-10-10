import { UserRound, ShieldCheck, RefreshCw, LocateFixed, LogOut, FlaskConical, ChevronRight, Languages, ChevronDown, type LucideIcon } from 'lucide-react-native';
import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { randomUUID } from 'expo-crypto';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
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
import { RelativeTime } from '../../components/IncidentSummary';
import { useLocationSession } from '../../session/LocationSession';

function Settings() {
  const { t }=useTranslation(); const theme=useTheme(); const { language,changeLanguage }=useLanguage();
  const { isAuthenticated }=useConvexAuth(); const { fix,setFix,setSignedOut }=useLocationSession(); const { signOut }=useAuthActions();
  const own=useQuery(api.profiles.me,isAuthenticated?{}:'skip'); const save=useMutation(api.profiles.setLanguage);
  const setDemo=useMutation(api.profiles.setDemoEnabled);
  const syncAccess=useMutation(api.authorityAccess.sync);
  const [busy,setBusy]=useState(false); const [error,setError]=useState<string|null>(null); const running=useRef(false);
  const [languagesOpen,setLanguagesOpen]=useState(false);
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
    {!isAuthenticated ? <ActionButton icon={LocateFixed} title={t('locationAction')} onPress={()=>router.replace('/location')} /> : own===undefined ? <LoadingState /> : <>
      <View style={{ gap: 4, backgroundColor: theme.surface, borderRadius: 20, overflow: 'hidden' }}>
        <SettingsRow icon={UserRound} title={t('profileTitle')} detail={own.profile?.alias} onPress={()=>router.push('/profile')} disabled={busy} />
        {own.role === 'AUTHORITY' && <SettingsRow icon={ShieldCheck} title={t('authorityTitle')} onPress={()=>router.push('/authority')} disabled={busy} />}
        <SettingsRow icon={RefreshCw} title={t('refreshAccountAccess')} onPress={()=>void refreshAccess()} disabled={busy || uncertain} />
      </View>
      <View style={{ backgroundColor: theme.surface, borderRadius: 20, overflow: 'hidden' }}>
        <SettingsRow icon={Languages} title={t('languageTitle')} detail={languageNames[language].native} expanded={languagesOpen} onPress={()=>setLanguagesOpen(value=>!value)} disabled={busy || uncertain} />
        {languagesOpen && <View style={{ padding: 16, paddingTop: 0, gap: 8 }}>{LANGUAGE_CODES.map(code=><Choice key={code} label={languageNames[code].native} selected={language===code} disabled={busy || uncertain} onPress={()=>void select(code)} />)}</View>}
        <SettingsRow icon={LocateFixed} title={t('locationCaptured')} onPress={()=>router.replace('/location')} disabled={busy} />
        {fix && <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}><RelativeTime timestamp={fix.observedAt}/></View>}
      </View>
      <View style={{ backgroundColor: theme.surface, borderRadius: 20, overflow: 'hidden' }}>
        <SettingsRow icon={FlaskConical} title="DEMO" detail={t(own.profile?.demoEnabled ? 'disableDemoMode' : 'enableDemoMode')} onPress={()=>void toggleDemo()} disabled={busy || uncertain} />
        <AppText variant="caption" style={{ paddingHorizontal: 16, paddingBottom: 16, color: theme.secondary }}>{t('demoModeHelp')}</AppText>
      </View>
      {busy && <LoadingState />}
      {error && <AppText style={{color:theme.danger}} accessibilityLiveRegion="polite">{t(error)}</AppText>}
      {uncertain && !busy && <ActionButton icon={RefreshCw} title={t('retry')} onPress={()=>{if(pending.current)void select(pending.current.language);}} />}
      <SettingsRow icon={LogOut} title={t('signOut')} danger onPress={()=>void logout()} disabled={busy} />
    </>}
  </Screen>;
}
export default function SettingsScreen() {return <ReadBoundary><Settings /></ReadBoundary>;}

function SettingsRow({ icon: Icon, title, detail, onPress, disabled, danger = false, expanded }: { icon: LucideIcon; title: string; detail?: string | undefined; onPress: () => void; disabled?: boolean; danger?: boolean; expanded?: boolean }) {
  const theme = useTheme();
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled, ...(expanded !== undefined ? { expanded } : {}) }} disabled={disabled} onPress={onPress}
    style={({pressed})=>({minHeight:60,padding:16,flexDirection:'row',alignItems:'center',gap:12,backgroundColor:pressed?theme.muted:'transparent',opacity:disabled ? .5 : 1})}>
    <Icon size={21} color={danger?theme.danger:theme.accent} accessible={false}/>
    <View style={{flex:1,gap:3}}><AppText style={{color:danger?theme.danger:theme.text,fontWeight:'500'}}>{title}</AppText>{detail && <AppText variant="caption" style={{color:theme.secondary}}>{detail}</AppText>}</View>
    {!danger && (expanded ? <ChevronDown size={18} color={theme.secondary}/> : <ChevronRight size={18} color={theme.secondary}/>)}
  </Pressable>;
}
