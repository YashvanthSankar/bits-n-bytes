import { useConvexAuth, useQuery } from 'convex/react';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { MapPin, LocateFixed, Plus, List, House } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NearbyMap } from '../../components/NearbyMap';
import { useTranslation } from 'react-i18next';
import { ActionButton, AppText, LoadingState, Screen } from '../../components/ui';
import { useLocationSession } from '../../session/LocationSession';
import { api } from '../../../convex/_generated/api';
import { ReadBoundary } from '../../components/ReadBoundary';
import { useNavigationInset } from '../../navigation/NavigationInset';
import { useTheme } from '../../theme/useTheme';
import { EmergencyAlerts } from '../../features/alerts/EmergencyAlerts';
import { useLocality } from '../../features/incidents/useLocality';

function MapContent() {
  const { t,i18n } = useTranslation(); const theme=useTheme(); const safe=useSafeAreaInsets(); const {fontScale,height}=useWindowDimensions();
  const { isLoading, isAuthenticated } = useConvexAuth(); const { fix, signedOut } = useLocationSession();
  const own = useQuery(api.profiles.me, isAuthenticated ? {} : 'skip');
  const nearby = useQuery(api.incidents.nearby,isAuthenticated && fix ? {} : 'skip');
  const locality=useLocality(fix?.point??null);
  const navInset=useNavigationInset()??120;const [headerHeight,setHeaderHeight]=useState(190);const [reportHeight,setReportHeight]=useState(64);const [recenter,setRecenter]=useState(0);
  const expandedText=fontScale>=1.5;
  useFocusEffect(useCallback(() => {
    if (isLoading || signedOut) return;
    if (!isAuthenticated) router.replace('/login'); else if (!fix) router.replace('/location');
  }, [isLoading, isAuthenticated, fix, signedOut]));
  if(!fix)return <Screen><LoadingState /></Screen>;
  return <View style={{flex:1,backgroundColor:theme.background}}>
    <NearbyMap point={fix.point} fullscreen incidents={nearby?.items ?? []} recenter={recenter} topInset={safe.top+headerHeight+12} bottomInset={navInset+reportHeight+24}
      onIncidentPress={id=>router.push({pathname:'/incident/[id]',params:{id}})} />
    <View pointerEvents="box-none" style={{position:'absolute',top:safe.top+8,left:safe.left+16,right:safe.right+16,maxHeight:height*.42}}>
      <View onLayout={event=>setHeaderHeight(event.nativeEvent.layout.height)} style={{borderRadius:24,overflow:'hidden',borderWidth:1,borderColor:theme.border,backgroundColor:theme.surface+'F5',flexShrink:1}}>
        <ScrollView contentContainerStyle={{padding:16,gap:12}}>
          <View style={{flexDirection:'row',gap:12,alignItems:'center'}}>
            <View style={{flex:1,gap:4}}><AppText variant={expandedText?'caption':'heading'} accessibilityRole="header">{expandedText?'GudTour':t('mapWelcome')}</AppText>
              <View style={{flexDirection:'row',alignItems:'center',gap:6}}><MapPin size={16} color={theme.secondary} accessible={false} /><AppText variant="caption" style={{color:theme.secondary,flex:1}}>{locality??t('mapCurrentArea')}</AppText></View>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={t('mapRecenter')} onPress={()=>setRecenter(value=>value+1)} style={({pressed})=>({minWidth:48,minHeight:48,alignItems:'center',justifyContent:'center',borderRadius:16,backgroundColor:pressed?theme.selection:theme.muted})}><LocateFixed size={22} color={theme.accent} accessible={false} /></Pressable>
          </View>
          <EmergencyAlerts />
          {own?.role === 'AUTHORITY' && <ActionButton title={t('authorityTitle')} onPress={()=>router.push('/authority')} />}
          <View style={{flexDirection:expandedText?'column':'row',gap:8}}>
            {[{label:'navIncidents',icon:List,path:'/incidents'},{label:'navShelters',icon:House,path:'/shelters'}].map(action=><Pressable key={action.path} accessibilityRole="button" onPress={()=>router.navigate(action.path as '/incidents'|'/shelters')} style={({pressed})=>({flex:expandedText?undefined:1,minHeight:48,padding:12,borderRadius:14,backgroundColor:pressed?theme.selection:theme.muted,flexDirection:'row',gap:8,alignItems:'center',justifyContent:'center'})}>
              <action.icon size={18} color={theme.accent} accessible={false} /><AppText variant="caption" style={{fontWeight:'600',flexShrink:1}}>{t(action.label)}</AppText>
            </Pressable>)}
          </View>
          <AppText variant="caption" style={{color:theme.secondary}}>{nearby===undefined?t('loading'):nearby.partial?t('mapPartial'):nearby.items.length===0?t('mapEmptySummary'):t('mapReportSummary',{count:nearby.items.length})}</AppText>
          <Pressable accessibilityRole="button" accessibilityLabel={t('refreshLocation')} onPress={()=>router.replace('/location')} style={({pressed})=>({minHeight:48,justifyContent:'center',borderRadius:12,paddingHorizontal:8,backgroundColor:pressed?theme.muted:'transparent'})}>
            <AppText variant="caption" style={{color:theme.secondary}}>{t('locationCaptured')} · {new Date(fix.observedAt).toLocaleTimeString(i18n.language,{hour:'2-digit',minute:'2-digit'})} · ±{Math.ceil(fix.accuracyM)} m</AppText>
          </Pressable>
        </ScrollView>
      </View>
    </View>
    <View pointerEvents="box-none" style={{position:'absolute',bottom:navInset+12,left:safe.left+20,right:safe.right+20,alignItems:'center'}}>
      <Pressable onLayout={event=>setReportHeight(event.nativeEvent.layout.height)} accessibilityRole="button" accessibilityLabel={t('reportTitle')} onPress={()=>router.push('/report')}
        style={({pressed})=>({minHeight:56,maxWidth:440,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:12,borderRadius:28,paddingHorizontal:24,paddingVertical:16,backgroundColor:theme.accent,opacity:pressed?.8:1,shadowColor:theme.text,shadowOpacity:.16,shadowRadius:12,shadowOffset:{width:0,height:4},elevation:6})}>
        <Plus size={24} color={theme.onAccent} accessible={false} />{!expandedText && <AppText style={{color:theme.onAccent,fontWeight:'700',flexShrink:1,textAlign:'center'}}>{t('reportTitle')}</AppText>}
      </Pressable>
    </View>
  </View>;
}
export default function MapScreen() { return <ReadBoundary><MapContent /></ReadBoundary>; }
