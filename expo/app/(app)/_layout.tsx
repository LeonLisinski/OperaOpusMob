import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { Screen } from '@/components/Screen';
import { useAppSelector } from '@/store/hooks';
import { useTheme } from '@/theme';

/** Ekvivalent PrivateRoute.tsx — bez core konfiguracije ili korisnika preusmjerava na (auth). */
export default function AppLayout() {
  const bootstrapStatus = useAppSelector((state) => state.auth.bootstrapStatus);
  const hasCore = useAppSelector((state) => !!state.auth.core);
  const hasUser = useAppSelector((state) => !!state.auth.user);
  const { colors } = useTheme();

  if (bootstrapStatus !== 'ready') {
    return (
      <Screen contentStyle={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </Screen>
    );
  }

  if (!hasCore) {
    return <Redirect href="/(auth)/unlock" />;
  }

  if (!hasUser) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="apps" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: 'Postavke' }} />
      <Stack.Screen name="modules/[code]" options={{ title: 'Moduli' }} />
      <Stack.Screen name="documents/list" options={{ title: 'Popis' }} />
      <Stack.Screen name="documents/detail" options={{ title: 'Detalji' }} />
      <Stack.Screen name="documents/lines" options={{ title: 'Stavke' }} />
      <Stack.Screen name="documents/attachments" options={{ title: 'Privitci' }} />
      <Stack.Screen name="documents/signature" options={{ title: 'Potpis' }} />
      <Stack.Screen name="documents/form" options={{ presentation: 'modal', title: 'Forma' }} />
      <Stack.Screen name="documents/dst-form" options={{ presentation: 'modal', title: 'Stavka' }} />
      <Stack.Screen name="app-unlock" options={{ presentation: 'modal', title: 'Otključavanje aplikacije' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
