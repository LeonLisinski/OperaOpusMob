import { useCallback, useEffect, useState, type RefObject } from 'react';
import { Keyboard, Platform, type KeyboardEvent, type View } from 'react-native';

/** Gboard/iOS suggestion traka često nije u screenY. */
export const KEYBOARD_TOP_BUFFER = Platform.OS === 'android' ? 40 : 12;

/**
 * Mjeri koliko tipkovnica preklapa dno `layoutRef` kontejnera i vraća
 * paddingBottom za podizanje scrolla + footera zajedno (isti pristup kao potpis).
 */
export function useContainerKeyboardPad(layoutRef: RefObject<View | null>, enabled: boolean): number {
  const [keyboardPad, setKeyboardPad] = useState(0);

  const applyPad = useCallback(
    (event: KeyboardEvent) => {
      layoutRef.current?.measureInWindow((_x, y, _w, height) => {
        const overlap = Math.max(0, Math.ceil(y + height - event.endCoordinates.screenY));
        setKeyboardPad(overlap > 0 ? overlap + KEYBOARD_TOP_BUFFER : 0);
      });
    },
    [layoutRef],
  );

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (event: KeyboardEvent) => {
      applyPad(event);
      if (Platform.OS === 'android') {
        setTimeout(() => applyPad(event), 80);
        setTimeout(() => applyPad(event), 200);
      }
    };
    const onHide = () => setKeyboardPad(0);

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [applyPad, enabled]);

  // Kad je tipkovnica isključena, ne zovi setState u effectu — vrati 0 iz derivacije.
  return enabled ? keyboardPad : 0;
}
