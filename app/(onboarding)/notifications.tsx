import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Notifications from 'expo-notifications';

import { ScreenContainer, Title, Body, Button, ProgressBar } from '@shared/components';
import { colors, spacing } from '@shared/theme';
import { useOnboardingContext } from './_layout';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { completeOnboarding } = useOnboardingContext();

  const handleEnable = async () => {
    await Notifications.requestPermissionsAsync();
    finishOnboarding();
  };

  const finishOnboarding = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <ProgressBar steps={4} currentStep={4} />
        <View style={styles.content}>
          <Body style={styles.bellIcon}>{'\uD83D\uDD14'}</Body>
          <Title style={styles.title}>{t('onboarding.notifications.title')}</Title>
          <Body style={styles.subtitle}>{t('onboarding.notifications.subtitle')}</Body>
        </View>
        <View style={styles.footer}>
          <Button title={t('onboarding.notifications.enable')} onPress={handleEnable} />
          <Body onPress={finishOnboarding} style={styles.skipLink}>
            {t('onboarding.notifications.skip')}
          </Body>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  bellIcon: { fontSize: 56, marginBottom: spacing.xl },
  title: { fontSize: 20, textAlign: 'center' },
  subtitle: { fontSize: 12, opacity: 0.6, textAlign: 'center', lineHeight: 20, maxWidth: 220 },
  footer: { gap: spacing.md, alignItems: 'center' },
  skipLink: { color: colors.pearlWhite, fontSize: 12, opacity: 0.5 },
});
