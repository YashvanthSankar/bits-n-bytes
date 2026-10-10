import { useTranslation } from 'react-i18next';
import { AppText, Screen } from '../../components/ui';

export default function ChatScreen() {
  const { t } = useTranslation();
  return <Screen><AppText variant="title" accessibilityRole="header">{t('navChat')}</AppText>
    <AppText>{t('chatPending')}</AppText>
    <AppText variant="caption">{t('chatNotEvidence')}</AppText>
  </Screen>;
}
