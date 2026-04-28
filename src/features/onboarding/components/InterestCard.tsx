import { StyleSheet, Pressable, View, Text } from 'react-native';

import { colors, radius, spacing } from '@shared/theme';
import { Body } from '@shared/components';

type InterestCardProps = {
  icon: string;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
};

export const InterestCard = ({ icon, title, description, selected, onPress }: InterestCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected ? styles.cardSelected : styles.cardDefault]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.text}>
        <Body style={styles.title}>{title}</Body>
        <Body style={styles.description}>{description}</Body>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.lg, padding: spacing.lg },
  cardDefault: { backgroundColor: colors.whiteOverlay, borderWidth: 1, borderColor: colors.whiteBorder },
  cardSelected: { backgroundColor: colors.goldMuted, borderWidth: 1, borderColor: colors.goldBorder },
  icon: { fontSize: 24 },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: 'Inter-Medium', fontSize: 14 },
  description: { fontSize: 10, opacity: 0.5 },
});
