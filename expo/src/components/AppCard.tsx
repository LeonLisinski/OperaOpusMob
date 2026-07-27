import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, shadows, spacing, typography, useTheme } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface AppCardProps {
  title: string;
  /** Ionicons naziv iz spMob_Menu_Query (isti set koji Ionic koristi za <IonIcon name=...>). */
  icon?: string | null;
  /** Boja aplikacije iz spMob_Menu_Query — koristi se kao pozadina ikone. */
  color?: string | null;
  locked?: boolean;
  onPress: () => void;
}

/**
 * Kartica aplikacije na Kontrolnom centru — ikona (obojena pozadina iz `color`,
 * glif iz `icon`) + naziv, s katančić-značkom kad je aplikacija zaključana.
 * Zamjenjuje raniji plain red teksta (v. FEATURE_PARITY_MATRIX "Kontrolni centar").
 */
export function AppCard({ title, icon, color, locked, onPress }: AppCardProps) {
  const { colors } = useTheme();
  const iconBg = color ?? colors.primary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}${locked ? ' (zaključano)' : ''}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : locked ? 0.6 : 1 },
        shadows.card,
      ]}
    >
      <View style={[styles.iconBadge, { backgroundColor: iconBg }]}>
        <Ionicons name={(icon || 'apps-outline') as IoniconName} size={26} color="#FFFFFF" />
        {locked ? (
          <View style={[styles.lockBadge, { backgroundColor: colors.surface, borderColor: colors.surface }]}>
            <Ionicons name="lock-closed" size={11} color={colors.textMuted} />
          </View>
        ) : null}
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 128,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
});
