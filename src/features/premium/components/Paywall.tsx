import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ScreenContainer, Title, Body, Card } from '@shared/components';
import { colors, radius, spacing } from '@shared/theme';
import { usePremium } from '@services/premium';

type PaywallProps = {
  onClose: () => void;
};

const BENEFITS = [
  { key: 'premium.benefit1', icon: '\u2609' },
  { key: 'premium.benefit2', icon: '\u2721' },
  { key: 'premium.benefit3', icon: '\u2728' },
  { key: 'premium.benefit4', icon: '\uD83D\uDCC5' },
  { key: 'premium.benefit5', icon: '\u26D4' },
];

export const Paywall = ({ onClose }: PaywallProps) => {
  const { t } = useTranslation();
  const { offerings, purchase, restore } = usePremium();

  const monthly = offerings?.current?.availablePackages.find(
    (p) => p.identifier === '$rc_monthly'
  );
  const annual = offerings?.current?.availablePackages.find(
    (p) => p.identifier === '$rc_annual'
  );

  const handlePurchase = async (pkg: typeof monthly) => {
    if (!pkg) return;
    const success = await purchase(pkg);
    if (success) onClose();
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Body style={styles.starIcon}>{'\u2B50'}</Body>
        <Title style={styles.title}>{t('premium.title')}</Title>
        <Body style={styles.subtitle}>{t('premium.subtitle')}</Body>

        <View style={styles.benefits}>
          {BENEFITS.map((b) => (
            <View key={b.key} style={styles.benefitRow}>
              <Body style={styles.benefitIcon}>{b.icon}</Body>
              <Body style={styles.benefitText}>{t(b.key)}</Body>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          <Pressable onPress={() => handlePurchase(annual)} style={styles.planCard}>
            <Card variant="gold">
              <View style={styles.planHeader}>
                <Title style={styles.planTitle}>{t('premium.yearly')}</Title>
                <View style={styles.saveBadge}>
                  <Body style={styles.saveText}>{t('premium.yearlySave')}</Body>
                </View>
              </View>
              <Body style={styles.planPrice}>{t('premium.yearlyPrice')}</Body>
            </Card>
          </Pressable>

          <Pressable onPress={() => handlePurchase(monthly)} style={styles.planCard}>
            <Card variant="subtle">
              <Title style={styles.planTitle}>{t('premium.monthly')}</Title>
              <Body style={styles.planPrice}>{t('premium.monthlyPrice')}</Body>
            </Card>
          </Pressable>
        </View>

        <Pressable onPress={restore}>
          <Body style={styles.restoreLink}>{t('premium.restore')}</Body>
        </Pressable>

        <Pressable onPress={onClose}>
          <Body style={styles.closeLink}>{t('premium.close')}</Body>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: spacing.xl, alignItems: 'center', gap: spacing.lg, paddingBottom: spacing['5xl'] },
  starIcon: { fontSize: 48, marginTop: spacing['3xl'] },
  title: { fontSize: 28, textAlign: 'center' },
  subtitle: { fontSize: 14, opacity: 0.6, textAlign: 'center' },
  benefits: { gap: spacing.md, width: '100%', marginTop: spacing.lg },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  benefitIcon: { fontSize: 20, width: 30, textAlign: 'center' },
  benefitText: { fontSize: 14, flex: 1 },
  plans: { gap: spacing.md, width: '100%', marginTop: spacing.lg },
  planCard: { width: '100%' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planTitle: { fontSize: 16 },
  planPrice: { fontSize: 13, opacity: 0.7, marginTop: spacing.xs },
  saveBadge: { backgroundColor: colors.gold, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  saveText: { fontSize: 10, color: colors.black, fontFamily: 'Inter-SemiBold' },
  restoreLink: { color: colors.gold, fontSize: 13, marginTop: spacing.lg },
  closeLink: { color: colors.whiteDim, fontSize: 13, marginTop: spacing.sm },
});
