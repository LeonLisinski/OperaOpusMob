import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthLayout } from '@/components/AuthLayout';
import { ErrorMessage } from '@/components/ErrorMessage';
import { PinInput } from '@/components/PinInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { unlockCore } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing } from '@/theme';

const MIN_PIN_LENGTH = 8;

export default function UnlockCoreScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

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
    <AuthLayout
      title="Aktivacija uređaja"
      subtitle="Unesite šifru za aktivaciju aplikacije na ovom uređaju."
    >
      <ErrorMessage message={error} />
      <View style={styles.form}>
        <PinInput
          label="Šifra za otključavanje"
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
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
});
