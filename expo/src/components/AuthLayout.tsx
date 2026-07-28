import { Image } from 'expo-image';
import type { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { radius, shadows, spacing, typography, useTheme } from '@/theme';

const logoSource = require('@/assets/images/operaopus-logo.png');

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  /** Dodatna oznaka ispod logotipa (npr. baza tenanta nakon aktivacije). */
  heroBadge?: ReactNode;
  /** Sekundarna akcija ispod kartice (npr. ponovna aktivacija Core PIN-a). */
  footer?: ReactNode;
}

/**
 * Zajednički okvir prijave i aktivacije: brand hero s logotipom na vrhu i bijela kartica
 * koja pluta preko njegove granice. Ista vizualna logika kao hero na Kontrolnom centru,
 * pa ulaz u aplikaciju i njezin prvi ekran izgledaju kao isti proizvod.
 */
export function AuthLayout({ title, subtitle, heroBadge, footer, children }: PropsWithChildren<AuthLayoutProps>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Screen scroll keyboardAware contentStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: colors.brandChrome, paddingTop: insets.top + spacing.xxxl }]}>
        <Image source={logoSource} style={styles.logo} contentFit="contain" />
        {heroBadge ? <View style={styles.heroBadge}>{heroBadge}</View> : null}
      </View>

      <View style={styles.body}>
        <Card style={[styles.card, shadows.raised]}>
          <View style={styles.headings}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
          </View>
          {children}
        </Card>
        {footer}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  hero: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  logo: {
    width: '80%',
    maxWidth: 290,
    height: 52,
  },
  heroBadge: {
    alignItems: 'center',
  },
  body: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
    gap: spacing.lg,
  },
  card: {
    gap: spacing.lg,
  },
  headings: {
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  subtitle: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.md,
  },
});
