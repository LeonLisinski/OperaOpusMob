import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Fab } from '@/components/Fab';
import { RetryState } from '@/components/RetryState';
import { Screen, TAB_SCREEN_EDGES } from '@/components/Screen';
import { SkeletonListLoader } from '@/components/SkeletonListLoader';
import { SwipeableDocumentLine } from '@/components/SwipeableDocumentLine';
import {
  confirmDstQuantity,
  deleteDstLine,
  filterDstLinesByKind,
  loadDocumentLines,
  moduleHasDstEditing,
  moduleHasDstLines,
  removeDstQuantityConfirm,
  startDstEditForm,
} from '@/features/documents/documentsSlice';
import { dstLineSwipeActions, isTruthyApiField, layoutHasDstActions } from '@/features/documents/dstLineHelpers';
import type { DstLineKind } from '@/features/documents/types';
import { useDocumentLinesLoader } from '@/features/documents/useDocumentLinesLoader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing } from '@/theme';

function readDstId(row: Record<string, unknown>): string | number | undefined {
  const value = row.dstid ?? row.DstId;
  return typeof value === 'string' || typeof value === 'number' ? value : undefined;
}

/**
 * Popis stavki dokumenta sa swipe akcijama — ekvivalent src/pages/dgl/tabs/Tab3.jsx.
 * Dijeli se između tabova "Stavke" i "Rad" (`kind`), koji su odvojene rute jer native
 * tab navigator ne može imati dvije instance iste rute.
 */
export function DocumentLinesView({ kind }: { kind: DstLineKind }) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const layout = useAppSelector((state) => state.documents.layout);
  const item = useAppSelector((state) => state.documents.selectedItem);
  const { dstLines, dstLinesStatus } = useAppSelector((state) => state.documents);

  useDocumentLinesLoader();

  const canEditLines = isTruthyApiField(item?.editable) && moduleHasDstEditing(layout);
  const canSwipeLines = layoutHasDstActions(layout);
  const listGroups = useMemo(() => {
    if (!layout) {
      return [];
    }
    return kind === 'rad' ? layout.dstListItemsRad : layout.dstListItems;
  }, [layout, kind]);

  const visibleLines = useMemo(() => filterDstLinesByKind(dstLines, kind), [dstLines, kind]);

  const onNewPress = () => {
    dispatch(startDstEditForm({ item: null, kind }));
    router.push('/(app)/documents/dst-form');
  };

  const onRowPress = (row: Record<string, unknown>) => {
    if (!canEditLines || isTruthyApiField(row.locked)) {
      return;
    }
    dispatch(startDstEditForm({ item: row, kind }));
    router.push('/(app)/documents/dst-form');
  };

  const onAddSubPress = useCallback(
    (row: Record<string, unknown>) => {
      const parentId = readDstId(row);
      if (parentId === undefined) {
        return;
      }
      dispatch(startDstEditForm({ item: null, kind, parentId }));
      router.push('/(app)/documents/dst-form');
    },
    [dispatch, kind, router],
  );

  const onDeletePress = useCallback(
    (dstId: string | number) => {
      Alert.alert('Potvrdite brisanje', undefined, [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Obriši',
          style: 'destructive',
          onPress: () => {
            void dispatch(deleteDstLine(dstId));
          },
        },
      ]);
    },
    [dispatch],
  );

  if (!item || !layout) {
    return (
      <Screen edges={TAB_SCREEN_EDGES}>
        <EmptyState
          icon="alert-circle-outline"
          title="Stavka nije pronađena"
          description="Vratite se na popis i odaberite stavku ponovno."
        />
      </Screen>
    );
  }

  if (!moduleHasDstLines(layout)) {
    return (
      <Screen edges={TAB_SCREEN_EDGES}>
        <EmptyState
          icon="list-outline"
          title="Stavke nisu dostupne"
          description="Ovaj modul nema definiciju stavki u layoutu."
        />
      </Screen>
    );
  }

  if (listGroups.length === 0) {
    return (
      <Screen edges={TAB_SCREEN_EDGES}>
        <EmptyState
          icon="construct-outline"
          title="Layout stavki nije definiran"
          description={kind === 'rad' ? 'dstListItemRad nedostaje u layoutu.' : 'dstListItem nedostaje u layoutu.'}
        />
      </Screen>
    );
  }

  if (dstLinesStatus.loading && visibleLines.length === 0) {
    return (
      <Screen edges={TAB_SCREEN_EDGES}>
        <SkeletonListLoader />
      </Screen>
    );
  }

  if (dstLinesStatus.error && visibleLines.length === 0) {
    return (
      <Screen edges={TAB_SCREEN_EDGES}>
        <RetryState message={dstLinesStatus.error} onRetry={() => dispatch(loadDocumentLines())} />
      </Screen>
    );
  }

  return (
    <Screen edges={TAB_SCREEN_EDGES} style={styles.screen}>
      <FlatList
        style={styles.list}
        data={visibleLines}
        keyExtractor={(row, index) => String(row.dstid ?? row.id ?? index)}
        contentContainerStyle={[styles.listContent, canEditLines ? styles.listContentWithFab : null]}
        refreshing={dstLinesStatus.loading}
        onRefresh={() => dispatch(loadDocumentLines())}
        ListHeaderComponent={dstLinesStatus.error ? <ErrorMessage message={dstLinesStatus.error} /> : <View />}
        ListEmptyComponent={
          <EmptyState
            icon="file-tray-outline"
            title="Nema stavki"
            description="Za ovaj dokument trenutno nema stavki za prikaz."
          />
        }
        renderItem={({ item: row, index }) => {
          const dstId = readDstId(row);
          const swipeActions = dstLineSwipeActions(row, layout, canSwipeLines);
          const rowEditable = canEditLines && !isTruthyApiField(row.locked);

          return (
            <SwipeableDocumentLine
              groups={listGroups}
              item={row}
              index={index}
              actions={swipeActions}
              onPress={rowEditable ? () => onRowPress(row) : undefined}
              onDelete={swipeActions.delete && dstId !== undefined ? () => onDeletePress(dstId) : undefined}
              onConfirmQty={
                swipeActions.confirmQty && dstId !== undefined
                  ? () => {
                      void dispatch(confirmDstQuantity(dstId));
                    }
                  : undefined
              }
              onRemoveQty={
                swipeActions.removeQty && dstId !== undefined
                  ? () => {
                      void dispatch(removeDstQuantityConfirm(dstId));
                    }
                  : undefined
              }
              onAddSub={swipeActions.addSub ? () => onAddSubPress(row) : undefined}
            />
          );
        }}
        removeClippedSubviews={false}
      />
      {canEditLines ? <Fab onPress={onNewPress} accessibilityLabel="Nova stavka" /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  // Zadnja stavka ne smije ostati ispod FAB-a (56px + odmak od dna).
  listContentWithFab: {
    paddingBottom: 88,
  },
});
