/**
 * HTML u vrijednostima detalja — SP/layout vraća `<a href="tel:...">` (v. Tab1.jsx isHTML +
 * dangerouslySetInnerHTML). Nije greška baze; Expo mora parsirati prikaz kao legacy.
 */

const HTML_TAG_PATTERN = /(<([^>]+)>)/i;
const ANCHOR_PATTERN = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

export function isHtmlValue(value: unknown): boolean {
  return typeof value === 'string' && HTML_TAG_PATTERN.test(value);
}

export type HtmlSegment =
  | { kind: 'text'; text: string }
  | { kind: 'link'; href: string; label: string };

/** Dekodira uobičajene HTML entitete i `<br>` u prikazni tekst. */
export function decodeHtmlEntities(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

export function stripHtmlTags(value: string): string {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, '')).trim();
}

/** Razbija HTML string na tekstualne i link segmente (tel/mailto/http). */
export function parseHtmlSegments(html: string): HtmlSegment[] {
  const segments: HtmlSegment[] = [];
  let lastIndex = 0;

  for (const match of html.matchAll(ANCHOR_PATTERN)) {
    const full = match[0];
    const href = match[1] ?? '';
    const label = stripHtmlTags(match[2] ?? href);
    const start = match.index ?? 0;

    if (start > lastIndex) {
      const text = stripHtmlTags(html.slice(lastIndex, start));
      if (text.length > 0) {
        segments.push({ kind: 'text', text });
      }
    }

    if (href.length > 0) {
      segments.push({ kind: 'link', href, label: label.length > 0 ? label : href });
    }

    lastIndex = start + full.length;
  }

  if (lastIndex < html.length) {
    const text = stripHtmlTags(html.slice(lastIndex));
    if (text.length > 0) {
      segments.push({ kind: 'text', text });
    }
  }

  if (segments.length === 0) {
    const plain = stripHtmlTags(html);
    if (plain.length > 0) {
      segments.push({ kind: 'text', text: plain });
    }
  }

  return segments;
}
