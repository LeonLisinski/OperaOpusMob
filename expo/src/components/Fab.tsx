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
  /** Odmak od dna ekrana. */
  bottomOffset?: number;
  /** Horizontalni rub — akcije dolje desno (default), odjava/legacy lijevo po potrebi. */
  anchor?: 'left' | 'right';
  variant?: 'primary' | 'danger';
  disabled?: boolean;
  size?: 'md' | 'sm';
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
  anchor = 'right',
  variant = 'primary',
  disabled = false,
  size = 'md',
}: FabProps) {
  const { colors } = useTheme();
  const extended = typeof label === 'string' && label.length > 0;
  const isSmall = size === 'sm';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.fab,
        anchor === 'left' ? styles.fabLeft : styles.fabRight,
        extended ? styles.fabExtended : isSmall ? styles.fabSmall : styles.fabRound,
        {
          bottom: bottomOffset,
          backgroundColor:
            variant === 'danger'
              ? pressed
                ? colors.dangerFabPressed
                : colors.dangerFab
              : pressed
                ? colors.primaryPressed
                : colors.primary,
          opacity: disabled ? 0.5 : 1,
        },
        shadows.fab,
      ]}
    >
      <Ionicons
        name={icon}
        size={extended ? 20 : isSmall ? 22 : 26}
        color={variant === 'danger' ? colors.onDanger : colors.onPrimary}
      />
      {extended ? (
        <Text style={[styles.label, { color: variant === 'danger' ? colors.onDanger : colors.onPrimary }]}>{label}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fabLeft: {
    left: spacing.lg,
  },
  fabRight: {
    right: spacing.lg,
  },
  fabRound: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  fabSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
