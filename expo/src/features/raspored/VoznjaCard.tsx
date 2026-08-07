import { Ionicons } from '@expo/vector-icons';
import { useRef, type ComponentRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';

import { routeLabel, timeRangeLabel } from '@/features/raspored/dates';
import type { VozniRedRow } from '@/features/raspored/types';
import { spacing, typography, useTheme, type ThemeColors } from '@/theme';

interface VoznjaCardProps {
  ride: VozniRedRow;
  isLast?: boolean;
  /** Vizualno gotovo (sivo) — lokalno, ne API. */
  done?: boolean;
  /** Omogući swipe (Aktualno/Sutra). */
  allowSwipeDone?: boolean;
  onMarkDone?: () => void;
  onUnmarkDone?: () => void;
}

/**
 * Disp web: POVRATAK = plava strijelica lijevo; TAMO (odlazak) = zelena desno.
 */
function directionVisual(
  smjenatip: string | null,
  colors: ThemeColors,
  muted: boolean,
): { icon: keyof typeof Ionicons.glyphMap; color: string; label: string } | null {
  const tip = (smjenatip ?? '').trim().toUpperCase();
  if (tip === 'POVRATAK') {
    return {
      icon: 'arrow-back',
      color: muted ? colors.textSubtle : colors.info,
      label: 'Povratak',
    };
  }
  if (tip === 'TAMO') {
    return {
      icon: 'arrow-forward',
      color: muted ? colors.textSubtle : colors.success,
      label: 'Odlazak',
    };
  }
  return null;
}

/** Red vožnje unutar dnevnog bloka. */
export function VoznjaCard({
  ride,
  isLast = false,
  done = false,
  allowSwipeDone = false,
  onMarkDone,
  onUnmarkDone,
}: VoznjaCardProps) {
  const { colors } = useTheme();
  const swipeRef = useRef<ComponentRef<typeof Swipeable>>(null);
  const time = timeRangeLabel(ride);
  const route = routeLabel(ride);
  const vehicle = ride.registracija?.trim();
  const coDrivers = ride.suvozaciImena;
  const direction = directionVisual(ride.smjenatip, colors, done);

  const textMain = done ? colors.textSubtle : colors.text;
  const textMuted = done ? colors.textSubtle : colors.textMuted;
  const surface = done ? colors.surfaceMuted : colors.surface;

  const closeAnd = (action?: () => void) => () => {
    swipeRef.current?.close();
    action?.();
  };

  const row = (
    <View
      style={[
        styles.row,
        { backgroundColor: surface },
        !isLast
          ? {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.border,
            }
          : null,
      ]}
    >
      <View style={styles.topLine}>
        <View style={styles.timeCluster}>
          {direction ? (
            <Ionicons
              name={direction.icon}
              size={18}
              color={direction.color}
              accessibilityLabel={direction.label}
            />
          ) : null}
          <Text style={[styles.time, { color: textMain }, done ? styles.doneStrike : null]}>{time}</Text>
        </View>
        {done ? (
          <Text style={[styles.doneBadge, { color: colors.textSubtle }]}>Gotovo</Text>
        ) : null}
      </View>

      <Text style={[styles.route, { color: textMain }, done ? styles.doneDim : null]} numberOfLines={2}>
        {route}
      </Text>

      {(vehicle || coDrivers.length > 0) && (
        <View style={styles.metaBlock}>
          {vehicle ? (
            <View style={styles.metaRow}>
              <Ionicons name="bus-outline" size={14} color={textMuted} />
              <Text style={[styles.meta, { color: textMuted }]} numberOfLines={1}>
                {vehicle}
              </Text>
            </View>
          ) : null}
          {coDrivers.map((name) => (
            <View key={name} style={styles.metaRow}>
              <Ionicons name="people-outline" size={14} color={textMuted} />
              <Text style={[styles.meta, { color: textMuted }]} numberOfLines={1}>
                Suvozač: {name}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (!allowSwipeDone || (!onMarkDone && !onUnmarkDone)) {
    return row;
  }

  return (
    <View style={styles.swipeClip}>
      <Swipeable
        ref={swipeRef}
        friction={2}
        overshootLeft={false}
        overshootRight={false}
        leftThreshold={48}
        rightThreshold={48}
        enableTrackpadTwoFingerGesture
        renderRightActions={
          !done && onMarkDone
            ? () => (
                <View style={styles.actionRow}>
                  <RectButton
                    style={[styles.action, { backgroundColor: colors.success }]}
                    onPress={closeAnd(onMarkDone)}
                  >
                    <Ionicons name="checkmark-outline" size={20} color={colors.onSuccess} />
                    <Text style={[styles.actionText, { color: colors.onSuccess }]}>Gotovo</Text>
                  </RectButton>
                </View>
              )
            : undefined
        }
        renderLeftActions={
          done && onUnmarkDone
            ? () => (
                <View style={styles.actionRow}>
                  <RectButton
                    style={[styles.action, { backgroundColor: colors.info }]}
                    onPress={closeAnd(onUnmarkDone)}
                  >
                    <Ionicons name="arrow-undo-outline" size={20} color="#FFFFFF" />
                    <Text style={[styles.actionText, { color: '#FFFFFF' }]}>Vrati</Text>
                  </RectButton>
                </View>
              )
            : undefined
        }
      >
        {row}
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeClip: {
    overflow: 'hidden',
  },
  row: {
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  timeCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 1,
  },
  time: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  doneBadge: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    textTransform: 'uppercase',
  },
  doneStrike: {
    textDecorationLine: 'line-through',
  },
  doneDim: {
    opacity: 0.75,
  },
  route: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  metaBlock: {
    gap: 4,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  meta: {
    fontSize: typography.size.sm,
    flexShrink: 1,
  },
  actionRow: {
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  action: {
    width: 88,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'stretch',
  },
  actionText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
});
