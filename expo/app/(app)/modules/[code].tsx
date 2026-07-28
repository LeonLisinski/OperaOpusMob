import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useEffect } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { selectModule } from '@/features/core/coreSlice';
import type { ModuleMenuEntry } from '@/features/core/types';
import { resolveModuleRoute } from '@/features/documents/moduleRouting';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing, typography, useTheme } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export default function ModulesScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { code } = useLocalSearchParams<{ code: string }>();

  const app = useAppSelector((state) => state.core.apps.find((item) => item.code === code) ?? null);
  const sifgrupe = useAppSelector((state) => state.auth.user?.sifgrupe as string | number | undefined);

  useEffect(() => {
    navigation.setOptions({ title: app?.title ?? 'Moduli' });
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

  if (!app) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle-outline"
          title="Aplikacija nije pronađena"
          description="Vratite se na kontrolni centar i odaberite aplikaciju ponovno."
        />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.screenContent}>
      <FlatList
        data={modules}
        keyExtractor={(item, index) => `${item.url ?? item.title}-${index}`}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <SectionHeader title="Moduli" trailing={modules.length > 0 ? `${modules.length}` : undefined} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="folder-open-outline"
            title="Nema dostupnih modula"
            description="Ova aplikacija trenutno nema modula za prikaz."
          />
        }
        renderItem={({ item }) => (
          <Card onPress={() => onModulePress(item)} accessibilityLabel={item.title} style={styles.moduleCard}>
            <View style={[styles.iconBox, { backgroundColor: colors.primarySurface }]}>
              <Ionicons
                name={(item.icon || 'document-text-outline') as IoniconName}
                size={20}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
});
