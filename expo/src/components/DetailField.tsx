import { Linking, StyleSheet, Text, View } from 'react-native';

import { formatDateValue, isEmptyValue } from '@/features/documents/format';
import type { ViewFieldDef } from '@/features/documents/types';
import { spacing, typography, useTheme } from '@/theme';

interface DetailFieldProps {
  field: ViewFieldDef;
  item: Record<string, unknown>;
}

const EMPTY_PLACEHOLDER = '—';

/** Jedan redak read-only detalja: labela + vrijednost, prema *ViewItems.json definiciji polja. */
export function DetailField({ field, item }: DetailFieldProps) {
  const { colors } = useTheme();

  if (field.visiblefield && item[field.visiblefield] === false) {
    return null;
  }

  const rawValue = item[field.field];

  return (
    <View style={[styles.row, field.lines === false && styles.rowNoBorder, { borderColor: colors.border }]}>
      {field.caption ? <Text style={[styles.caption, { color: colors.textMuted }]}>{field.caption}</Text> : null}
      {renderValue(field, rawValue, colors.text, colors.primary)}
    </View>
  );
}

function renderValue(field: ViewFieldDef, rawValue: unknown, textColor: string, linkColor: string) {
  if (isEmptyValue(rawValue)) {
    return <Text style={[styles.value, { color: textColor }]}>{EMPTY_PLACEHOLDER}</Text>;
  }

  if (field.type === 'date') {
    return <Text style={[styles.value, { color: textColor }]}>{formatDateValue(rawValue, field.format)}</Text>;
  }

  if (field.type === 'url') {
    const url = String(rawValue);
    return (
      <Text
        style={[styles.value, styles.link, { color: linkColor }]}
        onPress={() => Linking.openURL(url).catch(() => undefined)}
        accessibilityRole="link"
      >
        {field.urlcaption || url}
      </Text>
    );
  }

  return (
    <Text style={[styles.value, { color: textColor }]} selectable>
      {String(rawValue)}
    </Text>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  rowNoBorder: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  caption: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  value: {
    fontSize: typography.size.md,
  },
  link: {
    textDecorationLine: 'underline',
  },
});
