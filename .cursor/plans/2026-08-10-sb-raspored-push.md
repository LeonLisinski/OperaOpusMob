# SB Raspored — push notifikacije (Android v1)

Datum: 2026-08-10 · Opseg: srednji · Status: implementacija (klijent)

Odluke vlasnika: **auth A** (ERP + TOKEN po `SifOsobe`), **opseg A** (pun Android E2E, može u koracima), Firebase na Dispu **nepoznat / vjerojatno nije**.

---

## 1. Zahtjev

Kad dispečer pošalje raspored s Disp weba, vozač na Androidu dobije push; tap otvara Opera Mobile Raspored → tab **Aktualno**. Kasnije isti klijentski sloj mora podnijeti i druge tipove notifikacija. iOS runtime nije u ovom PR-u, ali kod/config ne smiju biti Android-only slijepi ugao.

## 2. Postojeći obrazac

| Sloj | Stanje | Dokaz |
|---|---|---|
| Disp Pošalji + persist | Gotovo | `Dispecer/api/Disp.Gen/Services/PushService.cs`, web → `POST /api/push/send` |
| Token store | `MobKorisnik.PushToken` po `SifOsobe` (UNIQUE) | `Dispecer/sql/01-tables/80-MobKorisnik.sql` |
| Snimi token bez MOB PIN-a | `spMobKorisnikSave` `Action=TOKEN` + `SifOsobe` | `Dispecer/sql/02-procedures/75-spMobKorisnikSave.sql` |
| Kanali slanja | **FCM** (treba Firebase creds) **ili Expo** (`ExponentPushToken[…]`, bez Firebase) | `PushService.IsExpoToken` / `SendExpoAsync` / `EnsureFirebase` |
| Payload | `type=raspored_obavijest`, `datum` | `PushService.BuildData`, `mob-korisnik-api.md` |
| Expo Raspored UI + potvrda | Gotovo na ERP `sifosobe` | `expo/app/(app)/raspored/`, `useRasporedObavijesti` |
| Expo push klijent | **Nema** | nema `expo-notifications` u `package.json` / pluginima |
| Ionic push | Demo, ne koristiti kao ugovor | `src/pages/utils/PushNotificationsContainer.tsx` |

**Odluka A — zašto je održiva i pametna (ne “vjerojatno”):**

1. Disp već šalje po **`SifOsobe`**, ne po ERP korime — isti ključ koji Expo već koristi za vozni red.
2. SP **već** snima token po `SifOsobe` bez `loginType=MOB` — hibrid ERP+Servis ostaje netaknut (pravilo auth).
3. `MobKorisnik.SifOsobe` je UNIQUE → jedan aktivan uređaj/token po vozaču, predvidljivo.
4. Ne uvodimo drugi PIN ekran ni paralelnu sesiju.

**Što A ne može jamčiti sama od sebe (hard preduvjeti):**

| Preduvjet | Ako falne | Tko |
|---|---|---|
| Aktivan red u `MobKorisnik` za vozačev `SifOsobe` | `TOKEN` → greška; Pošalji → `no_token` | Disp admin / kolega |
| Ispravan kanal slanja na `dispapi` | Push fail iako je POSLANO u bazi | Ops + naš izbor tokena |
| Permission + registracija u app | Nema tokena | Expo klijent |
| Dev/preview APK s notification native modulom | Token/listen ne radi u go/old APK | Build |

**Kanal za Android v1 (konkretno):** snimati **Expo push token** (`ExponentPushToken[…]`), ne native FCM token.

Razlog: `EnsureFirebase()` baca ako nema `Push:FirebaseCredentialsPath|Json`. Korisnik kaže da Firebase vjerojatno nije rađen. Expo kanal u `PushService` ide na `https://exp.host/--/api/v2/push/send` **bez** Firebase. Kasnije, kad Disp doda Firebase + isti Firebase projekt kao `google-services.json` u app, možemo preći / dodati native FCM bez promjene ugovora tablice.

## 3. Relevantne datoteke

### Novo (Expo — mali, jasni sloj)

| Datoteka | Uloga |
|---|---|
| `expo/src/features/push/types.ts` | `PushData`, `PushType` (`raspored_obavijest` + rezerviran union za buduće tipove) |
| `expo/src/features/push/registerPush.ts` | permission, `getExpoPushTokenAsync`, poziv API TOKEN |
| `expo/src/features/push/notificationRouter.ts` | mapira `data.type` → navigacija (samo raspored sada) |
| `expo/src/features/push/PushBootstrap.tsx` | mount listenera (received / response) jednom u app shellu |
| `expo/src/services/api/pushApi.ts` | `spMobKorisnikSave` TOKEN / CLEAR_TOKEN |

### Izmjene (Expo)

| Datoteka | Uloga |
|---|---|
| `expo/package.json` | dodati `expo-notifications` (odobrenje ovisnosti) |
| `expo/app.config.ts` | plugin `expo-notifications`; iOS `UIBackgroundModes` remote-notification (priprema); Android channel |
| `expo/app/(app)/_layout.tsx` (ili ekvivalent shell) | mount `PushBootstrap` kad je sesija aktivna |
| `expo/app/(app)/raspored/index.tsx` | opcionalni query `focus=aktualno` / refresh na deep link |
| `expo/eas.json` | bez lomljenja preview/production profila; build nakon plugin-a |
| `docs/ai/SLABUS_RASPORED_DESIGN.md` | Faza 3 odluka A + Expo token |
| `docs/ai/DECISION_LOG.md` | kratka odluka |
| `docs/ai/OPEN_QUESTIONS.md` | zatvoriti/sužiti push pitanje za SB |

### Ne dirati

- `src/` Ionic
- `MobLayoutsControls/`
- `API/` Opera
- Disp web Pošalji (već radi) — samo checklist za kolegu
- Globalni auth flow / MOB login

## 4. API endpointi

Tenant Disp API (isti `auth.api` / `db` kao Raspored):

**Registracija tokena**

```http
POST {api}/data
```

```json
{
  "db": "<tenantDb>",
  "queries": [{
    "query": "spMobKorisnikSave",
    "commandType": "sp",
    "params": {
      "Action": "TOKEN",
      "SifOsobe": "<auth.user.sifosobe>",
      "PushToken": "ExponentPushToken[…]"
    }
  }]
}
```

**Logout / odjava (kasnije ili uz Settings Odjava)** — `Action=CLEAR_TOKEN` + isti `SifOsobe` (da stari telefon ne prima tuđe).

**Slanje** — samo Disp web / `POST /api/push/send` (kolega već ima). Expo **ne** zove `/push/send`.

Payload koji klijent očekuje u `data`:

```json
{ "type": "raspored_obavijest", "datum": "yyyy-MM-dd" }
```

## 5. SQL objekti

Tenant baza (`ooSLABUS` / NT `ooSLABUS_20260423_NT`):

| Objekt | Uloga |
|---|---|
| `MobKorisnik` | identity + `PushToken` |
| `spMobKorisnikSave` | TOKEN / CLEAR_TOKEN |
| `DispRasporedObavijest` + `spDispRasporedObavijestSave` Action=`send` | već iz Pošalji |
| `spDispRasporedObavijestList` / odgovor | već u Expo Fazi 2 |

**Nema novih SQL objekata u Opera Mobile repou** za v1. Ako na live `ooSLABUS` tablice/SP nisu deployani — **nepoznato**, kolega potvrđuje.

## 6. JSON layouti

Nema. Raspored nije dgl/gen layout.

## 7. Utjecaj na druge module

| Modul | Utjecaj |
|---|---|
| `raspored-mobile` | registracija + deep link |
| `servis-mobile` / dgl / gen | nema promjene ponašanja; PushBootstrap miruje ili samo drži token ako je ista sesija |
| Auth / CC | bez MOB logina; token tek kad imamo ERP `sifosobe` i (preferirano) ulazak u Raspored ili CC nakon logina |

Preporuka trenutka registracije: **nakon uspješnog App PIN unlocka za `raspored-mobile`** (najuži scope, manje šuma). Alternativa: nakon ERP logina za sve SB korisnike — šire, ali Servis korisnici bez `MobKorisnik` reda dobiju grešku TOKEN → logirati i ne blokirati UI.

**Odabrano:** registracija pri ulasku u Raspored (+ ponovno kad se token osvježi). CLEAR_TOKEN na Odjava ako je token bio registriran.

## 8. Utjecaj na druge klijente i tenante

Samo tenant s Disp MobKorisnik + Pošalji (SB). Ostali tenanti: kod postoji, ali se ne aktivira bez Raspored puta / token save ne zove se. Ne dirati generički Opera push za sve tenante u ovom PR-u.

## 9. Sloj implementacije

1. **Expo klijent** — primarni rad (token, listeneri, router).
2. **Disp ops / kolega** — checklist ispod (bez obavezne izmjene Disp koda ako Expo kanal već radi na deployanom API-ju).
3. **SQL** — samo ako live nema `MobKorisnik` / SP (kolega deploy).
4. **Firebase** — **nije** u kritičnom putu za Android v1 (Expo token). Kasnije opcioni hardening.

### Koraci implementacije (nakon odobrenja)

**Korak 1 — Disp checklist (kolega, paralelno)**  
- Potvrditi na **live** `ooSLABUS`: tablica + SP-ovi postoje.  
- Za test vozača: aktivan `MobKorisnik` s `SifOsobe` = ERP sesija vozača (ne samo `svam` ako nema reda).  
- Potvrditi da `dispapi` može zvati Expo Push HTTP (outbound). Firebase **nije** potreban dok su tokeni Expo.  
- Kad web Pošalji → response: `sent` vs `no_token` / `failed` (UI ili log).  
- Kasnije (ne blokira v1): Firebase project + `Push:FirebaseCredentials*` + usklađen `google-services.json` ako ikad pređemo na native FCM.

**Korak 2 — Expo ovisnost + config**  
- `expo-notifications` + plugin u `app.config.ts` (Android default channel, iOS background mode priprema).  
- **Android EAS FCM (obavezno za delivery):** Firebase Android app za package `com.opera.mobile` (i preview `com.opera.mobile.preview` ako testiramo preview APK) → `google-services.json` u `expo/` + `android.googleServicesFile` u configu → FCM V1 service account upload na EAS (`eas credentials`). Bez ovoga Disp može poslati na `exp.host`, ali uređaj ne prima.  
- Rebuild preview/dev APK (stari APK bez native modula neće primati).

**Korak 3 — API + registracija**  
- `pushApi.ts` + `registerPush.ts` (permission → Expo token → TOKEN save).  
- Hook na Raspored mount; tihi fail + log ako nema `MobKorisnik`.

**Korak 4 — Router + UI**  
- `PushBootstrap`: cold start + tap → `notificationRouter` → `/(app)/raspored` Aktualno + refresh obavijesti/voznog reda.  
- Foreground: OS banner ili in-app — minimalno ne gutati event bez navigacije na tap.

**Korak 5 — E2E smoke**  
- Uređaj s novim APK → Raspored → token u `MobKorisnik.PushToken`.  
- Disp Pošalji dan → notifikacija → tap → Aktualno s pending/confirmed stanjem.

**Korak 6 — iOS priprema (bez store)**  
- Isti TS kod; plugin/infoPlist; bez APNs cert / TestFlight u ovom PR-u.

## 10. Rizici i otvorena pitanja

| Rizik | Ublažavanje |
|---|---|
| Nema `MobKorisnik` za ERP `sifosobe` | Checklist + admin INSERT; app ne ruši se |
| Firebase nije konfiguriran | Expo token kanal (namjerno) |
| `PushToken` NVARCHAR(512) prekratak | Expo tokeni stanu; native FCM+APNs dulji stringovi — pratiti pri budućem native |
| Jedan uređaj po vozaču | Očekivano; novi telefon prepisuje token |
| Preview package `com.opera.mobile.preview` vs production | Expo projectId već u `app.config.ts`; testirati na istom EAS projektu |
| Live SP/tablica nisu deployani | **nepoznato** — kolega |
| Auth pravilo (ne mijenjati auth) | Poštovano — nema MOB logina |

Otvoreno za potvrdu kolege (ne blokira pisanje koda, blokira E2E “zeleno”):

1. Je li `MobKorisnik` na produkcijskom `ooSLABUS`?  
2. Radi li outbound prema `exp.host` s IIS/dispapi?  
3. Koji test vozač (`SifOsobe` + MobKorisnik + ERP login) koristimo za smoke?

## 11. Plan testiranja

1. Ulazak u Raspored → permission → u bazi `PushToken` počinje s `ExponentPushToken[`.  
2. Ponovni ulazak → token osvježen, nema crasha.  
3. Disp Pošalji za taj `SifOsobe` → `sent`, ne `no_token`.  
4. App u backgroundu → banner → tap → Raspored Aktualno.  
5. App killed → tap → cold start → isti ekran.  
6. App foreground → tap/response i dalje vodi na Aktualno.  
7. Negativno: vozač bez `MobKorisnik` → Raspored i dalje radi; token save fail je tih.  
8. Servis app na istom uređaju → bez regresije liste/dokumenata.  
9. Regresija: potvrda dana (Potvrdi) i dalje radi.

## 12. Kriteriji prihvaćanja

- [ ] Android build s `expo-notifications` prima push nakon Disp Pošalji za vozača s tokenom.  
- [ ] Tap (background + killed) otvara Raspored **Aktualno**.  
- [ ] Nema MOB login ekrana; ERP + App PIN tok nepromijenjen.  
- [ ] Token se snima preko `spMobKorisnikSave` TOKEN + `SifOsobe`.  
- [ ] `notificationRouter` ima jedan switch po `type` — spreman za buduće tipove.  
- [ ] iOS: config/plugin pripremljen; nema tvrdnje da iOS runtime radi.  
- [ ] Dokumentacija: design + decision log ažurirani.

## Documentation impact

- Tehničko ponašanje: da — SB Raspored push  
- Korisnički flow: da — vozač prima i otvara obavijest  
- Screenshot: ne nužno  
- Arhitektonska odluka: da — A + Expo push token za v1  

## Rollback

- Feature flag / ne zvati `registerPush` → app bez pusha, ostalo radi.  
- Revert commitova u `expo/src/features/push` + plugin; rebuild APK.  
- Token u bazi: `CLEAR_TOKEN` ili ostaje harmless.  
- Disp Pošalji i `DispRasporedObavijest` ostaju (inbox u app i bez pusha).

## Poruka za kolegu (Disp) — copy/paste

1. Live `ooSLABUS`: postoje li `MobKorisnik` + `spMobKorisnikSave` + push SP-ovi?  
2. Za smoke: jedan aktivan `MobKorisnik` čiji `SifOsobe` odgovara ERP loginu vozača kojeg testiramo u Opera Mobile.  
3. Android v1 šaljemo **Expo** tokene (`ExponentPushToken[…]`) — `PushService` već ima `SendExpoAsync`; **Firebase nije potreban** za ovaj korak. Molim potvrdu da server smije HTTP na `exp.host`.  
4. Pošalji i dalje šalje `data.type=raspored_obavijest` + `datum`.  
5. Firebase credentials ostaju kasniji ops zadatak ako želimo native FCM/APNs.  
6. Nije potreban novi MOB login u Opera Mobile za snimanje tokena.
