import type { PropsWithChildren, ReactNode, RefObject } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { STICKY_FOOTER_HEIGHT } from '@/components/StickyFooter';
import { ScreenKeyboardPadContext } from '@/contexts/ScreenKeyboardPadContext';
import { useContainerKeyboardPad } from '@/hooks/useContainerKeyboardPad';
import { spacing, useTheme } from '@/theme';

type ScreenProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
  scroll?: boolean;
  scrollEnabled?: boolean;
  keyboardAware?: boolean;
  footer?: ReactNode;
  overlay?: ReactNode;
}>;

export const TAB_SCREEN_EDGES: Edge[] = ['left', 'right'];

type KeyboardAwareContextValue = {
  registerField: (id: string, ref: RefObject<View | null>) => void;
  unregisterField: (id: string) => void;
  scrollToField: (id: string) => void;
  setFocusedField: (id: string | null) => void;
};

const KeyboardAwareContext = createContext<KeyboardAwareContextValue | null>(null);

export function useKeyboardAwareScroll() {
  return useContext(KeyboardAwareContext);
}

/**
 * Zajednička podloga. Kad ima footer ili keyboardAware:
 * paddingBottom = preklapanje tipkovnice (isti mehanizam kao potpis) — digne scroll + gumb.
 */
export function Screen({
  children,
  style,
  contentStyle,
  edges = ['left', 'right', 'bottom'],
  scroll = false,
  scrollEnabled = true,
  keyboardAware = false,
  footer,
  overlay,
}: ScreenProps) {
  const { colors } = useTheme();
  const layoutRef = useRef<View>(null);
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const fieldRefs = useRef(new Map<string, RefObject<View | null>>());
  const focusedFieldId = useRef<string | null>(null);
  const scrollOffsetY = useRef(0);
  const viewportHeight = useRef(0);
  const safeEdges = footer ? edges.filter((edge) => edge !== 'bottom') : edges;
  const footerReserve = footer ? STICKY_FOOTER_HEIGHT : 0;
  const liftForKeyboard = Boolean(footer) || keyboardAware;
  const keyboardPad = useContainerKeyboardPad(layoutRef, liftForKeyboard);

  const scrollToField = useCallback(
    (id: string) => {
      if (!scroll || !keyboardAware) {
        return;
      }
      const fieldRef = fieldRefs.current.get(id);
      const contentNode = contentRef.current;
      if (!fieldRef?.current || !contentNode) {
        return;
      }
      fieldRef.current.measureLayout(
        contentNode,
        (_x, y, _width, height) => {
          const visibleBottom = scrollOffsetY.current + viewportHeight.current - footerReserve - spacing.lg;
          const fieldBottom = y + height;
          if (fieldBottom > visibleBottom) {
            scrollRef.current?.scrollTo({
              y: Math.max(0, scrollOffsetY.current + (fieldBottom - visibleBottom) + spacing.sm),
              animated: true,
            });
          }
        },
        () => undefined,
      );
    },
    [footerReserve, keyboardAware, scroll],
  );

  useEffect(() => {
    if (keyboardPad > 0 && keyboardAware && focusedFieldId.current) {
      const id = focusedFieldId.current;
      scrollToField(id);
      if (Platform.OS === 'android') {
        const timer = setTimeout(() => scrollToField(id), 120);
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [keyboardPad, keyboardAware, scrollToField]);

  const keyboardContext = useMemo<KeyboardAwareContextValue>(
    () => ({
      registerField: (id, ref) => {
        fieldRefs.current.set(id, ref);
      },
      unregisterField: (id) => {
        fieldRefs.current.delete(id);
        if (focusedFieldId.current === id) {
          focusedFieldId.current = null;
        }
      },
      scrollToField,
      setFocusedField: (id) => {
        focusedFieldId.current = id;
      },
    }),
    [scrollToField],
  );

  const scrollBottomPad = footer ? spacing.lg + footerReserve : keyboardAware ? spacing.xxl : 0;
  /** Kad sami dižemo kontejner, ne duplirati inset na ScrollView. */
  const useNativeKeyboardInsets = keyboardAware && !footer;

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetY.current = event.nativeEvent.contentOffset.y;
  };

  const onScrollLayout = (event: LayoutChangeEvent) => {
    viewportHeight.current = event.nativeEvent.layout.height;
  };

  const body = scroll ? (
    <ScrollView
      ref={scrollRef}
      style={footer || keyboardAware ? styles.scrollFill : undefined}
      scrollEnabled={scrollEnabled}
      onLayout={onScrollLayout}
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={[
        styles.scrollContent,
        contentStyle,
        scrollBottomPad > 0 ? { paddingBottom: scrollBottomPad } : null,
      ]}
      automaticallyAdjustKeyboardInsets={useNativeKeyboardInsets}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
    >
      <View ref={contentRef}>{children}</View>
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
      <View style={[styles.container, footer || keyboardAware ? styles.scrollFill : null]}>{wrappedBody}</View>
    </TouchableWithoutFeedback>
  ) : (
    wrappedBody
  );

  return (
    <SafeAreaView edges={safeEdges} style={[styles.container, { backgroundColor: colors.background }, style]}>
      <ScreenKeyboardPadContext.Provider value={keyboardPad}>
        <View
          ref={layoutRef}
          style={[styles.container, footer ? styles.containerWithFooter : null, { paddingBottom: keyboardPad }]}
        >
          {dismissableBody}
          {footer}
        </View>
      </ScreenKeyboardPadContext.Provider>
      {overlay ? (
        <View style={styles.overlay} pointerEvents="box-none">
          {overlay}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export function useRegisterKeyboardField(fieldId: string, onFocus?: () => void) {
  const keyboard = useKeyboardAwareScroll();
  const viewRef = useRef<View>(null);

  useEffect(() => {
    if (!keyboard) {
      return undefined;
    }
    keyboard.registerField(fieldId, viewRef);
    return () => keyboard.unregisterField(fieldId);
  }, [fieldId, keyboard]);

  const handleFocus = () => {
    onFocus?.();
    keyboard?.setFocusedField(fieldId);
    requestAnimationFrame(() => {
      keyboard?.scrollToField(fieldId);
      if (Platform.OS === 'android') {
        setTimeout(() => keyboard?.scrollToField(fieldId), 120);
      }
    });
  };

  return { viewRef, handleFocus };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerWithFooter: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollFill: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
});
