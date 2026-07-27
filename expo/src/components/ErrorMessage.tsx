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
      <Text style={[styles.text, { color: colors.danger }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    textAlign: 'center',
  },
});
