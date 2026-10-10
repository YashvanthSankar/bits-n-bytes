export const colors = {
  light: {
    background: '#F6F7F4', surface: '#FFFFFF', text: '#182321', secondary: '#53615C',
    border: '#D8DFDA', accent: '#244BC4', onAccent: '#FFFFFF', selection: '#E8EDFC',
    danger: '#AF2424', warning: '#805500', muted: '#EEF1EC',
  },
  dark: {
    background: '#101917', surface: '#192521', text: '#F2F5F1', secondary: '#BCC9C1',
    border: '#3E5147', accent: '#ADC0FF', onAccent: '#142559', selection: '#293C6B',
    danger: '#FFB3AC', warning: '#F3D080', muted: '#24332C',
  },
} as const;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, section: 32, page: 40 } as const;
export const typography = {
  title: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  heading: { fontSize: 22, lineHeight: 30, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 14, lineHeight: 21 },
} as const;
