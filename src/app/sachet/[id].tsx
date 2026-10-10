import { useConvexAuth, useQuery } from 'convex/react';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { AppText, LoadingState, Screen } from '../../components/ui';
import { ReadBoundary } from '../../components/ReadBoundary';
import { useTheme } from '../../theme/useTheme';
import { isLanguageCode } from '../../i18n/resources';
function Detail(){
 const {t,i18n}=useTranslation(),theme=useTheme(),{id}=useLocalSearchParams<{id:string}>(),{isAuthenticated}=useConvexAuth();
 const language=isLanguageCode(i18n.language)?i18n.language:'en';
 const notice=useQuery(api.sachetPublic.detail,isAuthenticated&&id?{noticeId:id as Id<'officialNotices'>,language}:'skip');
 const date=(time:number)=>new Date(time).toLocaleString(i18n.language);
 return <Screen>
  <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
   <Pressable accessibilityRole="button" accessibilityLabel={t('sachetBack')} onPress={()=>router.canGoBack()?router.back():router.replace('/sachet')}
    style={({pressed})=>({minWidth:44,minHeight:44,borderRadius:22,backgroundColor:pressed?theme.selection:theme.surface,alignItems:'center',justifyContent:'center'})}><ArrowLeft size={22} color={theme.accent}/></Pressable>
   <AppText style={{color:theme.secondary,fontWeight:'600'}}>SACHET</AppText>
  </View>
  {!notice?<LoadingState/>:<><AppText variant="caption">NDMA · SACHET</AppText><AppText variant="title">{notice.headline||notice.event}</AppText><AppText>{notice.issuer}</AppText>
   <AppText style={{color:notice.expired||!notice.active?theme.secondary:theme.accent}}>{t(!notice.active?'sachetSuperseded':notice.expired?'sachetExpired':'sachetPublished')} · {notice.severity}</AppText>
   <AppText>{t('sachetUrgency')}: {notice.urgency} · {t('sachetCertainty')}: {notice.certainty}</AppText>
   <AppText variant="caption">{t('emergencyIssued')}: {date(notice.issuedAt)}</AppText>
   {notice.effectiveAt!==null&&<AppText variant="caption">{t('sachetEffective')}: {date(notice.effectiveAt)}</AppText>}
   {notice.onsetAt!==null&&<AppText variant="caption">{t('sachetOnset')}: {date(notice.onsetAt)}</AppText>}
   {notice.expiresAt!==null&&<AppText variant="caption">{t('sachetExpires')}: {date(notice.expiresAt)}</AppText>}
   {(notice.stale||notice.expired||!notice.active)&&<AppText style={{color:theme.warning}}>{t('sachetHistoryNotice')}</AppText>}
   <View style={{gap:10,padding:16,borderRadius:16,backgroundColor:theme.surface,borderWidth:1,borderColor:theme.border}}><AppText variant="heading">{t('sachetArea')}</AppText>{notice.areaDescriptions.map((area,i)=><AppText key={i}>{area}</AppText>)}{notice.geometryPending&&<AppText variant="caption">{t('sachetGeometryPending')}</AppText>}</View>
   <AppText variant="caption">{t('sachetOriginalLanguage')}: {notice.language}</AppText>
   {notice.infoBlocks.map((block,index)=><View key={index} style={{gap:16}}>
    {index>0&&<><AppText variant="heading">{block.headline||block.event}</AppText><AppText>{block.areaDescriptions.join(' · ')}</AppText><AppText>{block.severity} · {block.urgency}</AppText>{block.expiresAt!==null&&<AppText>{t('sachetExpires')}: {date(block.expiresAt)}</AppText>}</>}
    {!!block.description&&<><AppText variant="heading">{t('sachetDescription')}</AppText><AppText selectable>{block.description}</AppText></>}
    {!!block.instruction&&<View style={{gap:12,padding:16,borderLeftWidth:4,borderLeftColor:theme.accent,backgroundColor:theme.surface}}><AppText variant="heading">{t('sachetInstructions')}</AppText><AppText selectable>{block.instruction}</AppText></View>}
   </View>)}
   <AppText variant="caption" selectable>{notice.identifier} · {t('sachetRevision')} {notice.revision}</AppText>
  </>}
 </Screen>;
}
export default function SachetDetail(){return <ReadBoundary><Detail/></ReadBoundary>;}
