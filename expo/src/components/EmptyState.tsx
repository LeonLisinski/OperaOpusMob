import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useTheme } from '@/theme';

interface EmptyStateProps {
  title: string;
  description?: string;
  /** Ikona u brand-tintiranom krugu — daje praznom stanju vizualno sidro. */
  icon?: keyof typeof Ionicons.glyphMap;
}

/** Prazna lista/detalj bez podataka — nikad prazan ekran bez objašnjenja (v. 50-ui-ux.mdc). */
export function EmptyState({ title, description, icon = 'file-tray-outline' }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primarySurface }]}>
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {description ? <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.md,
    textAlign: 'center',
    maxWidth: 280,
  },
});
