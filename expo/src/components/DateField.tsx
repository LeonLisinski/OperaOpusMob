import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DatePickerSheet } from '@/components/DatePickerSheet';
import {
  formatDisplayDate,
  parseIsoDateParts,
  toIsoDate,
} from '@/features/documents/format';
import { controlHeight, radius, spacing, typography, useTheme } from '@/theme';

interface DateFieldProps {
  label: string;
  /** Interna ISO vrijednost (YYYY-MM-DD) — šalje se API-ju. */
  value: string;
  onChangeIso: (iso: string | null) => void;
  editable?: boolean;
  accessibilityLabel?: string;
  /** Otvaranje pickera kontrolira roditelj (npr. filter modal — izbjegava ugniježđeni Modal). */
  externalPicker?: {
    open: boolean;
    onOpen: () => void;
    onClose: () => void;
  };
}

/**
 * Datumsko polje: korisnik vidi `dd.MM.yyyy`, vrijednost ostaje ISO za SP/API.
 * Isti bottom-sheet izbornik u light i dark temi (spinner u themed sheetu).
 */
export function DateField({
  label,
  value,
  onChangeIso,
  editable = true,
  accessibilityLabel,
  externalPicker,
}: DateFieldProps) {
  const { colors } = useTheme();
  const [internalOpen, setInternalOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<Date>(() => parseIsoDateParts(value) ?? new Date());

  const open = externalPicker?.open ?? internalOpen;
  const display = formatDisplayDate(value) ?? 'Odaberite datum…';
  const hasValue = value.trim().length > 0;

  const pickerValue = useMemo(() => parseIsoDateParts(value) ?? draftDate, [draftDate, value]);

  const closePicker = () => {
    if (externalPicker) {
      externalPicker.onClose();
    } else {
      setInternalOpen(false);
    }
  };

  const openPicker = () => {
    if (!editable) {
      return;
    }
    setDraftDate(parseIsoDateParts(value) ?? new Date());
    if (externalPicker) {
      externalPicker.onOpen();
    } else {
      setInternalOpen(true);
    }
  };

  const commitDate = (date: Date) => {
    onChangeIso(toIsoDate(date));
    closePicker();
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <Pressable
        onPress={openPicker}
        disabled={!editable}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        style={({ pressed }) => [
          styles.inputRow,
          {
            backgroundColor: editable ? colors.surface : colors.surfaceMuted,
            borderColor: hasValue && editable ? colors.primaryBorder : colors.border,
            opacity: pressed && editable ? 0.85 : 1,
          },
        ]}
      >
        <Text style={[styles.value, { color: hasValue ? colors.text : colors.textSubtle }]} numberOfLines={1}>
          {display}
        </Text>
        {editable ? <Ionicons name="calendar-outline" size={20} color={colors.textMuted} /> : null}
      </Pressable>

      {externalPicker ? null : (
        <DatePickerSheet
          visible={open}
          value={pickerValue}
          onChange={setDraftDate}
          onClose={closePicker}
          onConfirm={commitDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: controlHeight.md,
  },
  value: {
    flex: 1,
    fontSize: typography.size.md,
    paddingVertical: spacing.sm,
  },
});
