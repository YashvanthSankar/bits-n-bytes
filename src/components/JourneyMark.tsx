import { View } from 'react-native';
import Svg, { Circle, Path, Rect, G, Ellipse } from 'react-native-svg';
import { useTheme } from '../theme/useTheme';

/** Decorative wayfinding illustration, not a map or suggested route. */
export function JourneyMark() {
  const theme = useTheme();
  return <View accessible={false} importantForAccessibility="no-hide-descendants" style={{ width: '100%', height: 176, overflow: 'hidden', borderRadius: 32, backgroundColor: theme.selection }}>
    <Svg width="100%" height="100%" viewBox="0 0 320 220">
      <Circle cx="160" cy="110" r="87" fill="none" stroke={theme.border} />
      <Circle cx="160" cy="110" r="65" fill="none" stroke={theme.border} />
      <Ellipse cx="158" cy="191" rx="105" ry="9" fill={theme.border} />
      <G transform="rotate(-12 105 120)">
        <Rect x="48" y="58" width="105" height="128" rx="8" fill={theme.sky} stroke={theme.border} />
        <Path d="M59 70 L91 79 L119 68 L142 76 L142 165 L119 157 L91 170 L59 161 Z" fill={theme.muted} stroke={theme.border} />
        <Path d="M91 79 V170 M119 68 V157 M63 140 Q80 100 103 119 T137 94" fill="none" stroke={theme.secondary} strokeWidth="1.5" strokeDasharray="4 5" />
        <Circle cx="103" cy="119" r="5" fill={theme.accent} />
      </G>
      <G transform="rotate(9 194 125)">
        <Path d="M175 69 V56 Q175 48 183 48 H198 Q206 48 206 56 V69" fill="none" stroke={theme.text} strokeWidth="4" />
        <Rect x="145" y="67" width="96" height="115" rx="19" fill={theme.peach} stroke={theme.secondary} />
        <Path d="M164 85 V162 M181 85 V162 M204 85 V162 M222 85 V162" stroke={theme.onAccent} strokeOpacity=".18" strokeWidth="2" />
        <Rect x="168" y="96" width="50" height="39" rx="5" fill={theme.surface} />
        <Path d="M180 124 L193 106 L206 124 Z" fill={theme.selection} stroke={theme.secondary} strokeWidth="1.5" />
        <Circle cx="163" cy="185" r="5" fill={theme.text} /><Circle cx="222" cy="185" r="5" fill={theme.text} />
      </G>
      <Circle cx="249" cy="64" r="28" fill={theme.sand} stroke={theme.border} />
      <Circle cx="249" cy="64" r="21" fill="none" stroke={theme.border} />
      <Path d="M239 77 L249 46 L259 77 L249 70 Z" fill={theme.accent} />
      <Path d="M43 38 H53 M48 33 V43 M273 155 H281 M277 151 V159" stroke={theme.secondary} strokeWidth="1.5" />
      <Path d="M87 42 Q157 2 219 28" fill="none" stroke={theme.secondary} strokeDasharray="3 5" />
    </Svg>
  </View>;
}
