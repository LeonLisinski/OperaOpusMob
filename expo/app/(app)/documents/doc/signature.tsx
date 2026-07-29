import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type KeyboardEvent,
  type LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SignatureCanvas, { type SignatureViewRef } from 'react-native-signature-canvas';

import { EmptyState } from '@/components/EmptyState';
import { ErrorMessage } from '@/components/ErrorMessage';
import { IconButton } from '@/components/IconButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen, TAB_SCREEN_EDGES } from '@/components/Screen';
import { StickyFooter } from '@/components/StickyFooter';
import { TextField } from '@/components/TextField';
import { clearSignatureMessage, moduleHasSignature, submitSignature } from '@/features/documents/documentsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { KEYBOARD_TOP_BUFFER } from '@/hooks/useContainerKeyboardPad';
import { radius, spacing, typography, useTheme } from '@/theme';

const CANVAS_HEIGHT = 200;

function buildSignatureWebStyle(surfaceColor: string, hintColor: string): string {
  return `
  body, html { background-color: ${surfaceColor} !important; margin: 0; touch-action: none; overflow: hidden; }
  .m-signature-pad { box-shadow: none; border: none; background-color: ${surfaceColor} !important; touch-action: none; }
  .m-signature-pad--body { border: none; background-color: ${surfaceColor} !important; touch-action: none; }
  canvas { background-color: ${surfaceColor} !important; touch-action: none; }
  .m-signature-pad--footer { display: none; margin: 0; }
  .description { color: ${hintColor}; }
`;
}

/**
 * Potpis u tab navigatoru — Screen.keyboardAware radi za modal (form/filter),
 * ali u tabu footer ostaje ispod tipkovnice. Ovdje:
 * 1. canvas IZVAN ScrollView-a (crtanje slide-om)
 * 2. tipkovnica → cijeli layout (scroll+footer) dobiva paddingBottom = overlap
 * 3. canvas se kolapsira (ne unmounta) da polja + gumb stanu iznad tipkovnice
 */
export default function DocumentSignatureScreen() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const signatureRef = useRef<SignatureViewRef>(null);
  const layoutRef = useRef<View>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [hasStroke, setHasStroke] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardPad, setKeyboardPad] = useState(0);
  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const [emailOverride, setEmailOverride] = useState<string | null>(null);
  const [emptySignatureError, setEmptySignatureError] = useState(false);

  const route = useAppSelector((state) => state.documents.route);
  const layout = useAppSelector((state) => state.documents.layout);
  const item = useAppSelector((state) => state.documents.selectedItem);
  const { signatureStatus, signatureSavedFileName } = useAppSelector((state) => state.documents);

  const nameField = layout?.properties.signatureTextSelectField;
  const emailField = layout?.properties.signatureEmailSelectField;
  const defaultSignatureName = nameField && typeof item?.[nameField] === 'string' ? (item[nameField] as string) : '';
  const defaultSignatureEmail = emailField && typeof item?.[emailField] === 'string' ? (item[emailField] as string) : '';
  const signatureName = nameOverride ?? defaultSignatureName;
  const signatureEmail = emailOverride ?? defaultSignatureEmail;
  const signatureWebStyle = useMemo(
    () => buildSignatureWebStyle(colors.surface, colors.textSubtle),
    [colors.surface, colors.textSubtle],
  );

  const keyboardOpen = keyboardVisible;

  const applyKeyboardPad = useCallback((event: KeyboardEvent) => {
    layoutRef.current?.measureInWindow((_x, y, _w, height) => {
      const overlap = Math.max(0, Math.ceil(y + height - event.endCoordinates.screenY));
      setKeyboardPad(overlap > 0 ? overlap + KEYBOARD_TOP_BUFFER : 0);
    });
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (event: KeyboardEvent) => {
      setKeyboardVisible(true);
      applyKeyboardPad(event);
      if (Platform.OS === 'android') {
        setTimeout(() => applyKeyboardPad(event), 80);
        setTimeout(() => applyKeyboardPad(event), 200);
      }
    };
    const onHide = () => {
      setKeyboardVisible(false);
      setKeyboardPad(0);
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [applyKeyboardPad]);

  useEffect(() => {
    if (!keyboardOpen) {
      return undefined;
    }
    const id = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, Platform.OS === 'android' ? 160 : 60);
    return () => clearTimeout(id);
  }, [keyboardOpen]);

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
    <SafeAreaView edges={TAB_SCREEN_EDGES} style={[styles.root, { backgroundColor: colors.background }]}>
      <View ref={layoutRef} style={[styles.root, { paddingBottom: keyboardPad }]}>
        {keyboardOpen ? (
          <View style={[styles.canvasCollapsed, { borderBottomColor: colors.border }]}>
            <Text style={[styles.canvasCollapsedText, { color: colors.textMuted }]}>
              {hasStroke ? 'Potpis unesen' : 'Potpis — nastavite unos'}
            </Text>
            <IconButton icon="trash-outline" variant="plain" onPress={onClear} accessibilityLabel="Obriši potpis" />
          </View>
        ) : null}

        {/* Canvas uvijek mountan — kolaps kad tipkovnica da se potpis ne izgubi. */}
        <View
          pointerEvents={keyboardOpen ? 'none' : 'auto'}
          style={keyboardOpen ? styles.canvasHidden : styles.canvasSection}
        >
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
                backgroundColor="rgba(0,0,0,0)"
                webStyle={signatureWebStyle}
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
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
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

        <StickyFooter safeBottom={false}>
          <PrimaryButton
            label="Spremi i pošalji izvještaj"
            onPress={onSavePress}
            loading={signatureStatus.loading}
            disabled={signatureStatus.loading}
          />
        </StickyFooter>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  canvasSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  canvasHidden: {
    height: 0,
    overflow: 'hidden',
    opacity: 0,
  },
  canvasCollapsed: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  canvasCollapsedText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
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
});
