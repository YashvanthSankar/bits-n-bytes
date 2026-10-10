import { usePaginatedQuery, useQuery } from 'convex/react';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import { ActionButton, AppText, EmptyState, LoadingState, Screen } from '../../../components/ui';
import { AuthorityGate } from '../../../features/authority/AuthorityGate';
import { useTheme } from '../../../theme/useTheme';

function ManagedShelters() {
  const { t, i18n } = useTranslation(); const theme = useTheme();
  const { jurisdictionId, saved, archived } = useLocalSearchParams<{ jurisdictionId?: string; saved?: string; archived?: string }>();
  const scopes = useQuery(api.authority.scopes, {});
  const scope = scopes?.find(s => s.id === jurisdictionId);
  const { results, status, loadMore } = usePaginatedQuery(api.shelters.managed, scope ? { jurisdictionId: scope.id } : 'skip', { initialNumItems: 20 });
  return <Screen footer={<>
    {scope && <ActionButton title={t('addShelter')} onPress={() => router.push({ pathname: '/authority/shelters/edit', params: { jurisdictionId: scope.id } })} />}
    <ActionButton title={t('authorityTitle')} variant="secondary" onPress={() => router.replace('/authority')} />
  </>}>
    <AppText variant="title">{t('manageShelters')}</AppText>
    {saved === '1' && <AppText accessibilityLiveRegion="polite">{t('shelterSaved')}</AppText>}
    {archived === '1' && <AppText accessibilityLiveRegion="polite">{t('shelterArchived')}</AppText>}
    {!scopes ? <LoadingState /> : !scope ? <AppText>{t('jurisdictionDenied')}</AppText> : <>
      <AppText variant="heading">{scope.name}</AppText><AppText>{scope.issuer}</AppText>
      {scope.audience === 'DEMO' && <AppText>DEMO</AppText>}
      {status === 'LoadingFirstPage' ? <LoadingState /> : !results.length ? <EmptyState title={t('noManagedShelters')} /> : results.map(shelter => <View key={shelter.id} style={{ gap: 8, padding: 16, borderWidth: 1, borderColor: theme.border, borderRadius: 16, backgroundColor: theme.surface }}>
        <AppText variant="heading">{shelter.name}</AppText><AppText>{shelter.address}</AppText><AppText>{t(`shelter${shelter.status}`)}</AppText>
        <AppText variant="caption">{t('lastConfirmed')}: {new Date(shelter.statusConfirmedAt).toLocaleString(i18n.language)}</AppText>
        {shelter.stale && <AppText style={{ color: theme.warning }}>{t('stale')}</AppText>}
        <ActionButton title={t('editShelter')} variant="secondary" onPress={() => router.push({ pathname: '/authority/shelters/edit', params: { jurisdictionId: scope.id, shelterId: shelter.id as Id<'shelters'> } })} />
      </View>)}
      {status === 'CanLoadMore' && <ActionButton title={t('loadMore')} variant="secondary" onPress={() => loadMore(20)} />}
      {status === 'LoadingMore' && <LoadingState />}
    </>}
  </Screen>;
}
export default function SheltersManagementScreen() { return <AuthorityGate><ManagedShelters /></AuthorityGate>; }
