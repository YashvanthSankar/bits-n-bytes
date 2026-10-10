import { useMutation, useQuery } from 'convex/react';
import type { FunctionArgs, FunctionReturnType } from 'convex/server';
import { randomUUID } from 'expo-crypto';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { ActionButton, AppText, LoadingState, Screen } from '../../components/ui';
import { Choice } from '../../components/Choice';
import { AuthorityGate } from '../../features/authority/AuthorityGate';
import { apiErrorCode, errorTranslationKey } from '../../domain/apiError';
import { useTheme } from '../../theme/useTheme';
type Item=FunctionReturnType<typeof api.declarations.managed>['page'][number];
type End=FunctionArgs<typeof api.declarations.end>;
function Manager(){
 const {jurisdictionId}=useLocalSearchParams<{jurisdictionId:string}>(),{t,i18n}=useTranslation(),theme=useTheme(),safe=useSafeAreaInsets();
 const [cursor,setCursor]=useState<string|null>(null),[selected,setSelected]=useState<Item|null>(null),[kind,setKind]=useState<End['kind']>('WITHDRAWN');
 const [busy,setBusy]=useState(false),[uncertain,setUncertain]=useState(false),[error,setError]=useState<string|null>(null),[saved,setSaved]=useState(false);
 const running=useRef(false),pending=useRef<End|null>(null);
 const result=useQuery(api.declarations.managed,jurisdictionId?{jurisdictionId:jurisdictionId as Id<'jurisdictions'>,paginationOpts:{numItems:20,cursor}}:'skip'),end=useMutation(api.declarations.end);
 async function submit(){
  if(running.current || !selected)return;running.current=true;setBusy(true);setError(null);
  pending.current??={requestId:randomUUID(),jurisdictionId:jurisdictionId as Id<'jurisdictions'>,declarationId:selected.id,expectedRevision:selected.revision,kind};
  try{await end(pending.current);pending.current=null;setUncertain(false);setSelected(null);setSaved(true);}
  catch(err){if(apiErrorCode(err)){pending.current=null;setUncertain(false);}else setUncertain(true);setError(errorTranslationKey(err));}
  finally{running.current=false;setBusy(false);}
 }
 return <Screen footer={<ActionButton title={t('authorityTitle')} variant="secondary" disabled={busy||uncertain} onPress={()=>router.replace('/authority')} />}>
  <AppText variant="title">{t('manageEmergencies')}</AppText>
  {saved && <AppText>{t('declarationEnded')}</AppText>}
  {!result?<LoadingState/>:<>
   {!result.page.length && <AppText>{t('noDeclarationsInPage')}</AppText>}
   {result.page.map(item=><View key={item.id} style={{padding:16,gap:12,borderRadius:20,borderWidth:1,borderColor:theme.border,backgroundColor:theme.surface}}>
    <AppText variant="heading">{item.locality} · {t(`hazard${item.hazard}`)}</AppText><AppText>{item.issuer} · {item.audience}</AppText><AppText>{t(`severity${item.severity}`)}</AppText>
    <AppText variant="caption">{t('declarationReview')}: {new Date(item.reviewDueAt).toLocaleString(i18n.language)}</AppText>
    <AppText selectable>{item.originalText}</AppText>
    <ActionButton title={t('endDeclaration')} variant="secondary" disabled={busy||uncertain} onPress={()=>{setSelected(item);setKind('WITHDRAWN');setError(null);setSaved(false);}} />
   </View>)}
   {!result.isDone && <ActionButton title={t('moreIncidents')} variant="secondary" onPress={()=>setCursor(result.continueCursor)} />}
  </>}
  <Modal visible={!!selected} transparent animationType="slide" onRequestClose={()=>{if(!busy&&!uncertain)setSelected(null);}}>
   <View style={{flex:1,justifyContent:'center',padding:20,paddingTop:safe.top+20,paddingBottom:safe.bottom+20,backgroundColor:theme.scrim}}>
    <View style={{maxHeight:'90%',backgroundColor:theme.surface,borderRadius:24,padding:20,gap:16}}>
     <AppText variant="heading">{t('endDeclaration')}</AppText>
     <ScrollView contentContainerStyle={{gap:12}}><AppText>{selected?.locality}</AppText><AppText>{t('endDeclarationHelp')}</AppText>
      {(['WITHDRAWN','RESOLVED','FALSE_ALERT'] as const).map(value=><Choice key={value} label={t(`end${value}`)} selected={kind===value} disabled={busy||uncertain} onPress={()=>setKind(value)}/>)}
      {error && <AppText style={{color:theme.danger}}>{t(uncertain?'authorityWriteUncertain':error)}</AppText>}
     </ScrollView>
     <ActionButton title={t(uncertain?'retry':'confirmEndDeclaration')} variant="danger" busy={busy} onPress={()=>void submit()}/>
     <ActionButton title={t('cancel')} variant="secondary" disabled={busy||uncertain} onPress={()=>setSelected(null)}/>
    </View>
   </View>
  </Modal>
 </Screen>;
}
export default function Emergencies(){return <AuthorityGate><Manager/></AuthorityGate>;}
