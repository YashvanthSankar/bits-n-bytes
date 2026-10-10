import { useQuery } from 'convex/react';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import { ActionButton, AppText, LoadingState, Screen } from '../../../components/ui';
import { AuthorityGate } from '../../../features/authority/AuthorityGate';
import { useTheme } from '../../../theme/useTheme';
function Detail(){
 const {t,i18n}=useTranslation(),theme=useTheme(),{id,jurisdictionId}=useLocalSearchParams<{id:string;jurisdictionId:string}>();const [showContext,setShowContext]=useState(false);
 const value=useQuery(api.authorityReports.detail,id&&jurisdictionId?{incidentId:id as Id<'incidents'>,jurisdictionId:jurisdictionId as Id<'jurisdictions'>}:'skip');
 const a=value?.assessment;
 const context=a?.contextJson?JSON.parse(a.contextJson) as {incident?:{counts?:{recent:number;total:number};samples?:{description:string;observedAt:number}[]};weather?:{data?:{current?:{description:string;temperatureC:number|null;windKmh:number|null}}};official?:{items?:{headline:string;issuer:string}[]};missingInputs?:string[]}:null;
 const judgments=a?JSON.parse(a.judgmentsJson) as Record<string,{choice:string;optionProbability:number;confidence:number}>:null;
 const date=(time:number)=>new Date(time).toLocaleString(i18n.language);
 return <Screen footer={<><ActionButton title={t('viewReports')} variant="secondary" onPress={()=>router.replace({pathname:'/authority/reports',params:{jurisdictionId,audience:value?.incident.audience??'LIVE'}})}/>{value?.canDeclare&&<ActionButton title={t('declareEmergency')} onPress={()=>router.push({pathname:'/authority/declare',params:{jurisdictionId,audience:value?.incident.audience??'LIVE'}})}/>}</>}>
  {!value?<LoadingState/>:<><AppText variant="title">{t(`hazard${value.incident.hazard}`)}</AppText><AppText>{value.incident.locality}</AppText>{value.incident.audience==='DEMO'&&<AppText>DEMO</AppText>}
   <AppText>{t(`verification${value.incident.verification}`)}</AppText><AppText>{t('recentWitnesses')}: {value.incident.recentWitnesses} · {t('totalWitnesses')}: {value.incident.totalWitnesses}</AppText>
   {value.job&&<AppText variant="caption">{t('assessmentJob')}: {value.job.status}{value.job.lastError?` · ${value.job.lastError}`:''}</AppText>}
   {!a?<AppText>{t(value.incident.provenance==='AUTHORITY'?'officialDecisionBypass':'assessmentDevelopment')}</AppText>:<>
    <View style={{gap:12,padding:18,borderWidth:1,borderColor:theme.border,borderRadius:20,backgroundColor:theme.surface}}>
     <AppText variant="heading">{t('jevDecision')}: {t(`qualification${a.qualification}`)}</AppText>
     <AppText>{t('appliedOutcome')}: {t(a.outcome==='SUPPRESSED'?'assessmentSuppressed':`qualification${a.outcome==='QUALIFIED'?'NOTIFIABLE_EMERGENCY':a.outcome}`)}</AppText>
     <AppText>{t('selectedProbability')}: {Math.round(a.optionProbability*100)}% · {t('modelConfidence')}: {Math.round(a.confidence*100)}%</AppText>
     <AppText>{t('severityLabel')}: {t(`severity${a.severity}`)}</AppText><AppText variant="caption">{t('assessedAt')}: {date(a.assessedAt)}</AppText><AppText variant="caption">{a.model} · {a.rubric} · {a.latencyMs} ms</AppText>
     {!a.currentEvidence&&<AppText style={{color:theme.warning}}>{t('assessmentOutdated')}</AppText>}
     <AppText>{t('modelEvidenceNotice')}</AppText>
    </View>
    <AppText variant="heading">{t('contextGiven')}</AppText>
    {context?.incident?.counts&&<AppText>{t('recentWitnesses')}: {context.incident.counts.recent} · {t('totalWitnesses')}: {context.incident.counts.total}</AppText>}
    {context?.incident?.samples?.map((sample,i)=><View key={i} style={{gap:4}}><AppText>{sample.description||t('emptyReportDescription')}</AppText><AppText variant="caption">{date(sample.observedAt)}</AppText></View>)}
    <AppText>{t('weatherEvidence')}: {context?.weather?.data?.current?.description??t('unavailableEvidence')}</AppText>
    {context?.official?.items?.map((source,i)=><AppText key={i}>{source.issuer} · {source.headline}</AppText>)}
    {!context?.official?.items?.length&&<AppText>{t('noOfficialMatch')}</AppText>}
    {!!context?.missingInputs?.length&&<><AppText style={{fontWeight:'600'}}>{t('missingInputs')}</AppText>{context.missingInputs.map(key=><AppText key={key} variant="caption">{key}</AppText>)}</>}
    <AppText variant="heading">{t('jevJudgments')}</AppText>{Object.entries(judgments??{}).map(([key,j])=><AppText key={key}>{key}: {j.choice} · {Math.round(j.optionProbability*100)}%</AppText>)}
    <ActionButton title={t(showContext?'hideExactContext':'showExactContext')} variant="secondary" onPress={()=>setShowContext(x=>!x)}/>
    {showContext&&<><AppText>{t('contextOriginalNotice')}</AppText><AppText variant="heading">{t('contextStageOne')}</AppText><AppText selectable variant="caption">{JSON.stringify({policy:a.rubric,evidence:context},null,2)}</AppText><AppText variant="heading">{t('contextStageTwo')}</AppText><AppText selectable variant="caption">{JSON.stringify({evidence:context,judgments},null,2)}</AppText></>}
   </>}
  </>}
 </Screen>;
}
export default function ReportDecisionDetail(){return <AuthorityGate><Detail/></AuthorityGate>;}
