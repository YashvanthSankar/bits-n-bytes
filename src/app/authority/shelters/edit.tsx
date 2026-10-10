import { useQuery } from 'convex/react';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import { AppText, LoadingState, Screen } from '../../../components/ui';
import { AuthorityGate } from '../../../features/authority/AuthorityGate';
import { ShelterForm } from '../../../features/authority/ShelterForm';
import { useTranslation } from 'react-i18next';

function Editor() {
  const { t } = useTranslation();
  const { jurisdictionId, shelterId } = useLocalSearchParams<{ jurisdictionId?: string; shelterId?: string }>();
  const scopes = useQuery(api.authority.scopes, {});
  const scope = scopes?.find(s => s.id === jurisdictionId);
  const current = useQuery(api.shelters.managedDetail, scope && shelterId ? { shelterId: shelterId as Id<'shelters'> } : 'skip');
  if (!scopes || (scope && shelterId && !current)) return <Screen><LoadingState /></Screen>;
  if (!scope || (current && current.jurisdictionId !== scope.id)) return <Screen><AppText>{t('jurisdictionDenied')}</AppText></Screen>;
  return <ShelterForm key={shelterId ?? scope.id} jurisdictionId={scope.id} jurisdictionName={scope.name} issuer={scope.issuer} audience={scope.audience} initial={current ?? null} />;
}
export default function ShelterEditorScreen() { return <AuthorityGate><Editor /></AuthorityGate>; }
