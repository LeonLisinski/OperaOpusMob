import type { Href } from 'expo-router';

import type { PushData } from './types';

export type PushRouteAction =
  | { kind: 'navigate'; href: Href }
  | { kind: 'ignore'; reason: string };

/**
 * Mapira push `data` → navigaciju.
 * Novi tipovi: dodaj case ovdje, ne raspršuj if-ove po ekranima.
 */
export function resolvePushRoute(data: PushData | null | undefined): PushRouteAction {
  const type = typeof data?.type === 'string' ? data.type.trim().toLowerCase() : '';

  if (type === 'raspored_obavijest') {
    // tab=aktualno + fromPush — RasporedScreen postavi tab i osvježi inbox.
    return { kind: 'navigate', href: '/raspored?tab=aktualno&fromPush=1' as Href };
  }

  if (type.length === 0) {
    return { kind: 'ignore', reason: 'missing_type' };
  }

  return { kind: 'ignore', reason: `unknown_type:${type}` };
}

export function parsePushData(raw: Record<string, unknown> | undefined | null): PushData {
  if (!raw || typeof raw !== 'object') return {};
  const out: PushData = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value == null) continue;
    out[key] = typeof value === 'string' ? value : String(value);
  }
  return out;
}
