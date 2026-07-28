# Tehnička dokumentacija

Praktične upute za developere koji rade na **Opera Mobile** Expo aplikaciji.

Za arhitektonske detalje, odluke i status migracije v. [AI dokumentacija](/ai/SYSTEM_MAP) - ovdje je fokus na **kako pokrenuti, razumjeti strukturu i raditi u kodu**.

## Repozitorij

```
ERP-IONIC7/
├── src/                  Ionic referenca (produkcija, ne dirati bez odobrenja)
├── expo/                 Expo/React Native aplikacija (cilj)
├── MobLayoutsControls/   JSON layouti po tenant-u
├── docs/
│   ├── user/             Korisničke upute
│   ├── technical/        Ova dokumentacija
│   └── ai/               Kanonska arhitektura i migracija
└── .cursor/rules/        Pravila za AI i developere
```

## Sadržaj

| Stranica | Opis |
|---|---|
| [Razvojno okruženje](./okruzenje) | Instalacija, pokretanje, provjere |
| [Struktura projekta](./struktura) | Mape, rute, state, servisi |
| [JSON layouti](./json-layouti) | Kako konfiguracija definira UI |
| [API i state](./api-i-state) | Pozivi na backend, Redux slice-ovi |
| [Build i testiranje](./build) | Android/iOS build, ograničenja web preview-a |

## Brzi start

```bash
cd expo
npm install
npx expo start
```

U terminalu odaberite platformu (development build, emulator, web).

## Tehnologije

| Sloj | Tehnologija |
|---|---|
| Framework | Expo SDK 57, React Native 0.86 |
| Navigacija | Expo Router (file-based) |
| State | Redux Toolkit |
| Jezik | TypeScript |
| API | `fetch` + Basic Auth (centralni klijent) |
| Storage | `expo-secure-store` + AsyncStorage |

## Granice

- **`src/`** je produkcijska referenca - ne mijenjati bez eksplicitnog zadatka
- **`MobLayoutsControls/`** se ne mijenja bez odobrenog zadatka za konkretan layout
- Backend API **nije u ovom repozitoriju** - ponašanje se ne izmišlja
