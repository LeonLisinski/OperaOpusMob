import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { radius, shadows, spacing, typography, useTheme } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface FabProps {
  onPress: () => void;
  accessibilityLabel: string;
  icon?: IconName;
  /** Kad je zadan, FAB je "extended" — ikona + tekst u pill obliku. */
  label?: string;
  /** Odmak od dna; povećava se kad ekran ima tab bar u footeru. */
  bottomOffset?: number;
  disabled?: boolean;
}

/**
 * Plutajuća primarna akcija dolje desno — dohvatljiva palcem, za razliku od
 * tekstualnog gumba u headeru. Renderira se kao zadnje dijete `Screen` tijela.
 */
export function Fab({
  onPress,
  accessibilityLabel,
  icon = 'add',
  label,
  bottomOffset = spacing.lg,
  disabled = false,
}: FabProps) {
  const { colors } = useTheme();
  const extended = typeof label === 'string' && label.length > 0;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.fab,
        extended ? styles.fabExtended : styles.fabRound,
        {
          bottom: bottomOffset,
          backgroundColor: pressed ? colors.primaryPressed : colors.primary,
          opacity: disabled ? 0.5 : 1,
        },
        shadows.fab,
      ]}
    >
      <Ionicons name={icon} size={extended ? 20 : 26} color={colors.onPrimary} />
      {extended ? <Text style={[styles.label, { color: colors.onPrimary }]}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fabRound: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  fabExtended: {
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
});
