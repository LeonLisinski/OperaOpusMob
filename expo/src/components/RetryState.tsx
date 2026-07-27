import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { spacing, typography, useTheme } from '@/theme';

interface RetryStateProps {
  message: string;
  onRetry: () => void;
  retrying?: boolean;
}

/** Greška s mogućnošću ponovnog pokušaja — koristi se za mrežne/layout/listu greške. */
export function RetryState({ message, onRetry, retrying = false }: RetryStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      <PrimaryButton label="Pokušaj ponovno" onPress={onRetry} loading={retrying} variant="secondary" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  message: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    textAlign: 'center',
  },
});
