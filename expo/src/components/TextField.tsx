import { Ionicons } from '@expo/vector-icons';
import { useId, useState, type RefObject } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from 'react-native';
import { useRegisterKeyboardField } from '@/components/Screen';
import { controlHeight, radius, spacing, typography, useTheme } from '@/theme';

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  secureEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  editable?: boolean;
  accessibilityLabel?: string;
  onSubmitEditing?: () => void;
  returnKeyType?: TextInputProps['returnKeyType'];
  inputRef?: RefObject<TextInput | null>;
  onFocus?: () => void;
}

/** Zajedničko tekstualno polje (korisničko ime, lozinka) s temeljnim theme tokenima. */
export function TextField({
  label,
  value,
  onChangeText,
  secureEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  textContentType,
  editable = true,
  accessibilityLabel,
  onSubmitEditing,
  returnKeyType = 'done',
  inputRef,
  onFocus,
}: TextFieldProps) {
  const { colors } = useTheme();
  const [hidden, setHidden] = useState(() => (secureEntry ? true : false));
  const [focused, setFocused] = useState(false);
  const fieldId = useId();
  const { viewRef, handleFocus: scrollToFieldOnFocus } = useRegisterKeyboardField(fieldId, onFocus);

  return (
    <View ref={viewRef} style={styles.container}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: editable ? colors.surface : colors.surfaceMuted,
            borderColor: focused ? colors.primary : colors.border,
            borderWidth: focused ? 1.5 : 1,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => {
            setFocused(true);
            scrollToFieldOnFocus();
          }}
          onBlur={() => setFocused(false)}
          secureTextEntry={secureEntry && hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          autoCorrect={false}
          editable={editable}
          accessibilityLabel={accessibilityLabel ?? label}
          placeholderTextColor={colors.textSubtle}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={returnKeyType === 'done'}
          style={[styles.input, { color: colors.text }]}
        />
        {secureEntry ? (
          <Pressable
            onPress={() => setHidden((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Prikaži unos' : 'Sakrij unos'}
            hitSlop={8}
            style={styles.toggleButton}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={22} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>
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
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: controlHeight.md,
  },
  input: {
    flex: 1,
    fontSize: typography.size.md,
    paddingVertical: spacing.sm,
  },
  toggleButton: {
    paddingLeft: spacing.xs,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});