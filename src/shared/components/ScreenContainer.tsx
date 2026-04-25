import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@shared/theme';

type ScreenContainerProps = {
  children: ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export const ScreenContainer = ({
  children,
  edges = ['top', 'bottom'],
}: ScreenContainerProps) => {
  return (
    <LinearGradient
      colors={[colors.black, colors.deepPurple]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe} edges={edges}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
});
