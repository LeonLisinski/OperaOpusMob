import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { PendingDayInbox } from '@/features/raspored/types';
import { VoznjaCard } from '@/features/raspored/VoznjaCard';
import { radius, spacing, typography, useTheme } from '@/theme';

interface PendingDayCardProps {
  item: PendingDayInbox;
  confirming?: boolean;
  onConfirm: () => void;
}

/** Istaknuti dan koji čeka potvrdu (status POSLANO). */
export function PendingDayCard({ item, confirming = false, onConfirm }: PendingDayCardProps) {
  const { colors } = useTheme();
  const count = item.rides.length;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.warningSoft,
          borderColor: colors.warning,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: colors.warning }]}>
          <Ionicons name="alert-circle" size={14} color={colors.onWarning} />
          <Text style={[styles.badgeText, { color: colors.onWarning }]}>Nova dodjela</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{item.label}</Text>
        <Text style={[styles.count, { color: colors.textMuted }]}>
          {count === 0 ? 'Nema vožnji u vozom redu' : count === 1 ? '1 vožnja' : `${count} vožnje`}
        </Text>
      </View>

      {count > 0 ? (
        <View style={[styles.body, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          {item.rides.map((ride, index) => (
            <VoznjaCard key={`${ride.disprasporedstavkaid ?? index}`} ride={ride} isLast={index === count - 1} />
          ))}
        </View>
      ) : null}

      <Pressable
        onPress={onConfirm}
        disabled={confirming}
        accessibilityRole="button"
        accessibilityLabel={`Potvrdi raspored za ${item.label}`}
        style={({ pressed }) => [
          styles.confirmBtn,
          {
            backgroundColor: colors.primary,
            opacity: confirming ? 0.7 : pressed ? 0.85 : 1,
          },
        ]}
      >
        {confirming ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <>
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.onPrimary} />
            <Text style={[styles.confirmLabel, { color: colors.onPrimary }]}>Potvrdi</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  header: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    textTransform: 'capitalize',
  },
  count: {
    fontSize: typography.size.xs,
  },
  body: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  confirmBtn: {
    marginHorizontal: spacing.md,
    minHeight: 44,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  confirmLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
});
