import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import {
  applyDocumentFilters,
  toggleFilterTempStatus,
  updateFilterTempField,
  resetFilterTemp,
} from '@/features/documents/documentsSlice';
import { statusToneFromColor } from '@/features/documents/statusTone';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing, typography, useTheme } from '@/theme';

type DocumentFilterModalProps = {
  visible: boolean;
  onClose: () => void;
};

/**
 * Filter dokumenata — jedan koherentan scroll s jasno odvojenim sekcijama
 * (Statusi / Razdoblje / Ostalo) umjesto ranijih Statusi/Ostalo tabova, tako da
 * su datumska polja odmah vidljiva bez dodatnog taska. Tijelo koristi isti
 * `Screen scroll keyboardAware` mehanizam kao ostale forme (v. documents/form.tsx)
 * — ranije je ovaj modal imao običan ScrollView bez zaštite od tipkovnice.
 */
export function DocumentFilterModal({ visible, onClose }: DocumentFilterModalProps) {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const statusColor = (indcolor: string | null | undefined) =>
    ({
      neutral: colors.borderStrong,
      primary: colors.primary,
      success: colors.success,
      warning: colors.warning,
      danger: colors.danger,
      info: colors.info,
    })[statusToneFromColor(indcolor)];
  const filterTemp = useAppSelector((state) => state.documents.filterTemp);
  const listStatus = useAppSelector((state) => state.documents.listStatus);

  const handleApply = async () => {
    const result = await dispatch(applyDocumentFilters());
    if (applyDocumentFilters.fulfilled.match(result)) {
      onClose();
    }
  };

  if (!filterTemp) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.brandChrome, paddingTop: insets.top + spacing.md }]}>
          <Pressable onPress={onClose} accessibilityRole="button" hitSlop={8}>
            <Text style={[styles.headerAction, { color: colors.onBrand }]}>Odustani</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.onBrand }]}>Filter</Text>
          <Pressable onPress={() => dispatch(resetFilterTemp())} accessibilityRole="button" hitSlop={8}>
            <Text style={[styles.headerAction, styles.headerActionEnd, { color: colors.onBrandSubtle }]}>Reset</Text>
          </Pressable>
        </View>

        <Screen
          edges={[]}
          scroll
          keyboardAware
          contentStyle={styles.body}
          footer={
            <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
              <PrimaryButton label="Primijeni" onPress={handleApply} loading={listStatus.loading} style={styles.footerButton} />
            </View>
          }
        >
          {filterTemp.statuses.length > 0 ? (
            <FilterSection title="Statusi">
              {filterTemp.statuses.map((item) => (
                <Pressable
                  key={String(item.id)}
                  onPress={() => dispatch(toggleFilterTempStatus(item.id))}
                  style={styles.statusRow}
                >
                  <View style={[styles.statusStripe, { backgroundColor: statusColor(item.indcolor) }]} />
                  <Text style={[styles.statusLabel, { color: colors.text }]}>{item.name}</Text>
                  <Switch
                    value={item.checked}
                    onValueChange={() => {
                      dispatch(toggleFilterTempStatus(item.id));
                    }}
                    trackColor={{ true: colors.primarySoft, false: colors.surfaceMuted }}
                    thumbColor={item.checked ? colors.primary : colors.borderStrong}
                  />
                </Pressable>
              ))}
            </FilterSection>
          ) : null}

          <FilterSection title="Razdoblje">
            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <TextField
                  label="Datum od"
                  value={filterTemp.datumod}
                  onChangeText={(value) => dispatch(updateFilterTempField({ datumod: value }))}
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="next"
                />
              </View>
              <View style={styles.dateField}>
                <TextField
                  label="Datum do"
                  value={filterTemp.datumdo}
                  onChangeText={(value) => dispatch(updateFilterTempField({ datumdo: value }))}
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="done"
                />
              </View>
            </View>
            <Text style={[styles.hint, { color: colors.textSubtle }]}>Format: GGGG-MM-DD</Text>
          </FilterSection>

          <FilterSection title="Ostalo">
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>Samo moje stavke</Text>
              <Switch
                value={filterTemp.samomoje}
                onValueChange={(value) => {
                  dispatch(updateFilterTempField({ samomoje: value }));
                }}
                trackColor={{ true: colors.primarySoft, false: colors.surfaceMuted }}
                thumbColor={filterTemp.samomoje ? colors.primary : colors.borderStrong}
              />
            </View>
          </FilterSection>
        </Screen>
      </SafeAreaView>
    </Modal>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <Card style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerAction: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    minWidth: 64,
  },
  headerActionEnd: {
    textAlign: 'right',
  },
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionBody: {
    gap: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    overflow: 'hidden',
    minHeight: 48,
  },
  statusStripe: {
    width: 4,
    alignSelf: 'stretch',
  },
  statusLabel: {
    flex: 1,
    paddingHorizontal: spacing.md,
    fontSize: typography.size.md,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateField: {
    flex: 1,
  },
  hint: {
    fontSize: typography.size.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  toggleLabel: {
    fontSize: typography.size.md,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
  },
});
