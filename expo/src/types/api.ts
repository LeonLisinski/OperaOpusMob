export type ApiErrorCode = 'network' | 'timeout' | 'http' | 'parse';

/**
 * Standardizirana greška API sloja. `userMessage` je uvijek na hrvatskom i sigurno
 * za prikaz korisniku; tehnički detalj (`detail`, HTTP `status`) je namijenjen samo
 * development logu, ne korisničkom sučelju.
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number | null;
  readonly detail: unknown;

  constructor(code: ApiErrorCode, userMessage: string, status: number | null = null, detail: unknown = null) {
    super(userMessage);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Pretvara bilo koju grešku (API ili neočekivanu) u hrvatsku poruku sigurnu za prikaz.
 * Koristi se u thunkovima prije spremanja greške u Redux state.
 */
export function toUserMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return 'Došlo je do neočekivane greške. Pokušajte ponovno.';
}
