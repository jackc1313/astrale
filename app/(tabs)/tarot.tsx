import { StyleSheet, View } from 'react-native';

import { ScreenContainer, Title, Body } from '@shared/components';
import { spacing } from '@shared/theme';

export default function TarotScreen() {
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Title>Tarocchi</Title>
        <View style={styles.placeholder}>
          <Body style={styles.placeholderText}>Pesca la carta — Fase 2</Body>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, paddingTop: spacing['3xl'] },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { opacity: 0.3, fontSize: 14 },
});
