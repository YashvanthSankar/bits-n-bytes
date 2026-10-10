import { EmergencyNotice } from './EmergencyNotice';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { router, usePathname } from 'expo-router';
import { Component, type PropsWithChildren, useEffect, useState } from 'react';
import { AppState, Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { api } from '../../../convex/_generated/api';
import { ActionButton, AppText } from '../../components/ui';
import { useLocationSession } from '../../session/LocationSession';
import { useTheme } from '../../theme/useTheme';
import { compareAlerts } from '../../domain/alertOrder';
import { POLICY } from '../../domain/policy';

/** Mounted on a focused tourist page; dismissing attention never removes the warning. */
export function EmergencyAlerts({ global = false, compact = false }: { global?: boolean; compact?: boolean }) {
  const { t } = useTranslation(), theme = useTheme(), safe = useSafeAreaInsets();
  const { isAuthenticated } = useConvexAuth(), { fix, signedOut } = useLocationSession();
  const result = useQuery(api.alerts.active, isAuthenticated && fix && !signedOut ? {} : 'skip');
  const acknowledge = useMutation(api.alerts.dismiss);
  const path = usePathname();
  const [active, setActive] = useState(AppState.currentState === 'active'), [now, setNow] = useState(Date.now), [hidden, setHidden] = useState<Set<string>>(new Set());
  const [error, setError] = useState(false);
  useEffect(() => { const subscription = AppState.addEventListener('change', state => { setActive(state === 'active'); setNow(Date.now()); }); return () => subscription.remove(); }, []);
  const eligiblePage = !['/', '/login', '/location', '/profile', '/auth/callback'].includes(path) && !path.startsWith('/alert/');
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 15_000); return () => clearInterval(timer); }, []);
  const fresh = result?.locationFresh && now - result.locationObservedAt <= POLICY.alertFix.maxAgeMs;
  const items = fresh ? [...(result?.items ?? [])].sort(compareAlerts) : [];
  const urgent = items.find(item => item.needsAttention && !hidden.has(item.exposureId + ':' + item.revision));
  const update = result?.updates?.find(item => !hidden.has(item.exposureId + ':' + item.revision));
  const attention = urgent ?? update;
  const isUpdate = !!attention && !urgent;
  async function dismiss() {
    if (!attention) return;
    const current = attention, key = current.exposureId + ':' + current.revision;
    setHidden(previous => new Set(previous).add(key)); setError(false);
    try { await acknowledge({ alertId: current.id, revision: current.revision }); }
    catch { setError(true); } // The persistent warning remains available even if acknowledgement fails.
  }
  if (!isAuthenticated || signedOut || !fix) return null;
  return <>
    {!global && compact && items.map(item => <Pressable key={item.id} accessibilityRole="button" onPress={()=>router.push({pathname:'/alert/[id]',params:{id:item.id}})} style={{padding:12,gap:4,borderRadius:16,backgroundColor:theme.surface,borderLeftWidth:3,borderLeftColor:theme.danger}}>
      <AppText variant="caption" style={{color:theme.danger,fontWeight:'700'}}>{item.audience==='DEMO'?'DEMO · ':''}{t('emergencyActive')} · {t(`severity${item.severity}`)}</AppText>
      <AppText variant="caption">{item.locality}</AppText>
    </Pressable>)}
    {!global && !compact && items.map(item => <View key={item.id} style={{ padding: 14, gap: 8, borderRadius: 16, borderWidth: 1, borderColor: item.needsAttention && !hidden.has(item.exposureId + ':' + item.revision) ? theme.danger : theme.warning, backgroundColor: theme.surface }}>
      <AppText style={{ color: theme.danger, fontWeight: '700' }}>{item.audience === 'DEMO' ? 'DEMO · ' : ''}{t('emergencyActive')}</AppText>
      <EmergencyNotice alertId={item.id} revision={item.revision} now={now}/>
    </View>)}
    {!global && result?.updates?.map(item => <View key={'update-'+item.id} style={{padding:14,gap:8,borderRadius:16,borderWidth:1,borderColor:theme.warning,backgroundColor:theme.surface}}>
      <AppText>{item.audience === 'DEMO' ? 'DEMO · ' : ''}{t(item.kind === 'CORRECTION' ? 'alertCorrected' : 'alertSourceEnded')}</AppText>
      <EmergencyNotice alertId={item.id} revision={item.revision} now={now}/>
    </View>)}
    {!global && error && <AppText style={{ color: theme.warning }}>{t('emergencyDismissFailed')}</AppText>}
    <Modal visible={global && active && eligiblePage && !!attention} animationType="slide" onRequestClose={() => void dismiss()}>
      <View style={{ flex: 1, backgroundColor: theme.background, padding: 20, paddingTop: safe.top + 20, paddingBottom: safe.bottom + 20 }}>
        <View style={{ flex: 1, backgroundColor: theme.surface, borderRadius: 24, padding: 20, gap: 16 }}>
          <AppText variant="heading" style={{ color: isUpdate ? theme.warning : theme.danger }}>{attention?.audience === 'DEMO' ? 'DEMO · ' : ''}{t(isUpdate ? update?.kind === 'CORRECTION' ? 'alertCorrected' : 'alertSourceEnded' : 'emergencyActive')}</AppText>
          <ScrollView contentContainerStyle={{ gap: 16 }}>
            {attention && <EmergencyNotice alertId={attention.id} revision={attention.revision} now={now}/>}
            {error && <AppText>{t('emergencyDismissFailed')}</AppText>}
          </ScrollView>
          <ActionButton title={t('dismissPopup')} variant="secondary" onPress={() => void dismiss()} />
        </View>
      </View>
    </Modal>
  </>;
}

/** A transient protected-read error must not replace the entire app navigation. */
class NotificationBoundary extends Component<PropsWithChildren, { failed: boolean }> {
 state = {failed:false};
 static getDerivedStateFromError() {return {failed:true};}
 render(){return this.state.failed?null:this.props.children;}
}
export function GlobalEmergencyNotifications() {
 const {fix,signedOut}=useLocationSession();
 return <NotificationBoundary key={`${signedOut}:${fix?.observedAt ?? 0}`}><EmergencyAlerts global /></NotificationBoundary>;
}
