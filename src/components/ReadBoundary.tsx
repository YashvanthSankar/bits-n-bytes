import { Component, type PropsWithChildren } from 'react';
import { router } from 'expo-router';
import { ActionButton, ErrorState, Screen } from './ui';
import { useTranslation } from 'react-i18next';
import { errorTranslationKey } from '../domain/apiError';

function ReadFailure({ error }: { error: unknown }) {
  const { t } = useTranslation();
  return <Screen footer={<ActionButton title={t('locationAction')} onPress={() => router.replace('/location')} />}><ErrorState message={t(errorTranslationKey(error))} /></Screen>;
}
/** A rejected protected query must produce a recovery screen, never an unhandled native error. */
export class ReadBoundary extends Component<PropsWithChildren, { failed: boolean; error: unknown }> {
  state = { failed: false, error: null as unknown };
  static getDerivedStateFromError(error: unknown) { return { failed: true, error }; }
  render() { return this.state.failed ? <ReadFailure error={this.state.error} /> : this.props.children; }
}
