import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ComponentProps, PropsWithChildren } from 'react';

import { radius, spacing, typography, type ThemeColors } from '@/theme';

type StackScreenOptions = NonNullable<ComponentProps<typeof Stack>['screenOptions']>;

/**
 * Brand header za native Stack — zelena podloga, bijeli naslov i strelica.
 * Primjenjuje se centralno u `(app)/_layout.tsx` da svi ekrani dijele isti okvir.
 */
export function brandHeaderOptions(colors: ThemeColors): StackScreenOptions {
  return {
    headerStyle: { backgroundColor: colors.brandChrome },
    headerTintColor: colors.onBrand,
    headerTitleStyle: {
      color: colors.onBrand,
      fontWeight: typography.weight.semibold,
      fontSize: typography.size.lg,
    },
    headerShadowVisible: false,
    headerBackTitle: '',
    contentStyle: { backgroundColor: colors.background },
  };
}

/**
 * Nastavak brand zone ispod headera — vizualno se spaja s njim i nosi kontekst
 * ekrana (pretraga, sažetak). Donji radius odvaja brand zonu od sadržaja.
 */
export function BrandBand({
  children,
  colors,
  style,
  rounded = true,
}: PropsWithChildren<{ colors: ThemeColors; style?: StyleProp<ViewStyle>; rounded?: boolean }>) {
  return (
    <View
      style={[
        styles.band,
        { backgroundColor: colors.brandChrome },
        rounded ? styles.bandRounded : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Ikona akcije na brand podlozi headera (koristi se kroz `headerRight`). */
export function HeaderIconAction({
  icon,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  colors: ThemeColors;
}) {
  return <Ionicons name={icon} size={22} color={colors.onBrand} />;
}

const styles = StyleSheet.create({
  band: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  bandRounded: {
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
});
