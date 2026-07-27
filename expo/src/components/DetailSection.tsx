import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { DetailField } from '@/components/DetailField';
import type { ViewSection } from '@/features/documents/types';
import { spacing, typography, useTheme } from '@/theme';

interface DetailSectionProps {
  section: ViewSection;
  item: Record<string, unknown>;
}

/** Jedna sekcija read-only detalja (caption + polja), prema *ViewItems.json grupi. */
export function DetailSection({ section, item }: DetailSectionProps) {
  const { colors } = useTheme();

  if (section.visiblefield && item[section.visiblefield] === false) {
    return null;
  }

  return (
    <Card style={styles.card}>
      <Text style={[styles.caption, { color: colors.text }]}>{section.caption}</Text>
      <View>
        {section.items.map((field, index) => (
          <DetailField key={`${field.field}-${index}`} field={field} item={item} />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
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
});
