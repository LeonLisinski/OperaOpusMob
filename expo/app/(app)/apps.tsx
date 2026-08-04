import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppCard } from '@/components/AppCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Fab } from '@/components/Fab';
import { Screen, TAB_SCREEN_EDGES } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { logout } from '@/features/auth/authSlice';
import { fetchMenu, selectApp } from '@/features/core/coreSlice';
import type { AppMenuEntry } from '@/features/core/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing, typography, useTheme } from '@/theme';

const logoSource = require('@/assets/images/operaopus-logo.png');

/** Praznina koja popunjava neparni zadnji stupac u 2-stupačnoj mreži (v. AppCard). */
type GridEntry = AppMenuEntry | { code: string; placeholder: true };

export default function AppsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const apps = useAppSelector((state) => state.core.apps);
  const { loading, error } = useAppSelector((state) => state.core.menu);
  const korime = useAppSelector((state) => state.auth.user?.korime ?? null);

  useEffect(() => {
    dispatch(fetchMenu());
  }, [dispatch]);

  const onAppPress = (app: AppMenuEntry) => {
    if (!app.unlocked) {
      router.push({ pathname: '/(app)/app-unlock', params: { code: app.code, title: app.title } });
      return;
    }
    dispatch(selectApp(app));
    router.push({ pathname: '/(app)/modules/[code]', params: { code: app.code } });
  };

  const onSettingsPress = () => {
    router.push('/(app)/settings');
  };

  const onLogoutPress = () => {
    Alert.alert('Odjava', 'Želite li se odjaviti?', [
      { text: 'Odustani', style: 'cancel' },
      {
        text: 'Potvrdi',
        style: 'destructive',
        onPress: async () => {
          await dispatch(logout());
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const gridData: GridEntry[] = apps.length % 2 === 1 ? [...apps, { code: '__placeholder', placeholder: true }] : apps;

  return (
    <Screen
      edges={TAB_SCREEN_EDGES}
      style={styles.screen}
      overlay={
        <Fab
          icon="power"
          variant="danger"
          size="sm"
          onPress={onLogoutPress}
          accessibilityLabel="Odjava"
        />
      }
    >
      <View style={[styles.heroBand, { backgroundColor: colors.brandChrome, paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.heroTopRow}>
          {korime ? (
            <Text style={[styles.greeting, { color: colors.onBrandMuted }]} numberOfLines={1}>
              Pozdrav, {korime}
            </Text>
          ) : (
            <View />
          )}
          <Pressable
            onPress={onSettingsPress}
            accessibilityRole="button"
            accessibilityLabel="Postavke"
            hitSlop={10}
            style={({ pressed }) => [
              styles.settingsButton,
              { backgroundColor: colors.onBrandSurface, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="settings-outline" size={22} color={colors.onBrand} />
          </Pressable>
        </View>

        <Image source={logoSource} style={styles.logo} contentFit="contain" />
      </View>

      <View style={styles.body}>
        <ErrorMessage message={error} />

        {loading && apps.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <FlatList
            style={styles.listContainer}
            data={gridData}
            numColumns={2}
            keyExtractor={(item) => item.code}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.list}
            refreshing={loading}
            onRefresh={() => dispatch(fetchMenu())}
            ListHeaderComponent={
              <SectionHeader title="Aplikacije" trailing={apps.length > 0 ? `${apps.length}` : undefined} />
            }
            ListEmptyComponent={
              <EmptyState
                icon="apps-outline"
                title="Nema dostupnih aplikacija"
                description="Za ovog korisnika nije dodijeljena nijedna aplikacija."
              />
            }
            renderItem={({ item }) =>
              'placeholder' in item ? (
                <View style={styles.cardSlot} />
              ) : (
                <View style={styles.cardSlot}>
                  <AppCard
                    title={item.title}
                    icon={item.icon}
                    color={item.color}
                    locked={!item.unlocked}
                    onPress={() => onAppPress(item)}
                  />
                </View>
              )
            }
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  heroBand: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    gap: spacing.sm,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    flexShrink: 1,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '64%',
    maxWidth: 240,
    height: 38,
    alignSelf: 'center',
  },
  body: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  gridRow: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  cardSlot: {
    flex: 1,
  },
});
