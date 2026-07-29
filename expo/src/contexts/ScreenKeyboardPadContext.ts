import { createContext, useContext } from 'react';

/** > 0 kad tipkovnica preklapa Screen kontejner. */
export const ScreenKeyboardPadContext = createContext(0);

export function useScreenKeyboardPad(): number {
  return useContext(ScreenKeyboardPadContext);
}
