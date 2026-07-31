import { Ionicons } from '@expo/vector-icons';
import { useId } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { DateField } from '@/components/DateField';
import { useRegisterKeyboardField } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { updateEditFormData, updateEditValues } from '@/features/documents/documentsSlice';
import { parseIsoDateParts, toIsoDate } from '@/features/documents/format';
import type { EditFieldDef } from '@/features/documents/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { controlHeight, radius, spacing, typography, useTheme } from '@/theme';

/** Normalizira datum iz SP-a (ISO, datetime, dd.MM.yyyy) u YYYY-MM-DD za DateField. */
function toEditIsoDate(raw: unknown): string {
  if (typeof raw !== 'string' && !(raw instanceof Date)) {
    return '';
  }
  if (raw instanceof Date) {
    return Number.isNaN(raw.getTime()) ? '' : toIsoDate(raw);
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return '';
  }
  const fromIso = parseIsoDateParts(trimmed.slice(0, 10));
  if (fromIso) {
    return toIsoDate(fromIso);
  }
  const dmy = /^(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(trimmed);
  if (dmy) {
    const date = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
    return Number.isNaN(date.getTime()) ? '' : toIsoDate(date);
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? '' : toIsoDate(parsed);
}

interface EditFormFieldProps {
  field: EditFieldDef;
  /** true = postojeći zapis se uređuje (za disabled: "edit" — v. src/pages/dgl/components/MasterAzur.jsx checkDisabledValue). */
  editingExisting: boolean;
  onOpenSearch: (field: EditFieldDef) => void;
}

/**
 * Jedna kontrola forme prema *EditItems.json (v. .cursor/rules/30-api-database-layouts.mdc).
 * Datumi koriste DateField (prikaz dd.MM.yyyy, API ISO) — ekvivalent legacy DatePicker modala.
 */
export function EditFormField({ field, editingExisting, onOpenSearch }: EditFormFieldProps) {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const values = useAppSelector((state) => state.documents.editValues) ?? {};

  const disabled = field.disabled === 'allways' || (field.disabled === 'edit' && editingExisting);

  const setValue = (display: Record<string, unknown>, formValue: unknown) => {
    dispatch(updateEditValues(display));
    dispatch(updateEditFormData({ [field.azurFieldKey]: formValue }));
  };

  if (field.type === 'text') {
    const value = String(values[field.selectFieldKey] ?? '');
    const isHoursField = field.azurFieldKey.toLowerCase() === 'dstdatum2temp';
    return (
      <TextField
        label={field.caption}
        value={value}
        onChangeText={(text) => setValue({ [field.selectFieldKey]: text }, text)}
        editable={!disabled}
        keyboardType={isHoursField ? 'number-pad' : 'default'}
        placeholder={isHoursField ? 'npr. 2 ili 0200 (HHmm)' : undefined}
      />
    );
  }

  if (field.type === 'memo') {
    return (
      <MemoField
        label={field.caption}
        value={String(values[field.selectFieldKey] ?? '')}
        editable={!disabled}
        onChangeText={(text) => setValue({ [field.selectFieldKey]: text }, text)}
      />
    );
  }

  if (field.type === 'date') {
    const iso = toEditIsoDate(values[field.selectFieldKey]);
    return (
      <DateField
        label={field.caption}
        value={iso}
        editable={!disabled}
        onChangeIso={(next) => setValue({ [field.selectFieldKey]: next ?? '' }, next)}
      />
    );
  }

  // simple / advanced — šifrarnik odabir preko SifarnikSearchModal
  const displayValue = field.selectFieldText ? values[field.selectFieldText] : undefined;
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{field.caption}</Text>
      <Pressable
        onPress={() => !disabled && onOpenSearch(field)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={field.caption}
        style={({ pressed }) => [
          styles.pickerRow,
          {
            backgroundColor: disabled ? colors.surfaceMuted : colors.surface,
            borderColor: displayValue && !disabled ? colors.primaryBorder : colors.border,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.pickerValue,
            displayValue ? styles.pickerValueSelected : null,
            { color: displayValue ? colors.text : colors.textSubtle },
          ]}
          numberOfLines={2}
        >
          {displayValue ? String(displayValue) : 'Odaberite…'}
        </Text>
        {!disabled ? <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} /> : null}
      </Pressable>
    </View>
  );
}

function MemoField({
  label,
  value,
  editable,
  onChangeText,
}: {
  label: string;
  value: string;
  editable: boolean;
  onChangeText: (text: string) => void;
}) {
  const { colors } = useTheme();
  const fieldId = useId();
  const { viewRef, handleFocus } = useRegisterKeyboardField(fieldId);

  return (
    <View ref={viewRef} style={styles.container}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        editable={editable}
        multiline
        textAlignVertical="top"
        placeholderTextColor={colors.textSubtle}
        style={[
          styles.memo,
          {
            color: colors.text,
            backgroundColor: editable ? colors.surface : colors.surfaceMuted,
            borderColor: colors.border,
          },
        ]}
      />
      {value.length > 0 ? (
        <Text style={[styles.counter, { color: colors.textSubtle }]}>{`${value.length} znakova`}</Text>
      ) : null}
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
  memo: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
  },
  counter: {
    fontSize: typography.size.xs,
    textAlign: 'right',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: controlHeight.md,
  },
  pickerValue: {
    flex: 1,
    fontSize: typography.size.md,
    paddingVertical: spacing.sm,
  },
  pickerValueSelected: {
    fontWeight: typography.weight.medium,
  },
});
