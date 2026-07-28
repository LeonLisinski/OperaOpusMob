import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { IconButton } from '@/components/IconButton';
import { clearSearchQuery, setSearchQuery } from '@/features/documents/documentsSlice';
import { buildFilterChips, countActiveFilters } from '@/features/documents/filterUtils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing, typography, useTheme } from '@/theme';

type DocumentListToolbarProps = {
  onOpenFilter: () => void;
};

/**
 * Kontekst liste: trajno vidljiva pretraga u brand zoni (nastavak headera), filter kao
 * ikona s brojem aktivnih promjena, a aktivni filter kao red chipova. Zamjenjuje dva
 * tekstualna gumba i centrirani troredni sažetak koji su trošili visinu bez informacije.
 */
export function DocumentListToolbar({ onOpenFilter }: DocumentListToolbarProps) {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const searchRef = useRef<TextInput>(null);

  const searchQuery = useAppSelector((state) => state.documents.searchQuery);
  const filter = useAppSelector((state) => state.documents.filter);
  const filterBaseline = useAppSelector((state) => state.documents.filterBaseline);
  const list = useAppSelector((state) => state.documents.list);
  const originalList = useAppSelector((state) => state.documents.originalList);
  const searchFields = useAppSelector((state) => state.documents.searchFields);

  const activeFilterCount = countActiveFilters(filter, filterBaseline);
  const chips = buildFilterChips(filter);
  const isSearchActive = searchQuery.trim().length > 0;
  const isEmptyBecauseSearch = isSearchActive && list.length === 0 && originalList.length > 0;
  const canSearch = searchFields.length > 0;

  return (
    <View>
      <View style={[styles.band, { backgroundColor: colors.brandChrome }]}>
        {canSearch ? (
          <Pressable
            onPress={() => searchRef.current?.focus()}
            style={[styles.searchPill, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="search" size={18} color={colors.textMuted} />
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
              <Pressable
                onPress={() => dispatch(clearSearchQuery())}
                accessibilityRole="button"
                accessibilityLabel="Očisti pretragu"
                hitSlop={10}
              >
                <Ionicons name="close-circle" size={18} color={colors.textSubtle} />
              </Pressable>
            ) : null}
          </Pressable>
        ) : (
          <View style={styles.searchSpacer} />
        )}

        <View>
          <IconButton icon="options-outline" variant="onBrand" onPress={onOpenFilter} accessibilityLabel="Filter" />
          {activeFilterCount > 0 ? (
            <View style={[styles.filterBadge, { backgroundColor: colors.surface }]}>
              <Text style={[styles.filterBadgeText, { color: colors.primary }]}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        keyboardShouldPersistTaps="handled"
      >
        {chips.map((chip) => (
          <Chip key={chip.id} label={chip.label} icon={chip.icon} tone="brand" onPress={onOpenFilter} />
        ))}
      </ScrollView>

      <View style={styles.metaRow}>
        <Text style={[styles.count, { color: colors.textMuted }]}>
          <Text style={[styles.countValue, { color: colors.text }]}>{list.length}</Text>
          {list.length === 1 ? ' dokument' : ' dokumenata'}
        </Text>
        {isEmptyBecauseSearch ? (
          <Text style={[styles.hint, { color: colors.warning }]}>Nema podudaranja</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  searchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  searchSpacer: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.size.md,
    paddingVertical: spacing.sm,
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
  },
  chipsRow: {
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  count: {
    fontSize: typography.size.xs,
  },
  countValue: {
    fontWeight: typography.weight.semibold,
  },
  hint: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
});
