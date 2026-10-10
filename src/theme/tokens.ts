export const colors = {
  light: {
    background: '#F7F6F3', surface: '#FFFFFF', text: '#20201E', secondary: '#686761',
    border: '#E5E3DD', accent: '#242421', onAccent: '#FFFFFF', selection: '#ECEAE4',
    danger: '#AD302B', warning: '#805500', muted: '#F0EFEA', scrim: '#18181699', glassSurface: '#FFFFFFEB',
    sky: '#E1EFF8', peach: '#FBE4D6', sand: '#F4EACB', rose: '#F5E1E3',
  },
  dark: {
    background: '#151514', surface: '#20201E', text: '#F6F5F1', secondary: '#BDBAB2',
    border: '#3C3B36', accent: '#F1EFE8', onAccent: '#20201E', selection: '#36352F',
    danger: '#FFB3AC', warning: '#F3D080', muted: '#2A2925', scrim: '#00000099', glassSurface: '#20201EEB',
    sky: '#233744', peach: '#443126', sand: '#3E3824', rose: '#422E33',
  },
} as const;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, section: 24, page: 28 } as const;
export const typography = {
  title: { fontSize: 24, lineHeight: 30, letterSpacing: -0.6, fontWeight: '700' as const },
  heading: { fontSize: 18, lineHeight: 25, letterSpacing: -0.3, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 22 },
  caption: { fontSize: 12, lineHeight: 18 },
} as const;
