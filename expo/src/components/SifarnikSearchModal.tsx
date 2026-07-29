import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { readItemId } from '@/features/documents/documentsSlice';
import type { EditFieldDef } from '@/features/documents/types';
import { extractTenantDatabase, normalizeDocumentList } from '@/services/api/responseNormalizers';
import { fetchSifarnikRows } from '@/services/api/sifarniciApi';
import { useAppSelector } from '@/store/hooks';
import { radius, spacing, typography, useTheme } from '@/theme';
import { toUserMessage } from '@/types/api';

const DEFAULT_SP = 'spMob_DGL_Sifarnici';
const MIN_ADVANCED_LENGTH = 2;

interface SifarnikSearchModalProps {
  visible: boolean;
  field: EditFieldDef | null;
  onClose: () => void;
  onSelect: (row: Record<string, unknown>) => void;
}

/**
 * Generički šifrarnik pretraživač za "simple"/"advanced" kontrole — replicira
 * src/components/search/simple/search.jsx. Fokus na search polje ide kroz Modal.onShow
 * (bez setTimeout kašnjenja) da animacija modala i tipkovnice djeluju kao jedan prijelaz.
 */
export function SifarnikSearchModal({ visible, field, onClose, onSelect }: SifarnikSearchModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const route = useAppSelector((state) => state.documents.route);
  const layout = useAppSelector((state) => state.documents.layout);
  const selectedItem = useAppSelector((state) => state.documents.selectedItem);
  const editValues = useAppSelector((state) => state.documents.editValues);
  const core = useAppSelector((state) => state.auth.core);
  const user = useAppSelector((state) => state.auth.user);
  const connection = useAppSelector((state) => state.auth.connection);

  const [query, setQuery] = useState('');
  const [originalRows, setOriginalRows] = useState<Record<string, unknown>[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdvanced = field?.type === 'advanced';

  const focusSearchInput = useCallback(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    if (field && !isAdvanced) {
      void loadRows(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadRows(search: string | undefined) {
    if (!field || !route || !core || !user) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const sp = layout?.sifarniciQuery?.sp ?? DEFAULT_SP;
      const parentId = field.parentIdFieldKey ? editValues?.[field.parentIdFieldKey] : undefined;
      const extraParams =
        route.kind === 'gen' ? { id: readItemId(route, selectedItem) } : { sifdv: route.sifdv };
      const tenantDb = extractTenantDatabase(connection as Record<string, unknown> | undefined, core.db);
      const raw = await fetchSifarnikRows({
        apiBaseUrl: core.apiBaseUrl,
        tenantDb,
        sp,
        entity: field.entity ?? '',
        korime: user.korime,
        search,
        parentId,
        extraParams: { ...extraParams, azurFieldKey: field.azurFieldKey },
      });
      const data = normalizeDocumentList(raw);
      setOriginalRows(data);
      setRows(data);
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (!isAdvanced) {
      const needle = text.toLowerCase();
      setRows(originalRows.filter((row) => String(row.name ?? '').toLowerCase().includes(needle)));
      return;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (text.length < MIN_ADVANCED_LENGTH) {
      setOriginalRows([]);
      setRows([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      void loadRows(text);
    }, field?.debaunce ?? 300);
  };

  if (!field) {
    return null;
  }

  const placeholder = isAdvanced ? `Tražilica (minimalno ${MIN_ADVANCED_LENGTH} znaka)` : 'Tražilica';
  const showEmpty = !loading && !error && rows.length === 0;

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
              {field.caption}
            </Text>
            <Pressable onPress={onClose} accessibilityRole="button" hitSlop={8}>
              <Text style={[styles.headerAction, { color: colors.onBrand }]}>Odustani</Text>
            </Pressable>
          </View>

          <View style={[styles.searchPill, { backgroundColor: colors.surface }]}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={handleChangeText}
              placeholder={placeholder}
              placeholderTextColor={colors.textSubtle}
              autoCorrect={false}
              showSoftInputOnFocus
              style={[styles.searchInput, { color: colors.text }]}
            />
          </View>
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
            icon="search-outline"
            title="Nema rezultata"
            description={
              isAdvanced && query.length < MIN_ADVANCED_LENGTH ? 'Upišite tekst za pretragu.' : 'Promijenite pretragu.'
            }
          />
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(item, index) => String(item.id ?? index)}
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
                <Text style={[styles.rowLabel, { color: colors.text }]}>{String(item.name ?? '')}</Text>
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
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    fontSize: typography.size.md,
  },
});
