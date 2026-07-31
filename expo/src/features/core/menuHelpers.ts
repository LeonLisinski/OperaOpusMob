import type { AppMenuEntry, ModuleMenuEntry } from '@/features/core/types';

/**
 * Pronalazi modul po sifdv u meniju (Ionic selectModuleBySifDv).
 * Preferira app `servis-mobile` — isto kao TabAkcije openSRN.
 */
export function findModuleBySifDv(
  apps: AppMenuEntry[],
  sifdv: string,
  preferredAppCode = 'servis-mobile',
): { app: AppMenuEntry; module: ModuleMenuEntry } | null {
  const target = sifdv.trim().toLowerCase();
  const matches = (module: ModuleMenuEntry) => {
    if (module.sifdv != null && String(module.sifdv).trim().toLowerCase() === target) {
      return true;
    }
    const url = typeof module.url === 'string' ? module.url : '';
    const escaped = sifdv.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`/docs/dgl/${escaped}(/|$)`, 'i').test(url);
  };

  const preferred = apps.find((app) => app.code.trim().toLowerCase() === preferredAppCode.trim().toLowerCase());
  if (preferred) {
    const module = preferred.items?.[0]?.items?.find(matches);
    if (module) {
      return { app: preferred, module };
    }
  }

  for (const app of apps) {
    const module = app.items?.[0]?.items?.find(matches);
    if (module) {
      return { app, module };
    }
  }

  return null;
}
