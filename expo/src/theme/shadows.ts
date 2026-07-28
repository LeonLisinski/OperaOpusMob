import { Platform, type ViewStyle } from 'react-native';

/**
 * Minimalne, suptilne sjene — koriste se štedljivo (kartice, plutajuće površine).
 * Android nema shadow* svojstva pa se razdvaja preko `elevation`.
 */
function elevationShadow(elevation: number, opacity = 0.06): ViewStyle {
  if (Platform.OS === 'android') {
    return { elevation };
  }
  return {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: Math.max(1, elevation / 2) },
    shadowOpacity: opacity,
    shadowRadius: elevation * 1.5,
  };
}

export const shadows = {
  none: {} as ViewStyle,
  card: elevationShadow(2),
  raised: elevationShadow(6),
  /** Plutajuća akcija (FAB) — jača sjena jer lebdi nad sadržajem. */
  fab: elevationShadow(8, 0.18),
} as const;

export type ShadowKey = keyof typeof shadows;
