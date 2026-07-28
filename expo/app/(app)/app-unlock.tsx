import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { ErrorMessage } from '@/components/ErrorMessage';
import { PinInput } from '@/components/PinInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { reactivateCore } from '@/features/auth/authSlice';
import { selectApp, unlockApp } from '@/features/core/coreSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing, typography, useTheme } from '@/theme';

const PIN_LENGTH = 8;

export default function AppUnlockScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ code?: string; title?: string }>();
  const appCode = params.code ?? '';
  const appTitle = params.title ?? appCode;

  const app = useAppSelector((state) => state.core.apps.find((item) => item.code === appCode) ?? null);

  const [pin, setPin] = useState('');
  const { loading, error } = useAppSelector((state) => state.core.appUnlock);

  useEffect(() => {
    navigation.setOptions({ title: appTitle || 'Otključavanje aplikacije' });
  }, [navigation, appTitle]);

  const canSubmit = pin.length === PIN_LENGTH && !loading && appCode.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    const result = await dispatch(unlockApp({ pin, appCode }));
    if (unlockApp.fulfilled.match(result)) {
      setPin('');
      const unlockedApp = app ? { ...app, unlocked: true } : null;
      if (unlockedApp) {
        dispatch(selectApp(unlockedApp));
      }
      router.replace({ pathname: '/(app)/modules/[code]', params: { code: appCode } });
      return;
    }
    setPin('');
  };

  const handleReactivateCore = () => {
    Alert.alert(
      'Ponovna aktivacija',
      'Bit ćete vraćeni na ekran za Core PIN kako bi se uređaj ponovno registrirao. Morat ćete se ponovno prijaviti.',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Nastavi',
          onPress: async () => {
            await dispatch(reactivateCore());
            router.replace('/(auth)/unlock');
          },
        },
      ],
    );
  };

  const showReactivateHint =
    !!error &&
    (error.toLowerCase().includes('core pin') || error.toLowerCase().includes('otključavanje nije uspjelo'));

  return (
    <Screen scroll keyboardAware contentStyle={styles.screenContent}>
      <View style={styles.hero}>
        <View style={[styles.heroIcon, { backgroundColor: colors.primarySurface }]}>
          <Ionicons name="lock-closed-outline" size={26} color={colors.primary} />
        </View>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Unesite šifru za otključavanje ove aplikacije.
        </Text>
      </View>

      <Card style={styles.card}>
        <ErrorMessage message={error} />

        <PinInput
          label="Šifra"
          value={pin}
          onChangeText={setPin}
          editable={!loading}
          onSubmitEditing={handleSubmit}
        />

        <View style={styles.actions}>
          <PrimaryButton
            label="Otkaži"
            onPress={() => router.back()}
            variant="secondary"
            disabled={loading}
            style={styles.actionButton}
          />
          <PrimaryButton
            label="Otključaj"
            onPress={handleSubmit}
            loading={loading}
            disabled={!canSubmit}
            style={styles.actionButton}
          />
        </View>

        {showReactivateHint ? (
          <PrimaryButton
            label="Ponovno unesi Core PIN"
            onPress={handleReactivateCore}
            variant="secondary"
            disabled={loading}
          />
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: typography.size.sm,
    textAlign: 'center',
  },
  card: {
    gap: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
