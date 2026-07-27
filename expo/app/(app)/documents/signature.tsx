import { useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import SignatureCanvas, { type SignatureViewRef } from 'react-native-signature-canvas';

import { DocumentTabBar } from '@/components/DocumentTabBar';
import { EmptyState } from '@/components/EmptyState';
import { ErrorMessage } from '@/components/ErrorMessage';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { clearSignatureMessage, moduleHasSignature, submitSignature } from '@/features/documents/documentsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing, typography, useTheme } from '@/theme';

/**
 * Potpis dokumenta + generiranje/slanje REPX izvještaja — ekvivalent
 * src/pages/dgl/tabs/Tab4.jsx. Dostupno samo za dgl module s `tabpotpisvisible`
 * (v. DocumentTabBar/moduleHasSignature).
 */
export default function DocumentSignatureScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const signatureRef = useRef<SignatureViewRef>(null);
  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const [emailOverride, setEmailOverride] = useState<string | null>(null);
  const [emptySignatureError, setEmptySignatureError] = useState(false);

  const route = useAppSelector((state) => state.documents.route);
  const layout = useAppSelector((state) => state.documents.layout);
  const item = useAppSelector((state) => state.documents.selectedItem);
  const { signatureStatus, signatureSavedFileName } = useAppSelector((state) => state.documents);

  const showRadTab = Boolean(item?.tabradvisible);

  useEffect(() => {
    navigation.setOptions({ title: 'Potpis' });
  }, [navigation]);

  // Predpuni ime/email iz SP retka dokumenta (v. Tab4.jsx), ali čim korisnik nešto upiše
  // ta vrijednost dobiva prednost — bez efekta/setState-a, izravno izvedeno u renderu.
  const nameField = layout?.properties.signatureTextSelectField;
  const emailField = layout?.properties.signatureEmailSelectField;
  const defaultSignatureName = nameField && typeof item?.[nameField] === 'string' ? (item[nameField] as string) : '';
  const defaultSignatureEmail = emailField && typeof item?.[emailField] === 'string' ? (item[emailField] as string) : '';
  const signatureName = nameOverride ?? defaultSignatureName;
  const signatureEmail = emailOverride ?? defaultSignatureEmail;

  if (!item || !layout) {
    return (
      <Screen>
        <EmptyState title="Stavka nije pronađena" description="Vratite se na popis i odaberite stavku ponovno." />
      </Screen>
    );
  }

  if (!moduleHasSignature(route, item)) {
    return (
      <Screen>
        <EmptyState title="Potpis nije dostupan" description="Ovaj dokument nema uključen tab za potpis." />
      </Screen>
    );
  }

  const onClear = () => {
    signatureRef.current?.clearSignature();
    setEmptySignatureError(false);
    dispatch(clearSignatureMessage());
  };

  const onSavePress = () => {
    setEmptySignatureError(false);
    dispatch(clearSignatureMessage());
    signatureRef.current?.readSignature();
  };

  const onSignatureOK = (signature: string) => {
    void dispatch(submitSignature({ signature, signatureText: signatureName, signatureEmail }));
  };

  const tabBar = <DocumentTabBar activeTab="potpis" showRadTab={showRadTab} />;
  const canvasWidth = Dimensions.get('window').width - spacing.lg * 2;

  return (
    <Screen scroll keyboardAware style={styles.screen} contentStyle={styles.content} footer={tabBar}>
      <View style={[styles.canvasWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <SignatureCanvas
          ref={signatureRef}
          onOK={onSignatureOK}
          onEmpty={() => setEmptySignatureError(true)}
          autoClear={false}
          trimWhitespace
          penColor={colors.primary}
          backgroundColor={colors.surface}
          webStyle={`.m-signature-pad { box-shadow: none; border: none; } .m-signature-pad--body { border: none; } .m-signature-pad--footer { display: none; margin: 0; }`}
          style={{ width: canvasWidth, height: 240 }}
        />
      </View>
      <PrimaryButton label="Obriši" variant="secondary" onPress={onClear} style={styles.clearButton} />

      {emptySignatureError ? <ErrorMessage message="Potpis je prazan. Molimo potpišite prije spremanja." /> : null}
      <ErrorMessage message={signatureStatus.error} />
      {signatureSavedFileName ? (
        <View style={[styles.successBanner, { backgroundColor: colors.successSoft }]}>
          <Text style={[styles.successText, { color: colors.success }]}>{`Dokument '${signatureSavedFileName}' je pohranjen.`}</Text>
        </View>
      ) : null}

      <TextField label="Ime i prezime" value={signatureName} onChangeText={setNameOverride} autoCapitalize="words" returnKeyType="next" />
      <TextField label="Email" value={signatureEmail} onChangeText={setEmailOverride} keyboardType="email-address" returnKeyType="done" />

      <PrimaryButton
        label="Spremi / Pošalji izvještaj"
        onPress={onSavePress}
        loading={signatureStatus.loading}
        disabled={signatureStatus.loading}
        style={styles.saveButton}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  canvasWrapper: {
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  clearButton: {
    alignSelf: 'flex-end',
  },
  successBanner: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  successText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: spacing.sm,
  },
});
