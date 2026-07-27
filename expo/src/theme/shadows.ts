import { Platform, type ViewStyle } from 'react-native';

/**
 * Minimalne, suptilne sjene — koriste se štedljivo (uglavnom kartice), nikad
 * na gumbima. Android nema shadow* svojstva pa se razdvaja preko `elevation`.
 */
function elevationShadow(elevation: number): ViewStyle {
  if (Platform.OS === 'android') {
    return { elevation };
  }
  return {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: Math.max(1, elevation / 2) },
    shadowOpacity: 0.06,
    shadowRadius: elevation * 1.5,
  };
}

export const shadows = {
  none: {} as ViewStyle,
  card: elevationShadow(2),
  raised: elevationShadow(6),
} as const;

export type ShadowKey = keyof typeof shadows;
