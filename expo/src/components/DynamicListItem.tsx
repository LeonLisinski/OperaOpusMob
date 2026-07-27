import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { formatDateValue, isEmptyValue } from '@/features/documents/format';
import type { ListFieldDef, ListItemLayoutGroup } from '@/features/documents/types';
import { spacing, typography, useTheme } from '@/theme';

interface DynamicListItemProps {
  groups: ListItemLayoutGroup[];
  item: Record<string, unknown>;
  onPress?: () => void;
  /** Redni broj stavke (Tab3 prikazuje i+1 u kutu). */
  index?: number;
}

/**
 * Jedan redak generičke liste, renderiran prema *ListItem.json definiciji
 * (v. src/pages/dgl/List.jsx renderList/renderListItem/getItemValue).
 * Prva grupa (bez labela) je primarni tekst; ostale grupe su sekundarne
 * label:vrijednost linije. `item.indcolor` je konvencija koju SP-ovi vraćaju
 * neovisno o layoutu (v. List.jsx:166) — koristi se kao status traka.
 */
export function DynamicListItem({ groups, item, onPress, index }: DynamicListItemProps) {
  const { colors } = useTheme();
  const indColor = typeof item.indcolor === 'string' && item.indcolor.length > 0 ? item.indcolor : null;
  const heading = typeof item.classmain === 'string' && item.classmain.length > 0 ? item.classmain : null;

  const renderedGroups = groups
    .map((group, groupIndex) => ({ index: groupIndex, text: renderGroupText(group, item) }))
    .filter((entry) => entry.text !== null);

  const body = (
    <View style={styles.row}>
      {indColor ? <View style={[styles.stripe, { backgroundColor: indColor }]} /> : null}
      <View style={styles.body}>
        {typeof index === 'number' ? (
          <Text style={[styles.lineNumber, { color: colors.textSubtle }]}>{index + 1}.</Text>
        ) : null}
        {heading ? <Text style={[styles.heading, { color: colors.text }]}>{heading}</Text> : null}
        {renderedGroups.map(({ index: groupIndex, text }) => {
          const group = groups[groupIndex];
          const isPrimary = groupIndex === 0;
          return (
            <Text
              key={groupIndex}
              style={[
                isPrimary ? styles.primary : styles.secondary,
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
      {onPress ? <Text style={[styles.chevron, { color: colors.textSubtle }]}>›</Text> : null}
    </View>
  );

  if (!onPress) {
    return (
      <Card accessibilityLabel={buildAccessibilityLabel(heading, renderedGroups.map((entry) => entry.text ?? ''))} style={styles.card}>
        {body}
      </Card>
    );
  }

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={buildAccessibilityLabel(heading, renderedGroups.map((entry) => entry.text ?? ''))}
      style={styles.card}
    >
      {body}
    </Card>
  );
}

function renderGroupText(group: ListItemLayoutGroup, item: Record<string, unknown>): string | null {
  const parts = group.fields
    .map((field) => formatFieldValue(field, item))
    .filter((value): value is string => value !== null);

  if (parts.length === 0) {
    return null;
  }
  return parts.join('  ');
}

function formatFieldValue(field: ListFieldDef, item: Record<string, unknown>): string | null {
  const value = item[field.field];
  if (isEmptyValue(value)) {
    return null;
  }
  if (field.type === 'date') {
    return formatDateValue(value, field.format);
  }
  return String(value);
}

function buildAccessibilityLabel(heading: string | null, lines: string[]): string {
  return [heading, ...lines].filter(Boolean).join(', ');
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  stripe: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: spacing.md,
    gap: 2,
    position: 'relative',
  },
  lineNumber: {
    position: 'absolute',
    top: spacing.xs,
    left: 0,
    fontSize: typography.size.xs,
  },
  heading: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  primary: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  secondary: {
    fontSize: typography.size.sm,
  },
  label: {
    fontWeight: typography.weight.medium,
  },
  chevron: {
    fontSize: typography.size.xl,
    alignSelf: 'center',
    paddingHorizontal: spacing.sm,
  },
});
