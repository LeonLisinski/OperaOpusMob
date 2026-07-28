import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useTheme } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface ChipProps {
  label: string;
  icon?: IconName;
  onPress?: () => void;
  /** Kad je zadan, chip dobiva "×" za uklanjanje filtera. */
  onRemove?: () => void;
  tone?: 'neutral' | 'brand';
}

/** Pill oznaka aktivnog filtera — kompaktan prikaz konteksta liste bez zauzimanja visine. */
export function Chip({ label, icon, onPress, onRemove, tone = 'neutral' }: ChipProps) {
  const { colors } = useTheme();

  const palette =
    tone === 'brand'
      ? { bg: colors.primarySurface, border: colors.primaryBorder, text: colors.primary }
      : { bg: colors.surface, border: colors.border, text: colors.textMuted };

  const content = (
    <>
      {icon ? <Ionicons name={icon} size={13} color={palette.text} /> : null}
      <Text style={[styles.label, { color: palette.text }]} numberOfLines={1}>
        {label}
      </Text>
      {onRemove ? (
        <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel={`Ukloni ${label}`} hitSlop={8}>
          <Ionicons name="close" size={13} color={palette.text} />
        </Pressable>
      ) : null}
    </>
  );

  const chipStyle = [styles.chip, { backgroundColor: palette.bg, borderColor: palette.border }];

  if (!onPress) {
    return <View style={chipStyle}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      // Chip je nizak radi gustoće reda; hitSlop drži dodirni cilj na ~46px.
      hitSlop={8}
      style={({ pressed }) => [...chipStyle, { opacity: pressed ? 0.7 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 30,
  },
  label: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    flexShrink: 1,
  },
});
