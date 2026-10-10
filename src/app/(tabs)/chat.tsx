import { useConvexAuth, useConvexConnectionState, useMutation, useQuery } from 'convex/react';
import { randomUUID } from 'expo-crypto';
import { router } from 'expo-router';
import { Navigation, Plus, ArrowUp, MessageCircle } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { api } from '../../../convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import { AppText, LoadingState } from '../../components/ui';
import { ReadBoundary } from '../../components/ReadBoundary';
import { chatGroups } from '../../features/chat/presentation';
import { relativeTime } from '../../i18n/relativeTime';
import { errorTranslationKey } from '../../domain/apiError';
import { POLICY } from '../../domain/policy';
import { validateFix } from '../../domain/eligibility';
import { useReportLocation } from '../../features/incidents/useReportLocation';
import { useLocationSession } from '../../session/LocationSession';
import { useNavigationInset } from '../../navigation/NavigationInset';
import { useTheme } from '../../theme/useTheme';

type Message = FunctionReturnType<typeof api.chat.nearby>['items'][number] & { groupStart: boolean; groupEnd: boolean };
export default function ChatScreen() { return <ReadBoundary><NearbyChat /></ReadBoundary>; }
function NearbyChat() {
  const { t, i18n } = useTranslation(); const theme = useTheme(); const inset = useNavigationInset();
  const { isAuthenticated } = useConvexAuth(); const { isWebSocketConnected: online } = useConvexConnectionState();
  const { fix } = useLocationSession(); const refreshLocation = useReportLocation(POLICY.chatFix);
  const [now, setNow] = useState(Date.now); const [body, setBody] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [unread, setUnread] = useState(false);
  const feed = useQuery(api.chat.nearby, isAuthenticated ? { refreshKey } : 'skip');
  const send = useMutation(api.chat.send); const list = useRef<FlatList<Message>>(null);
  const nearBottom = useRef(true);
  const newestId = useRef<string | undefined>(undefined);
  const pending = useRef<{ body: string; requestId: string } | null>(null);
  useEffect(() => { const timer = setInterval(() => { setNow(Date.now()); if (online) setRefreshKey(value => value + 1); }, 15_000); return () => clearInterval(timer); }, [online]);
  const eligible = validateFix(fix, now, POLICY.chatFix).ok && feed?.needsLocation !== true;
  const messages = chatGroups((feed?.items ?? []).filter(message => message.expiresAt > now));
  const canSend = eligible && online && !!body.trim() && !busy;
  async function refresh() {
    if (busy || !online) return;
    setBusy(true); setError('');
    try { await refreshLocation(); setNow(Date.now()); setRefreshKey(value => value + 1); }
    catch (cause) { setError(t(errorTranslationKey(cause))); }
    finally { setBusy(false); }
  }
  async function publish() {
    const clean = body.trim(); if (!clean || busy || !online || !eligible) return;
    setBusy(true); setError('');
    try {
      await refreshLocation();
      const request = pending.current?.body === clean ? pending.current : { body: clean, requestId: randomUUID() };
      pending.current = request;
      await send(request); nearBottom.current = true; setUnread(false); pending.current = null; setBody(''); setNow(Date.now()); setRefreshKey(value => value + 1);
    } catch (cause) { setError(t(errorTranslationKey(cause))); }
    finally { setBusy(false); }
  }
  return <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: theme.background, paddingBottom: inset ?? 0 }}>
    <KeyboardAvoidingView style={{ flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, gap: 6 }}>
        <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
          <View style={{flex:1,gap:4}}><AppText variant="heading" accessibilityRole="header">{t('navChat')}</AppText><AppText variant="caption" style={{color:theme.secondary}}>{t('chatNearby')}</AppText></View>
          <Pressable onPress={()=>router.push('/report')} accessibilityRole="button" accessibilityLabel={t('reportTitle')} style={{minWidth:44,minHeight:44,borderRadius:22,backgroundColor:theme.surface,alignItems:'center',justifyContent:'center'}}><Plus size={22} color={theme.accent}/></Pressable>
        </View>
        <AppText variant="caption" style={{ color: theme.secondary, paddingHorizontal: 4 }}>{t('chatCommunity')}</AppText>
        {!online && <AppText accessibilityLiveRegion="polite" variant="caption">{t('chatOffline')}</AppText>}
        {!eligible && online && <Pressable accessibilityRole="button" accessibilityLabel={t('chatRefresh')} disabled={busy} onPress={()=>void refresh()} style={{minHeight:44,flexDirection:'row',alignItems:'center',gap:8}}>{busy?<ActivityIndicator color={theme.accent}/>:<Navigation size={17} color={theme.accent}/>}<AppText variant="caption" style={{color:theme.accent,fontWeight:'600'}}>{t('chatRefresh')}</AppText></Pressable>}
        {!!error && <AppText accessibilityLiveRegion="polite" variant="caption" style={{ color: theme.danger }}>{error}</AppText>}
      </View>
      <FlatList ref={list} data={messages} keyExtractor={message => message.id} keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16, gap: 4, flexGrow: 1 }}
        onScroll={event => { const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent; nearBottom.current = contentSize.height - contentOffset.y - layoutMeasurement.height < 80; if (nearBottom.current) setUnread(false); }} scrollEventThrottle={100}
        onContentSizeChange={() => {
          const latest = messages.at(-1)?.id;
          if (nearBottom.current) list.current?.scrollToEnd({ animated: false });
          else if (latest && newestId.current && latest !== newestId.current) setUnread(true);
          newestId.current = latest;
        }}
        ListEmptyComponent={feed === undefined && online ? <LoadingState /> : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 48, gap: 12 }}>
          <View style={{ width: 76, height: 76, borderRadius: 28, backgroundColor: theme.selection, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}><MessageCircle size={32} strokeWidth={1.6} color={theme.accent} /></View>
          <AppText variant="heading" style={{ textAlign: 'center' }}>{t(online?'chatEmpty':'chatConnect')}</AppText>
          <AppText variant="caption" style={{ textAlign: 'center', color: theme.secondary }}>{t(online?'chatStart':'chatConnectHelp')}</AppText>
        </View>}
        ListHeaderComponent={feed?.truncated ? <AppText variant="caption">{t('chatLatest')}</AppText> : null}
        renderItem={({ item }) => <View style={{ marginTop: item.groupStart ? 12 : 0, alignSelf: item.own ? 'flex-end' : 'flex-start', maxWidth: '90%', paddingHorizontal: 14, paddingVertical: 10, gap: 4, borderRadius: 18, borderTopRightRadius: item.own && !item.groupStart ? 6 : 18, borderTopLeftRadius: !item.own && !item.groupStart ? 6 : 18, borderBottomRightRadius: item.own && !item.groupEnd ? 6 : 18, borderBottomLeftRadius: !item.own && !item.groupEnd ? 6 : 18, backgroundColor: item.own ? theme.accent : theme.surface }}>
          {!item.own && item.groupStart && <AppText variant="caption" style={{ color: theme.accent, fontWeight: '600' }}>{item.alias}</AppText>}
          <AppText style={{ color: item.own ? theme.onAccent : theme.text }}>{item.body}</AppText>
          {item.groupEnd && <AppText variant="caption" style={{ fontSize: 12, lineHeight: 16, color: item.own ? theme.onAccent : theme.secondary, opacity: .85 }} accessibilityLabel={new Date(item.createdAt).toLocaleString(i18n.language)}>{relativeTime(item.createdAt, i18n.language, now)}</AppText>}
        </View>} />
      {unread && <Pressable accessibilityRole="button" accessibilityLabel={t('chatNewMessages')} onPress={()=>{nearBottom.current=true;setUnread(false);list.current?.scrollToEnd({animated:true});}} style={{alignSelf:'center',minHeight:44,paddingHorizontal:18,justifyContent:'center',borderRadius:22,backgroundColor:theme.selection,marginBottom:6}}><AppText variant="caption" style={{color:theme.accent,fontWeight:'600'}}>{t('chatNewMessages')} ↓</AppText></Pressable>}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: theme.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 6, paddingLeft: 16, borderRadius: 28, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface }}>
          <TextInput accessibilityLabel={t('chatMessage')} placeholder={t('chatPlaceholder')} placeholderTextColor={theme.secondary}
            value={body} onChangeText={setBody} multiline maxLength={500} editable={!busy}
            style={{ flex: 1, minHeight: 44, maxHeight: 128, paddingTop: 11, paddingBottom: 11, fontSize: 16, lineHeight: 22, color: theme.text, fontFamily: Platform.OS === 'android' ? 'Inter' : undefined }} />
          <Pressable accessibilityRole="button" accessibilityLabel={t('chatSend')} accessibilityState={{ disabled: !canSend, busy }} disabled={!canSend} onPress={()=>void publish()}
            style={({pressed})=>({width:44,height:44,borderRadius:22,backgroundColor:canSend?theme.accent:theme.muted,alignItems:'center',justifyContent:'center',opacity:pressed ? .75 : 1})}>
            {busy ? <ActivityIndicator color={theme.accent} /> : <ArrowUp size={22} strokeWidth={2.5} color={canSend?theme.onAccent:theme.secondary} />}
          </Pressable>
        </View>
        {body.length >= 400 && <AppText variant="caption" style={{ color: theme.secondary, textAlign: 'right', paddingRight: 12, paddingTop: 4 }}>{body.length}/500</AppText>}
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
