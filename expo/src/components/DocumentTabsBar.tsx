import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { moduleHasAttachments, moduleHasDstLines, moduleHasSignature } from '@/features/documents/documentsSlice';
import { isTruthyApiField } from '@/features/documents/dstLineHelpers';
import { useAppSelector } from '@/store/hooks';
import { radius, spacing, typography, useTheme } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_CONFIG: Record<string, { label: string; icon: IconName; activeIcon: IconName }> = {
  index: { label: 'Info', icon: 'information-circle-outline', activeIcon: 'information-circle' },
  lines: { label: 'Stavke', icon: 'list-outline', activeIcon: 'list' },
  work: { label: 'Rad', icon: 'construct-outline', activeIcon: 'construct' },
  attachments: { label: 'Privitci', icon: 'attach-outline', activeIcon: 'attach' },
  signature: { label: 'Potpis', icon: 'create-outline', activeIcon: 'create' },
};

/**
 * Tab bar unutar dokumenta — ikone s malim tekstom i aktivnim pill indikatorom.
 * Vidljivost tabova prati Ionic pravila (v. DglMainTabs: `tabradvisible`, privitci samo
 * za dgl, potpis uz `tabpotpisvisible`) filtriranjem, a ne uklanjanjem ruta — tako
 * navigator zadržava stanje svih tabova i prijelaz je bez ponovnog dohvata.
 */
export function DocumentTabsBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const route = useAppSelector((s) => s.documents.route);
  const layout = useAppSelector((s) => s.documents.layout);
  const item = useAppSelector((s) => s.documents.selectedItem);

  const hasLines = moduleHasDstLines(layout);
  const visibility: Record<string, boolean> = {
    index: true,
    lines: hasLines,
    work: hasLines && isTruthyApiField(item?.tabradvisible),
    attachments: moduleHasAttachments(route, layout),
    signature: moduleHasSignature(route, item),
  };

  const visibleRoutes = state.routes.filter((tabRoute) => visibility[tabRoute.name] && TAB_CONFIG[tabRoute.name]);
  if (visibleRoutes.length <= 1) {
    return null;
  }

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, spacing.xs),
        },
      ]}
    >
      {visibleRoutes.map((tabRoute) => {
        const config = TAB_CONFIG[tabRoute.name];
        const focused = state.routes[state.index]?.key === tabRoute.key;

        return (
          <Pressable
            key={tabRoute.key}
            onPress={() => {
              if (!focused) {
                navigation.navigate(tabRoute.name);
              }
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={config.label}
            style={styles.tab}
          >
            <View style={[styles.iconPill, focused ? { backgroundColor: colors.primarySurface } : null]}>
              <Ionicons
                name={focused ? config.activeIcon : config.icon}
                size={20}
                color={focused ? colors.primary : colors.textMuted}
              />
            </View>
            <Text
              style={[
                styles.label,
                { color: focused ? colors.primary : colors.textMuted },
                focused ? styles.labelActive : null,
              ]}
              numberOfLines={1}
            >
              {config.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.xs,
    minHeight: 48,
  },
  iconPill: {
    width: 48,
    height: 26,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: typography.weight.medium,
  },
  labelActive: {
    fontWeight: typography.weight.semibold,
  },
});
