# Build i testiranje

## Development build

Expo projekt koristi **`expo-dev-client`** - za puni native pristup (Secure Store, document picker, sharing, potpis) trebate development build, ne Expo Go.

```bash
cd expo
npx expo run:android
# ili na macOS:
npx expo run:ios
```

Prvi native build traje duže (preuzimanje Gradle/CocoaPods ovisnosti).

## Konfiguracija aplikacije

`expo/app.json`:

| Polje | Vrijednost |
|---|---|
| Android package | `com.opera.mobile` |
| iOS bundle ID | `com.opera.mobile` |
| EAS konfiguracija | `expo/eas.json` (development / preview / production profile) |
| Scheme | `operamobile` |
| Orientacija | portrait |

Verzija: `expo.version` (trenutno `1.0.0`).

## Provjere prije builda

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

## Testiranje po platformi

| Platforma | Što testirati | Ograničenja |
|---|---|---|
| **Web** (`expo start --web`) | Navigacija, layout, Redux flow | Secure Store write, potpis, native file picker |
| **Android emulator/device** | Pun flow uklj. privitke, potpis | Preporučeno za paritet review |
| **iOS simulator/device** | Isto kao Android | Xcode potreban za build |

Feature Parity Matrix označava `verified` tek kad je paritet potvrđen na **obje** platforme.

## Web preview - poznata ograničenja

- **`expo-secure-store`** - čitanje/pisanje može failati; bootstrap i Core PIN zahtijevaju try/catch (implementirano)
- **`react-native-signature-canvas`** - ovisi o WebView; na webu ne radi pouzdano
- **`expo-sharing`** / **`expo-document-picker`** - native only
- **Direktna navigacija na URL** (npr. `/documents/lines`) gubi Redux state - uvijek krenuti od `/`

## Test tenant

Dosadašnje runtime provjere koristile su tenant **ooZJUKIC** (Android) za listu/filter module. ERP login i Core PIN nisu testirani na produkcijskom API-ju u razvojnom okruženju (nema test credentials u repou).

Za timski test: dogovoriti test PIN, test korisnika i modul s poznatim layoutom.

## Produkcijski build

Produkcijski build pipeline (EAS, potpisivanje, store upload) **nije postavljen** u ovom repozitoriju. Ionic aplikacija u `src/` i dalje služi produkciji.

Kad bude potrebno:

1. Postaviti `ios.bundleIdentifier`
2. Konfigurirati EAS Build ili lokalni release build
3. Potpisivanje ključevima tvrtke

## Dokumentacija promjena

Nakon funkcionalne promjene prođi checklist u **[Održavanje dokumentacije](./odrzavanje-dokumentacije)**.

Ukratko:

- `docs/ai/FEATURE_PARITY_MATRIX.md` - status pariteta
- `docs/user/` - korisnički tok
- `docs/technical/` - struktura, API, setup
- `docs/ai/` - arhitektura, odluke, rizici, otvorena pitanja

Ne ažurirati dokumentaciju samo za vizualne promjene osim ako tim eksplicitno traži.
