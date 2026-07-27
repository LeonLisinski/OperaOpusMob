# Migration Strategy

Faze su sekvencijalne po ovisnosti, ne po vremenu — nema procjena trajanja jer za to trenutno nema dovoljno podataka (veličina tima, stvarna kompleksnost pojedinog modula po tenantu). Svaka faza ima jasan kriterij završetka prije prelaska na sljedeću.

Ova strategija se ažurira kako se donose odluke iz `TARGET_ARCHITECTURE.md` i kako se otvorena pitanja iz `OPEN_QUESTIONS.md` razrješavaju.

---

## Faza 0 — Zaštita postojećih layouta i referentnog ponašanja

- **Cilj:** osigurati da postoji pouzdana, verzionirana snimka trenutnog stanja prije bilo kakve migracijske aktivnosti.
- **Preduvjeti:** nema (početna faza).
- **Rezultat:** `MobLayoutsControls/` snimka i `docs/ai/` dokumentacija trenutnog stanja postoje i mogu se koristiti kao referenca.
- **Kriterij završetka:** `CURRENT_ARCHITECTURE.md` opisuje dokazano stanje sustava; lokalna kopija layouta je poznata i dokumentirana (broj datoteka, nevalidne datoteke, pokrivenost po tenantu).
- **Glavni rizici:** lokalna snimka ne pokriva klijente s vlastitim API serverom (v. `CURRENT_ARCHITECTURE.md` §7.7); promjene na `operaweb` layoutima nakon snimke nisu vidljive.
- **Rollback:** nije primjenjivo — ova faza ne mijenja produkciju.

## Faza 1 — Projektna infrastruktura i dokumentacija

- **Cilj:** uspostaviti Cursor rules, skills i kanonsku dokumentaciju (`docs/ai/`) kao temelj za sve sljedeće faze.
- **Preduvjeti:** Faza 0 završena.
- **Rezultat:** `.cursor/rules/`, `.cursor/skills/`, `docs/ai/` postoje i koriste se u svakodnevnom radu.
- **Kriterij završetka:** tim koristi rules/skills bez podsjećanja; dokumentacija je referencirana u planovima promjena.
- **Glavni rizici:** dokumentacija i pravila postanu preteški za mali tim za održavanje (v. `KNOWN_RISKS.md`).
- **Rollback:** dokumentacija i pravila se mogu pojednostaviti ili ukloniti bez utjecaja na aplikaciju.

## Faza 2 — Potvrda kontrakata API-ja, layouta i SQL flowova

- **Cilj:** zatvoriti što je moguće više stavki iz `OPEN_QUESTIONS.md` koje blokiraju arhitektonske odluke — posebno oblik `/login` odgovora, `/doclayouts` fallback pravila, obradu makroa (`#today`, `#coid`), i pristup reprezentativnoj tenant bazi.
- **Preduvjeti:** Faza 1 završena; potreban pristup osobi/timu koji poznaje backend ili barem read-only pristup njegovom repozitoriju/kodu.
- **Rezultat:** ažuriran `OPEN_QUESTIONS.md` sa smanjenim brojem nepoznanica; TypeScript kontrakti mogu se definirati na dokazanoj osnovi umjesto pretpostavki.
- **Kriterij završetka:** ključne nepoznanice koje blokiraju Fazu 3 (API client, tipovi) su razriješene ili eksplicitno prihvaćene kao rizik.
- **Glavni rizici:** backend tim nije dostupan ili backend repozitorij nije pronađen — v. `OPEN_QUESTIONS.md` #1.
- **Rollback:** nije primjenjivo — istraživačka faza bez promjena u kodu.

## Faza 3 — Expo temeljna arhitektura

- **Cilj:** postaviti `expo/` s minimalnom, praznom, ali strukturiranom aplikacijom (navigacija, API client skeleton, error handling, osnovni theming) prema odlukama iz `TARGET_ARCHITECTURE.md`, ravnopravno za Android i iOS.
- **Preduvjeti:** Faza 2 završena za odluke koje o njoj ovise (npr. API kontrakt); `TARGET_ARCHITECTURE.md` decision pending stavke vezane uz navigaciju i state riješene.
- **Rezultat:** `expo/` postoji, buildable je za obje platforme, ali nema poslovnih ekrana.
- **Kriterij završetka:** prazna Expo aplikacija se pokreće na Android i iOS uređaju/simulatoru; struktura foldera odgovara odabranom sloju arhitekture (screens/components/hooks/state/services/api).
- **Glavni rizici:** prerano zaključivanje o strukturi prije nego što je prvi pravi modul (Faza 5) potvrdi u praksi; izbor biblioteke koja radi na Androidu ali ima ograničenja na iOS-u (ili obrnuto) otkriven prekasno.
- **Rollback:** brisanje `expo/` foldera, bez utjecaja na `src/`.

## Faza 4 — Auth vertikala

- **Cilj:** implementirati core PIN → login → app PIN flow u Expo aplikaciji, funkcionalno jednak Ionic flowu.
- **Preduvjeti:** Faza 3 završena; kontrakt `/login` i `spPinCoreAzur`/`spPinAppAzur` ponašanja potvrđen (Faza 2).
- **Rezultat:** korisnik se može prijaviti u Expo aplikaciji istim PIN-om/kredencijalima kao u Ionic aplikaciji, na istom tenantu.
- **Kriterij završetka:** paritet potvrđen na barem jednom test tenantu (v. `OPEN_QUESTIONS.md` — testni tenant/PIN/korisnik); zapisano u `FEATURE_PARITY_MATRIX.md`.
- **Glavni rizici:** hardkodirani Basic Auth i nedostatak JWT-a (v. `KNOWN_RISKS.md`) — odluka mijenja li se auth mehanizam je izvan opsega dok backend strana nije razriješena (`.cursor/rules/10-change-safety.mdc` pravilo 9).
- **Rollback:** Expo auth ekrani se ne koriste u produkciji dok Ionic ostaje referenca; nema utjecaja na postojeće korisnike.

## Faza 5 — Generički modul: lista → detalj → forma

- **Cilj:** migrirati jedan referentni generički modul (npr. jedan `dgl` ili `gen` modul niskog rizika) kroz cijeli krug: lista, detalj, forma, spremanje.
- **Preduvjeti:** Faza 4 završena (auth potreban za sve zaštićene rute); JSON layout kontrakt za odabrani modul potvrđen.
- **Rezultat:** prvi kompletan poslovni modul radi u Expo aplikaciji nad istim JSON layoutom i istim SP-ovima kao Ionic verzija.
- **Kriterij završetka:** funkcionalna jednakost potvrđena na test tenantu za odabrani modul; obrazac (pattern) koji je pritom nastao dokumentiran je kao referenca za sljedeće module.
- **Glavni rizici:** JSON layout ima nestandardne slučajeve koje odabrani modul ne pokriva pa se obrazac mora revidirati kasnije.
- **Rollback:** modul se ne uključuje u rollout (Faza 10) dok paritet nije `verified`.

## Faza 6 — Stavke, šifrarnici i tenant varijante

- **Cilj:** proširiti generički modul iz Faze 5 na stavke dokumenta (`dst*`), šifrarnike (search/simple/advanced) i poznate tenant-specifične varijacije (npr. `spMob_ZJUKIC_DST_Azur`).
- **Preduvjeti:** Faza 5 završena i obrazac dokumentiran.
- **Rezultat:** generički modul podržava stavke i šifrarnike; tenant varijante rade bez tenant-specifičnih `if` provjera u zajedničkom kodu (princip iz `TARGET_ARCHITECTURE.md`).
- **Kriterij završetka:** barem jedan modul sa stavkama i šifrarnicima ima potvrđeni paritet na test tenantu.
- **Glavni rizici:** tenant-specifične SP varijante (v. `CURRENT_ARCHITECTURE.md` §9.4) zahtijevaju mehanizam konfiguracije koji još ne postoji u ciljnoj arhitekturi.
- **Rollback:** isto kao Faza 5 — modul ostaje izvan rollouta dok paritet nije potvrđen.

## Faza 7 — Privitci, fotografije, potpis i izvještaji

- **Cilj:** migrirati upload/download privitaka, kameru, potpis (signature canvas ekvivalent) i REPX izvještaje.
- **Preduvjeti:** barem jedan modul iz Faze 5/6 koji te funkcionalnosti koristi.
- **Rezultat:** privitci, fotografije, potpis i ispis rade u Expo aplikaciji na istim endpointima (`/saveatt`, `/getatt`, `/repxreport`).
- **Kriterij završetka:** funkcionalni paritet potvrđen, uključujući rubne slučajeve (veličina datoteke, format, offline snimanje ako je primjenjivo).
- **Glavni rizici:** Expo ekvivalenti nativnih Capacitor plugina (camera, file-picker, filesystem) mogu imati različita ograničenja platforme.
- **Rollback:** korisnik i dalje koristi Ionic aplikaciju za te funkcije dok paritet nije potvrđen.

## Faza 8 — Push notifikacije

- **Cilj:** implementirati produkcijski push flow za Android i iOS, za razliku od trenutnog Android-only demo stanja (v. `CURRENT_ARCHITECTURE.md` §12).
- **Preduvjeti:** analiza postojećeg backenda, FCM konfiguracije i zahtjeva za iOS APNs završena; odluka o push provideru iz `TARGET_ARCHITECTURE.md` donesena; server-side push infrastruktura potvrđena (`OPEN_QUESTIONS.md`).
- **Rezultat:** push notifikacije rade end-to-end za barem jedan poslovni scenarij, na obje platforme.
- **Kriterij završetka:** notifikacija poslana sa servera stiže i ispravno navigira unutar aplikacije, na Androidu i na iOS-u.
- **Glavni rizici:** server-side push infrastruktura možda ne postoji još — ovo može blokirati cijelu fazu dok se ne razriješi; APNs zahtijeva Apple Developer nalog i certifikate koji danas možda ne postoje.
- **Rollback:** push ostaje neaktivan u Expo aplikaciji bez utjecaja na ostale module.

## Faza 9 — Migracija legacy servis modula

- **Cilj:** migrirati hardkodirane `servis/*` module (Radni nalozi, Dnevni izvještaj) u generički obrazac iz Faze 5/6, ili zadržati ih kao poseban obrazac ako generalizacija nije opravdana.
- **Preduvjeti:** generički obrazac stabilan i dokazan na više modula (Faze 5–7).
- **Rezultat:** `servis/*` funkcionalnost postoji u Expo aplikaciji, generalizirana gdje ima smisla.
- **Kriterij završetka:** paritet potvrđen za Radne naloge i Dnevni izvještaj na test tenantu.
- **Glavni rizici:** legacy moduli imaju najviše korisnika (152 PIN-a za servis-mobile — v. Appendix A u `CURRENT_ARCHITECTURE.md`) pa greška ovdje ima najveći poslovni utjecaj.
- **Rollback:** Ionic servis moduli ostaju u produkciji dok paritet nije `verified` za svakog aktivnog tenanta koji ih koristi.

## Faza 10 — Rollout po tenantima i gašenje Ionic verzije

- **Cilj:** postupno prebaciti tenante na Expo aplikaciju, tenant po tenant, i ugasiti Ionic verziju tek kad više nema aktivnih korisnika na njoj.
- **Preduvjeti:** sve prethodne faze završene za module koje dani tenant koristi; `FEATURE_PARITY_MATRIX.md` pokazuje `verified` za te module na tom tenantu.
- **Rezultat:** tenanti postupno prelaze na Expo aplikaciju; Ionic aplikacija se gasi kad joj ne preostane aktivnih korisnika.
- **Kriterij završetka:** svi aktivni tenanti rade na Expo aplikaciji; Ionic build je arhiviran, ne uklonjen naglo.
- **Glavni rizici:** tenanti sa zasebnim API serverima i layoutima (Jukić, Ruve i drugi — v. `CURRENT_ARCHITECTURE.md` §7.7) nisu analizirani ovom snimkom i mogu imati iznenađenja pri rolloutu; napušteni/neaktivni tenanti mogu lažno povećati opseg ako se ne identificiraju ranije (v. `OPEN_QUESTIONS.md`); Android i iOS mogu izaći iz rollouta u različitom tempu (npr. App Store review vrijeme) — to se prati po platformi, ne samo po tenantu.
- **Rollback:** tenant se po potrebi vraća na Ionic verziju dok se problem ne riješi, budući da Ionic build ostaje dostupan do potvrđenog punog rollouta.
