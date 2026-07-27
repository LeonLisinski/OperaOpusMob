import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
 * src/components/search/simple/search.jsx: "simple" učita cijelu listu odmah i filtrira
 * lokalno po unosu, "advanced" čeka minimalno 2 znaka i traži server-side uz debounce.
 */
export function SifarnikSearchModal({ visible, field, onClose, onSelect }: SifarnikSearchModalProps) {
  const { colors } = useTheme();
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

  // Reset na promjenu polja se postiže remountom preko `key` u form.tsx (v. Ionic
  // search.jsx useEffect deps [entity, azurFieldKey]) — ovaj efekt se izvrši samo jednom
  // po mountu, bez sinkronog setState-a za "reset" (izbjegava cascading renders).
  useEffect(() => {
    if (field && !isAdvanced) {
      void loadRows(undefined);
    }
    const focusTimeout = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(focusTimeout);
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
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{field.caption}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" hitSlop={8}>
            <Text style={[styles.headerAction, { color: colors.primary }]}>Odustani</Text>
          </Pressable>
        </View>

        <View style={[styles.searchRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={handleChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textSubtle}
            autoCorrect={false}
            style={[styles.searchInput, { color: colors.text }]}
          />
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
            title="Nema rezultata"
            description={isAdvanced && query.length < MIN_ADVANCED_LENGTH ? 'Upišite tekst za pretragu.' : 'Promijenite pretragu.'}
          />
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(item, index) => String(item.id ?? index)}
            keyboardShouldPersistTaps="handled"
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  headerAction: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  },
  searchRow: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  searchInput: {
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
