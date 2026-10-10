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
  const urgent = !!incident.officialEmergency || incident.qualification === 'NOTIFIABLE_EMERGENCY';
  const content = <><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
    <View style={{ padding: 12, borderRadius: 16, borderCurve: 'continuous', backgroundColor: urgent ? theme.rose : theme.sky }}><HazardIcon size={24} color={urgent ? theme.danger : theme.accent} accessible={false}/></View>
    <View style={{flex:1,gap:4}}><AppText variant="heading">{t(`hazard${incident.hazard}`)}</AppText><AppText variant="caption" style={{color:theme.secondary}}>{incident.locality}</AppText></View>{onPress && <ChevronRight size={20} color={theme.secondary} accessible={false}/>}</View>
    {incident.audience === 'DEMO' && <AppText variant="caption">DEMO</AppText>}
    <View style={{height:1,backgroundColor:theme.border}} />
    <IncidentSummary incident={incident} compact/></>;
  const style = { padding: 14, borderRadius: 18, borderWidth: 1, borderColor: urgent ? theme.danger : theme.border, backgroundColor: theme.surface, gap: 10 };
  return onPress ? <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ ...style, opacity: pressed ? 0.8 : 1 })}>{content}</Pressable> : <View style={style}>{content}</View>;
}
