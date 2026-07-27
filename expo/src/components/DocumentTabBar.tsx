import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { moduleHasAttachments, moduleHasSignature } from '@/features/documents/documentsSlice';
import type { DstLineKind } from '@/features/documents/types';
import { useAppSelector } from '@/store/hooks';
import { spacing, typography, useTheme } from '@/theme';

export type DocumentDetailTab = 'info' | DstLineKind | 'privitci' | 'potpis';

interface DocumentTabBarProps {
  activeTab: DocumentDetailTab;
  showRadTab: boolean;
}

/**
 * Donja navigacija unutar dokumenta — ekvivalent Ionic DglMainTabs tab bara
 * (Info / Stavke / Rad / Privitci). Potpis dolazi u kasnijoj fazi.
 */
export function DocumentTabBar({ activeTab, showRadTab }: DocumentTabBarProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const route = useAppSelector((state) => state.documents.route);
  const layout = useAppSelector((state) => state.documents.layout);
  const item = useAppSelector((state) => state.documents.selectedItem);

  const tabs: {
    id: DocumentDetailTab;
    label: string;
    pathname: '/(app)/documents/detail' | '/(app)/documents/lines' | '/(app)/documents/attachments' | '/(app)/documents/signature';
    tip?: DstLineKind;
  }[] = [
    { id: 'info', label: 'Info', pathname: '/(app)/documents/detail' },
    { id: 'stavke', label: 'Stavke', pathname: '/(app)/documents/lines', tip: 'stavke' },
  ];
  if (showRadTab) {
    tabs.push({ id: 'rad', label: 'Rad', pathname: '/(app)/documents/lines', tip: 'rad' });
  }
  if (moduleHasAttachments(route, layout)) {
    tabs.push({ id: 'privitci', label: 'Privitci', pathname: '/(app)/documents/attachments' });
  }
  if (moduleHasSignature(route, item)) {
    tabs.push({ id: 'potpis', label: 'Potpis', pathname: '/(app)/documents/signature' });
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
      {tabs.map((tab) => {
        const selected = tab.id === activeTab;
        return (
          <Pressable
            key={tab.id}
            onPress={() => {
              if (!selected) {
                if (tab.tip) {
                  router.replace({ pathname: tab.pathname, params: { tip: tab.tip } });
                } else {
                  router.replace(tab.pathname);
                }
              }
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={styles.tab}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? colors.primary : colors.textMuted },
                selected && styles.labelActive,
              ]}
            >
              {tab.label}
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
    paddingTop: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  labelActive: {
    fontWeight: typography.weight.semibold,
  },
});
