import { useConvexAuth, useQuery } from 'convex/react';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { MapPin, LocateFixed, Plus, ChevronUp, ChevronDown } from 'lucide-react-native';
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
  const [minimized,setMinimized]=useState(true);
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
            <View accessible={false} style={{width:40,height:40,borderRadius:14,backgroundColor:theme.selection,alignItems:'center',justifyContent:'center'}}><MapPin size={21} strokeWidth={1.6} color={theme.accent}/></View>
            <View style={{flex:1,gap:4}}><AppText variant={minimized || expandedText?'body':'heading'} style={{fontWeight:'600'}} accessibilityRole="header">{minimized?(locality??t('mapCurrentArea')):t('mapWelcome')}</AppText>
              {!minimized && <View style={{flexDirection:'row',alignItems:'center',gap:6}}><MapPin size={16} color={theme.secondary} accessible={false} /><AppText variant="caption" style={{color:theme.secondary,flex:1}}>{locality??t('mapCurrentArea')}</AppText></View>}
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={t(minimized?'expandPanel':'minimizePanel')} accessibilityState={{expanded:!minimized}} onPress={()=>setMinimized(value=>!value)} style={{minWidth:44,minHeight:44,alignItems:'center',justifyContent:'center'}}>{minimized?<ChevronDown size={20} color={theme.secondary}/>:<ChevronUp size={20} color={theme.secondary}/>}</Pressable>

          </View>
          <EmergencyAlerts compact />
          {!minimized && <>
          {own?.role === 'AUTHORITY' && <ActionButton title={t('authorityTitle')} onPress={()=>router.push('/authority')} />}
          <AppText variant="caption" style={{color:theme.secondary}}>{nearby===undefined?t('loading'):nearby.partial?t('mapPartial'):nearby.items.length===0?t('mapEmptySummary'):t('mapReportSummary',{count:nearby.items.length})}</AppText>
          <Pressable accessibilityRole="button" accessibilityLabel={t('refreshLocation')} onPress={()=>router.replace('/location')} style={({pressed})=>({minHeight:48,justifyContent:'center',borderRadius:12,paddingHorizontal:8,backgroundColor:pressed?theme.muted:'transparent'})}>
            <AppText variant="caption" style={{color:theme.secondary}}>{t('locationCaptured')} · {new Date(fix.observedAt).toLocaleTimeString(i18n.language,{hour:'2-digit',minute:'2-digit'})} · ±{Math.ceil(fix.accuracyM)} m</AppText>
          </Pressable>
          </>}
        </ScrollView>
      </View>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={t('mapRecenter')} onPress={()=>setRecenter(value=>value+1)} style={({pressed})=>({position:'absolute',bottom:navInset+reportHeight+28,right:safe.right+20,width:48,height:48,alignItems:'center',justifyContent:'center',borderRadius:24,backgroundColor:pressed?theme.selection:theme.surface,borderWidth:1,borderColor:theme.border})}><LocateFixed size={22} color={theme.accent} accessible={false}/></Pressable>
    <View pointerEvents="box-none" style={{position:'absolute',bottom:navInset+12,left:safe.left+20,right:safe.right+20,alignItems:'center'}}>
      <Pressable onLayout={event=>setReportHeight(event.nativeEvent.layout.height)} accessibilityRole="button" accessibilityLabel={t('reportTitle')} onPress={()=>router.push('/report')}
        style={({pressed})=>({minHeight:56,maxWidth:440,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:12,borderRadius:28,paddingHorizontal:24,paddingVertical:16,backgroundColor:theme.accent,opacity:pressed?.8:1,shadowColor:theme.text,shadowOpacity:.16,shadowRadius:12,shadowOffset:{width:0,height:4},elevation:6})}>
        <Plus size={24} color={theme.onAccent} accessible={false} />{!expandedText && <AppText style={{color:theme.onAccent,fontWeight:'700',flexShrink:1,textAlign:'center'}}>{t('reportTitle')}</AppText>}
      </Pressable>
    </View>
  </View>;
}
export default function MapScreen() { return <ReadBoundary><MapContent /></ReadBoundary>; }
