import { Ionicons } from '@expo/vector-icons';
import { useRef, type ComponentRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';

import { DynamicListItem } from '@/components/DynamicListItem';
import type { ListItemLayoutGroup } from '@/features/documents/types';
import { radius, spacing, typography, useTheme } from '@/theme';

interface SwipeableDocumentRowProps {
  groups: ListItemLayoutGroup[];
  item: Record<string, unknown>;
  index: number;
  editable: boolean;
  onPress: () => void;
  onEdit: () => void;
}

/**
 * Swipe red dokumenta na listi — samo desno→lijevo, akcija Uredi kad je `editable`.
 * Legacy Swipeable (ne Reanimated) — izbjegava native crash kad Worklets JS/native
 * verzije nisu usklađene u development buildu.
 */
export function SwipeableDocumentRow({
  groups,
  item,
  index,
  editable,
  onPress,
  onEdit,
}: SwipeableDocumentRowProps) {
  const { colors } = useTheme();
  const swipeRef = useRef<ComponentRef<typeof Swipeable>>(null);

  const runEdit = () => {
    swipeRef.current?.close();
    onEdit();
  };

  const renderRightActions = () => {
    if (!editable) {
      return null;
    }

    return (
      <View style={[styles.actionRow, styles.actionRowRight]}>
        <RectButton style={[styles.action, { backgroundColor: colors.primary }]} onPress={runEdit}>
          <Ionicons name="pencil-outline" size={20} color={colors.onPrimary} />
          <Text style={[styles.actionText, { color: colors.onPrimary }]} numberOfLines={1}>
            Uredi
          </Text>
        </RectButton>
      </View>
    );
  };

  const rowContent = (
    <Pressable onPress={onPress} accessibilityRole="button">
      <DynamicListItem groups={groups} item={item} index={index} />
    </Pressable>
  );

  if (!editable) {
    return rowContent;
  }

  return (
    <Swipeable
      ref={swipeRef}
      friction={2}
      overshootRight={false}
      rightThreshold={40}
      enableTrackpadTwoFingerGesture
      renderRightActions={renderRightActions}
    >
      {rowContent}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  actionRowRight: {
    borderTopRightRadius: radius.md,
    borderBottomRightRadius: radius.md,
  },
  action: {
    width: 84,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.xs,
  },
  actionText: {
    fontSize: 11,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
});
