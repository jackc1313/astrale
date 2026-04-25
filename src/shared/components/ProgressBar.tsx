import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@shared/theme';

type ProgressBarProps = {
  steps: number;
  currentStep: number;
};

export const ProgressBar = ({ steps, currentStep }: ProgressBarProps) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: steps }, (_, i) => (
        <View
          key={i}
          style={[styles.segment, i < currentStep ? styles.active : styles.inactive]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 4 },
  segment: { flex: 1, height: 3, borderRadius: radius.sm },
  active: { backgroundColor: colors.gold },
  inactive: { backgroundColor: colors.whiteBorder },
});
