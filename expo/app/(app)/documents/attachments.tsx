import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { DocumentTabBar } from '@/components/DocumentTabBar';
import { DynamicListItem } from '@/components/DynamicListItem';
import { EmptyState } from '@/components/EmptyState';
import { ErrorMessage } from '@/components/ErrorMessage';
import { HeaderTextButton } from '@/components/HeaderTextButton';
import { RetryState } from '@/components/RetryState';
import { SkeletonListLoader } from '@/components/SkeletonListLoader';
import { Screen } from '@/components/Screen';
import { loadAttachments, moduleHasAttachments, openAttachment, uploadAttachments } from '@/features/documents/documentsSlice';
import type { ListItemLayoutGroup } from '@/features/documents/types';
import { useAttachmentsLoader } from '@/features/documents/useAttachmentsLoader';
import { pickAttachmentFiles } from '@/services/files/attachmentPicker';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing, typography, useTheme } from '@/theme';

/** Prikaz retka privitka je u Ionicu hardkodiran na `item.naziv` (TabPrivitci.jsx) — nema JSON layouta. */
const ATTACHMENT_LIST_GROUPS: ListItemLayoutGroup[] = [{ fields: [{ field: 'naziv' }] }];

/**
 * Popis i upravljanje privitcima dokumenta — ekvivalent src/pages/dgl/tabs/TabPrivitci.jsx.
 * Dostupno samo za dgl module (v. DocumentTabBar/moduleHasAttachments, D027 — gen tab je
 * mrtav kod u Ionicu).
 */
export default function DocumentAttachmentsScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
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

  const showRadTab = Boolean(item?.tabradvisible);
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

  useEffect(() => {
    navigation.setOptions({
      title: 'Privitci',
      headerRight: () => (
        <HeaderTextButton label="+ Dodaj" onPress={() => void onAddPress()} disabled={isBusy} />
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, isBusy]);

  if (!item || !layout) {
    return (
      <Screen>
        <EmptyState title="Stavka nije pronađena" description="Vratite se na popis i odaberite stavku ponovno." />
      </Screen>
    );
  }

  if (!moduleHasAttachments(route, layout)) {
    return (
      <Screen>
        <EmptyState title="Privitci nisu dostupni" description="Ovaj modul nema definiciju privitaka u layoutu." />
      </Screen>
    );
  }

  const tabBar = <DocumentTabBar activeTab="privitci" showRadTab={showRadTab} />;

  if (attachmentsStatus.loading && attachments.length === 0) {
    return (
      <Screen footer={tabBar}>
        <SkeletonListLoader rows={3} />
      </Screen>
    );
  }

  if (attachmentsStatus.error && attachments.length === 0) {
    return (
      <Screen footer={tabBar}>
        <RetryState message={attachmentsStatus.error} onRetry={() => dispatch(loadAttachments())} />
      </Screen>
    );
  }

  const bannerMessage = attachmentUploadStatus.error ?? attachmentOpenError ?? pickError;

  return (
    <Screen style={styles.screen} footer={tabBar}>
      <FlatList
        style={styles.list}
        data={attachments}
        keyExtractor={(row, index) => String(row.id ?? index)}
        contentContainerStyle={styles.listContent}
        refreshing={attachmentsStatus.loading}
        onRefresh={() => dispatch(loadAttachments())}
        ListHeaderComponent={
          <View style={styles.header}>
            {attachmentUploadStatus.loading ? (
              <View style={styles.inlineStatus}>
                <ActivityIndicator color={colors.primary} />
                <Text style={[styles.inlineStatusLabel, { color: colors.textMuted }]}>Slanje privitka…</Text>
              </View>
            ) : null}
            <ErrorMessage message={bannerMessage} />
          </View>
        }
        ListEmptyComponent={
          <EmptyState title="Nema privitaka" description="Za ovaj dokument trenutno nema privitaka." />
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
