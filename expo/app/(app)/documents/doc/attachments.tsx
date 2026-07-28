import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { DynamicListItem } from '@/components/DynamicListItem';
import { EmptyState } from '@/components/EmptyState';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Fab } from '@/components/Fab';
import { RetryState } from '@/components/RetryState';
import { Screen, TAB_SCREEN_EDGES } from '@/components/Screen';
import { SkeletonListLoader } from '@/components/SkeletonListLoader';
import {
  loadAttachments,
  moduleHasAttachments,
  openAttachment,
  uploadAttachments,
} from '@/features/documents/documentsSlice';
import type { ListItemLayoutGroup } from '@/features/documents/types';
import { useAttachmentsLoader } from '@/features/documents/useAttachmentsLoader';
import { pickAttachmentFiles } from '@/services/files/attachmentPicker';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing, typography, useTheme } from '@/theme';

/** Prikaz retka privitka je u Ionicu hardkodiran na `item.naziv` (TabPrivitci.jsx) — nema JSON layouta. */
const ATTACHMENT_LIST_GROUPS: ListItemLayoutGroup[] = [{ fields: [{ field: 'naziv' }] }];

/**
 * Popis i upravljanje privitcima dokumenta — ekvivalent src/pages/dgl/tabs/TabPrivitci.jsx.
 * Dostupno samo za dgl module (v. moduleHasAttachments, D027 — gen tab je mrtav kod u Ionicu).
 */
export default function DocumentAttachmentsScreen() {
  const dispatch = useAppDispatch();
  const [pickError, setPickError] = useState<string | null>(null);

  const route = useAppSelector((state) => state.documents.route);
  const layout = useAppSelector((state) => state.documents.layout);
  const item = useAppSelector((state) => state.documents.selectedItem);
  const { colors } = useTheme();
  const {
    attachments,
    attachmentsStatus,
    attachmentUploadStatus,
    attachmentOpeningId,
    attachmentOpenError,
  } = useAppSelector((state) => state.documents);

  useAttachmentsLoader();

  const isBusy = attachmentUploadStatus.loading || attachmentOpeningId !== null;

  const onAddPress = async () => {
    setPickError(null);
    try {
      const files = await pickAttachmentFiles();
      if (!files) {
        return;
      }
      await dispatch(uploadAttachments(files));
    } catch {
      setPickError('Odabir datoteke nije uspio.');
    }
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

  if (!moduleHasAttachments(route, layout)) {
    return (
      <Screen edges={TAB_SCREEN_EDGES}>
        <EmptyState
          icon="attach-outline"
          title="Privitci nisu dostupni"
          description="Ovaj modul nema definiciju privitaka u layoutu."
        />
      </Screen>
    );
  }

  if (attachmentsStatus.loading && attachments.length === 0) {
    return (
      <Screen edges={TAB_SCREEN_EDGES}>
        <SkeletonListLoader rows={3} />
      </Screen>
    );
  }

  if (attachmentsStatus.error && attachments.length === 0) {
    return (
      <Screen edges={TAB_SCREEN_EDGES}>
        <RetryState message={attachmentsStatus.error} onRetry={() => dispatch(loadAttachments())} />
      </Screen>
    );
  }

  const bannerMessage = attachmentUploadStatus.error ?? attachmentOpenError ?? pickError;

  return (
    <Screen edges={TAB_SCREEN_EDGES} style={styles.screen}>
      <FlatList
        style={styles.list}
        data={attachments}
        keyExtractor={(row, index) => String(row.id ?? index)}
        contentContainerStyle={styles.listContent}
        refreshing={attachmentsStatus.loading}
        onRefresh={() => dispatch(loadAttachments())}
        ListHeaderComponent={
          attachmentUploadStatus.loading || bannerMessage ? (
            <View style={styles.header}>
              {attachmentUploadStatus.loading ? (
                <View style={styles.inlineStatus}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={[styles.inlineStatusLabel, { color: colors.textMuted }]}>Slanje privitka…</Text>
                </View>
              ) : null}
              <ErrorMessage message={bannerMessage} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="attach-outline"
            title="Nema privitaka"
            description="Dodajte fotografiju ili dokument gumbom u donjem desnom kutu."
          />
        }
        renderItem={({ item: row, index }) => (
          <DynamicListItem
            groups={ATTACHMENT_LIST_GROUPS}
            item={row}
            index={index}
            onPress={attachmentOpeningId === null ? () => dispatch(openAttachment(row)) : undefined}
          />
        )}
      />
      <Fab icon="add" onPress={() => void onAddPress()} accessibilityLabel="Dodaj privitak" disabled={isBusy} />
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
    // Zadnji privitak ne smije ostati ispod FAB-a (56px + odmak od dna).
    paddingBottom: 88,
    flexGrow: 1,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  inlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inlineStatusLabel: {
    fontSize: typography.size.sm,
  },
});
