import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RasporedTab } from '@/features/raspored/types';
import { radius, spacing, typography, useTheme } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const TABS: {
  id: RasporedTab;
  label: string;
  icon: IconName;
  activeIcon: IconName;
}[] = [
  { id: 'aktualno', label: 'Aktualno', icon: 'calendar-outline', activeIcon: 'calendar' },
  { id: 'sutra', label: 'Sutra', icon: 'sunny-outline', activeIcon: 'sunny' },
  { id: 'povijest', label: 'Povijest', icon: 'time-outline', activeIcon: 'time' },
];

interface RasporedTabsBarProps {
  active: RasporedTab;
  onChange: (tab: RasporedTab) => void;
}

/** Donji tab bar rasporeda — isti vizualni jezik kao DocumentTabsBar. */
export function RasporedTabsBar({ active, onChange }: RasporedTabsBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

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
      {TABS.map((item) => {
        const focused = active === item.id;
        return (
          <Pressable
            key={item.id}
            onPress={() => onChange(item.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={item.label}
            style={styles.tab}
          >
            <View style={[styles.iconPill, focused ? { backgroundColor: colors.primarySurface } : null]}>
              <Ionicons
                name={focused ? item.activeIcon : item.icon}
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
              {item.label}
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
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  labelActive: {
    fontWeight: typography.weight.semibold,
  },
});
