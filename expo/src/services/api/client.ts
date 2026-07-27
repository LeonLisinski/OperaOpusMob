import { ApiError } from '@/types/api';

import { LEGACY_BASIC_AUTH_HEADER, REQUEST_TIMEOUT_MS } from './config';

interface ApiPostOptions {
  url: string;
  body?: unknown;
  timeoutMs?: number;
}

const SENSITIVE_KEYS = new Set(['pin', 'pwd', 'password']);

/** Uklanja PIN/lozinku iz objekta prije ispisa u development log. */
function sanitizeForLog(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeForLog);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, val]) => [
        key,
        SENSITIVE_KEYS.has(key.toLowerCase()) ? '***' : sanitizeForLog(val),
      ]),
    );
  }
  return value;
}

/** Pokušava izvući poruku greške iz backend odgovora — oblik nije potvrđen iz backend koda. */
function extractServerMessage(parsed: unknown): string | null {
  if (typeof parsed === 'string' && parsed.trim().length > 0) {
    return parsed;
  }
  if (parsed && typeof parsed === 'object') {
    const record = parsed as Record<string, unknown>;
    const candidate = record.message ?? record.Message ?? record.error ?? record.Error;
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
  }
  return null;
}

/**
 * Centralni POST klijent iznad fetch-a: Basic Auth (postojeći kompatibilnosni zahtjev),
 * timeout, sigurno parsiranje ne-JSON odgovora i standardizirane ApiError greške.
 * Ne zna ništa o poslovnom značenju poziva — to je odgovornost services/api/*Api.ts.
 */
export async function apiPost<TResponse>({ url, body, timeoutMs = REQUEST_TIMEOUT_MS }: ApiPostOptions): Promise<TResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (__DEV__) {
    console.log('[api] POST', url, body !== undefined ? sanitizeForLog(body) : undefined);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: LEGACY_BASIC_AUTH_HEADER,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    if (aborted) {
      throw new ApiError('timeout', 'Zahtjev je istekao. Provjerite internetsku vezu i pokušajte ponovno.', null, error);
    }
    throw new ApiError('network', 'Nije moguće uspostaviti vezu s poslužiteljem. Provjerite internetsku vezu.', null, error);
  } finally {
    clearTimeout(timeoutId);
  }

  const raw = await response.text();
  let parsed: unknown = null;
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      // LoginController.cs i BaseController.cs vraćaju greške kao HTTP 400/401 s JSON
      // string porukom (npr. "Pogrešna lozinka!"), ali zadržavamo fallback na raw tekst.
      if (response.status !== 200) {
        const trimmed = raw.trim();
        throw new ApiError(
          'http',
          trimmed.length > 0 ? trimmed : 'Zahtjev nije uspio.',
          response.status,
          { raw, parseError },
        );
      }
      throw new ApiError('parse', 'Poslužitelj je vratio neočekivan odgovor.', response.status, { raw, parseError });
    }
  }

  if (__DEV__) {
    console.log('[api] response', response.status, url);
  }

  if (response.status !== 200) {
    const serverMessage = extractServerMessage(parsed);
    throw new ApiError('http', serverMessage ?? `Zahtjev nije uspio (status ${response.status}).`, response.status, parsed);
  }

  return parsed as TResponse;
}
