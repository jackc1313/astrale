import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenContainer, Title, Body, Button, ProgressBar } from '@shared/components';
import { colors, spacing } from '@shared/theme';
import { InterestCard } from '@features/onboarding/components';
import type { InterestId } from '@features/onboarding/types';
import { useOnboardingContext } from './_layout';

const INTERESTS: { id: InterestId; icon: string; titleKey: string; descKey: string }[] = [
  { id: 'love', icon: 'heart-outline', titleKey: 'onboarding.interests.love', descKey: 'onboarding.interests.loveDesc' },
  { id: 'work', icon: 'briefcase-outline', titleKey: 'onboarding.interests.work', descKey: 'onboarding.interests.workDesc' },
  { id: 'health', icon: 'spa-outline', titleKey: 'onboarding.interests.health', descKey: 'onboarding.interests.healthDesc' },
  { id: 'luck', icon: 'clover', titleKey: 'onboarding.interests.luck', descKey: 'onboarding.interests.luckDesc' },
];

export default function InterestsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { interests, toggleInterest } = useOnboardingContext();

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.pearlWhite} />
        </Pressable>
        <ProgressBar steps={4} currentStep={3} />
        <View style={styles.header}>
          <Title style={styles.headerTitle}>{t('onboarding.interests.title')}</Title>
          <Body style={styles.subtitle}>{t('onboarding.interests.subtitle')}</Body>
        </View>
        <View style={styles.cards}>
          {INTERESTS.map((item) => (
            <InterestCard
              key={item.id}
              icon={item.icon}
              title={t(item.titleKey)}
              description={t(item.descKey)}
              selected={interests.includes(item.id)}
              onPress={() => toggleInterest(item.id)}
            />
          ))}
        </View>
        <View style={styles.footer}>
          <Button
            title={t('common.continue')}
            onPress={() => router.push('/(onboarding)/notifications')}
            disabled={interests.length === 0}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl },
  backButton: { marginBottom: spacing.sm },
  header: { marginTop: spacing['4xl'], gap: spacing.sm },
  headerTitle: { fontSize: 24, lineHeight: 34 },
  subtitle: { opacity: 0.6, fontSize: 14 },
  cards: { marginTop: spacing.xl, gap: spacing.md },
  footer: { marginTop: 'auto' },
});
