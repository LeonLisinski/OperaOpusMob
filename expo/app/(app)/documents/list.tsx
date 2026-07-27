import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { DocumentFilterModal } from '@/components/DocumentFilterModal';
import { DocumentListToolbar } from '@/components/DocumentListToolbar';
import { DynamicListItem } from '@/components/DynamicListItem';
import { EmptyState } from '@/components/EmptyState';
import { ErrorMessage } from '@/components/ErrorMessage';
import { HeaderTextButton } from '@/components/HeaderTextButton';
import { LoadingState } from '@/components/LoadingState';
import { RetryState } from '@/components/RetryState';
import { Screen } from '@/components/Screen';
import {
  loadDocumentModule,
  openFilterEditor,
  refreshDocumentList,
  selectListItem,
  startEditForm,
} from '@/features/documents/documentsSlice';
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
  const canCreateNew = route ? (route.kind === 'gen' || Boolean(settings.dglallownew)) : false;

  const onNewPress = () => {
    dispatch(startEditForm(null));
    router.push('/(app)/documents/form');
  };

  useEffect(() => {
    navigation.setOptions({
      title: selectedModule?.title ?? 'Popis',
      headerRight: canCreateNew ? () => <HeaderTextButton label="+ Novi" onPress={onNewPress} /> : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, selectedModule, canCreateNew]);

  useEffect(() => {
    if (selectedModule) {
      dispatch(loadDocumentModule(selectedModule));
    }
  }, [dispatch, selectedModule]);

  const onItemPress = (item: Record<string, unknown>) => {
    dispatch(selectListItem(item));
    router.push('/(app)/documents/detail');
  };

  const onOpenFilter = () => {
    dispatch(openFilterEditor());
    setFilterVisible(true);
  };

  if (!selectedModule) {
    return (
      <Screen>
        <EmptyState title="Modul nije odabran" description="Vratite se na popis modula i odaberite modul ponovno." />
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

  const listHeader = (
    <View style={styles.toolbar}>
      <DocumentListToolbar onOpenFilter={onOpenFilter} />
      {listStatus.error ? <ErrorMessage message={listStatus.error} /> : null}
      {isListEmpty ? (
        isSearchEmpty ? (
          <EmptyState title="Nema podudaranja" description="Promijenite pretragu ili poništite filter." />
        ) : (
          <EmptyState title="Nema dokumenata za prikaz" description="Za odabrani filter trenutno nema stavki." />
        )
      ) : null}
    </View>
  );

  return (
    <Screen style={styles.screen}>
      <FlatList
        style={styles.list}
        data={isListEmpty ? [] : list}
        keyExtractor={(item, index) => String(item.dglid ?? item.id ?? index)}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        refreshing={listStatus.loading}
        onRefresh={() => dispatch(refreshDocumentList())}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => (
          <DynamicListItem groups={layout?.listItems ?? []} item={item} onPress={() => onItemPress(item)} />
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
  toolbar: {
    paddingTop: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
});
