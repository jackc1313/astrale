import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { colors, fontFamilies, fontSizes, lineHeights } from '@shared/theme';

type TypographyProps = TextProps & {
  color?: string;
};

export const Title = ({ style, color, ...props }: TypographyProps) => (
  <Text style={[styles.title, color ? { color } : undefined, style]} {...props} />
);

export const Subtitle = ({ style, color, ...props }: TypographyProps) => (
  <Text style={[styles.subtitle, color ? { color } : undefined, style]} {...props} />
);

export const Body = ({ style, color, ...props }: TypographyProps) => (
  <Text style={[styles.body, color ? { color } : undefined, style]} {...props} />
);

export const Label = ({ style, color, ...props }: TypographyProps) => (
  <Text style={[styles.label, color ? { color } : undefined, style]} {...props} />
);

const styles = StyleSheet.create({
  title: {
    fontFamily: fontFamilies.title,
    fontSize: fontSizes.xl,
    color: colors.gold,
    lineHeight: fontSizes.xl * lineHeights.tight,
  },
  subtitle: {
    fontFamily: fontFamilies.title,
    fontSize: fontSizes['2xl'],
    color: colors.pearlWhite,
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
  },
  body: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.body,
    color: colors.pearlWhite,
    lineHeight: fontSizes.body * lineHeights.relaxed,
  },
  label: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    color: colors.whiteSubtle,
    textTransform: 'uppercase' as TextStyle['textTransform'],
    letterSpacing: 1,
  },
});
