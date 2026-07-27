import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { ErrorMessage } from '@/components/ErrorMessage';
import { PinInput } from '@/components/PinInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { unlockCore } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing, typography, useTheme } from '@/theme';

const MIN_PIN_LENGTH = 8;

export default function UnlockCoreScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  const [pin, setPin] = useState('');
  const { loading, error } = useAppSelector((state) => state.auth.coreUnlock);

  const canSubmit = pin.length === MIN_PIN_LENGTH && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    const result = await dispatch(unlockCore({ pin }));
    if (unlockCore.fulfilled.match(result)) {
      setPin('');
      router.replace('/(auth)/login');
    } else {
      setPin('');
    }
  };

  return (
    <Screen scroll keyboardAware contentStyle={styles.screenContent}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.textMuted }]}>SvamPlus</Text>
        <Text style={[styles.title, { color: colors.text }]}>Opera Mobile</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Unesite šifru za aktivaciju aplikacije na ovom uređaju.
        </Text>
      </View>

      <Card style={styles.card}>
        <ErrorMessage message={error} />
        <PinInput
          label="Šifra za otključavanje aplikacije"
          value={pin}
          onChangeText={setPin}
          editable={!loading}
          onSubmitEditing={handleSubmit}
        />
        <PrimaryButton
          label="Otključaj"
          onPress={handleSubmit}
          loading={loading}
          disabled={!canSubmit}
          accessibilityLabel="Otključaj aplikaciju"
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  eyebrow: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
  },
  subtitle: {
    fontSize: typography.size.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  card: {
    gap: spacing.lg,
  },
});
