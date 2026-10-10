import { useQuery } from 'convex/react';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { ShieldCheck, TriangleAlert, House, ChevronRight, MapPin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../../../convex/_generated/api';
import { ActionButton, AppText, EmptyState, LoadingState, Screen } from '../../components/ui';
import { AuthorityGate } from '../../features/authority/AuthorityGate';
import { useTheme } from '../../theme/useTheme';

function Overview() {
  const { t } = useTranslation(), theme = useTheme();
  const scopes = useQuery(api.authority.scopes, {});
  return <Screen footer={<ActionButton title={t('backToMap')} variant="secondary" onPress={() => router.replace('/map')} />}>
    <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
      <View style={{width:48,height:48,borderRadius:16,backgroundColor:theme.selection,alignItems:'center',justifyContent:'center'}}><ShieldCheck size={24} color={theme.accent} /></View>
      <View style={{flex:1,gap:4}}><AppText variant="caption" style={{color:theme.accent,fontWeight:'600'}}>GudTour</AppText><AppText variant="heading">{t('authorityTitle')}</AppText></View>
    </View>
    <ActionButton title={t('sachetTitle')} variant="secondary" onPress={()=>router.push('/sachet')} />
    {!scopes ? <LoadingState /> : !scopes.length ? <EmptyState title={t('authorityNoScopes')} /> : scopes.map(scope => <View key={scope.id} style={{gap:16}}>
      <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
        <MapPin size={18} color={theme.secondary} />
        <View style={{flex:1,gap:4}}><AppText style={{fontWeight:'600'}}>{scope.name}</AppText><AppText variant="caption" style={{color:theme.secondary}}>{scope.agencyName}</AppText></View>
        {scope.audience === 'DEMO' && <View style={{paddingHorizontal:10,paddingVertical:6,borderRadius:10,backgroundColor:theme.muted}}><AppText variant="caption" style={{color:theme.secondary,fontWeight:'600'}}>DEMO</AppText></View>}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={t('authorityPublishEmergency')} onPress={() => router.push({pathname:'/authority/declare',params:{jurisdictionId:scope.id}})}
        style={({pressed})=>({padding:20,borderRadius:22,backgroundColor:theme.accent,opacity:pressed ? 0.85 : 1,gap:18})}>
        <TriangleAlert size={26} color={theme.onAccent} />
        <View style={{gap:6}}><View style={{flexDirection:'row',alignItems:'center',gap:12}}><AppText variant="heading" style={{color:theme.onAccent,flex:1}}>{scope.audience === 'DEMO' ? t('authorityPublishDemoEmergency') : t('declareEmergency')}</AppText><ChevronRight size={22} color={theme.onAccent} /></View><AppText style={{color:theme.onAccent}}>{t('authorityPublishEmergencyHelp')}</AppText></View>
      </Pressable>
      {scope.audience === 'DEMO' && <Pressable accessibilityRole="button" accessibilityLabel={t('authorityCreateDemoEvidence')} onPress={() => router.push({pathname:'/authority/demo-notices',params:{jurisdictionId:scope.id}})}
        style={({pressed})=>({padding:20,borderRadius:22,borderWidth:1,borderColor:theme.border,backgroundColor:pressed?theme.muted:theme.surface,gap:10})}>
        <View style={{flexDirection:'row',alignItems:'center',gap:12}}><ShieldCheck size={24} color={theme.accent} /><AppText variant="heading" style={{flex:1}}>{t('authorityCreateDemoEvidence')}</AppText><ChevronRight size={22} color={theme.secondary} /></View>
        <AppText style={{color:theme.secondary}}>{t('authorityCreateDemoEvidenceHelp')}</AppText>
      </Pressable>}
      <ActionButton title={t('viewReports')} variant="secondary" onPress={()=>router.push({pathname:'/authority/reports',params:{jurisdictionId:scope.id}})} />
      <ActionButton title={t('manageEmergencies')} variant="secondary" onPress={()=>router.push({pathname:'/authority/emergencies',params:{jurisdictionId:scope.id}})} />
      <Pressable accessibilityRole="button" accessibilityLabel={t('manageShelters')} onPress={() => router.push({pathname:'/authority/shelters',params:{jurisdictionId:scope.id}})}
        style={({pressed})=>({padding:20,borderRadius:22,borderWidth:1,borderColor:theme.border,backgroundColor:pressed?theme.muted:theme.surface,flexDirection:'row',alignItems:'center',gap:16})}>
        <View style={{padding:12,borderRadius:14,backgroundColor:theme.selection}}><House size={24} color={theme.accent} /></View>
        <AppText style={{fontWeight:'600',flex:1}}>{t('manageShelters')}</AppText><ChevronRight size={20} color={theme.secondary} />
      </Pressable>
    </View>)}
  </Screen>;
}
export default function AuthorityScreen() { return <AuthorityGate><Overview /></AuthorityGate>; }
