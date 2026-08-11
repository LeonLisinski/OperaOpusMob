# Upute za preuzimanje

Privremeno preuzimanje Opera Mobile (Expo migracija). Fokus: **što je u projektu**, **kako raditi lokalno**, **kako buildati APK/AAB**. Bez romana — samo što treba da se ne zaglaviš.

Online: https://leonlisinski.github.io/OperaOpusMob/preuzimanje/

## 1. Što je ovaj projekt

Monorepo: stara **Ionic** produkcija + nova **Expo** aplikacija + layouti + API snapshot + Dispečer (referenca) + docs.

| Folder | Što je | Dirati? |
|---|---|---|
| `expo/` | **Cilj** — Expo / React Native app (tu se razvija) | Da — glavni rad |
| `src/` | Ionic + Capacitor — **produkcijska referenca** ponašanja | Ne bez odobrenja |
| `MobLayoutsControls/` | JSON layouti po tenantu (UI + SP mapiranje) | Ne bez odobrenog zadatka |
| `API/` | ASP.NET API snapshot s TFS-a (referenca) | Ne — prilagodbe idu layout/SQL |
| `Dispecer/` | Disp web (Slavonija Bus raspored) — referenca | Ne u sklopu mobilne migracije |
| `OperaWeb/` | Web Opera — referenca | Ne |
| `docs/` | VitePress dokumentacija | Da — uz funkcionalne promjene |
| `android/` | Stari Capacitor Android (Ionic) | Ne za Expo build |

**v1 = Android.** iOS runtime / store = v2. Favoriti / Profil u CC = v2 (prazno / nije prioritet).

## 2. Rad u Cursoru

Jedan workspace = cijeli ovaj folder (Ionic + Expo + layouti + API + Dispečer).

- Pravila: `.cursor/rules/` (sigurnost promjene, kontekst, API/layout).
- Skilovi: `.cursor/skills/` (plan promjene, root-cause bug, impact…).
- Kanonski kontekst: `docs/ai/` — počni od [`SYSTEM_MAP`](/ai/SYSTEM_MAP).

**Modeli (praksa Leona):** teži taskovi → Grok; brži/lakši → Composer. Nema obaveze — koristi što imaš tokena.

## 3. Expo account (obavezno za cloud build)

1. Google račun: **`svam.operaopus@gmail.com`** (lozinka / 2FA — kod tima, ne u gitu).
2. Na [expo.dev](https://expo.dev) prijavi se **preko Google** s tim mailom.
3. Tim / projekt: https://expo.dev/accounts/svampluss-team  
   - App slug: `operamobile`  
   - `owner` u `expo/app.config.ts`: `svampluss-team`  
   - EAS `projectId` već stoji u `app.config.ts` (`extra.eas.projectId`).

CLI login (iz `expo/`):

```bash
cd expo
npx eas login
```

Provjera:

```bash
npx eas whoami
```

Mora pokazati račun vezan na **svampluss-team**. Ako vidiš drugi account (npr. osobni) — `npx eas logout` pa opet `login` s Google / timskim računom.

## 4. Lokalni rad (bez EAS)

```bash
cd expo
npm install
npx expo start
```

| Tip | Naredba / napomena |
|---|---|
| Metro + QR / tipke | `npx expo start` — treba **development build** na telefonu (nije klasični Expo Go za puni native) |
| Lokalni Android APK na uređaj/emulator | `npx expo run:android` (Android Studio + SDK) |
| Web preview | `npx expo start --web` — UI/navigacija OK; **ne** zamjenjuje native (Secure Store, potpis, push, file picker) |

Provjere prije commita:

```bash
cd expo
npm run typecheck
npm run lint
npx expo-doctor
```

## 5. Cloud build (EAS) — što koristiti

Sve naredbe **iz mape `expo/`**. Repo je monorepo; root `.easignore` isključuje Ionic/API/layoute iz uploada — u arhivi treba biti uglavnom `expo/`.

| Profil (`eas.json`) | Package | Artefakt | Kad |
|---|---|---|---|
| `preview` | `com.opera.mobile.preview` | APK | Interni test uz Play Ionic (drugi package) |
| `apk-production` | `com.opera.mobile` | APK | Sideload **istog** packagea kao produkcija (npr. push / FCM) — **ne** store |
| `production` | `com.opera.mobile` | AAB | Play Store (signing: `credentialsSource: local`) |
| `development` | preview-ish | APK + dev client | Dev client build |

Package bira `APP_VARIANT` u `app.config.ts`: `preview`/`development` → `.preview`; inače `com.opera.mobile`.  
**Push (FCM):** `google-services.json` veže se samo na `com.opera.mobile`. Za push test koristi **`apk-production`** (ili production), ne obični `preview`.

### Preview APK (najčešći interni test)

```bash
cd expo
npx eas whoami
npx eas build -p android --profile preview
```

Build status / download: https://expo.dev/accounts/svampluss-team/projects/operamobile/builds

### APK s production packageom (push, sideload)

```bash
cd expo
npx eas build -p android --profile apk-production
```

### Store AAB

```bash
cd expo
npx eas build -p android --profile production
```

Lokalni keystore / credentials — **tvrtka**, ne commitati u git. Profil `production` koristi `credentialsSource: local`.

iOS build postoji u konfiguraciji, ali **v1 fokus je Android**; iOS store/runtime = v2.

## 6. Git

| Remote | URL | Pravilo |
|---|---|---|
| `github` | `LeonLisinski/OperaOpusMob` | **Default push** tijekom migracije |
| `origin` | TFS `ERP-IONIC7` | **Ne** pushati bez eksplicitnog odobrenja za TFS |

```bash
git remote -v
git push github <grana>
```

## 7. Test nalozi (poznato)

| Korak | Vrijednost |
|---|---|
| Core PIN (Jukić test) | `jukic001` |
| ERP user | `svam` (lozinka — kod tima) |
| App PIN | `plusplus` |

Drugi PIN-ovi (Jasika, Slavonija Bus, …) — v. PinCore / kolege; ne inventirati.

## 8. MCP, SQL, Postman (kratko)

| Alat | Namjena | Napomena |
|---|---|---|
| SQL MCP (Cursor) | Read-only SELECT na test/disp bazama | **Zabranjen** INSERT/UPDATE/DELETE/ALTER. Konfiguracija je lokalna (Cursor MCP) — nije u gitu |
| Postman MCP / Postman | Ručni API pozivi (`/data`, `/login`, `/doclayouts`…) | Basic Auth kao Ionic: `test:123` → header `Authorization: Basic dGVzdDoxMjM=` (isto u `dataHelper`) |
| Browser / Playwright MCP | UI smoke (web) | Native (potpis, push) na webu ne vrijedi |

Ako MCP ne radi — pitaj tima za pristup; ne „popravljaj“ pretpostavljenim passwordima u dokumentaciji.

## 9. Što je otvoreno pri preuzimanju (2026-08-11)

Ne tvrdi da je „sve verified“ — matrica: [`FEATURE_PARITY_MATRIX`](/ai/FEATURE_PARITY_MATRIX).

**Lokalne izmjene koje trebaju commit + novi build + smoke** (provjeri `git status` u `expo/`):

- Jasika / MEDIVA stavke — Azur override (`spMob_ZJUKIC_DST_Azur` jer tenant nema `*_JASIKA/MEDIVA_DST_Azur`)
- Adriateh potpis — `/repxreport` `db` iz Core PIN-a
- App unlock race nakon App PIN-a

**Namjerno van fokusa za sada:** Favoriti; DNIZ write komentar; MIDA `/servis` runtime (smatra se zastarjelim prioritetom dok se ne dokaže drugačije).

**Raspored (Slavonija Bus):** ekran + Expo push token smokean na `com.opera.mobile`; detalji u `docs/ai/SLABUS_RASPORED_DESIGN.md` i planovima u `.cursor/plans/`.

## 10. Gdje čitati dalje

| Trebaš | Otvori |
|---|---|
| Karta sustava | [`SYSTEM_MAP`](/ai/SYSTEM_MAP) |
| Status funkcija | [`FEATURE_PARITY_MATRIX`](/ai/FEATURE_PARITY_MATRIX) |
| Setup Node / Cursor | [`Razvojno okruženje`](/technical/okruzenje) |
| Build detalji | [`Build i testiranje`](/technical/build) |
| Odluke / rizici | [`DECISION_LOG`](/ai/DECISION_LOG), [`KNOWN_RISKS`](/ai/KNOWN_RISKS) |

Dokumentaciju lokalno: `cd docs && npm install && npm run docs:dev` (VitePress, base `/OperaOpusMob/`).
