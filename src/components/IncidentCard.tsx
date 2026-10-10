import { hazardIcons } from './hazardIcons';
import { Pressable, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { PublicIncident } from '../contracts/domain';
import { AppText } from './ui';
import { IncidentSummary } from './IncidentSummary';
import { useTheme } from '../theme/useTheme';

export function IncidentCard({ incident, onPress }: { incident: PublicIncident; onPress?: () => void }) {
  const { t } = useTranslation(); const theme = useTheme();
  const HazardIcon = hazardIcons[incident.hazard];
  const content = <><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
    <View style={{ padding: 10, borderRadius: 14, backgroundColor: theme.selection }}><HazardIcon size={23} color={theme.accent} accessible={false}/></View>
    <AppText variant="heading" style={{ flex: 1 }}>{t(`hazard${incident.hazard}`)}</AppText>{onPress && <ChevronRight size={20} color={theme.secondary} accessible={false}/>}</View>
    {incident.audience === 'DEMO' && <AppText variant="caption">DEMO</AppText>}
    <IncidentSummary incident={incident}/></>;
  const style = { padding: 18, borderWidth: 1, borderColor: theme.border, borderRadius: 22, backgroundColor: theme.surface, gap: 16 };
  return onPress ? <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ ...style, opacity: pressed ? 0.8 : 1 })}>{content}</Pressable> : <View style={style}>{content}</View>;
}
