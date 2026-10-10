import { House, MapPin } from 'lucide-react-native';
import { Fact, RelativeTime } from '../../components/IncidentSummary';
import { useConvexAuth, useQuery } from 'convex/react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { api } from '../../../convex/_generated/api';
import { ActionButton, AppText, EmptyState, LoadingState, Screen } from '../../components/ui';
import { ReadBoundary } from '../../components/ReadBoundary';
import { useLocationSession } from '../../session/LocationSession';
import { useTheme } from '../../theme/useTheme';

function Shelters() {
  const {t}=useTranslation();const theme=useTheme();const {isAuthenticated}=useConvexAuth();const {fix}=useLocationSession();
  const listed=useQuery(api.shelters.nearby,isAuthenticated && fix?{}:'skip');
  return <Screen><AppText variant="title" accessibilityRole="header">{t('navShelters')}</AppText><AppText variant="caption" style={{ color: theme.secondary }}>{t('shelterListNotice')}</AppText>
    {!isAuthenticated || !fix ? <ActionButton title={t('locationAction')} onPress={()=>router.replace('/location')} /> : !listed ? <LoadingState /> : <>
      {listed.partial && <AppText>{t('matchesPartial')}</AppText>}
      {!listed.items.length && <EmptyState title={t('shelterEmpty')} message={t('shelterEmptyNotice')} />}
      {listed.items.map(shelter=><View key={shelter.id} style={{gap:8,borderWidth:1,borderColor:theme.border,borderRadius:16,padding:16,backgroundColor:theme.surface}}>
        {shelter.id===listed.nearestId && <AppText style={{color:theme.accent}}>{t('nearestListedShelter')}</AppText>}<AppText variant="heading">{shelter.name}</AppText>{shelter.audience==='DEMO' && <AppText>DEMO</AppText>}<AppText>{shelter.issuer}</AppText><AppText>{shelter.address}</AppText>
        <AppText>{t(`shelter${shelter.status}`)} · {(shelter.distanceM/1000).toFixed(1)} km · {t('approximateDistance')}</AppText>
        <Fact icon={MapPin}><AppText variant="caption">{t('lastConfirmed')}</AppText><RelativeTime timestamp={shelter.statusConfirmedAt}/></Fact>
        {shelter.stale && <AppText style={{color:theme.warning}}>{t('stale')}</AppText>}
        {shelter.accessInstruction && <AppText>{shelter.accessInstruction}</AppText>}
        {shelter.phone && <AppText>{shelter.phone}</AppText>}
        <ActionButton icon={House} title={t('shelterDetails')} variant="secondary" onPress={()=>router.push({pathname:'/shelter/[id]',params:{id:shelter.id}})} />
      </View>)}
    </>}
  </Screen>;
}
export default function SheltersScreen(){return <ReadBoundary><Shelters /></ReadBoundary>;}
