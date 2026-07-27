import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppCard } from '@/components/AppCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Screen } from '@/components/Screen';
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

  const gridData: GridEntry[] = apps.length % 2 === 1 ? [...apps, { code: '__placeholder', placeholder: true }] : apps;

  return (
    <Screen edges={['left', 'right', 'bottom']} style={styles.screen}>
      <View style={[styles.heroBand, { backgroundColor: colors.primary, paddingTop: insets.top + spacing.md }]}>
        <View style={styles.heroTopRow}>
          {korime ? (
            <Text style={styles.greeting} numberOfLines={1}>
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
            style={({ pressed }) => [styles.settingsButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
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
            ListHeaderComponent={<Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Aplikacije</Text>}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Nema dostupnih aplikacija.</Text>
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
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    gap: spacing.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    flexShrink: 1,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  logo: {
    width: '70%',
    maxWidth: 260,
    height: 44,
    alignSelf: 'center',
    marginTop: spacing.sm,
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  sectionLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  gridRow: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  cardSlot: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    paddingTop: spacing.xl,
    fontSize: typography.size.md,
  },
});
