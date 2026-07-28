import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { radius, useTheme } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  /**
   * `surface` — bijeli gumb s rubom na svijetloj podlozi
   * `brand` — ispunjen brand gumb
   * `onBrand` — poluprozirni gumb na brand podlozi (header/hero)
   * `plain` — samo ikona, bez podloge
   */
  variant?: 'surface' | 'brand' | 'onBrand' | 'plain';
  size?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Kvadratni gumb s ikonom — pretraga, filter, brisanje, dodavanje. Dodirni cilj min. 44px. */
export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'surface',
  size = 20,
  disabled = false,
  style,
}: IconButtonProps) {
  const { colors } = useTheme();

  const palette = {
    surface: { bg: colors.surface, border: colors.border, icon: colors.text },
    brand: { bg: colors.primary, border: 'transparent', icon: colors.onPrimary },
    onBrand: { bg: colors.onBrandSurface, border: 'transparent', icon: colors.onBrand },
    plain: { bg: 'transparent', border: 'transparent', icon: colors.textMuted },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      hitSlop={6}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: variant === 'surface' ? 1 : 0,
          opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={size} color={palette.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
