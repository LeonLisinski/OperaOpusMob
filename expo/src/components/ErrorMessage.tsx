import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useTheme } from '@/theme';

interface ErrorMessageProps {
  message: string | null;
}

/** Prikaz greške na hrvatskom, konzistentan kroz sve ekrane prijave/otključavanja. */
export function ErrorMessage({ message }: ErrorMessageProps) {
  const { colors } = useTheme();

  if (!message) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.dangerSoft }]} accessibilityRole="alert">
      <Ionicons name="alert-circle" size={18} color={colors.danger} />
      <Text style={[styles.text, { color: colors.danger }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    lineHeight: typography.lineHeight.sm,
  },
});
