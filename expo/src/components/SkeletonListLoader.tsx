import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { radius, spacing, useTheme } from '@/theme';

interface SkeletonListLoaderProps {
  /** Broj placeholder redaka — 4 pokriva prosječnu visinu ekrana bez skrolanja. */
  rows?: number;
}

/**
 * Pulsirajući placeholder popis — zamjenjuje puni-ekran spinner+tekst za tabove koji
 * učitavaju listu (Stavke/Rad/Privitci) svaki put kad se tab otvori, jer prazno platno
 * s centriranim spinnerom djeluje kao "plain" prekid u odnosu na ostatak liste.
 * Isključivo prezentacijski — ne mijenja kad/zašto se `loading` postavlja u sliceu.
 */
export function SkeletonListLoader({ rows = 4 }: SkeletonListLoaderProps) {
  const { colors } = useTheme();
  const [pulse] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 650, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 650, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <View style={styles.container} accessibilityRole="progressbar">
      {Array.from({ length: rows }).map((_, index) => (
        <Animated.View
          key={index}
          style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pulse }]}
        >
          <View style={[styles.stripe, { backgroundColor: colors.border }]} />
          <View style={styles.lines}>
            <View style={[styles.bar, styles.barWide, { backgroundColor: colors.surfaceMuted }]} />
            <View style={[styles.bar, styles.barNarrow, { backgroundColor: colors.surfaceMuted }]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    minHeight: 60,
  },
  stripe: {
    width: 4,
    alignSelf: 'stretch',
  },
  lines: {
    flex: 1,
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  bar: {
    height: 12,
    borderRadius: radius.sm,
  },
  barWide: {
    width: '70%',
  },
  barNarrow: {
    width: '45%',
  },
});
