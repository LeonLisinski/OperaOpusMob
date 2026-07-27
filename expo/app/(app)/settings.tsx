import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { logout, reactivateCore, resetApp } from '@/features/auth/authSlice';
import { getDeviceIdentity } from '@/services/device/deviceIdentity';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing, typography, useTheme, type ThemePreference } from '@/theme';
import { useRouter } from 'expo-router';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const THEME_OPTIONS: { id: ThemePreference; label: string }[] = [
  { id: 'system', label: 'Sustav' },
  { id: 'light', label: 'Svijetla' },
  { id: 'dark', label: 'Tamna' },
];

/**
 * Puni ekran postavki — ekvivalent src/pages/core/cc/TabPostavke.tsx (verzija, konekcija,
 * uređaj, izgled, reset). "Zapamti prijavu" iz Ionic izvora je bio dekorativan
 * (hardkodiran `checked`, bez stvarne funkcije, označen "u izradi") — namjerno izostavljen.
 */
export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { colors, preference, setPreference } = useTheme();
  const core = useAppSelector((state) => state.auth.core);
  const connection = useAppSelector((state) => state.auth.connection);
  const [installationId, setInstallationId] = useState('…');

  useEffect(() => {
    getDeviceIdentity().then((device) => setInstallationId(device.installationId));
  }, []);

  const onLogoutPress = () => {
    Alert.alert('Odjava', 'Želite li se odjaviti?', [
      { text: 'Odustani', style: 'cancel' },
      {
        text: 'Odjava',
        style: 'destructive',
        onPress: async () => {
          await dispatch(logout());
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const onReactivatePress = () => {
    Alert.alert(
      'Ponovna aktivacija',
      'Vratit ćete se na Core PIN ekran kako bi se uređaj ponovno registrirao. Morat ćete se ponovno prijaviti.',
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

  const onResetAllPress = () => {
    Alert.alert(
      'Resetiraj sve postavke',
      'Briše se i identitet uređaja — aplikacija se ponaša kao da je prvi put instalirana. Nastaviti?',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Resetiraj',
          style: 'destructive',
          onPress: async () => {
            await dispatch(resetApp());
            router.replace('/(auth)/unlock');
          },
        },
      ],
    );
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <SettingsSection title="Verzija">
        <SettingsRow label="Verzija" value={Constants.expoConfig?.version ?? '—'} />
      </SettingsSection>

      <SettingsSection title="Konekcija">
        <SettingsRow label="Poslužitelj" value={connection?.server ? String(connection.server) : '—'} />
        <SettingsRow label="Baza" value={connection?.database ?? core?.db ?? '—'} />
        <SettingsRow label="API" value={core?.apiBaseUrl ?? '—'} last />
      </SettingsSection>

      <SettingsSection title="Uređaj">
        <SettingsRow label="Uuid" value={installationId} last />
      </SettingsSection>

      <SettingsSection title="Izgled">
        <View style={styles.segmentRow}>
          {THEME_OPTIONS.map((option) => {
            const selected = option.id === preference;
            return (
              <Pressable
                key={option.id}
                onPress={() => setPreference(option.id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[
                  styles.segment,
                  {
                    backgroundColor: selected ? colors.primary : colors.surfaceMuted,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.segmentLabel, { color: selected ? colors.onPrimary : colors.textMuted }]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SettingsSection>

      <SettingsSection title="Sesija">
        <ActionRow icon="log-out-outline" label="Odjava" onPress={onLogoutPress} last />
      </SettingsSection>

      <SettingsSection title="Reset">
        <ActionRow icon="refresh-outline" label="Resetiraj autorizacijske postavke" onPress={onReactivatePress} />
        <ActionRow icon="trash-outline" label="Resetiraj sve postavke" tone="danger" onPress={onResetAllPress} last />
      </SettingsSection>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSubtle }]}>
          Opera Mobile · SvamPlus{'\n'}v. {Constants.expoConfig?.version ?? '—'}
        </Text>
      </View>
    </Screen>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <Card style={styles.card}>
      <Text style={[styles.caption, { color: colors.text }]}>{title}</Text>
      <View>{children}</View>
    </Card>
  );
}

function ActionRow({
  icon,
  label,
  onPress,
  tone = 'default',
  last,
}: {
  icon: IoniconName;
  label: string;
  onPress: () => void;
  tone?: 'default' | 'danger';
  last?: boolean;
}) {
  const { colors } = useTheme();
  const tint = tone === 'danger' ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.actionRow, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
    >
      <View style={styles.actionRowLeft}>
        <View style={[styles.actionIcon, { backgroundColor: tone === 'danger' ? colors.dangerSoft : colors.surfaceMuted }]}>
          <Ionicons name={icon} size={16} color={tint} />
        </View>
        <Text style={[styles.actionLabel, { color: tint }]}>{label}</Text>
      </View>
      <Text style={[styles.chevron, { color: colors.textSubtle }]}>›</Text>
    </Pressable>
  );
}

function SettingsRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <Text style={[styles.rowLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.text }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  card: {
    gap: spacing.xs,
  },
  caption: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: spacing.xs,
  },
  row: {
    paddingVertical: spacing.sm,
    gap: 2,
  },
  rowLabel: {
    fontSize: typography.size.xs,
  },
  rowValue: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  segmentLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  actionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  actionIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    flexShrink: 1,
  },
  chevron: {
    fontSize: typography.size.lg,
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  footerText: {
    fontSize: typography.size.xs,
    textAlign: 'center',
    lineHeight: typography.lineHeight.sm,
  },
});
