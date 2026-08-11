# Build i testiranje

## Development build (lokalno)

Expo koristi **`expo-dev-client`** — za puni native (Secure Store, document picker, sharing, potpis, push) treba development / native build, ne klasični Expo Go.

```bash
cd expo
npx expo start
# puni lokalni Android build + instalacija:
npx expo run:android
```

Prvi native build traje duže (Gradle ovisnosti).

Detaljan handoff (account, profili, Git): **[Upute za preuzimanje](/preuzimanje/)**.

## Konfiguracija aplikacije

`expo/app.config.ts`:

| Polje | Vrijednost |
|---|---|
| Naziv | `Opera Mobile` |
| Expo owner / slug | `svampluss-team` / `operamobile` |
| Android/iOS production | `com.opera.mobile` |
| Android/iOS preview/dev | `com.opera.mobile.preview` |
| Verzija (app) | `2.0.12` / versionCode `20012` |
| EAS projectId | u `extra.eas.projectId` |

`APP_VARIANT` (`eas.json` `env`) bira package: `preview`/`development` → `.preview`; inače production package.

**Push:** `google-services.json` samo za `com.opera.mobile`. Preview APK **nema** FCM file u configu — za push test koristi profil `apk-production` ili `production`.

**EAS upload:** monorepo — root `.easignore` isključuje Ionic / `MobLayoutsControls` / `API` / `OperaWeb` / stari `android`. Naredbe uvijek iz `expo/`.

## EAS profili (`expo/eas.json`)

| Profil | Package (preko APP_VARIANT) | Android output | Namjena |
|---|---|---|---|
| `development` | preview | APK + dev client | Dev client |
| `preview` | preview | APK | Interni sideload uz Play Ionic |
| `apk-production` | production | APK | Sideload istog packagea (npr. push) — nije store |
| `production` | production | AAB | Play (`credentialsSource: local`) |

## Login na EAS

```bash
cd expo
npx eas login
npx eas whoami
```

Račun: Google **`svam.operaopus@gmail.com`** → tim https://expo.dev/accounts/svampluss-team  
Ako `whoami` nije timski account — `npx eas logout` pa ponovo login.

## Cloud build naredbe

```bash
cd expo
npx eas build -p android --profile preview
npx eas build -p android --profile apk-production
npx eas build -p android --profile production
```

Buildovi: https://expo.dev/accounts/svampluss-team/projects/operamobile/builds

Keystore / credentials: tvrtka, ne u gitu.

## Provjere prije builda

```bash
cd expo
npm run typecheck
npm run lint
npx expo-doctor
```

## Testiranje po platformi

| Platforma | Što | Ograničenja |
|---|---|---|
| Web (`expo start --web`) | Navigacija, layout, Redux | Secure Store write, potpis, push, native file picker |
| Android uređaj / emulator | Pun flow | Preporučeno za paritet |
| iOS | Portable kod | Runtime / store = **v2** |

`verified` u matrici pariteta = potvrda na **Androidu** za v1.

## Web preview — poznata ograničenja

- `expo-secure-store` — na webu nestabilan
- potpis (WebView) — na webu ne pouzdano
- `expo-sharing` / `expo-document-picker` / push — native
- Direktni deep link na `/documents/...` gubi Redux — kreni od app root toka

## Test tenant

**ooZJUKIC:** Core PIN `jukic001` → ERP `svam` → App PIN `plusplus` (Android).

Ostali tenanti (Jasika, SB, Mediva…) — PinCore / tim; v. [`FEATURE_PARITY_MATRIX`](/ai/FEATURE_PARITY_MATRIX).

## Git push

Tijekom migracije push na remote **`github`** (`LeonLisinski/OperaOpusMob`). TFS `origin` samo uz eksplicitno odobrenje.

## Dokumentacija promjena

Checklist: **[Održavanje dokumentacije](./odrzavanje-dokumentacije)**. Handoff: **[Upute za preuzimanje](/preuzimanje/)**.
