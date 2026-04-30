import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Notifications from 'expo-notifications';

import { ScreenContainer, Title, Body, Button, ProgressBar } from '@shared/components';
import { colors, spacing } from '@shared/theme';
import { storageService } from '@services/storage';
import { rescheduleAll } from '@services/notifications';
import { DEFAULT_NOTIFICATION_SETTINGS } from '@features/profile/types';
import { useOnboardingContext } from './_layout';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { completeOnboarding } = useOnboardingContext();

  const handleEnable = async () => {
    await Notifications.requestPermissionsAsync();

    const settings = {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      morningEnabled: true,
      eveningEnabled: true,
    };
    storageService.setNotificationSettings(settings);
    await rescheduleAll(settings);

    completeOnboarding();
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    const settings = {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      morningEnabled: false,
      eveningEnabled: false,
    };
    storageService.setNotificationSettings(settings);

    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <ProgressBar steps={4} currentStep={4} />
        <View style={styles.content}>
          <MaterialCommunityIcons name="bell-outline" size={56} color={colors.gold} style={styles.bellIcon} />
          <Title style={styles.title}>{t('onboarding.notifications.title')}</Title>
          <Body style={styles.subtitle}>{t('onboarding.notifications.subtitle')}</Body>
        </View>
        <View style={styles.footer}>
          <Button title={t('onboarding.notifications.enable')} onPress={handleEnable} />
          <Body onPress={handleSkip} style={styles.skipLink}>
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
  bellIcon: { fontSize: 56, marginBottom: spacing.xl, lineHeight: 70 },
  title: { fontSize: 24, textAlign: 'center' },
  subtitle: { fontSize: 14, opacity: 0.6, textAlign: 'center', lineHeight: 22, maxWidth: 260 },
  footer: { gap: spacing.md, alignItems: 'center' },
  skipLink: { color: colors.pearlWhite, fontSize: 12, opacity: 0.5 },
});
