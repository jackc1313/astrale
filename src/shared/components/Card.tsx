import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@shared/theme';

type CardProps = {
  children: ReactNode;
  variant?: 'gold' | 'subtle';
  style?: ViewStyle;
};

export const Card = ({ children, variant = 'subtle', style }: CardProps) => {
  const isGold = variant === 'gold';
  return (
    <View style={[styles.base, isGold ? styles.gold : styles.subtle, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: { borderRadius: radius.lg, padding: spacing.lg },
  gold: {
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  subtle: {
    backgroundColor: colors.whiteOverlay,
    borderWidth: 1,
    borderColor: colors.whiteBorder,
  },
});
