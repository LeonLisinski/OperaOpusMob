import { useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, Platform, type KeyboardEvent } from 'react-native';

export interface KeyboardMetrics {
  /** Preklapanje iz koordinata tipkovnice — 0 kad Android `resize` smanji prozor. */
  overlap: number;
  /** Visina tipkovnice iz eventa. */
  height: number;
  /** Efektivni inset za scroll padding i footer (max koordinata i preostalog preklapanja). */
  scrollInset: number;
  /** Isto kao scrollInset — footer i scroll dijele istu vrijednost. */
  footerInset: number;
}

function metricsFromEvent(event: KeyboardEvent, baselineWindowHeight: number): KeyboardMetrics {
  const { screenY, height } = event.endCoordinates;
  const windowHeight = Dimensions.get('window').height;
  const shrink = Math.max(0, baselineWindowHeight - windowHeight);
  const overlapFromCoords = Math.max(0, windowHeight - screenY);
  /** Kad tab navigator djelomično resizea prozor, koordinate mogu dati 0 — nadoknadimo razlikom visina. */
  const effectiveOverlap = Math.max(overlapFromCoords, height - shrink);

  return {
    overlap: overlapFromCoords,
    height,
    scrollInset: effectiveOverlap,
    footerInset: effectiveOverlap,
  };
}

const CLOSED: KeyboardMetrics = {
  overlap: 0,
  height: 0,
  scrollInset: 0,
  footerInset: 0,
};

/** @deprecated Koristi `useKeyboardMetrics`. */
export function useKeyboardInset(): number {
  return useKeyboardMetrics().footerInset;
}

export function useKeyboardMetrics(): KeyboardMetrics {
  const [metrics, setMetrics] = useState<KeyboardMetrics>(CLOSED);
  const baselineWindowHeight = useRef(Dimensions.get('window').height);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (event: KeyboardEvent) => {
      setMetrics(metricsFromEvent(event, baselineWindowHeight.current));
    };
    const onHide = () => {
      setMetrics(CLOSED);
      baselineWindowHeight.current = Dimensions.get('window').height;
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return metrics;
}
