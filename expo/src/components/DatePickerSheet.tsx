import DateTimePicker from '@react-native-community/datetimepicker';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { controlHeight, radius, spacing, typography, useTheme } from '@/theme';

interface DatePickerSheetProps {
  visible: boolean;
  value: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  /** Kad je roditelj već Modal (filter), ne otvaraj drugi Modal. */
  asOverlay?: boolean;
}

/**
 * Bottom-sheet odabir datuma (iOS) ili native dijalog (Android).
 * datetimepicker 9.x: onValueChange = potvrđen odabir (bez event.type);
 * onDismiss = otkazano. Ne koristiti event.type s onValueChange — type ne postoji.
 */
export function DatePickerSheet({
  visible,
  value,
  onChange,
  onClose,
  onConfirm,
  asOverlay = false,
}: DatePickerSheetProps) {
  const { colors, scheme } = useTheme();

  if (!visible) {
    return null;
  }

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={value}
        mode="date"
        display="default"
        locale="hr-HR"
        themeVariant={scheme}
        onValueChange={(_event, selected) => {
          onConfirm(selected ?? value);
        }}
        onDismiss={onClose}
      />
    );
  }

  const sheet = (
    <View style={asOverlay ? styles.overlayRoot : styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Zatvori odabir datuma" />
      <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.toolbar, { borderBottomColor: colors.border }]}>
          <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button">
            <Text style={[styles.action, { color: colors.textMuted }]}>Odustani</Text>
          </Pressable>
          <Pressable onPress={() => onConfirm(value)} hitSlop={8} accessibilityRole="button">
            <Text style={[styles.action, styles.actionPrimary, { color: colors.primary }]}>Gotovo</Text>
          </Pressable>
        </View>
        <DateTimePicker
          value={value}
          mode="date"
          display="spinner"
          locale="hr-HR"
          themeVariant={scheme}
          onValueChange={(_event, selected) => {
            if (selected) {
              onChange(selected);
            }
          }}
        />
      </View>
    </View>
  );

  if (asOverlay) {
    return sheet;
  }

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      {sheet}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  overlayRoot: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 50,
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.lg,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  action: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    minHeight: controlHeight.sm,
    textAlignVertical: 'center',
  },
  actionPrimary: {
    fontWeight: typography.weight.semibold,
  },
});
