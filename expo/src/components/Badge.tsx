import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useTheme } from '@/theme';

interface BadgeProps {
  label: string;
  tone?: 'neutral' | 'warning' | 'success' | 'primary';
}

/** Mala oznaka statusa (npr. "Zaključano") — koristi status boje iz teme, ne tekst boje. */
export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const { colors } = useTheme();

  const palette = {
    neutral: { bg: colors.surfaceMuted, text: colors.textMuted },
    warning: { bg: colors.warningSoft, text: colors.warning },
    success: { bg: colors.successSoft, text: colors.success },
    primary: { bg: colors.primarySoft, text: colors.primary },
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  label: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
});
