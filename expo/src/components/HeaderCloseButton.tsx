import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { spacing, useTheme } from '@/theme';

interface HeaderCloseButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

/** Zatvaranje modala/forme — X desno u brand headeru umjesto "Odustani" lijevo. */
export function HeaderCloseButton({ onPress, disabled }: HeaderCloseButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Zatvori"
      hitSlop={8}
      style={styles.button}
    >
      <Ionicons name="close" size={26} color={disabled ? colors.onBrandSubtle : colors.onBrand} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
