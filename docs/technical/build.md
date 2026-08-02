# Build i testiranje

## Development build

Expo projekt koristi **`expo-dev-client`** — za puni native pristup (Secure Store, document picker, sharing, potpis) trebate development build, ne Expo Go.

```bash
cd expo
npx expo run:android
# ili na macOS:
npx expo run:ios
```

Prvi native build traje duže (preuzimanje Gradle/CocoaPods ovisnosti).

## Konfiguracija aplikacije

`expo/app.config.ts` (Ionic identitet, Expo pipeline):

| Polje | Vrijednost |
|---|---|
| Naziv | `Opera Mobile` (isto kao Capacitor) |
| Ikona / splash | Ionic `assets/icon.png`, `assets/splash.png` |
| Android/iOS production | `com.opera.mobile` — store update iste app |
| Android/iOS preview/dev | `com.opera.mobile.preview` — sideload bez konflikta potpisa |
| Verzija | `2.0.11` / versionCode `20011` (production: `autoIncrement`) |
| EAS profili | `development` / `preview` (APK) / `production` (AAB) |

Store: production + **isti signing keystore** kao Ionic na Playu. Preview je samo za interni test.

**Upload opseg:** repo je monorepo — EAS inače pakira **cijeli git root**. Root `.easignore` zato blacklist-a Ionic/`MobLayoutsControls`/`API`/`OperaWeb`/Capacitor `android` itd. Provjera: `npx eas-cli@latest build:inspect --platform android --stage archive --profile preview --output ./eas-archive-check` iz `expo/` — u arhivi smiju biti fajlovi samo pod `expo/`. EAS naredbe uvijek iz `expo/`.

## Provjere prije builda (zadnji check 2026-07-31)

```bash
cd expo
npm run typecheck   # OK — 0 grešaka
npm run lint        # OK — 0 errors
npx expo-doctor     # OK — 20/20
```

SDK paketi usklađeni s `npx expo install --fix` (Expo ~57.0.9 / RN 0.86.2).

## Go / no-go za EAS (sljedeći korak)

**Spremno za pokretanje EAS buildova** (kad tim potvrdi runtime checklist):

- [x] `ios.bundleIdentifier` + `android.package`
- [x] `eas.json` profili (dev / preview APK / production AAB)
- [x] typecheck / lint / expo-doctor čisti
- [x] iOS privacy stringovi (photo library) + encryption flag
- [x] Android `versionCode` + keyboard resize
- [ ] `npx eas build:configure` — dodaje `extra.eas.projectId` (prvi put na Expo accountu)
- [ ] Apple Developer + Android keystore preko EAS Credentials (tvrtka, ne u gitu)
- [ ] Preview/production build prolazi na EAS
- [ ] iOS runtime isti checklist kao Android (još nije)

**Ne radi se u ovom koraku:** store submit, OTA, produkcijski rollout — tek nakon EAS + QA.

## Testiranje po platformi

| Platforma | Što testirati | Ograničenja |
|---|---|---|
| **Web** (`expo start --web`) | Navigacija, layout, Redux flow | Secure Store write, potpis, native file picker |
| **Android emulator/device** | Pun flow uklj. privitke, potpis | Preporučeno za paritet review |
| **iOS simulator/device** | Isto kao Android | Xcode / EAS potreban za build |

Feature Parity Matrix označava `verified` tek kad je paritet potvrđen na **obje** platforme.

## Web preview — poznata ograničenja

- **`expo-secure-store`** — čitanje/pisanje može failati; bootstrap i Core PIN zahtijevaju try/catch (implementirano)
- **`react-native-signature-canvas`** — ovisi o WebView; na webu ne radi pouzdano
- **`expo-sharing`** / **`expo-document-picker`** — native only
- **Direktna navigacija na URL** (npr. `/documents/lines`) gubi Redux state — uvijek krenuti od `/`

## Test tenant

Runtime provjere: **ooZJUKIC** — Core PIN `jukic001` → ERP `svam` → App PIN `plusplus` (**Android**). iOS checklist još nije.

Legacy `/servis/*` (MIDA): alias + fallback u kodu; runtime na uređaju **nepotvrđen** (nema lokalnog test PIN-a na SQL2022 za MIDA).

## Produkcijski build (sljedeći korak — još ne)

```bash
cd expo
npx eas login
npx eas build:configure
npx eas build -p android --profile preview   # interna APK
npx eas build -p ios --profile preview       # Apple Developer
npx eas build -p android --profile production
npx eas build -p ios --profile production
```

Potpisivanje (keystore / Apple certifikati) ide kroz EAS credentials — ključevi tvrtke, ne u gitu.

Ionic u `src/` ostaje produkcija dok Expo store release nije odobren. Push samo na remote `github` tijekom migracije (ne TFS `origin`).

## Dokumentacija promjena

Nakon funkcionalne promjene prođi checklist u **[Održavanje dokumentacije](./odrzavanje-dokumentacije)**.

Ukratko:

- `docs/ai/FEATURE_PARITY_MATRIX.md` — status pariteta
- `docs/user/` — korisnički tok
- `docs/technical/` — struktura, API, setup
- `docs/ai/` — arhitektura, odluke, rizici, otvorena pitanja

Ne ažurirati dokumentaciju samo za vizualne promjene osim ako tim eksplicitno traži.
