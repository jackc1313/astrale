import { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ScreenContainer, Title, Body, Button } from '@shared/components';
import { colors, spacing } from '@shared/theme';
import { storageService } from '@services/storage';
import { usePremium } from '@services/premium';
import { PremiumBanner } from '@features/premium/components';
import { getZodiacSignById, getZodiacIconName } from '@shared/utils/zodiac';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useReadingHistory, useNotifications } from '@features/profile/hooks';
import {
  StreakCounter,
  BadgeGrid,
  ReadingCalendar,
  ReadingDayDetail,
  NotificationSettings,
} from '@features/profile/components';
import type { BadgeInfo } from '@features/profile/types';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isPremium } = usePremium();
  const profile = storageService.getUserProfile();
  const streak = storageService.getUserStreak();
  const collectedCards = storageService.getCollectedCards();
  const sign = profile ? getZodiacSignById(profile.zodiacSign) : null;

  const { getEntriesForDate, getDaysWithEntries } = useReadingHistory();
  const { settings, updateSettings } = useNotifications();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleLogout = () => {
    storageService.clearAll();
    router.replace('/(onboarding)/sign');
  };

  const now = new Date();
  const daysWithEntries = getDaysWithEntries(now.getMonth() + 1, now.getFullYear());
  const selectedEntries = selectedDate ? getEntriesForDate(selectedDate) : [];

  const badges: BadgeInfo[] = [
    { id: '7_days', nameKey: 'badges.7_days', icon: 'fire', current: Math.min(streak.currentStreak, 7), total: 7, earned: streak.badges.includes('7_days') },
    { id: '30_days', nameKey: 'badges.30_days', icon: 'star-four-points', current: Math.min(streak.currentStreak, 30), total: 30, earned: streak.badges.includes('30_days') },
    { id: '100_days', nameKey: 'badges.100_days', icon: 'diamond-stone', current: Math.min(streak.currentStreak, 100), total: 100, earned: streak.badges.includes('100_days') },
    { id: 'all_arcana', nameKey: 'badges.all_arcana', icon: 'cards', current: collectedCards.length, total: 22, earned: streak.badges.includes('all_arcana') },
  ];

  return (
    <ScreenContainer>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()}>
          <Body style={styles.backButton}>{t('common.back')}</Body>
        </Pressable>
        <Title>{t('profile.title')}</Title>

        {sign && (
          <View style={styles.signSection}>
            <MaterialCommunityIcons
              name={getZodiacIconName(sign.id) as any}
              size={48}
              color={colors.gold}
            />
            <Body style={styles.signName}>{t(sign.nameKey)}</Body>
            {profile?.ascendant && (
              <Body style={styles.ascendant}>Asc: {t(getZodiacSignById(profile.ascendant).nameKey)}</Body>
            )}
          </View>
        )}

        <StreakCounter currentStreak={streak.currentStreak} longestStreak={streak.longestStreak} />

        <BadgeGrid badges={badges} />

        <ReadingCalendar
          daysWithEntries={daysWithEntries}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          maxDaysBack={isPremium ? 30 : 7}
        />

        {selectedDate && (
          <ReadingDayDetail date={selectedDate} entries={selectedEntries} />
        )}

        <NotificationSettings settings={settings} onUpdate={updateSettings} />

        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Body style={styles.logoutText}>Esci e ricomincia</Body>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing['5xl'] },
  backButton: { color: colors.gold, fontSize: 14 },
  signSection: { alignItems: 'center', gap: spacing.xs },
  signSymbol: { fontSize: 48 },
  signName: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 24, color: colors.pearlWhite },
  ascendant: { opacity: 0.6, fontSize: 14 },
  premiumButton: { marginTop: spacing.lg },
  logoutButton: { alignItems: 'center', paddingVertical: spacing.lg, marginTop: spacing.xl },
  logoutText: { color: '#ff4444', fontSize: 14 },
});
