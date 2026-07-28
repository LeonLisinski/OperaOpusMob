import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { TextField } from '@/components/TextField';
import { updateEditFormData, updateEditValues } from '@/features/documents/documentsSlice';
import type { EditFieldDef } from '@/features/documents/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { controlHeight, radius, spacing, typography, useTheme } from '@/theme';

interface EditFormFieldProps {
  field: EditFieldDef;
  /** true = postojeći zapis se uređuje (za disabled: "edit" — v. src/pages/dgl/components/MasterAzur.jsx checkDisabledValue). */
  editingExisting: boolean;
  onOpenSearch: (field: EditFieldDef) => void;
}

/**
 * Jedna kontrola forme prema *EditItems.json (v. .cursor/rules/30-api-database-layouts.mdc).
 * Datum ostaje ručni YYYY-MM-DD unos, dosljedno s DocumentFilterModal (D018) — bez novog
 * date-picker dependencyja dok se ne odobri i runtime-potvrdi.
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
    return (
      <TextField
        label={field.caption}
        value={value}
        onChangeText={(text) => setValue({ [field.selectFieldKey]: text }, text)}
        editable={!disabled}
      />
    );
  }

  if (field.type === 'memo') {
    const value = String(values[field.selectFieldKey] ?? '');
    return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: colors.textMuted }]}>{field.caption}</Text>
        <TextInput
          value={value}
          onChangeText={(text) => setValue({ [field.selectFieldKey]: text }, text)}
          editable={!disabled}
          multiline
          textAlignVertical="top"
          placeholderTextColor={colors.textSubtle}
          style={[
            styles.memo,
            {
              color: colors.text,
              backgroundColor: disabled ? colors.surfaceMuted : colors.surface,
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

  if (field.type === 'date') {
    const raw = values[field.selectFieldKey];
    const iso = typeof raw === 'string' ? raw.slice(0, 10) : '';
    return (
      <TextField
        label={`${field.caption} (GGGG-MM-DD)`}
        value={iso}
        onChangeText={(text) => setValue({ [field.selectFieldKey]: text }, text || null)}
        editable={!disabled}
        keyboardType="numbers-and-punctuation"
        autoComplete="off"
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
