import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { extractTenantDatabase, normalizeDocumentList } from '@/services/api/responseNormalizers';
import { fetchSerijaRows } from '@/services/api/serijaApi';
import { useAppSelector } from '@/store/hooks';
import { radius, spacing, typography, useTheme } from '@/theme';
import { toUserMessage } from '@/types/api';

const MIN_SEARCH_LENGTH = 2;
const DEFAULT_DEBOUNCE_MS = 200;

interface SerijaSearchModalProps {
  visible: boolean;
  /** Debounce iz layout `debaunce` (Ionic SearchSer zove s 200). */
  debounceMs?: number;
  onClose: () => void;
  onSelect: (row: Record<string, unknown>) => void;
}

function hasFilterValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return true;
}

/**
 * Pretraga serija uređaja — port src/components/search/searchser.tsx.
 * Filteri sifsklad/sifart čitaju se iz documents.editValues (Ionic dstDataEdit);
 * toggleovi šalju null kad su isključeni. Tražilica je vidljiva samo kad artikl
 * filter nije aktivan; tada server search (min 2 znaka) — Ionic advanced putanja
 * bez klijentskog filter bug-a na kraju handleChange.
 */
export function SerijaSearchModal({
  visible,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  onClose,
  onSelect,
}: SerijaSearchModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editValues = useAppSelector((state) => state.documents.editValues);
  const core = useAppSelector((state) => state.auth.core);
  const connection = useAppSelector((state) => state.auth.connection);

  const sifskladValue = editValues?.sifsklad;
  const sifartValue = editValues?.sifart;
  const skladisteLabel = editValues?.skladiste;
  const artiklLabel = editValues?.artikl;

  const canFilterSkladiste = hasFilterValue(sifskladValue);
  const canFilterArtikl = hasFilterValue(sifartValue);

  const [filterSkladiste, setFilterSkladiste] = useState(false);
  const [filterArtikl, setFilterArtikl] = useState(false);
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionKey, setSessionKey] = useState(0);

  // Reset session on open — stabilan ključ umjesto Ionic uuidv4() na svakom renderu.
  useEffect(() => {
    if (!visible) {
      return;
    }
    setQuery('');
    setRows([]);
    setError(null);
    const nextSkladiste = canFilterSkladiste;
    const nextArtikl = canFilterArtikl;
    setFilterSkladiste(nextSkladiste);
    setFilterArtikl(nextArtikl);
    setSessionKey((k) => k + 1);
  }, [visible, canFilterSkladiste, canFilterArtikl]);

  const loadRows = useCallback(
    async (search: string | null, useSkladiste: boolean, useArtikl: boolean) => {
      if (!core) {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const tenantDb = extractTenantDatabase(connection as Record<string, unknown> | undefined, core.db);
        const raw = await fetchSerijaRows({
          apiBaseUrl: core.apiBaseUrl,
          tenantDb,
          sifsklad: useSkladiste ? sifskladValue : null,
          sifart: useArtikl ? sifartValue : null,
          search,
        });
        setRows(normalizeDocumentList(raw));
      } catch (err) {
        setError(toUserMessage(err));
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [core, connection, sifskladValue, sifartValue],
  );

  // Ionic: ako je artikl checked → odmah getSearchData(null).
  useEffect(() => {
    if (!visible || sessionKey === 0) {
      return;
    }
    if (filterArtikl) {
      void loadRows(null, filterSkladiste, true);
      return;
    }
    setRows([]);
  }, [visible, sessionKey, filterArtikl, filterSkladiste, loadRows]);

  const focusSearchInput = useCallback(() => {
    if (filterArtikl) {
      return;
    }
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [filterArtikl]);

  const scheduleSearch = (text: string, useSkladiste: boolean, useArtikl: boolean) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (text.length < MIN_SEARCH_LENGTH) {
      setRows([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      void loadRows(text, useSkladiste, useArtikl);
    }, debounceMs);
  };

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (filterArtikl) {
      return;
    }
    scheduleSearch(text, filterSkladiste, false);
  };

  const onToggleSkladiste = (next: boolean) => {
    setFilterSkladiste(next);
    // Artikl ON → load ide kroz useEffect (filterSkladiste dep). Inače server search.
    if (filterArtikl) {
      return;
    }
    setRows([]);
    if (query.length >= MIN_SEARCH_LENGTH) {
      scheduleSearch(query, next, false);
    }
  };

  const onToggleArtikl = (next: boolean) => {
    setFilterArtikl(next);
    setQuery('');
    // next true → useEffect učitava search=null; next false → useEffect prazni listu.
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const showEmpty = !loading && !error && rows.length === 0;
  const showSearchBar = !filterArtikl;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      onShow={focusSearchInput}
    >
      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={[styles.band, { backgroundColor: colors.brandChrome, paddingTop: insets.top + spacing.md }]}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.onBrand }]} numberOfLines={1}>
              Serija
            </Text>
            <Pressable onPress={onClose} accessibilityRole="button" hitSlop={8}>
              <Text style={[styles.headerAction, { color: colors.onBrand }]}>Odustani</Text>
            </Pressable>
          </View>

          {(canFilterSkladiste || canFilterArtikl) && (
            <View style={[styles.filters, { backgroundColor: colors.surface }]}>
              {canFilterSkladiste ? (
                <View style={styles.toggleRow}>
                  <Text style={[styles.toggleLabel, { color: colors.text }]} numberOfLines={2}>
                    {String(skladisteLabel ?? 'Skladište')}
                  </Text>
                  <Switch
                    value={filterSkladiste}
                    onValueChange={onToggleSkladiste}
                    trackColor={{ true: colors.primarySoft, false: colors.surfaceMuted }}
                    thumbColor={filterSkladiste ? colors.primary : colors.borderStrong}
                  />
                </View>
              ) : null}
              {canFilterArtikl ? (
                <View style={[styles.toggleRow, canFilterSkladiste ? styles.toggleRowBorder : null, { borderColor: colors.border }]}>
                  <Text style={[styles.toggleLabel, { color: colors.text }]} numberOfLines={2}>
                    {String(artiklLabel ?? 'Artikl')}
                  </Text>
                  <Switch
                    value={filterArtikl}
                    onValueChange={onToggleArtikl}
                    trackColor={{ true: colors.primarySoft, false: colors.surfaceMuted }}
                    thumbColor={filterArtikl ? colors.primary : colors.borderStrong}
                  />
                </View>
              ) : null}
            </View>
          )}

          {showSearchBar ? (
            <View style={[styles.searchPill, { backgroundColor: colors.surface }]}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                ref={inputRef}
                value={query}
                onChangeText={handleChangeText}
                placeholder={`Tražilica (minimalno ${MIN_SEARCH_LENGTH} znaka)`}
                placeholderTextColor={colors.textSubtle}
                autoCorrect={false}
                showSoftInputOnFocus
                style={[styles.searchInput, { color: colors.text }]}
              />
            </View>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : null}

        {error ? (
          <View style={styles.loading}>
            <Text style={{ color: colors.danger }}>{error}</Text>
          </View>
        ) : null}

        {showEmpty ? (
          <EmptyState
            icon="barcode-outline"
            title="Nema rezultata"
            description={
              showSearchBar && query.length < MIN_SEARCH_LENGTH
                ? 'Upišite tekst za pretragu ili uključite filter artikla.'
                : 'Promijenite filtere ili pretragu.'
            }
          />
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(item, index) => String(item.serija ?? item.sifser ?? index)}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelect(item)}
                style={[styles.row, { borderColor: colors.border }]}
                accessibilityRole="button"
              >
                <Text style={[styles.rowPrimary, { color: colors.text }]}>
                  Uređaj: {String(item.serija ?? '')}
                </Text>
                <Text style={[styles.rowSecondary, { color: colors.textMuted }]}>
                  {String(item.artikl ?? '')}
                </Text>
                <Text style={[styles.rowSecondary, { color: colors.textMuted }]}>
                  Skladište: {String(item.skladiste ?? '')}
                </Text>
                <Text style={[styles.rowSecondary, { color: colors.textMuted }]}>
                  Kol. rezervirano / raspoloživo: {String(item.rezervirano ?? '')} /{' '}
                  {String(item.raspolozivo ?? '')}
                </Text>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  band: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
  },
  headerAction: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  },
  filters: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  toggleRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toggleLabel: {
    flex: 1,
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.size.md,
    paddingVertical: spacing.sm,
  },
  loading: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  list: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  rowPrimary: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  rowSecondary: {
    fontSize: typography.size.sm,
  },
});
