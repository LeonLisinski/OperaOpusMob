import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import SignatureCanvas, { type SignatureViewRef } from 'react-native-signature-canvas';

import { EmptyState } from '@/components/EmptyState';
import { ErrorMessage } from '@/components/ErrorMessage';
import { IconButton } from '@/components/IconButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen, TAB_SCREEN_EDGES } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { clearSignatureMessage, moduleHasSignature, submitSignature } from '@/features/documents/documentsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing, typography, useTheme } from '@/theme';

const CANVAS_HEIGHT = 220;

/**
 * Potpis dokumenta + generiranje/slanje REPX izvještaja — ekvivalent
 * src/pages/dgl/tabs/Tab4.jsx. Dostupno samo za dgl module s `tabpotpisvisible`.
 *
 * Canvas je namjerno izvan ScrollView-a: dok je bio unutar `Screen scroll keyboardAware`,
 * ScrollView i TouchableWithoutFeedback su presretali pan gesture, pa je do WebView-a
 * dolazio samo tap i potpis je ispadao kao niz točkica.
 */
export default function DocumentSignatureScreen() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const signatureRef = useRef<SignatureViewRef>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [hasStroke, setHasStroke] = useState(false);
  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const [emailOverride, setEmailOverride] = useState<string | null>(null);
  const [emptySignatureError, setEmptySignatureError] = useState(false);

  const route = useAppSelector((state) => state.documents.route);
  const layout = useAppSelector((state) => state.documents.layout);
  const item = useAppSelector((state) => state.documents.selectedItem);
  const { signatureStatus, signatureSavedFileName } = useAppSelector((state) => state.documents);

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
      <Screen edges={TAB_SCREEN_EDGES}>
        <EmptyState
          icon="alert-circle-outline"
          title="Stavka nije pronađena"
          description="Vratite se na popis i odaberite stavku ponovno."
        />
      </Screen>
    );
  }

  if (!moduleHasSignature(route, item)) {
    return (
      <Screen edges={TAB_SCREEN_EDGES}>
        <EmptyState
          icon="create-outline"
          title="Potpis nije dostupan"
          description="Ovaj dokument nema uključen tab za potpis."
        />
      </Screen>
    );
  }

  const onClear = () => {
    signatureRef.current?.clearSignature();
    setHasStroke(false);
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

  const onCanvasLayout = (event: LayoutChangeEvent) => {
    setCanvasWidth(event.nativeEvent.layout.width);
  };

  return (
    <Screen edges={TAB_SCREEN_EDGES} style={styles.screen}>
      <View style={styles.canvasSection}>
        <View style={styles.canvasHeader}>
          <Text style={[styles.canvasLabel, { color: colors.textMuted }]}>Potpis</Text>
          <IconButton icon="trash-outline" variant="plain" onPress={onClear} accessibilityLabel="Obriši potpis" />
        </View>

        <View
          onLayout={onCanvasLayout}
          style={[styles.canvasFrame, { borderColor: colors.borderStrong, backgroundColor: colors.surface }]}
        >
          {canvasWidth > 0 ? (
            <SignatureCanvas
              ref={signatureRef}
              onOK={onSignatureOK}
              onEmpty={() => setEmptySignatureError(true)}
              onBegin={() => setHasStroke(true)}
              autoClear={false}
              trimWhitespace
              penColor={colors.text}
              backgroundColor={colors.surface}
              webStyle={`.m-signature-pad { box-shadow: none; border: none; } .m-signature-pad--body { border: none; } .m-signature-pad--footer { display: none; margin: 0; }`}
              style={{ width: canvasWidth, height: CANVAS_HEIGHT }}
            />
          ) : null}

          <View pointerEvents="none" style={styles.canvasOverlay}>
            <View style={[styles.signatureLine, { backgroundColor: colors.border }]} />
            {!hasStroke ? (
              <Text style={[styles.canvasHint, { color: colors.textSubtle }]}>Potpišite se prstom</Text>
            ) : null}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.fields}
        contentContainerStyle={styles.fieldsContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {emptySignatureError ? <ErrorMessage message="Potpis je prazan. Molimo potpišite prije spremanja." /> : null}
        <ErrorMessage message={signatureStatus.error} />
        {signatureSavedFileName ? (
          <View style={[styles.successBanner, { backgroundColor: colors.successSoft }]}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={[styles.successText, { color: colors.success }]}>
              {`Dokument '${signatureSavedFileName}' je pohranjen i poslan.`}
            </Text>
          </View>
        ) : null}

        <TextField
          label="Ime i prezime"
          value={signatureName}
          onChangeText={setNameOverride}
          autoCapitalize="words"
          returnKeyType="next"
        />
        <TextField
          label="Email"
          value={signatureEmail}
          onChangeText={setEmailOverride}
          keyboardType="email-address"
          returnKeyType="done"
        />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <PrimaryButton
          label="Spremi i pošalji izvještaj"
          onPress={onSavePress}
          loading={signatureStatus.loading}
          disabled={signatureStatus.loading}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  canvasSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  canvasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  canvasLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  canvasFrame: {
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    height: CANVAS_HEIGHT,
  },
  canvasOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl,
  },
  signatureLine: {
    height: 1,
    alignSelf: 'stretch',
    marginHorizontal: spacing.xl,
  },
  canvasHint: {
    position: 'absolute',
    alignSelf: 'center',
    top: CANVAS_HEIGHT / 2 - 10,
    fontSize: typography.size.sm,
  },
  fields: {
    flex: 1,
  },
  fieldsContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  successText: {
    flex: 1,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
