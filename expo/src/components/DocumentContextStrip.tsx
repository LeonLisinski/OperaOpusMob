import { StyleSheet, Text, View } from 'react-native';

import { documentIdentityText } from '@/features/documents/listItemText';
import { statusToneFromColor } from '@/features/documents/statusTone';
import { useAppSelector } from '@/store/hooks';
import { radius, spacing, typography, useTheme } from '@/theme';

/**
 * Kontekstna traka unutar dokumenta — nastavak brand headera koji ostaje vidljiv na svim
 * tabovima, pa korisnik uvijek zna koji dokument gleda. Identitet i status dolaze iz
 * postojećeg layout ugovora (prva grupa `*ListItem.json` + `indcolor`), bez novih SP polja.
 */
export function DocumentContextStrip() {
  const { colors } = useTheme();
  const layout = useAppSelector((state) => state.documents.layout);
  const item = useAppSelector((state) => state.documents.selectedItem);

  const identity = documentIdentityText(layout?.listItems ?? [], item);
  if (!identity) {
    return null;
  }

  const tone = statusToneFromColor(item?.indcolor);
  const toneColor = {
    neutral: colors.onBrandSubtle,
    primary: colors.onBrand,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
    info: colors.info,
  }[tone];

  const statusLabel = typeof item?.classmain === 'string' && item.classmain.length > 0 ? item.classmain : null;

  return (
    <View style={[styles.strip, { backgroundColor: colors.brandChrome }]}>
      <View style={styles.row}>
        <View style={[styles.statusDot, { backgroundColor: toneColor }]} />
        <Text style={[styles.identity, { color: colors.onBrand }]} numberOfLines={1}>
          {identity}
        </Text>
      </View>
      {statusLabel ? (
        <Text style={[styles.status, { color: colors.onBrandSubtle }]} numberOfLines={1}>
          {statusLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  identity: {
    flex: 1,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
  },
  status: {
    fontSize: typography.size.xs,
    paddingLeft: spacing.lg,
  },
});
