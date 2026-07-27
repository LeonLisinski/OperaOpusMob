import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { ErrorMessage } from '@/components/ErrorMessage';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { loginErp, reactivateCore } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing, typography, useTheme } from '@/theme';

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const passwordRef = useRef<TextInput>(null);
  const { loading, error } = useAppSelector((state) => state.auth.login);
  const db = useAppSelector((state) => state.auth.core?.db ?? '');

  const canSubmit = username.trim().length > 0 && password.length > 0 && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    const result = await dispatch(loginErp({ username: username.trim(), password }));
    if (loginErp.fulfilled.match(result)) {
      setPassword('');
      router.replace('/(app)/apps');
    }
  };

  const handleReactivate = () => {
    Alert.alert(
      'Ponovna aktivacija',
      'Vratit ćete se na Core PIN ekran. Morat ćete se ponovno prijaviti nakon aktivacije.',
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

  return (
    <Screen scroll keyboardAware contentStyle={styles.screenContent}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Prijava</Text>
        {db ? <Badge label={db} /> : null}
      </View>

      <Card style={styles.card}>
        <ErrorMessage message={error} />

        <View style={styles.form}>
              <TextField
                label="Korisničko ime"
                value={username}
                onChangeText={setUsername}
                autoComplete="username"
                textContentType="username"
                editable={!loading}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
              <TextField
                label="Lozinka"
                value={password}
                onChangeText={setPassword}
                secureEntry
                autoComplete="password"
                textContentType="password"
                editable={!loading}
                inputRef={passwordRef}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
        </View>

        <PrimaryButton label="Prijava" onPress={handleSubmit} loading={loading} disabled={!canSubmit} />

        <Pressable onPress={handleReactivate} accessibilityRole="button" style={styles.reactivateLink}>
          <Text style={[styles.reactivateText, { color: colors.primary }]}>Ponovno unesi Core PIN</Text>
        </Pressable>
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
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
  },
  card: {
    gap: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  reactivateLink: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
  },
  reactivateText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    textDecorationLine: 'underline',
  },
});
