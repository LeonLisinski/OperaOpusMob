/** Čista, interna reprezentacija Core PIN konfiguracije (izvedena iz CoreUnlockRawResponse). */
export interface CoreConfig {
  /** Bazni URL tenant API-ja (iz response polja `serverpath`). */
  apiBaseUrl: string;
  /** Tenant baza dodijeljena Core PIN-om (iz response polja `db`). */
  db: string;
  layoutprefix: string | null;
}

/**
 * ERP korisnik. `korime` je jedino polje koje kod danas stvarno koristi (spMob_Menu_Query
 * parametar) pa je obavezno; ostala polja (name, grupa, sifosobe, sifgrupe, ...) se
 * čuvaju kakva dođu za buduće module, bez pretpostavke o potpunom skupu.
 */
export interface ErpUser {
  korime: string;
  [key: string]: unknown;
}

/** Server/database info s ERP logina — `database` koristi getData() kao ciljnu tenant bazu. */
export interface ErpConnection {
  database?: string;
  server?: string;
  [key: string]: unknown;
}
