import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/Screen';
import { bootstrapSession } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing, typography, useTheme } from '@/theme';

/**
 * Ulazna ruta — ne prikazuje sadržaj dok bootstrap ne završi, zatim preusmjerava
 * prema Core PIN / login / kontrolnom centru ovisno o spremljenom stanju.
 * Ekvivalent AppMain.tsx checkRememberMe() flowa.
 */
export default function BootstrapScreen() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  const bootstrapStatus = useAppSelector((state) => state.auth.bootstrapStatus);
  const hasCore = useAppSelector((state) => !!state.auth.core);
  const hasUser = useAppSelector((state) => !!state.auth.user);

  useEffect(() => {
    if (bootstrapStatus === 'idle') {
      dispatch(bootstrapSession());
    }
  }, [bootstrapStatus, dispatch]);

  if (bootstrapStatus !== 'ready') {
    return (
      <Screen contentStyle={styles.center}>
        <Text style={[styles.title, { color: colors.text }]}>Opera Mobile</Text>
        <ActivityIndicator color={colors.primary} size="large" style={styles.spinner} />
      </Screen>
    );
  }

  if (!hasCore) {
    return <Redirect href="/(auth)/unlock" />;
  }

  if (!hasUser) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(app)/apps" />;
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  spinner: {
    marginTop: spacing.lg,
  },
});
