import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ScreenContainer, Title, Body } from '@shared/components';
import { colors, spacing } from '@shared/theme';
import { storageService } from '@services/storage';
import { getZodiacSignById } from '@shared/utils/zodiac';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = storageService.getUserProfile();
  const sign = profile ? getZodiacSignById(profile.zodiacSign) : null;

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Title>
              {t('home.greeting', { sign: sign ? t(sign.nameKey) : '' })}
            </Title>
            <Body style={styles.date}>
              {new Date().toLocaleDateString('it-IT', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </Body>
          </View>
          <Pressable onPress={() => router.push('/profile')}>
            <View style={styles.avatar}>
              <Body style={styles.avatarText}>{sign?.symbol ?? '\u2609'}</Body>
            </View>
          </Pressable>
        </View>
        <View style={styles.placeholder}>
          <Body style={styles.placeholderText}>Oroscopo giornaliero — Fase 2</Body>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  date: { fontSize: 12, opacity: 0.5, marginTop: spacing.xs },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.goldMuted, borderWidth: 1, borderColor: colors.goldBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 18 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { opacity: 0.3, fontSize: 14 },
});
