export const SIDEBAR_STORAGE_KEY = 'opera-docs-sidebar-collapsed'

/** Putanje koje imaju lijevi sidebar (moraju odgovarati config.ts sidebar ključevima). */
export const SIDEBAR_PREFIXES = ['/user', '/technical', '/ai', '/preuzimanje']

export function normalizeDocPath(path: string, base = '/OperaOpusMob/'): string {
  let p = path.split('?')[0].split('#')[0]
  const b = base.endsWith('/') ? base : `${base}/`
  if (p.startsWith(b)) {
    p = p.slice(b.length - 1)
  }
  if (!p.startsWith('/')) {
    p = `/${p}`
  }
  return p.replace(/\/$/, '') || '/'
}

export function pathHasSidebar(path: string, base = '/OperaOpusMob/'): boolean {
  const normalized = normalizeDocPath(path, base)
  return SIDEBAR_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  )
}

export function readCollapsedPreference(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function writeCollapsedPreference(collapsed: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed))
  } catch {
    /* ignore */
  }
}

export function syncSidebarCollapsedClass(collapsed: boolean, hasSidebar: boolean): void {
  document.documentElement.classList.toggle(
    'sidebar-collapsed',
    hasSidebar && collapsed,
  )
}
