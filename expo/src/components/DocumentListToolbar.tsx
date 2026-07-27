import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Badge } from '@/components/Badge';
import { buildFilterSummary, countActiveFilters } from '@/features/documents/filterUtils';
import { clearSearchQuery, setSearchQuery } from '@/features/documents/documentsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing, typography, useTheme } from '@/theme';

type DocumentListToolbarProps = {
  onOpenFilter: () => void;
};

export function DocumentListToolbar({ onOpenFilter }: DocumentListToolbarProps) {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const searchRef = useRef<TextInput>(null);

  const [searchVisible, setSearchVisible] = useState(false);
  const searchQuery = useAppSelector((state) => state.documents.searchQuery);
  const filter = useAppSelector((state) => state.documents.filter);
  const filterBaseline = useAppSelector((state) => state.documents.filterBaseline);
  const list = useAppSelector((state) => state.documents.list);
  const originalList = useAppSelector((state) => state.documents.originalList);
  const searchFields = useAppSelector((state) => state.documents.searchFields);

  const activeFilterCount = countActiveFilters(filter, filterBaseline);
  const summary = buildFilterSummary(filter);
  const isSearchActive = searchQuery.trim().length > 0;
  const isEmptyBecauseSearch = isSearchActive && list.length === 0 && originalList.length > 0;

  const openSearch = () => {
    setSearchVisible(true);
    requestAnimationFrame(() => searchRef.current?.focus());
  };

  const closeSearch = () => {
    setSearchVisible(false);
    dispatch(clearSearchQuery());
  };

  if (searchVisible) {
    return (
      <View style={[styles.searchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          ref={searchRef}
          value={searchQuery}
          onChangeText={(value) => dispatch(setSearchQuery(value))}
          placeholder="Pretraga…"
          placeholderTextColor={colors.textSubtle}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          style={[styles.searchInput, { color: colors.text }]}
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={() => dispatch(clearSearchQuery())} accessibilityRole="button" hitSlop={8}>
            <Text style={[styles.actionText, { color: colors.primary }]}>Očisti</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={closeSearch} accessibilityRole="button" hitSlop={8}>
          <Text style={[styles.actionText, { color: colors.primary }]}>Zatvori</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.actionsRow}>
        {searchFields.length > 0 ? (
          <Pressable
            onPress={openSearch}
            accessibilityRole="button"
            style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.iconLabel, { color: colors.text }]}>Pretraga</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={onOpenFilter}
          accessibilityRole="button"
          style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.iconLabel, { color: colors.text }]}>Filter</Text>
          {activeFilterCount > 0 ? <Badge label={String(activeFilterCount)} tone="primary" /> : null}
        </Pressable>
      </View>

      <View style={[styles.summaryBox, { borderColor: colors.border }]}>
        <Text style={[styles.summaryLine, { color: colors.textMuted }]}>{summary.line1}</Text>
        <Text style={[styles.summaryLine, { color: colors.textMuted }]}>{summary.line2}</Text>
        <Text style={[styles.countLine, { color: colors.textSubtle }]}>
          Ukupno stavaka: <Text style={{ color: colors.text, fontWeight: typography.weight.semibold }}>{list.length}</Text>
        </Text>
        {isEmptyBecauseSearch ? (
          <Text style={[styles.hint, { color: colors.warning }]}>Nema podudaranja za unesenu pretragu.</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 40,
  },
  iconLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  summaryBox: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  summaryLine: {
    fontSize: typography.size.xs,
    textAlign: 'center',
  },
  countLine: {
    fontSize: typography.size.xs,
    textAlign: 'right',
    paddingTop: spacing.xs,
  },
  hint: {
    fontSize: typography.size.sm,
    textAlign: 'center',
    paddingTop: spacing.xs,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.size.md,
    paddingVertical: spacing.sm,
  },
  actionText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
});
