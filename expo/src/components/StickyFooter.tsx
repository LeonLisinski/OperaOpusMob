import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenKeyboardPad } from '@/contexts/ScreenKeyboardPadContext';
import { controlHeight, spacing, useTheme } from '@/theme';

/** Procjena visine footera (gumb + padding) — rezerva u Screen scrollu kad je footer prisutan. */
export const STICKY_FOOTER_HEIGHT = controlHeight.lg + spacing.md * 2 + StyleSheet.hairlineWidth;

type StickyFooterProps = PropsWithChildren<{
  /** false na tab ekranima — tab bar već nosi donji safe area. */
  safeBottom?: boolean;
}>;

/** Fiksna zona primarne akcije — Screen diže cijeli layout iznad tipkovnice. */
export function StickyFooter({ children, safeBottom = true }: StickyFooterProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const keyboardPad = useScreenKeyboardPad();
  const keyboardOpen = keyboardPad > 0;
  const bottomPad = keyboardOpen
    ? spacing.sm
    : safeBottom
      ? Math.max(insets.bottom, spacing.md)
      : spacing.sm;

  return (
    <View
      style={[
        styles.footer,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: bottomPad,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
