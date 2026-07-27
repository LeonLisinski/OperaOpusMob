import { useNavigation, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';

import { DetailSection } from '@/components/DetailSection';
import { DocumentTabBar } from '@/components/DocumentTabBar';
import { EmptyState } from '@/components/EmptyState';
import { HeaderTextButton } from '@/components/HeaderTextButton';
import { Screen } from '@/components/Screen';
import { moduleHasAttachments, moduleHasDstLines, moduleHasSignature, startEditForm } from '@/features/documents/documentsSlice';
import { useDocumentLinesLoader } from '@/features/documents/useDocumentLinesLoader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing } from '@/theme';

/**
 * Read-only detalj dokumenta — koristi već dohvaćen redak iz liste (isti obrazac
 * kao src/pages/dgl/store getListItem: setItemData(item) prije zasebnog dst poziva).
 * Stavke se dohvaćaju paralelno preko loadDocumentLines (Tab3).
 */
export default function DocumentDetailScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const selectedModule = useAppSelector((state) => state.core.selectedModule);
  const route = useAppSelector((state) => state.documents.route);
  const layout = useAppSelector((state) => state.documents.layout);
  const item = useAppSelector((state) => state.documents.selectedItem);

  useDocumentLinesLoader();

  const canEdit = Boolean(item?.editable);
  const showTabBar = moduleHasDstLines(layout) || moduleHasAttachments(route, layout) || moduleHasSignature(route, item);
  const showRadTab = Boolean(item?.tabradvisible);

  const onEditPress = () => {
    dispatch(startEditForm(item));
    router.push('/(app)/documents/form');
  };

  useEffect(() => {
    navigation.setOptions({
      title: selectedModule?.title ?? 'Detalji',
      headerRight: canEdit ? () => <HeaderTextButton label="Uredi" onPress={onEditPress} /> : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, selectedModule, canEdit, item]);

  if (!item || !layout) {
    return (
      <Screen>
        <EmptyState title="Stavka nije pronađena" description="Vratite se na popis i odaberite stavku ponovno." />
      </Screen>
    );
  }

  if (layout.viewItems.length === 0) {
    return (
      <Screen>
        <EmptyState title="Detalj nije definiran" description="Layout ovog modula ne sadrži definiciju prikaza." />
      </Screen>
    );
  }

  const tabBar = showTabBar ? <DocumentTabBar activeTab="info" showRadTab={showRadTab} /> : null;

  return (
    <Screen scroll contentStyle={styles.content} footer={tabBar}>
      {layout.viewItems.map((section, index) => (
        <DetailSection key={`${section.caption}-${index}`} section={section} item={item} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
});
