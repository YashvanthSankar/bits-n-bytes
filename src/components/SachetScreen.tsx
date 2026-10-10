import { useConvexAuth, usePaginatedQuery, useQuery } from 'convex/react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../../convex/_generated/api';
import { ActionButton, AppText, EmptyState, LoadingState, Screen } from '../components/ui';
import { ReadBoundary } from '../components/ReadBoundary';
import { useLocationSession } from '../session/LocationSession';
import { useTheme } from '../theme/useTheme';
import { isLanguageCode } from '../i18n/resources';
function Latest(){
 const {t,i18n}=useTranslation(),theme=useTheme(),{isAuthenticated}=useConvexAuth(),{fix,signedOut}=useLocationSession();
 const enabled=isAuthenticated&&!!fix&&!signedOut;const language=isLanguageCode(i18n.language)?i18n.language:'en';
 const {results,status,loadMore}=usePaginatedQuery(api.sachetPublic.latest,enabled?{language}:'skip',{initialNumItems:15});
 const feed=useQuery(api.sachetPublic.status,enabled?{}:'skip');
 const date=(time:number)=>new Date(time).toLocaleString(i18n.language);
 return <Screen>
  <AppText variant="title">{t('sachetTitle')}</AppText><AppText>{t('sachetAllIndia')}</AppText>
  {feed?.checkedAt&&<AppText variant="caption">{t('sachetLastSync')}: {date(feed.checkedAt)}</AppText>}
  {(feed?.stale||feed?.failed)&&<AppText style={{color:theme.warning}}>{t('sachetStale')}</AppText>}
  {!enabled?<ActionButton title={t('locationAction')} onPress={()=>router.replace('/location')}/>:status==='LoadingFirstPage'?<LoadingState/>:<>
   {!results.length&&<EmptyState title={t('sachetEmpty')} message={t('sachetEmptyHelp')}/>}
   {results.map(notice=><View key={notice.id} style={{gap:10,padding:18,borderRadius:20,borderWidth:1,borderColor:theme.border,backgroundColor:theme.surface}}>
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}><AppText style={{color:notice.expired?theme.secondary:['Extreme','Severe'].includes(notice.severity)?theme.danger:theme.accent,fontWeight:'600'}}>{notice.severity}</AppText><AppText>{t(notice.expired?'sachetExpired':'sachetPublished')}</AppText></View>
    <AppText variant="heading">{notice.headline}</AppText><AppText>{notice.issuer}</AppText>
    {!!notice.areaDescriptions.length&&<AppText>{notice.areaDescriptions.join(' · ')}</AppText>}
    {!!notice.descriptionPreview&&<AppText>{notice.descriptionPreview}{notice.descriptionPreview.length===240?'…':''}</AppText>}
    <AppText variant="caption">{t('emergencyIssued')}: {date(notice.issuedAt)}</AppText>
    {notice.expiresAt!==null&&<AppText variant="caption">{t('sachetExpires')}: {date(notice.expiresAt)}</AppText>}
    {notice.stale&&<AppText style={{color:theme.warning}}>{t('sachetStale')}</AppText>}
    <ActionButton title={t('sachetRead')} variant="secondary" onPress={()=>router.push({pathname:'/sachet/[id]',params:{id:notice.id}})}/>
   </View>)}
   {status==='CanLoadMore'&&<ActionButton title={t('loadMore')} variant="secondary" onPress={()=>loadMore(15)}/>}{status==='LoadingMore'&&<LoadingState/>}
  </>}
 </Screen>;
}
export default function SachetPage(){return <ReadBoundary><Latest/></ReadBoundary>;}
