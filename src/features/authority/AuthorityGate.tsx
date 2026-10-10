import { useConvexAuth, useQuery } from 'convex/react';
import { router } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../convex/_generated/api';
import { ActionButton, AppText, LoadingState, Screen } from '../../components/ui';
import { ReadBoundary } from '../../components/ReadBoundary';

/** UI convenience only. Every authority query/mutation independently enforces approval. */
function Gate({ children }: PropsWithChildren) {
  const { t } = useTranslation(); const { isAuthenticated, isLoading } = useConvexAuth();
  const own = useQuery(api.profiles.me, isAuthenticated ? {} : 'skip');
  if (isLoading || (isAuthenticated && !own)) return <Screen><LoadingState /></Screen>;
  if (!isAuthenticated || own?.role !== 'AUTHORITY') return <Screen footer={<ActionButton title={t('backToMap')} onPress={() => router.replace('/map')} />}>
    <AppText variant="title">{t('authorityTitle')}</AppText><AppText>{t('authorityDenied')}</AppText>
  </Screen>;
  return children;
}
export function AuthorityGate({ children }: PropsWithChildren) { return <ReadBoundary><Gate>{children}</Gate></ReadBoundary>; }
