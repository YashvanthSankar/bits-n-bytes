import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { PublicIncident } from '../contracts/domain';
import { AppText } from './ui';
import { useTheme } from '../theme/useTheme';

export function IncidentCard({ incident, onPress }: { incident: PublicIncident; onPress?: () => void }) {
  const { t, i18n } = useTranslation(); const theme = useTheme();
  const content = <><AppText variant="heading">{t(`hazard${incident.hazard}`)}</AppText>
    <AppText>{t(`verification${incident.verification}`)}</AppText>
    <AppText variant="caption">{t(`lifecycle${incident.lifecycle}`)} · {t(`qualification${incident.qualification ?? 'PENDING'}`)}</AppText>
    <AppText variant="caption">{t('lastObservation')}: {new Date(incident.lastObservedAt).toLocaleString(i18n.language)}</AppText>
    <AppText variant="caption">{t('recentWitnesses')}: {incident.recentWitnesses}</AppText></>;
  const style = { padding: 16, borderWidth: 1, borderColor: theme.border, borderRadius: 16, backgroundColor: theme.surface, gap: 8 };
  return onPress ? <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ ...style, opacity: pressed ? 0.8 : 1 })}>{content}</Pressable> : <View style={style}>{content}</View>;
}
