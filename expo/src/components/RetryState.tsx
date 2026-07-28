import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { radius, spacing, typography, useTheme } from '@/theme';

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
      <View style={[styles.iconCircle, { backgroundColor: colors.dangerSoft }]}>
        <Ionicons name="cloud-offline-outline" size={28} color={colors.danger} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Podaci nisu dohvaćeni</Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
      <PrimaryButton label="Pokušaj ponovno" onPress={onRetry} loading={retrying} variant="secondary" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.md,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: spacing.md,
  },
});
