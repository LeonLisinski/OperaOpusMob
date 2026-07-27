import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, FlatList, StyleSheet, Text } from 'react-native';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { selectModule } from '@/features/core/coreSlice';
import type { ModuleMenuEntry } from '@/features/core/types';
import { resolveModuleRoute } from '@/features/documents/moduleRouting';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing, typography, useTheme } from '@/theme';

export default function ModulesScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { code } = useLocalSearchParams<{ code: string }>();

  const app = useAppSelector((state) => state.core.apps.find((item) => item.code === code) ?? null);
  const sifgrupe = useAppSelector((state) => state.auth.user?.sifgrupe as string | number | undefined);

  useEffect(() => {
    navigation.setOptions({ title: app ? `Moduli - ${app.title}` : 'Moduli' });
  }, [navigation, app]);

  const modules = app?.items?.[0]?.items ?? [];

  const onModulePress = (module: ModuleMenuEntry) => {
    dispatch(selectModule(module));

    if (!resolveModuleRoute(module, sifgrupe)) {
      // Modul tip izvan opsega generičkog enginea u ovoj fazi (npr. servis/*, push).
      Alert.alert(module.title, 'Ovaj modul još nije implementiran u Expo aplikaciji.');
      return;
    }

    router.push('/(app)/documents/list');
  };

  return (
    <Screen contentStyle={styles.screenContent}>
      {!app ? (
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>Aplikacija nije pronađena.</Text>
      ) : (
        <FlatList
          data={modules}
          keyExtractor={(item, index) => `${item.url ?? item.title}-${index}`}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Nema dostupnih modula.</Text>
          }
          renderItem={({ item }) => (
            <Card onPress={() => onModulePress(item)} accessibilityLabel={item.title} style={styles.moduleCard}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.chevron, { color: colors.textSubtle }]}>›</Text>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  chevron: {
    fontSize: typography.size.xl,
  },
  emptyText: {
    textAlign: 'center',
    paddingTop: spacing.xl,
    fontSize: typography.size.md,
  },
});
