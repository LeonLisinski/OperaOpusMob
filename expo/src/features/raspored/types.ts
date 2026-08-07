/**
 * Redak iz `spDispVozniRed` (lowercase aliasi iz SP-a).
 * Primjer ugovora (2026-08): `relacija` + `suvozaci` JSON; `registracija` = COALESCE(RegOznaka, SifArt).
 */
export interface VozniRedRow {
  /** Stabilan id stavke kad SP vraća `disprasporedstavkaid`. */
  disprasporedstavkaid: number | null;
  datumvoznje: string;
  sifosobe: string | null;
  imevozaca: string | null;
  sifpred: string | null;
  /** Naziv linije iz Pred (`NazPred`), npr. „ŠIBENIK - ROGOZNICA“. */
  nazivlinije: string | null;
  odrediste: string | null;
  mjestopolaskanaziv: string | null;
  mjestoodredistanaziv: string | null;
  mjestoa_naziv: string | null;
  mjestob_naziv: string | null;
  /** Smjerom prilagođena relacija vožnje, npr. „Rogoznica - Šibenik“. */
  relacija: string | null;
  relacijaod: string | null;
  relacijado: string | null;
  vrijemepolaska: string | null;
  vrijemedolaska: string | null;
  smjenatip: string | null;
  registracija: string | null;
  /** Redni broj na stavci (1 = glavni). */
  rednibrojvozaca: number | null;
  /**
   * Suvozači (bez prijavljenog vozača) — imena iz `suvozaci` JSON-a,
   * fallback `imedodatnogvozaca` ako stariji SP još postoji.
   */
  suvozaciImena: string[];
}

/** Status dana iz `DispRasporedObavijest` / List SP. */
export type ObavijestStatus = 'POSLANO' | 'PRIHVACENO' | 'ODBIJENO' | string;

/** Redak iz `spDispRasporedObavijestList`. */
export interface ObavijestRow {
  disprasporedobavijestid: number | null;
  sifosobe: string | null;
  /** ISO datum `YYYY-MM-DD`. */
  datum: string;
  status: ObavijestStatus;
  komentar: string | null;
  poslanou: string | null;
  imevozaca: string | null;
}

/** Aktualno = od danas max 7 dana; Sutra = samo sutra; Povijest = tjedni pon–ned. */
export type RasporedTab = 'aktualno' | 'sutra' | 'povijest';

export interface RasporedDaySection {
  datum: string;
  label: string;
  accent: 'today' | 'tomorrow' | 'none';
  rides: VozniRedRow[];
}

/** Dan koji čeka potvrdu (POSLANO) — inbox na Aktualno. */
export interface PendingDayInbox {
  datum: string;
  label: string;
  obavijest: ObavijestRow;
  rides: VozniRedRow[];
}
