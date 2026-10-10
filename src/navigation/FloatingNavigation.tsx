import { BlurView } from 'expo-blur';
import { TabTrigger, useTabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { Map, List, House, BellRing, MessageCircle, Settings, Menu, X, Check, type LucideIcon } from 'lucide-react-native';
import { useEffect, useState, type RefObject } from 'react';
import { AccessibilityInfo, Keyboard, Modal, Platform, Pressable, ScrollView, StyleSheet, View, useColorScheme, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppText } from '../components/ui';
import { useTheme } from '../theme/useTheme';

export const destinations = [
  { name: 'map', href: '/map', label: 'navMap', icon: Map },
  { name: 'incidents', href: '/incidents', label: 'navIncidents', icon: List },
  { name: 'shelters', href: '/shelters', label: 'navShelters', icon: House },
  { name: 'sachet', href: '/sachet', label: 'navSachet', icon: BellRing },
  { name: 'chat', href: '/chat', label: 'navChat', icon: MessageCircle },
  { name: 'settings', href: '/settings', label: 'navSettings', icon: Settings },
] as const;

function NavigationButton({ label, icon: Icon, isFocused, expanded = false, style, ...props }: TabTriggerSlotProps & { label: string; icon: LucideIcon; expanded?: boolean }) {
  const theme = useTheme();
  const color = isFocused ? (expanded ? theme.onAccent : theme.accent) : theme.secondary;
  return <Pressable {...props} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: !!isFocused }}
    style={state => [typeof style === 'function' ? style(state) : style, { flex: expanded ? undefined : 1, minHeight: 56, minWidth: 48, borderRadius: expanded ? 16 : 18, paddingVertical: 10, paddingHorizontal: expanded ? 16 : 4,
      flexDirection: expanded ? 'row' : 'column', justifyContent: 'center', alignItems: 'center', gap: expanded ? 16 : 0,
      backgroundColor: isFocused ? (expanded ? theme.accent : theme.selection) : state.pressed ? theme.muted : 'transparent', opacity: state.pressed ? .75 : 1 }]}>
    <Icon size={24} strokeWidth={2} color={color} accessible={false} />

    {expanded && <AppText style={{ color, fontWeight: isFocused ? '700' : '500', flex: 1, flexShrink: 1 }}>{label}</AppText>}
    {expanded && isFocused && <Check size={22} color={theme.onAccent} accessible={false} />}
  </Pressable>;
}

/** Target contains only screen content: never blur the bar recursively on Android. */
export function FloatingNavigation({ target, onInset }: { target: RefObject<View | null>; onInset: (height: number) => void }) {
  const theme = useTheme(); const scheme = useColorScheme(); const { t } = useTranslation();
  const safe = useSafeAreaInsets(); const { width, fontScale } = useWindowDimensions();
  const compact = width - safe.left - safe.right < 380 || fontScale > 1.3;
  const [menuOpen, setMenuOpen] = useState(false); const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [opaque, setOpaque] = useState(Platform.OS === 'ios');
  const { getTrigger } = useTabTrigger({ name: 'map' });
  const active = destinations.find(item => getTrigger(item.name)?.isFocused) ?? destinations[0];
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let alive = true;
    void AccessibilityInfo.isReduceTransparencyEnabled().then(value => { if (alive) setOpaque(value); }).catch(() => { /* Keep readable opaque fallback. */ });
    const subscription = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setOpaque);
    return () => { alive = false; subscription.remove(); };
  }, []);
  useEffect(() => { if (keyboardVisible) onInset(0); }, [keyboardVisible, onInset]);
  const fallback = opaque || (Platform.OS === 'android' && Number(Platform.Version) < 31);
  return <>
    {!keyboardVisible && <View pointerEvents="box-none" onLayout={event => onInset(event.nativeEvent.layout.height)}
      style={{ position: 'absolute', bottom: 0, left: safe.left, right: safe.right, paddingTop: 8, paddingBottom: safe.bottom + 12, paddingHorizontal: 16 }}>
      <View style={{ width: '100%', maxWidth: 600, alignSelf: 'center', borderRadius: 26, shadowColor: theme.text, shadowOffset: { width: 0, height: 5 }, shadowRadius: 18, shadowOpacity: .12, elevation: 10 }}>
        <View style={{ overflow: 'hidden', borderRadius: 26, borderWidth: 1, borderColor: theme.border }}>
          {!fallback && <BlurView pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" blurTarget={target} blurMethod="dimezisBlurViewSdk31Plus" intensity={75} tint={scheme === 'dark' ? 'systemUltraThinMaterialDark' : 'systemUltraThinMaterialLight'} style={StyleSheet.absoluteFill} />}
          <View style={{ backgroundColor: fallback ? theme.surface : theme.glassSurface, padding: 6, flexDirection: 'row', gap: 8 }}>
            {compact ? <>
              <View accessibilityLabel={t(active.label)} style={{ flex: 1, paddingHorizontal: 12, justifyContent: 'center' }}><active.icon size={24} color={theme.accent} accessible={false} /></View>
              <Pressable accessibilityRole="button" accessibilityLabel={t('navNavigate')} accessibilityState={{ expanded: menuOpen }} onPress={() => setMenuOpen(true)}
                style={({ pressed }) => ({ minWidth: 56, minHeight: 56, padding: 12, borderRadius: 18, backgroundColor: pressed ? theme.muted : theme.selection, justifyContent: 'center', alignItems: 'center' })}>
                <Menu size={26} color={theme.accent} accessible={false} />
              </Pressable>
            </> : destinations.map(item => <TabTrigger key={item.name} name={item.name} asChild><NavigationButton label={t(item.label)} icon={item.icon} /></TabTrigger>)}
          </View>
        </View>
      </View>
    </View>}
    <Modal visible={menuOpen} transparent animationType="none" onRequestClose={() => setMenuOpen(false)}>
      <View style={{ flex: 1, backgroundColor: theme.scrim, justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} accessibilityRole="button" accessibilityLabel={t('navClose')} onPress={() => setMenuOpen(false)} />
        <SafeAreaView edges={['bottom', 'left', 'right']} accessibilityViewIsModal style={{ backgroundColor: theme.surface, maxHeight: '85%', borderTopLeftRadius: 28, borderTopRightRadius: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20 }}>
            <AppText variant="heading" accessibilityRole="header" style={{ flex: 1 }}>{t('navNavigate')}</AppText>
            <Pressable accessibilityRole="button" accessibilityLabel={t('navClose')} onPress={() => setMenuOpen(false)} style={({ pressed }) => ({ minHeight: 48, minWidth: 48, borderRadius: 16, backgroundColor: pressed ? theme.selection : theme.muted, alignItems: 'center', justifyContent: 'center' })}><X size={24} color={theme.text} accessible={false} /></Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 8 }}>
            {destinations.map(item => <TabTrigger key={item.name} name={item.name} onPress={() => setMenuOpen(false)} asChild><NavigationButton label={t(item.label)} icon={item.icon} expanded /></TabTrigger>)}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  </>;
}
