import { useQuery } from 'convex/react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../../../convex/_generated/api';
import { ActionButton, AppText, EmptyState, LoadingState, Screen } from '../../components/ui';
import { AuthorityGate } from '../../features/authority/AuthorityGate';

function Overview() {
  const { t } = useTranslation(); const scopes = useQuery(api.authority.scopes, {});
  return <Screen footer={<ActionButton title={t('backToMap')} variant="secondary" onPress={() => router.replace('/map')} />}>
    <AppText variant="title">{t('authorityTitle')}</AppText><AppText>{t('authorityScopeHelp')}</AppText>
    {!scopes ? <LoadingState /> : !scopes.length ? <EmptyState title={t('authorityNoScopes')} /> : scopes.map(scope => <View key={scope.id} style={{ gap: 12 }}>
      <AppText variant="heading">{scope.name}</AppText><AppText>{scope.agencyName}</AppText>
      {scope.audience === 'DEMO' && <AppText>DEMO</AppText>}
      <ActionButton title={t('manageShelters')} onPress={() => router.push({ pathname: '/authority/shelters', params: { jurisdictionId: scope.id } })} />
    </View>)}
  </Screen>;
}
export default function AuthorityScreen() { return <AuthorityGate><Overview /></AuthorityGate>; }
