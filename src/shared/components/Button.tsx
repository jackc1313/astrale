import { StyleSheet, Pressable, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@shared/theme';
import { Body } from './Typography';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
};

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: ButtonProps) => {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Body
        color={isPrimary ? colors.black : colors.pearlWhite}
        style={styles.text}
      >
        {title}
      </Body>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.gold },
  ghost: { backgroundColor: colors.transparent },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  text: { fontFamily: 'Inter-SemiBold', fontSize: 14 },
});
