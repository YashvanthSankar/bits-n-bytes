import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { api } from '../../../convex/_generated/api';
import { ActionButton, AppText } from '../../components/ui';
import { useLocationSession } from '../../session/LocationSession';
import { useTheme } from '../../theme/useTheme';
import { compareAlerts } from '../../domain/alertOrder';
import { POLICY } from '../../domain/policy';

/** Mounted on a focused tourist page; dismissing attention never removes the warning. */
export function EmergencyAlerts() {
  const { t } = useTranslation(), theme = useTheme(), safe = useSafeAreaInsets();
  const { isAuthenticated } = useConvexAuth(), { fix, signedOut } = useLocationSession();
  const result = useQuery(api.alerts.active, isAuthenticated && fix && !signedOut ? {} : 'skip');
  const acknowledge = useMutation(api.alerts.dismiss);
  const [focused, setFocused] = useState(false), [now, setNow] = useState(Date.now), [hidden, setHidden] = useState<Set<string>>(new Set());
  const [error, setError] = useState(false);
  useFocusEffect(useCallback(() => { setFocused(true); return () => setFocused(false); }, []));
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 15_000); return () => clearInterval(timer); }, []);
  const fresh = result?.locationFresh && now - result.locationObservedAt <= POLICY.alertFix.maxAgeMs;
  const items = fresh ? [...(result?.items ?? [])].sort(compareAlerts) : [];
  const attention = items.find(item => item.needsAttention && !hidden.has(item.exposureId + ':' + item.revision));
  const open = (id: typeof items[number]['id']) => router.push({ pathname: '/alert/[id]', params: { id } });
  async function dismiss() {
    if (!attention) return;
    const current = attention, key = current.exposureId + ':' + current.revision;
    setHidden(previous => new Set(previous).add(key)); setError(false);
    try { await acknowledge({ alertId: current.id, revision: current.revision }); }
    catch { setError(true); } // The persistent warning remains available even if acknowledgement fails.
  }
  if (!isAuthenticated || signedOut || !fix) return null;
  return <>
    {items.map(item => <View key={item.id} style={{ padding: 14, gap: 8, borderRadius: 16, borderWidth: 1, borderColor: item.needsAttention && !hidden.has(item.exposureId + ':' + item.revision) ? theme.danger : theme.warning, backgroundColor: theme.surface }}>
      <AppText style={{ color: theme.danger, fontWeight: '700' }}>{item.audience === 'DEMO' ? 'DEMO · ' : ''}{t('emergencyActive')}</AppText>
      <AppText>{item.locality} · {t(`hazard${item.hazard}`)}</AppText>
      <AppText variant="caption">{t(item.proximity === 'INSIDE' ? 'emergencyNearby' : 'emergencyPossible')}</AppText>
      <ActionButton title={t('viewEmergency')} onPress={() => open(item.id)} />
    </View>)}
    {error && <AppText style={{ color: theme.warning }}>{t('emergencyDismissFailed')}</AppText>}
    <Modal visible={focused && !!attention} animationType="slide" onRequestClose={() => void dismiss()}>
      <View style={{ flex: 1, backgroundColor: theme.background, padding: 20, paddingTop: safe.top + 20, paddingBottom: safe.bottom + 20 }}>
        <View style={{ flex: 1, backgroundColor: theme.surface, borderRadius: 24, padding: 20, gap: 16 }}>
          <AppText variant="heading" style={{ color: theme.danger }}>{attention?.audience === 'DEMO' ? 'DEMO · ' : ''}{t('emergencyActive')}</AppText>
          <ScrollView contentContainerStyle={{ gap: 12 }}><AppText>{attention?.locality}</AppText><AppText>{t(attention?.proximity === 'INSIDE' ? 'emergencyNearby' : 'emergencyPossible')}</AppText><AppText>{t('emergencyStillAvailable')}</AppText></ScrollView>
          <ActionButton title={t('viewEmergency')} onPress={() => { if (attention) { const id = attention.id; void dismiss(); open(id); } }} />
          <ActionButton title={t('dismissPopup')} variant="secondary" onPress={() => void dismiss()} />
        </View>
      </View>
    </Modal>
  </>;
}
