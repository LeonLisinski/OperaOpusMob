/**
 * Centralizirani popis storage ključeva. Nijedna komponenta ne smije izravno
 * čitati/pisati SecureStore ili AsyncStorage — sve ide kroz sessionStorage.ts.
 */
export const STORAGE_KEYS = {
  secure: {
    // Mali, uređaj-specifičan identifikator — u Secure Store radi smanjenja
    // rizika trivijalne izmjene/čitanja, iako sam po sebi nije tajna poput lozinke.
    deviceInstallationId: 'device.installationId',
  },
  async: {
    // API/DB/layoutprefix iz Core PIN aktivacije — neosjetljiva konfiguracija, veći JSON.
    coreConfig: 'session.coreConfig',
    // ERP korisnik (korime, sifosobe, grupa...) — nikad ne sadrži lozinku.
    user: 'session.user',
    // Server/database info s ERP logina.
    connection: 'session.connection',
    // Lista otključanih aplikacija (code/db parovi) — vraćena od spPinAppAzur.
    unlockedApps: 'session.unlockedApps',
  },
} as const;
