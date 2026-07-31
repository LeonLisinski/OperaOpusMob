# Expo v1 — funkcionalni paritet s Ionic produkcijom

Datum: 2026-07-31 · Opseg: veliki · Status: **odobreno** (korisnik: „ajmo odraditi potrebno da završimo 1. verziju")

## 1. Zahtjev

Objaviti **Opera Mobile v1** u Expo-u: funkcionalno **1/1** s onim što korisnici stvarno koriste u Ionic app (`src/`), moderniji UI, optimiziran kod, **Android + iOS** build. Push, CC Favoriti/Profil i slične dorade idu u v2.

Referenca pariteta = **Ionic runtime ponašanje** (meni → URL → ekrani → SP), ne mrtav kod u izvoru.

## 2. Postojeći obrazac

| Područje | Ionic referenca | Expo stanje |
|---|---|---|
| Auth | `src/pages/auth/`, `core/cc/UnlockApp` | `expo/app/(auth)/`, `app-unlock.tsx` — parity-review |
| dgl/gen engine | `src/pages/dgl/`, `src/pages/gen/` | `expo/src/features/documents/` — parity-review |
| Legacy servis | `src/pages/servis/` | **Nije migrirano** — `moduleRouting.ts` vraća null za `/servis/*` |
| Stavke swipe | `dgl/tabs/Tab3.jsx`, `dgl/store` hardkod SP | Expo UI + thunkovi postoje; `dstAzurQuery` često nedostaje u JSON-u |
| gen Akcije | `gen/tabs/TabAkcije.jsx` + `queries.gla.createdoc` | **Nema** u Expo tab bar-u |
| Build | Capacitor Android `com.opera.mobile` | Expo `app.json` — **nema** `ios.bundleIdentifier`, nema EAS |

## 3. Relevantne datoteke

- Plan i backlog: `.cursor/plans/`, `docs/ai/V2_BACKLOG.md`
- Expo engine: `expo/src/features/documents/documentsSlice.ts`, `layoutQueryPatches.ts`, `layoutContract.ts`
- Routing: `expo/src/features/documents/moduleRouting.ts`, `expo/app/(app)/modules/[code].tsx`
- Tabovi: `expo/src/components/DocumentTabsBar.tsx`, `expo/app/(app)/documents/doc/_layout.tsx`
- Ionic servis: `src/pages/servis/RadniNalozi/`, `DnevniIzvjestaj/`
- Ionic gen akcije: `src/pages/gen/tabs/TabAkcije.jsx`, `gen/store` (`createDoc`, `copyRNfromUpit`)
- Build: `expo/app.json`, `docs/technical/build.md`

## 4. API endpointi

Bez promjena — `/data`, `/login`, `/doclayouts`, `/saveatt`, `/getatt`, `/repxreport`. Expo replicira Ionic envelope iz `dataHelper.js`.

## 5. SQL objekti

- **OperaMobile:** `App`, `PinApp`, `PinCore` — inventar aplikacija (servis-mobile ≈ 116 PIN-ova)
- **Tenant DB:** `spMob_Menu_Query` (module.url), `spMob_*_DST_Azur`, `spMob_DST_RadniNalozi_Azur`, servis SP-ovi
- **Nepoznato:** pun popis `module.url` po aktivnim PIN-ovima — treba read-only upit ili export od tima

## 6. JSON layouti

**Ne mijenjati** `MobLayoutsControls/` bez odobrenog zadatka kolega. Expo dopunjuje nedostajuće `queries.dst.azur/delete` **runtime patch-em** (isti princip kao Ionic hardkod u `dgl/store`).

## 7. Utjecaj na module

- **dgl/gen:** stavke fallback, gen Akcije tab
- **servis:** zasebna vertikala — Faza 4 (ovisi o meniju)
- **Zajedničko:** `DocumentTabsBar`, `documentsSlice`

## 8. Utjecaj na tenante

Svi tenanti koji koriste module s `module.url`:
- `/docs/dgl/*` ili `/gen/*` → Faze 1–3
- `/servis/*` → Faza 4 (116+ PIN-ova na servis-mobile)

## 9. Sloj implementacije

| Faza | Sloj |
|---|---|
| 1 | Expo `layoutQueryPatches.ts` — dst SP fallback iz `queries.dst.list` |
| 2 | Expo gen Akcije tab + thunkovi |
| 3 | Paritet review + `FEATURE_PARITY_MATRIX` |
| 4 | Expo `features/servis/` ili potvrda da meni ne koristi `/servis/*` |
| 5 | `app.json`, EAS, iOS bundle ID |

## 10. Rizici

- **Servis-mobile PIN-ovi** bez `/servis/*` implementacije → modul „nije implementiran”
- **ASURA DST TEH** — `spMob_ASURA_DST_TEH_Query` → azur SP ime **nepotvrđeno** na svim bazama
- **iOS** — Apple Developer + certifikati nisu u repou
- **Tenant layouti na klijentskim serverima** mogu se razlikovati od lokalne snimke

## 11. Plan testiranja

1. **jukic001 → svam → plusplus** — pun flow
2. Modul s stavkama (RNint) — CRUD + swipe
3. CRM Upiti — Akcije → kreiraj RN → otvori dgl dokument
4. Privitci, potpis — native Android device
5. iOS simulator/device — auth, lista, forma, tipkovnica
6. `npm run typecheck`, `expo-doctor`

## 12. Kriteriji prihvaćanja (v1)

- [ ] Svi `module.url` obrasci koje aktivni tenanti koriste vode na funkcionalan ekran (ne Alert „nije implementiran”)
- [ ] Stavke: FAB, forma, swipe akcije rade kad Ionic `Tab3` radi (flagovi s backenda)
- [ ] gen CRM Upiti: tab Akcije + „Kreiraj radni nalog” + navigacija na RN
- [ ] dgl: Info, Stavke, Rad, Privitci, Potpis — vidljivost kao Ionic `MainTabs.tsx`
- [ ] Android release build prolazi
- [ ] iOS release build prolazi (`bundleIdentifier` postavljen)
- [ ] `FEATURE_PARITY_MATRIX.md` ažuriran
- [ ] v2 stavke u `V2_BACKLOG.md`

## Documentation impact

- Da — `FEATURE_PARITY_MATRIX.md`, `docs/user/`, `docs/technical/build.md`, novi `V2_BACKLOG.md`
- Korisnički flow: stavke, gen Akcije, servis (kad migrira)
- Screenshot: po potrebi nakon runtime review-a
- Odluka: dst SP derive — zapisati u DECISION_LOG nakon potvrde

## Rollback

Expo app se ne deploya na store dok paritet nije potvrđen. Ionic (`src/`) ostaje produkcija. Po modulu: revert Expo commit; tenanti ostaju na Ionic.

---

## Redoslijed implementacije

| Faza | Zadatak | Status |
|---|---|---|
| **0** | Ovaj plan + V2_BACKLOG | ✅ |
| **1** | Stavke: auto `queries.dst.azur/delete` iz `dst.list` SP | ✅ |
| **2** | gen tab **Akcije** (`queries.gla.createdoc`) | ✅ |
| **3** | Paritet review jukic001 + matrica | sljedeće |
| **4** | Legacy **servis** (`/servis/*`) — inventar URL pa port | sljedeće |
| **5** | **iOS/Android build** (bundle ID, EAS) | djelomično (bundle ID + eas.json) |
| **6** | Repo cleanup (legacy vs mobile folder) | |
