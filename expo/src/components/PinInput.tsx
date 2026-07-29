import { Ionicons } from '@expo/vector-icons';
import { useId, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useRegisterKeyboardField } from '@/components/Screen';
import { controlHeight, radius, spacing, typography, useTheme } from '@/theme';

const PIN_LENGTH = 8;

interface PinInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  editable?: boolean;
  accessibilityLabel?: string;
  onSubmitEditing?: () => void;
  returnKeyType?: TextInputProps['returnKeyType'];
}

/**
 * PIN/šifra za spPinCoreAzur i spPinAppAzur — SQL tip je char(8), može biti
 * alfanumerička (npr. "jukic001"). Ionic UnlockCore/UnlockApp koriste type=password
 * bez ograničenja na samo brojke — isto ponašanje ovdje.
 */
export function PinInput({
  label,
  value,
  onChangeText,
  editable = true,
  accessibilityLabel,
  onSubmitEditing,
  returnKeyType = 'done',
}: PinInputProps) {
  const { colors } = useTheme();
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  const fieldId = useId();
  const { viewRef, handleFocus: scrollToFieldOnFocus } = useRegisterKeyboardField(fieldId);

  const handleChange = (text: string) => {
    onChangeText(text.slice(0, PIN_LENGTH));
  };

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
          value={value}
          onChangeText={handleChange}
          onFocus={() => {
            setFocused(true);
            scrollToFieldOnFocus();
          }}
          onBlur={() => setFocused(false)}
          secureTextEntry={hidden}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={PIN_LENGTH}
          editable={editable}
          accessibilityLabel={accessibilityLabel ?? label}
          placeholder={'•'.repeat(PIN_LENGTH)}
          placeholderTextColor={colors.textSubtle}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit
          style={[styles.input, { color: colors.text }]}
        />
        <Pressable
          onPress={() => setHidden((current) => !current)}
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Prikaži šifru' : 'Sakrij šifru'}
          hitSlop={8}
          style={styles.toggleButton}
        >
          <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={22} color={colors.primary} />
        </Pressable>      </View>
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
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: controlHeight.lg,
  },
  input: {
    flex: 1,
    fontSize: typography.size.xl,
    letterSpacing: 2,
    textAlign: 'center',
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