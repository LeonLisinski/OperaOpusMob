import { Pressable, StyleSheet, Text } from 'react-native';

import { spacing, typography, useTheme } from '@/theme';

interface HeaderTextButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

/** Tekstualna akcija u navigacijskom headeru (Odustani/Spremi/Uredi/Novi) — konzistentna kroz sve ekrane. */
export function HeaderTextButton({ label, onPress, disabled }: HeaderTextButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={styles.button}
    >
      <Text style={[styles.label, { color: disabled ? colors.textSubtle : colors.primary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  },
});
