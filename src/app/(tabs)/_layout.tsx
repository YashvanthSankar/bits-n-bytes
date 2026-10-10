import { BlurTargetView } from 'expo-blur';
import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import { FloatingNavigation, destinations } from '../../navigation/FloatingNavigation';
import { NavigationInset } from '../../navigation/NavigationInset';
import { useTheme } from '../../theme/useTheme';

export default function MainLayout() {
  const theme = useTheme(); const target = useRef<View | null>(null); const [inset, setInset] = useState(120);
  return <NavigationInset.Provider value={inset}>
    <Tabs style={{ flex: 1, backgroundColor: theme.background }}>
      <BlurTargetView ref={target} style={{ flex: 1 }}><TabSlot /></BlurTargetView>
      <TabList style={{ display: 'none' }}>{destinations.map(item => <TabTrigger key={item.name} name={item.name} href={item.href} />)}</TabList>
      <FloatingNavigation target={target} onInset={setInset} />
    </Tabs>
  </NavigationInset.Provider>;
}
