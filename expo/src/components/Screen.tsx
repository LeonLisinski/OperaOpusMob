import type { PropsWithChildren, ReactNode } from 'react';
import { createContext, useContext, useMemo, useRef } from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { spacing, useTheme } from '@/theme';

type ScreenProps = PropsWithChildren<{
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  edges?: Edge[];
  scroll?: boolean;
  /** Scroll do fokusiranog polja kad se otvori tipkovnica — bez podizanja cijelog ekrana. */
  keyboardAware?: boolean;
  /** Fiksni sadržaj ispod glavnog tijela (npr. tab bar na detalju dokumenta). */
  footer?: ReactNode;
}>;

type KeyboardAwareContextValue = {
  registerField: (id: string, y: number, height: number) => void;
  scrollToField: (id: string) => void;
};

const KeyboardAwareContext = createContext<KeyboardAwareContextValue | null>(null);

export function useKeyboardAwareScroll() {
  return useContext(KeyboardAwareContext);
}

/**
 * Zajednička podloga ekrana. Kad je `keyboardAware`, ScrollView samo pomakne fokusirano
 * polje iznad tipkovnice — header i ostatak forme ostaju na mjestu.
 */
export function Screen({
  children,
  style,
  contentStyle,
  edges = ['top', 'bottom', 'left', 'right'],
  scroll = false,
  keyboardAware = false,
  footer,
}: ScreenProps) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const fieldPositions = useRef(new Map<string, { y: number; height: number }>());
  const safeEdges = footer ? edges.filter((edge) => edge !== 'bottom') : edges;

  const keyboardContext = useMemo<KeyboardAwareContextValue>(
    () => ({
      registerField: (id, y, height) => {
        fieldPositions.current.set(id, { y, height });
      },
      scrollToField: (id) => {
        if (!scroll || !keyboardAware) {
          return;
        }
        const field = fieldPositions.current.get(id);
        if (!field) {
          return;
        }
        scrollRef.current?.scrollTo({
          y: Math.max(0, field.y - spacing.lg),
          animated: true,
        });
      },
    }),
    [keyboardAware, scroll],
  );

  const body = scroll ? (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets={keyboardAware}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, contentStyle]}>{children}</View>
  );

  const wrappedBody =
    scroll && keyboardAware ? (
      <KeyboardAwareContext.Provider value={keyboardContext}>{body}</KeyboardAwareContext.Provider>
    ) : (
      body
    );

  const dismissableBody = keyboardAware ? (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>{wrappedBody}</View>
    </TouchableWithoutFeedback>
  ) : (
    wrappedBody
  );

  return (
    <SafeAreaView edges={safeEdges} style={[styles.container, { backgroundColor: colors.background }, style]}>
      {dismissableBody}
      {footer}
    </SafeAreaView>
  );
}

/** Helper za TextField/PinInput — registrira Y poziciju i scrolla na fokus. */
export function useRegisterKeyboardField(fieldId: string, onFocus?: () => void) {
  const keyboard = useKeyboardAwareScroll();

  const handleLayout = (event: LayoutChangeEvent) => {
    keyboard?.registerField(fieldId, event.nativeEvent.layout.y, event.nativeEvent.layout.height);
  };

  const handleFocus = () => {
    onFocus?.();
    requestAnimationFrame(() => keyboard?.scrollToField(fieldId));
  };

  return { handleLayout, handleFocus };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
