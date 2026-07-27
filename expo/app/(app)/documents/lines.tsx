import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { DocumentTabBar } from '@/components/DocumentTabBar';
import { DynamicListItem } from '@/components/DynamicListItem';
import { EmptyState } from '@/components/EmptyState';
import { ErrorMessage } from '@/components/ErrorMessage';
import { HeaderTextButton } from '@/components/HeaderTextButton';
import { RetryState } from '@/components/RetryState';
import { SkeletonListLoader } from '@/components/SkeletonListLoader';
import { Screen } from '@/components/Screen';
import {
  filterDstLinesByKind,
  loadDocumentLines,
  moduleHasDstEditing,
  moduleHasDstLines,
  startDstEditForm,
} from '@/features/documents/documentsSlice';
import type { DstLineKind } from '@/features/documents/types';
import { useDocumentLinesLoader } from '@/features/documents/useDocumentLinesLoader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing } from '@/theme';

function parseLineKind(raw: string | string[] | undefined): DstLineKind {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === 'rad' ? 'rad' : 'stavke';
}

/**
 * Read-only popis stavki dokumenta — ekvivalent src/pages/dgl/tabs/Tab3.jsx
 * (filtrira po tip=stavke|rad, layout dstListItem/dstListItemRad).
 */
export default function DocumentLinesScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ tip?: string }>();
  const lineKind = parseLineKind(params.tip);

  const selectedModule = useAppSelector((state) => state.core.selectedModule);
  const layout = useAppSelector((state) => state.documents.layout);
  const item = useAppSelector((state) => state.documents.selectedItem);
  const { dstLines, dstLinesStatus } = useAppSelector((state) => state.documents);

  useDocumentLinesLoader();

  const showRadTab = Boolean(item?.tabradvisible);
  // Isto ograničenje kao Ionic Tab3 onItemClick/onNewClick (listItem?.editable) — dodatno uz
  // dostupnost queries.dst.azur, koju Ionic uopće ne provjerava (v. D025/D026).
  const canEditLines = Boolean(item?.editable) && moduleHasDstEditing(layout);
  const listGroups = useMemo(() => {
    if (!layout) {
      return [];
    }
    return lineKind === 'rad' ? layout.dstListItemsRad : layout.dstListItems;
  }, [layout, lineKind]);

  const visibleLines = useMemo(() => filterDstLinesByKind(dstLines, lineKind), [dstLines, lineKind]);

  const onNewPress = () => {
    dispatch(startDstEditForm({ item: null, kind: lineKind }));
    router.push('/(app)/documents/dst-form');
  };

  const onRowPress = (row: Record<string, unknown>) => {
    if (!canEditLines || row.locked === true) {
      return;
    }
    dispatch(startDstEditForm({ item: row, kind: lineKind }));
    router.push('/(app)/documents/dst-form');
  };

  useEffect(() => {
    const title =
      lineKind === 'rad' ? 'Rad' : selectedModule?.title ? `${selectedModule.title} — stavke` : 'Stavke';
    navigation.setOptions({
      title,
      headerRight: canEditLines ? () => <HeaderTextButton label="+ Novi" onPress={onNewPress} /> : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, selectedModule, lineKind, canEditLines]);

  if (!item || !layout) {
    return (
      <Screen>
        <EmptyState title="Stavka nije pronađena" description="Vratite se na popis i odaberite stavku ponovno." />
      </Screen>
    );
  }

  if (!moduleHasDstLines(layout)) {
    return (
      <Screen>
        <EmptyState title="Stavke nisu dostupne" description="Ovaj modul nema definiciju stavki u layoutu." />
      </Screen>
    );
  }

  if (listGroups.length === 0) {
    return (
      <Screen>
        <EmptyState
          title="Layout stavki nije definiran"
          description={lineKind === 'rad' ? 'dstListItemRad nedostaje u layoutu.' : 'dstListItem nedostaje u layoutu.'}
        />
      </Screen>
    );
  }

  const tabBar = <DocumentTabBar activeTab={lineKind} showRadTab={showRadTab} />;

  if (dstLinesStatus.loading && visibleLines.length === 0) {
    return (
      <Screen footer={tabBar}>
        <SkeletonListLoader />
      </Screen>
    );
  }

  if (dstLinesStatus.error && visibleLines.length === 0) {
    return (
      <Screen footer={tabBar}>
        <RetryState message={dstLinesStatus.error} onRetry={() => dispatch(loadDocumentLines())} />
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen} footer={tabBar}>
      <FlatList
        style={styles.list}
        data={visibleLines}
        keyExtractor={(row, index) => String(row.dstid ?? row.id ?? index)}
        contentContainerStyle={styles.listContent}
        refreshing={dstLinesStatus.loading}
        onRefresh={() => dispatch(loadDocumentLines())}
        ListHeaderComponent={dstLinesStatus.error ? <ErrorMessage message={dstLinesStatus.error} /> : <View />}
        ListEmptyComponent={
          <EmptyState title="Nema stavki" description="Za ovaj dokument trenutno nema stavki za prikaz." />
        }
        renderItem={({ item: row, index }) => (
          <DynamicListItem
            groups={listGroups}
            item={row}
            index={index}
            onPress={canEditLines && row.locked !== true ? () => onRowPress(row) : undefined}
          />
        )}
      />
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
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    flexGrow: 1,
  },
});
