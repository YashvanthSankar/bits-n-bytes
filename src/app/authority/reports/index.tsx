import { usePaginatedQuery, useQuery } from 'convex/react';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { View } from 'react-native';
import { api } from '../../../../convex/_generated/api';
import { ActionButton, AppText, EmptyState, LoadingState, Screen } from '../../../components/ui';
import { AuthorityGate } from '../../../features/authority/AuthorityGate';
import { useTheme } from '../../../theme/useTheme';
function Reports(){
 const {t,i18n}=useTranslation(),theme=useTheme(),{jurisdictionId,audience:initialAudience}=useLocalSearchParams<{jurisdictionId?:string;audience?:string}>();
 const [audience,setAudience]=useState<'LIVE'|'DEMO'>(initialAudience==='DEMO'?'DEMO':'LIVE');
 const scopes=useQuery(api.authority.scopes,{}),scope=scopes?.find(s=>s.id===jurisdictionId);
 const {results,status,loadMore}=usePaginatedQuery(api.authorityReports.list,scope?{jurisdictionId:scope.id,audience}:'skip',{initialNumItems:15});
 return <Screen footer={<ActionButton title={t('authorityTitle')} variant="secondary" onPress={()=>router.replace('/authority')}/>}>
  <AppText variant="title">{t('viewReports')}</AppText>{!scopes?<LoadingState/>:!scope?<AppText>{t('jurisdictionDenied')}</AppText>:<>
   <AppText>{scope.name} · {scope.issuer}</AppText>{scope.audience==='DEMO'&&<View style={{gap:8}}><ActionButton title={t('liveReports')} variant={audience==='LIVE'?'primary':'secondary'} onPress={()=>setAudience('LIVE')}/><ActionButton title={t('demoReports')} variant={audience==='DEMO'?'primary':'secondary'} onPress={()=>setAudience('DEMO')}/></View>}<AppText>{t(audience==='LIVE'?'liveReports':'demoReports')}</AppText>
   {status==='LoadingFirstPage'?<LoadingState/>:!results.length?<EmptyState title={t('emptyTitle')}/>:results.map(report=><View key={report.id} style={{gap:10,padding:18,borderRadius:20,borderWidth:1,borderColor:theme.border,backgroundColor:theme.surface}}>
    <AppText variant="heading">{t(`hazard${report.hazard}`)}</AppText><AppText>{report.locality}</AppText><AppText>{t(`source${report.provenance}`)}</AppText><AppText>{t(`verification${report.verification}`)} · {report.lifecycle}</AppText>
    <AppText>{`${t('recentWitnesses')}: ${report.recentWitnesses}`}</AppText>
    <AppText style={{fontWeight:'600'}}>{t('jevDecision')}: {report.assessment?t(`qualification${report.assessment.qualification}`):t(report.provenance==='AUTHORITY'?'officialDecisionBypass':'assessmentDevelopment')}</AppText>
    {report.assessment&&<AppText variant="caption">{t('assessedAt')}: {new Date(report.assessment.assessedAt).toLocaleString(i18n.language)}</AppText>}
    {report.reviewNeeded&&<AppText style={{color:theme.warning}}>{t('reviewRequested')}</AppText>}
    <ActionButton title={t('viewDecisionContext')} variant="secondary" onPress={()=>router.push({pathname:'/authority/reports/[id]',params:{id:report.id,jurisdictionId:scope.id,audience}})}/>
   </View>)}{status==='CanLoadMore'&&<ActionButton title={t('loadMore')} variant="secondary" onPress={()=>loadMore(15)}/>} {status==='LoadingMore'&&<LoadingState/>}
  </>}
 </Screen>;
}
export default function AuthorityReports(){return <AuthorityGate><Reports/></AuthorityGate>;}
