import { Link, Stack } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/Screen';
import { spacing, typography, useTheme } from '@/theme';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Stranica nije pronađena' }} />
      <Screen contentStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Stranica ne postoji</Text>
        <Link href="/" style={[styles.link, { color: colors.primary }]}>
          Povratak na početnu
        </Link>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
  },
  link: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  },
});
