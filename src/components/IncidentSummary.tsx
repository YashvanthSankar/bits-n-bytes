import { relativeTime } from '../i18n/relativeTime';
import { Clock3, Users, ShieldCheck, ShieldQuestion, Radio, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import type { PublicIncident } from '../contracts/domain';
import { AppText } from './ui';
import { useTheme } from '../theme/useTheme';

export function RelativeTime({ timestamp }: { timestamp: number }) {
  const { i18n } = useTranslation(); const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(timer); }, []);
  return <AppText variant="caption" accessibilityLabel={new Date(timestamp).toLocaleString(i18n.language)}>{relativeTime(timestamp, i18n.language, now)}</AppText>;
}
export function Fact({ icon: Icon, children, label }: { icon: LucideIcon; children: React.ReactNode; label?: string }) {
  const theme = useTheme();
  return <View accessible={!!label} accessibilityLabel={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}><Icon size={18} color={theme.secondary} accessible={false}/>{children}</View>;
}
export function IncidentSummary({ incident, compact = false }: { incident: PublicIncident; compact?: boolean }) {
  const { t, i18n } = useTranslation(); const theme = useTheme();
  const active = incident.lifecycle === 'ACTIVE';
  return <View style={{ gap: 12 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
      <View accessible accessibilityLabel={t(`lifecycle${incident.lifecycle}`)} style={{ padding: compact ? 0 : 8, borderRadius: 12, backgroundColor: compact ? 'transparent' : theme.muted, flexDirection: 'row', alignItems: 'center', gap: 7 }}>
        <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: active ? theme.accent : theme.secondary }}/>{!compact && <AppText variant="caption">{t(`lifecycle${incident.lifecycle}`)}</AppText>}
      </View>
      <Fact icon={Clock3} label={`${t('lastObservation')}: ${new Date(incident.lastObservedAt).toLocaleString(i18n.language)}`}><RelativeTime timestamp={incident.lastObservedAt}/></Fact>
      <Fact icon={Users} label={`${t('recentWitnesses')}: ${incident.recentWitnesses}`}><AppText variant="caption" style={{ fontWeight: '700' }}>{incident.recentWitnesses}</AppText></Fact>
    </View>
    <Fact icon={incident.verification === 'AUTHORITY_VERIFIED' ? ShieldCheck : ShieldQuestion}><AppText variant="caption" style={{ color: theme.secondary, flex: 1 }}>{t(`verification${incident.verification}`)}</AppText></Fact>
    {(!compact || incident.officialEmergency) && <Fact icon={Radio}><AppText variant="caption" style={{ color: incident.officialEmergency ? theme.danger : theme.secondary, flex: 1 }}>{incident.officialEmergency ? `${t('emergencyActive')} · ${t(`severity${incident.officialEmergency.severity}`)}` : t(`qualification${incident.qualification ?? 'PENDING'}`)}</AppText></Fact>}
  </View>;
}
