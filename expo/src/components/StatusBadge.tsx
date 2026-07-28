import { StyleSheet, Text, View } from 'react-native';

import { tonePalette, type StatusTone } from '@/features/documents/statusTone';
import { radius, spacing, typography, useTheme } from '@/theme';

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  /** Kompaktna varijanta bez pozadine — za redove liste gdje badge ne smije dominirati. */
  subtle?: boolean;
}

/** Oznaka statusa u semantičkom tonu (v. statusTone.ts za mapiranje `indcolor` iz SP-a). */
export function StatusBadge({ label, tone = 'neutral', subtle = false }: StatusBadgeProps) {
  const { colors } = useTheme();

  const { soft, ink } = tonePalette(colors, tone);

  return (
    <View style={[styles.badge, subtle ? styles.badgeSubtle : { backgroundColor: soft }]}>
      <Text style={[styles.label, { color: ink }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    maxWidth: '100%',
  },
  badgeSubtle: {
    paddingHorizontal: 0,
  },
  label: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
});
