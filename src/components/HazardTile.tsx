import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { HazardCode } from '../contracts/domain';
import { hazardIcons } from './hazardIcons';
import { AppText } from './ui';
import { useTheme } from '../theme/useTheme';

export function HazardTile({ code, selected, disabled, onPress }: { code: HazardCode; selected: boolean; disabled: boolean; onPress: () => void }) {
  const theme = useTheme(); const { t } = useTranslation(); const Icon = hazardIcons[code];
  const tint = { FLASH_FLOOD: theme.sky, FLOOD_WATERLOGGING: theme.sky, LANDSLIDE: theme.peach, CYCLONE: theme.rose, SEVERE_STORM: theme.sand, COASTAL_SURGE: theme.sky, HEATWAVE: theme.peach, OTHER_NATURAL: theme.sand }[code];
  return <Pressable accessibilityRole="radio" accessibilityLabel={t(`hazard${code}`)} accessibilityState={{ checked: selected, disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => ({ flexGrow: 1, flexBasis: '45%', minWidth: 130, padding: 12, gap: 8, borderRadius: 18, borderCurve: 'continuous', borderWidth: 1, borderColor: selected ? theme.accent : theme.border, backgroundColor: selected ? theme.selection : theme.surface, opacity: disabled ? .5 : pressed ? .75 : 1 })}>
    <View accessible={false} style={{ height: 60, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 14, backgroundColor: tint }}>
      <View style={{ position: 'absolute', width: 100, height: 100, borderWidth: 1, borderColor: theme.border, borderRadius: 50, right: -15, top: -28 }} />
      <View style={{ position: 'absolute', width: 74, height: 74, borderWidth: 1, borderColor: theme.border, borderRadius: 37, left: -20, bottom: -40 }} />
      <Icon size={42} strokeWidth={1.3} color={theme.text} />
    </View>
    <AppText style={{ fontWeight: '600', fontSize: 15, lineHeight: 21 }}>{t(`hazard${code}`)}</AppText>
  </Pressable>;
}
