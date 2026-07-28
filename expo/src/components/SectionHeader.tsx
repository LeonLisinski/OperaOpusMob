import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography, useTheme } from '@/theme';

interface SectionHeaderProps {
  title: string;
  /** Sekundarna informacija desno (npr. broj zapisa). */
  trailing?: string;
}

/** Naslov sekcije liste — mala uppercase oznaka bez viška vertikalnog prostora. */
export function SectionHeader({ title, trailing }: SectionHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: colors.textMuted }]}>{title}</Text>
      {trailing ? <Text style={[styles.trailing, { color: colors.textSubtle }]}>{trailing}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  trailing: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
});
