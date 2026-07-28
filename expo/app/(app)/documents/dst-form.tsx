import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { Card } from '@/components/Card';
import { EditFormField } from '@/components/EditFormField';
import { EmptyState } from '@/components/EmptyState';
import { ErrorMessage } from '@/components/ErrorMessage';
import { HeaderTextButton } from '@/components/HeaderTextButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SifarnikSearchModal } from '@/components/SifarnikSearchModal';
import { StickyFooter } from '@/components/StickyFooter';
import { dstEditLayoutFor, resetEditForm, saveDstLine, updateEditFormData, updateEditValues } from '@/features/documents/documentsSlice';
import type { EditFieldDef } from '@/features/documents/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing } from '@/theme';

/**
 * Forma unosa/izmjene stavke — ekvivalent src/pages/dgl/components/DetailAzurNew.jsx.
 * Dijeli editValues/editFormData i EditFormField/SifarnikSearchModal s glavnom formom
 * dokumenta (documents/form.tsx) jer je posrijedi ista JSON shema kontrola, samo drugi
 * izvor layouta (dstEditItems/dstEditItemsRad umjesto {dgl,gla}EditItems) i SP (queries.dst.azur
 * umjesto spWeb_UpdateDGL/queries.gla.azur — v. DECISION_LOG.md D025/D026).
 */
export default function DstFormScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const navigation = useNavigation();
  const [activeSearchField, setActiveSearchField] = useState<EditFieldDef | null>(null);

  const layout = useAppSelector((state) => state.documents.layout);
  const editValues = useAppSelector((state) => state.documents.editValues);
  const saveStatus = useAppSelector((state) => state.documents.saveStatus);
  const dstEditContext = useAppSelector((state) => state.documents.dstEditContext);

  const isExistingRecord = dstEditContext?.dstId !== null && dstEditContext?.dstId !== undefined;
  const isSubItem = !isExistingRecord && dstEditContext?.parentId !== null && dstEditContext?.parentId !== undefined;

  useEffect(() => {
    navigation.setOptions({
      title: isExistingRecord ? 'Editiranje stavke' : isSubItem ? 'Unos nove podstavke' : 'Unos nove stavke',
      headerLeft: () => <HeaderTextButton label="Odustani" onPress={handleCancel} />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, isExistingRecord, isSubItem]);

  useEffect(() => {
    return () => {
      dispatch(resetEditForm());
    };
  }, [dispatch]);

  const handleCancel = () => {
    dispatch(resetEditForm());
    router.back();
  };

  const handleSave = async () => {
    const result = await dispatch(saveDstLine());
    if (saveDstLine.fulfilled.match(result)) {
      router.back();
    }
  };

  const handleSelectSifarnik = (row: Record<string, unknown>) => {
    const field = activeSearchField;
    setActiveSearchField(null);
    if (!field) {
      return;
    }

    const display: Record<string, unknown> = { [field.selectFieldKey]: row.id };
    if (field.selectFieldText) {
      display[field.selectFieldText] = row.name;
    }
    dispatch(updateEditValues(display));
    dispatch(updateEditFormData({ [field.azurFieldKey]: row.id }));

    field.dependencies?.forEach((dependency) => {
      if (dependency.action === 'reset') {
        const resetDisplay: Record<string, unknown> = {};
        if (dependency.selectFieldKey) resetDisplay[dependency.selectFieldKey] = null;
        if (dependency.selectFieldText) resetDisplay[dependency.selectFieldText] = null;
        dispatch(updateEditValues(resetDisplay));
        if (dependency.azurFieldKey) {
          dispatch(updateEditFormData({ [dependency.azurFieldKey]: null }));
        }
        return;
      }
      if (dependency.action === 'azur') {
        const depDisplay: Record<string, unknown> = {};
        if (dependency.controlFieldKey && dependency.selectFieldKey) {
          depDisplay[dependency.controlFieldKey] = row[dependency.selectFieldKey];
        }
        if (dependency.controlFieldText && dependency.selectFieldText) {
          depDisplay[dependency.controlFieldText] = row[dependency.selectFieldText];
        }
        dispatch(updateEditValues(depDisplay));
        if (dependency.controlAzurFieldKey && dependency.azurFieldKey) {
          dispatch(updateEditFormData({ [dependency.controlAzurFieldKey]: row[dependency.azurFieldKey] }));
        }
      }
    });
  };

  if (!layout || !editValues || !dstEditContext) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle-outline"
          title="Forma nije spremna"
          description="Vratite se i pokušajte ponovno otvoriti unos/izmjenu."
        />
      </Screen>
    );
  }

  const fields = dstEditLayoutFor(layout, dstEditContext.kind);

  if (fields.length === 0) {
    return (
      <Screen>
        <EmptyState
          icon="create-outline"
          title="Forma nije definirana"
          description="Layout ovog modula ne sadrži definiciju forme stavke."
        />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      keyboardAware
      contentStyle={styles.content}
      footer={
        <StickyFooter>
          <PrimaryButton label="Spremi" onPress={() => void handleSave()} loading={saveStatus.loading} />
        </StickyFooter>
      }
    >
      <Card style={styles.card}>
        {fields.map((field, index) => (
          <EditFormField
            key={`${field.azurFieldKey}-${index}`}
            field={field}
            editingExisting={isExistingRecord}
            onOpenSearch={setActiveSearchField}
          />
        ))}
      </Card>

      <ErrorMessage message={saveStatus.error} />

      <SifarnikSearchModal
        key={activeSearchField ? `${activeSearchField.entity ?? ''}-${activeSearchField.azurFieldKey}` : 'none'}
        visible={activeSearchField !== null}
        field={activeSearchField}
        onClose={() => setActiveSearchField(null)}
        onSelect={handleSelectSifarnik}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  card: {
    gap: spacing.md,
  },
});
