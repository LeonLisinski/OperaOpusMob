import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { DocumentFilterModal } from '@/components/DocumentFilterModal';
import { DocumentListToolbar } from '@/components/DocumentListToolbar';
import { EmptyState } from '@/components/EmptyState';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Fab } from '@/components/Fab';
import { LoadingState } from '@/components/LoadingState';
import { RetryState } from '@/components/RetryState';
import { Screen } from '@/components/Screen';
import { SwipeableDocumentRow } from '@/components/SwipeableDocumentRow';
import {
  loadDocumentModule,
  openFilterEditor,
  refreshDocumentList,
  selectListItem,
  startEditForm,
} from '@/features/documents/documentsSlice';
import { isTruthyApiField } from '@/features/documents/dstLineHelpers';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing } from '@/theme';

export default function DocumentsListScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const navigation = useNavigation();
  const [filterVisible, setFilterVisible] = useState(false);

  const selectedModule = useAppSelector((state) => state.core.selectedModule);
  const { route, layout, layoutStatus, list, listStatus, searchQuery, originalList, settings } = useAppSelector(
    (state) => state.documents,
  );

  // "Novi" gumb: gen nema flag u Ionic izvoru (uvijek prikazan), dgl poštuje settings.dglallownew
  // (v. src/pages/dgl/List.jsx vs src/pages/gen/List.jsx).
  const canCreateNew = route ? route.kind === 'gen' || Boolean(settings.dglallownew) : false;

  const onNewPress = () => {
    dispatch(startEditForm(null));
    router.push('/(app)/documents/form');
  };

  useEffect(() => {
    navigation.setOptions({ title: selectedModule?.title ?? 'Popis' });
  }, [navigation, selectedModule]);

  useEffect(() => {
    if (selectedModule) {
      dispatch(loadDocumentModule(selectedModule));
    }
  }, [dispatch, selectedModule]);

  const onItemPress = (item: Record<string, unknown>) => {
    dispatch(selectListItem(item));
    router.push('/(app)/documents/doc');
  };

  const onEditItem = (item: Record<string, unknown>) => {
    dispatch(selectListItem(item));
    dispatch(startEditForm(item));
    router.push('/(app)/documents/form');
  };

  const onOpenFilter = () => {
    dispatch(openFilterEditor());
    setFilterVisible(true);
  };

  if (!selectedModule) {
    return (
      <Screen>
        <EmptyState
          icon="albums-outline"
          title="Modul nije odabran"
          description="Vratite se na popis modula i odaberite modul ponovno."
        />
      </Screen>
    );
  }

  if (layoutStatus.loading) {
    return (
      <Screen>
        <LoadingState label="Učitavanje modula…" />
      </Screen>
    );
  }

  if (layoutStatus.error) {
    return (
      <Screen>
        <RetryState message={layoutStatus.error} onRetry={() => dispatch(loadDocumentModule(selectedModule))} />
      </Screen>
    );
  }

  const isSearchEmpty = searchQuery.trim().length > 0 && list.length === 0 && originalList.length > 0;
  const isListEmpty = list.length === 0 && !listStatus.loading;

  return (
    <Screen
      style={styles.screen}
      overlay={canCreateNew ? <Fab onPress={onNewPress} accessibilityLabel="Novi dokument" /> : null}
    >
      <DocumentListToolbar onOpenFilter={onOpenFilter} />

      <FlatList
        style={styles.list}
        data={isListEmpty ? [] : list}
        keyExtractor={(item, index) => String(item.dglid ?? item.id ?? index)}
        contentContainerStyle={[styles.listContent, canCreateNew ? styles.listContentWithFab : null]}
        refreshing={listStatus.loading}
        onRefresh={() => dispatch(refreshDocumentList())}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        ListHeaderComponent={listStatus.error ? <ErrorMessage message={listStatus.error} /> : null}
        ListEmptyComponent={
          isSearchEmpty ? (
            <EmptyState
              icon="search-outline"
              title="Nema podudaranja"
              description="Promijenite pretragu ili poništite filter."
            />
          ) : (
            <EmptyState
              icon="file-tray-outline"
              title="Nema dokumenata za prikaz"
              description="Za odabrani filter trenutno nema stavki."
            />
          )
        }
        renderItem={({ item, index }) => (
          <SwipeableDocumentRow
            groups={layout?.listItems ?? []}
            item={item}
            index={index}
            editable={isTruthyApiField(item.editable)}
            onPress={() => onItemPress(item)}
            onEdit={() => onEditItem(item)}
          />
        )}
      />

      <DocumentFilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} />
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
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  // Zadnja kartica ne smije ostati ispod FAB-a (56px + odmak od dna).
  listContentWithFab: {
    paddingBottom: 88,
  },
});
