import { useConvex, useConvexAuth, useQuery } from 'convex/react';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Linking, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { ActionButton, AppText, LoadingState, Screen } from '../../components/ui';
import { ReadBoundary } from '../../components/ReadBoundary';
import { coordinates, shelterCopyText, shelterMapsUrl, shelterPhoneUrl } from '../../domain/shelterDestination';
import { useTheme } from '../../theme/useTheme';

function Detail() {
  const { t, i18n } = useTranslation(); const theme = useTheme(); const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useConvexAuth(); const convex = useConvex();
  const shelter = useQuery(api.shelters.detail, isAuthenticated && id ? { shelterId: id as Id<'shelters'> } : 'skip');
  const [busy, setBusy] = useState(false), [notice, setNotice] = useState<string | null>(null);
  const running = useRef(false);
  async function external(kind: 'MAPS' | 'COPY' | 'PHONE') {
    if (running.current || !shelter) return; running.current = true; setBusy(true); setNotice(null);
    try {
      // Copy the visible destination even when the network is down; navigation still revalidates.
      if (kind === 'COPY') { await Clipboard.setStringAsync(shelterCopyText(shelter)); setNotice('destinationCopied'); return; }
      const current = await convex.query(api.shelters.detail, { shelterId: shelter.id });
      if (current.revision !== shelter.revision) { setNotice('shelterChanged'); return; }
      if (kind === 'MAPS') await Linking.openURL(shelterMapsUrl(current.point));
      else { const url = shelterPhoneUrl(current.phone); if (!url) { setNotice('shelterNoPhone'); return; } await Linking.openURL(url); }
    } catch { setNotice(kind === 'COPY' ? 'copyUnavailable' : 'destinationUnavailable'); }
    finally { running.current = false; setBusy(false); }
  }
  return <Screen footer={<>
    {notice && <AppText accessibilityLiveRegion="polite">{t(notice)}</AppText>}
    {shelter && <><ActionButton title={t('shelterDirections')} busy={busy} onPress={() => void external('MAPS')} />
      <ActionButton title={t('copyDestination')} variant="secondary" disabled={busy} onPress={() => void external('COPY')} /></>}
    <ActionButton title={t('navShelters')} variant="secondary" disabled={busy} onPress={() => router.replace('/shelters')} />
  </>}>
    {!isAuthenticated ? <ActionButton title={t('locationAction')} onPress={() => router.replace('/location')} /> : !shelter ? <LoadingState /> : <>
      <AppText variant="title">{shelter.name}</AppText><AppText>{shelter.issuer}</AppText>{shelter.audience === 'DEMO' && <AppText>DEMO</AppText>}
      <AppText variant="heading">{t(`shelter${shelter.status}`)}</AppText><AppText>{shelter.address}</AppText><AppText selectable>{coordinates(shelter.point)}</AppText>
      <AppText variant="caption">{t('lastConfirmed')}: {new Date(shelter.statusConfirmedAt).toLocaleString(i18n.language)}</AppText>
      <AppText>{(shelter.distanceM / 1_000).toFixed(1)} km · {t('approximateDistance')}</AppText>
      {!shelter.locationFresh && <AppText style={{ color: theme.warning }}>{t('shelterOldLocation')}</AppText>}
      <View style={{ gap: 8 }}>{shelter.limitations.map(reason => <AppText key={reason} style={{ color: theme.warning }}>{t(`shelterLimit${reason}`)}</AppText>)}</View>
      <AppText>{t('shelterCapacity')}: {shelter.capacity ?? t('unknownValue')}</AppText>
      <AppText>{t('shelterRemaining')}: {shelter.remaining ?? t('unknownValue')}</AppText>
      <AppText>{t(`access${shelter.accessibility}`)}</AppText>
      {!!shelter.facilities.length && <AppText>{shelter.facilities.join(' · ')}</AppText>}
      {!!shelter.accessInstruction && <AppText>{shelter.accessInstruction}</AppText>}
      {shelter.phone ? <><AppText selectable>{shelter.phone}</AppText><ActionButton title={t('callShelter')} variant="secondary" disabled={busy} onPress={() => void external('PHONE')} /></> : <AppText>{t('shelterNoPhone')}</AppText>}
      <AppText variant="caption">{t('shelterRouteNotice')}</AppText>
    </>}
  </Screen>;
}
export default function ShelterDetailScreen() { return <ReadBoundary><Detail /></ReadBoundary>; }
