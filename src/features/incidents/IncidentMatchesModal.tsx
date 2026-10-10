import { Modal,Pressable,ScrollView,View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Layers,X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { PublicIncident } from '../../contracts/domain';
import { ActionButton,AppText } from '../../components/ui';
import { IncidentCard } from '../../components/IncidentCard';
import { Choice } from '../../components/Choice';
import { useTheme } from '../../theme/useTheme';

export function IncidentMatchesModal({visible,items,partial,chosen,onChoose,onClose}: {
  visible:boolean;items:PublicIncident[];partial:boolean;chosen:string|null;onChoose:(id:string)=>void;onClose:()=>void;
}) {
  const {t}=useTranslation();const theme=useTheme();const safe=useSafeAreaInsets();
  return <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
    <View style={{flex:1,justifyContent:'center',backgroundColor:theme.scrim,paddingHorizontal:20,paddingTop:safe.top+20,paddingBottom:safe.bottom+20}}>
      <View accessibilityViewIsModal style={{width:'100%',maxWidth:600,maxHeight:'90%',alignSelf:'center',borderRadius:24,backgroundColor:theme.surface,overflow:'hidden'}}>
        <View style={{padding:20,flexDirection:'row',gap:12,alignItems:'center'}}>
          <Layers size={24} color={theme.accent} accessible={false} />
          <AppText variant="heading" accessibilityRole="header" style={{flex:1}}>{t('matchTitle')}</AppText>
          <Pressable accessibilityRole="button" accessibilityLabel={t('closeMatches')} onPress={onClose} style={({pressed})=>({minWidth:48,minHeight:48,borderRadius:14,backgroundColor:pressed?theme.selection:theme.muted,justifyContent:'center',alignItems:'center'})}><X size={24} color={theme.text} accessible={false} /></Pressable>
        </View>
        <ScrollView contentContainerStyle={{paddingHorizontal:20,paddingBottom:20,gap:16}}>
          <AppText>{t('matchExplanation')}</AppText>
          {partial && <AppText>{t('matchesPartial')}</AppText>}
          {items.map(item=><View key={item.id} style={{gap:8}}><IncidentCard incident={item} /><Choice label={t('addObservation')} selected={chosen===item.id} onPress={()=>onChoose(item.id)} /></View>)}
        </ScrollView>
        <View style={{padding:20,gap:12,borderTopWidth:1,borderTopColor:theme.border}}>
          <ActionButton title={t('continue')} disabled={!chosen} onPress={onClose} />
          <ActionButton title={t('differentEvent')} variant="secondary" onPress={()=>{onChoose('NEW');onClose();}} />
        </View>
      </View>
    </View>
  </Modal>;
}
