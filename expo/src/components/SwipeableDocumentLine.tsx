import { Ionicons } from '@expo/vector-icons';
import { useRef, type ComponentRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RectButton, TouchableOpacity } from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { DynamicListItem } from '@/components/DynamicListItem';
import type { DstLineSwipeActions } from '@/features/documents/dstLineHelpers';
import { isPodstavkaRow, isTruthyApiField, toneForIndClass } from '@/features/documents/dstLineHelpers';
import type { ListItemLayoutGroup } from '@/features/documents/types';
import { radius, spacing, typography, useTheme } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface SwipeAction {
  key: string;
  label: string;
  icon: IconName;
  color: string;
  ink: string;
  onPress: () => void;
}

interface SwipeableDocumentLineProps {
  groups: ListItemLayoutGroup[];
  item: Record<string, unknown>;
  index: number;
  actions: DstLineSwipeActions;
  onPress?: () => void;
  onDelete?: () => void;
  onConfirmQty?: () => void;
  onRemoveQty?: () => void;
  onAddSub?: () => void;
}

/**
 * Swipe red stavke — ekvivalent Ionic Tab3 IonItemSliding + IonItemOptions.
 * ReanimatedSwipeable (RNGH 2.x) — pouzdanije na RN 0.86 / Expo 57 nego legacy Swipeable.
 * Akcije su ikona + kratka riječ: trolinijski tekst je bio nečitljiv i tražio 100px širine.
 */
export function SwipeableDocumentLine({
  groups,
  item,
  index,
  actions,
  onPress,
  onDelete,
  onConfirmQty,
  onRemoveQty,
  onAddSub,
}: SwipeableDocumentLineProps) {
  const { colors } = useTheme();
  const swipeRef = useRef<ComponentRef<typeof ReanimatedSwipeable>>(null);
  const tintTone = toneForIndClass(item.indclassname);
  const indent = isPodstavkaRow(item);
  const locked = isTruthyApiField(item.locked);

  const runAction = (action: () => void) => () => {
    swipeRef.current?.close();
    action();
  };

  const renderAction = (action: SwipeAction) => (
    <RectButton key={action.key} style={[styles.action, { backgroundColor: action.color }]} onPress={action.onPress}>
      <Ionicons name={action.icon} size={20} color={action.ink} />
      <Text style={[styles.actionText, { color: action.ink }]} numberOfLines={1}>
        {action.label}
      </Text>
    </RectButton>
  );

  const renderLeftActions = () => {
    if (!actions.delete || !onDelete) {
      return null;
    }
    return (
      <View style={[styles.actionRow, styles.actionRowLeft]}>
        {renderAction({
          key: 'delete',
          label: 'Obriši',
          icon: 'trash-outline',
          color: colors.danger,
          ink: colors.onDanger,
          onPress: runAction(onDelete),
        })}
      </View>
    );
  };

  const renderRightActions = () => {
    const buttons: SwipeAction[] = [];
    if (actions.confirmQty && onConfirmQty) {
      buttons.push({
        key: 'confirm',
        label: 'Potvrdi',
        icon: 'checkmark-circle-outline',
        color: colors.primary,
        ink: colors.onPrimary,
        onPress: runAction(onConfirmQty),
      });
    }
    if (actions.removeQty && onRemoveQty) {
      buttons.push({
        key: 'remove',
        label: 'Ukloni',
        icon: 'close-circle-outline',
        color: colors.warning,
        ink: colors.onWarning,
        onPress: runAction(onRemoveQty),
      });
    }
    if (actions.addSub && onAddSub) {
      buttons.push({
        key: 'sub',
        label: 'Podstavka',
        icon: 'add-circle-outline',
        color: colors.primaryStrong,
        ink: colors.onBrand,
        onPress: runAction(onAddSub),
      });
    }
    if (buttons.length === 0) {
      return null;
    }
    return <View style={[styles.actionRow, styles.actionRowRight]}>{buttons.map(renderAction)}</View>;
  };

  const hasSwipe = actions.delete || actions.confirmQty || actions.removeQty || actions.addSub;

  const listItem = (
    <DynamicListItem
      groups={groups}
      item={item}
      index={index}
      compact
      tintTone={tintTone}
      locked={locked}
    />
  );

  const rowContent =
    onPress && !locked ? (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {listItem}
      </TouchableOpacity>
    ) : (
      listItem
    );

  if (!hasSwipe) {
    return <View style={indent ? styles.indent : undefined}>{rowContent}</View>;
  }

  return (
    <View style={indent ? styles.indent : undefined}>
      <ReanimatedSwipeable
        ref={swipeRef}
        friction={2}
        overshootLeft={false}
        overshootRight={false}
        leftThreshold={40}
        rightThreshold={40}
        enableTrackpadTwoFingerGesture
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
      >
        {rowContent}
      </ReanimatedSwipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  indent: {
    paddingLeft: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  actionRowLeft: {
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
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
