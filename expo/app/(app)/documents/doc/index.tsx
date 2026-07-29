import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { DetailSection } from '@/components/DetailSection';
import { EmptyState } from '@/components/EmptyState';
import { Fab } from '@/components/Fab';
import { Screen, TAB_SCREEN_EDGES } from '@/components/Screen';
import { startEditForm } from '@/features/documents/documentsSlice';
import { isTruthyApiField } from '@/features/documents/dstLineHelpers';
import { useDocumentLinesLoader } from '@/features/documents/useDocumentLinesLoader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing } from '@/theme';

/**
 * Read-only detalj dokumenta — koristi već dohvaćen redak iz liste (isti obrazac
 * kao src/pages/dgl/store getListItem: setItemData(item) prije zasebnog dst poziva).
 * Stavke se dohvaćaju paralelno preko loadDocumentLines (Tab3).
 */
export default function DocumentInfoScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const layout = useAppSelector((state) => state.documents.layout);
  const item = useAppSelector((state) => state.documents.selectedItem);

  useDocumentLinesLoader();

  const canEdit = isTruthyApiField(item?.editable);

  const onEditPress = () => {
    dispatch(startEditForm(item));
    router.push('/(app)/documents/form');
  };

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

  if (layout.viewItems.length === 0) {
    return (
      <Screen edges={TAB_SCREEN_EDGES}>
        <EmptyState
          icon="document-outline"
          title="Detalj nije definiran"
          description="Layout ovog modula ne sadrži definiciju prikaza."
        />
      </Screen>
    );
  }

  return (
    <Screen
      edges={TAB_SCREEN_EDGES}
      style={styles.screen}
      scroll
      contentStyle={[styles.content, canEdit ? styles.contentWithFab : null]}
      overlay={
        canEdit ? (
          <Fab icon="pencil" bottomOffset={spacing.sm} onPress={onEditPress} accessibilityLabel="Uredi dokument" />
        ) : null
      }
    >
      {layout.viewItems.map((section, index) => (
        <DetailSection key={`${section.caption}-${index}`} section={section} item={item} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  // Zadnja sekcija ne smije ostati ispod FAB-a (56px + odmak od dna).
  contentWithFab: {
    paddingBottom: 88,
  },
});
