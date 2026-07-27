import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { spacing, typography, useTheme } from '@/theme';

interface LoadingStateProps {
  label?: string;
}

/** Puni-ekran loading state za module/listu/detalj — konzistentan kroz cijelu aplikaciju. */
export function LoadingState({ label }: LoadingStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <ActivityIndicator color={colors.primary} size="large" />
      {label ? <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  label: {
    fontSize: typography.size.sm,
    textAlign: 'center',
  },
});
