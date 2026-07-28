import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { StatusBadge } from '@/components/StatusBadge';
import { renderListGroupText } from '@/features/documents/listItemText';
import { statusToneFromColor, tonePalette, type StatusTone } from '@/features/documents/statusTone';
import type { ListItemLayoutGroup } from '@/features/documents/types';
import { radius, spacing, typography, useTheme } from '@/theme';

interface DynamicListItemProps {
  groups: ListItemLayoutGroup[];
  item: Record<string, unknown>;
  onPress?: () => void;
  /** Redni broj stavke (Tab3 prikazuje i+1 u kutu). */
  index?: number;
  /** Manji padding — kompaktniji prikaz stavki (Tab3 swipe lista). */
  compact?: boolean;
  /** Ton pozadine iz item.indclassname (Tab3.css) — nijansa dolazi iz teme. */
  tintTone?: StatusTone | null;
  /** Zaključana stavka — bez tap-a, prikaz ikone (Tab3 locked). */
  locked?: boolean;
}

/**
 * Jedan redak generičke liste, renderiran prema *ListItem.json definiciji
 * (v. src/pages/dgl/List.jsx renderList/renderListItem/getItemValue).
 * Prva grupa (bez labela) je primarni tekst; ostale grupe su sekundarne
 * label:vrijednost linije. `item.indcolor` je konvencija koju SP-ovi vraćaju
 * neovisno o layoutu (v. List.jsx:166) — svodi se na semantički ton (statusTone.ts)
 * da akcent traka i oznaka statusa ostanu čitljivi i u obje sheme.
 */
export function DynamicListItem({
  groups,
  item,
  onPress,
  index,
  compact = false,
  tintTone = null,
  locked = false,
}: DynamicListItemProps) {
  const { colors } = useTheme();
  const hasIndColor = typeof item.indcolor === 'string' && item.indcolor.length > 0;
  const tone = statusToneFromColor(item.indcolor);
  const statusLabel = typeof item.classmain === 'string' && item.classmain.trim().length > 0 ? item.classmain : null;
  const effectiveOnPress = locked ? undefined : onPress;

  const accentColor = tonePalette(colors, tone).solid;
  const backgroundTint = tintTone ? tonePalette(colors, tintTone).soft : null;

  const renderedGroups = groups
    .map((group, groupIndex) => ({ index: groupIndex, text: renderListGroupText(group, item) }))
    .filter((entry) => entry.text !== null);

  const showMetaRow = typeof index === 'number' || statusLabel !== null || locked;

  const body = (
    <View style={styles.row}>
      {hasIndColor ? <View style={[styles.accent, { backgroundColor: accentColor }]} /> : null}
      <View style={[styles.body, compact ? styles.bodyCompact : null]}>
        {showMetaRow ? (
          <View style={styles.metaRow}>
            {typeof index === 'number' ? (
              <Text style={[styles.lineNumber, { color: colors.textSubtle }]}>{index + 1}.</Text>
            ) : null}
            {statusLabel ? <StatusBadge label={statusLabel} tone={tone} /> : null}
            <View style={styles.metaSpacer} />
            {locked ? <Ionicons color={colors.textSubtle} name="lock-closed" size={14} /> : null}
          </View>
        ) : null}

        {renderedGroups.map(({ index: groupIndex, text }) => {
          const group = groups[groupIndex];
          const isPrimary = groupIndex === 0;
          return (
            <Text
              key={groupIndex}
              style={[
                isPrimary ? (compact ? styles.primaryCompact : styles.primary) : styles.secondary,
                { color: isPrimary ? colors.text : colors.textMuted },
              ]}
              numberOfLines={group.classmain === 'three-lines' ? 3 : 2}
            >
              {group.label ? <Text style={styles.label}>{group.label}: </Text> : null}
              {text}
            </Text>
          );
        })}
      </View>
      {effectiveOnPress ? (
        <View style={styles.chevron}>
          <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
        </View>
      ) : null}
    </View>
  );

  const cardStyle = [styles.card, backgroundTint ? { backgroundColor: backgroundTint } : null];
  const accessibilityLabel = buildAccessibilityLabel(
    statusLabel,
    renderedGroups.map((entry) => entry.text ?? ''),
  );

  if (!effectiveOnPress) {
    return (
      <Card accessibilityLabel={accessibilityLabel} style={cardStyle}>
        {body}
      </Card>
    );
  }

  return (
    <Card onPress={effectiveOnPress} accessibilityLabel={accessibilityLabel} style={cardStyle}>
      {body}
    </Card>
  );
}

function buildAccessibilityLabel(heading: string | null, lines: string[]): string {
  return [heading, ...lines].filter(Boolean).join(', ');
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: radius.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  accent: {
    width: 4,
  },
  body: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: 2,
  },
  bodyCompact: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  metaSpacer: {
    flex: 1,
  },
  lineNumber: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  primary: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.lineHeight.md,
  },
  primaryCompact: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.lineHeight.sm,
  },
  secondary: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
  },
  label: {
    fontWeight: typography.weight.medium,
  },
  chevron: {
    alignSelf: 'center',
    paddingRight: spacing.md,
    paddingLeft: spacing.xs,
  },
});
