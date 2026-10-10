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
    <View style={{flex:1,gap:3}}><AppText style={{fontWeight:'600'}}>{t(`hazard${incident.hazard}`)}</AppText><AppText variant="caption" style={{color:theme.secondary}}>{incident.locality}</AppText></View>{onPress && <ChevronRight size={20} color={theme.secondary} accessible={false}/>}</View>
    {incident.audience === 'DEMO' && <AppText variant="caption">DEMO</AppText>}
    <IncidentSummary incident={incident} compact/></>;
  const style = { padding: 16, borderRadius: 20, backgroundColor: theme.surface, gap: 12 };
  return onPress ? <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ ...style, opacity: pressed ? 0.8 : 1 })}>{content}</Pressable> : <View style={style}>{content}</View>;
}
