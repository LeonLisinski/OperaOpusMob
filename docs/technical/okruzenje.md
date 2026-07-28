# Razvojno okruženje

## Preduvjeti

- **Node.js** 20+ (preporučeno 22)
- **npm** (dolazi s Node.js)
- Za native build:
  - **Android** — Android Studio, JDK
  - **iOS** — Xcode (samo macOS)

## Instalacija

```bash
cd expo
npm install
```

Expo aplikacija ima **svoje ovisnosti** — ne koristi `node_modules` iz korijena repozitorija.

## Pokretanje

```bash
npx expo start
```

| Opcija u terminalu | Namjena |
|---|---|
| Development build | Na fizičkom uređaju s `expo-dev-client` |
| Android emulator | `a` |
| iOS simulator | `i` (macOS) |
| Web | `w` — brzi pregled UI-ja, **ne zamjenjuje** native test |

Web preview je koristan za layout i navigaciju, ali **ne podržava** sve native module (Secure Store pisanje, potpis, dijeljenje datoteka…).

### Direktno web

```bash
npm run web
# ili
npx expo start --web
```

## Provjere koda

```bash
npm run typecheck    # TypeScript
npm run lint         # ESLint (expo lint)
npx expo-doctor      # kompatibilnost Expo paketa
```

Pokrenite prije commita promjena u `expo/`.

## Dokumentacija (VitePress)

```bash
cd docs
npm install
npm run docs:dev     # lokalno na http://localhost:5173/OperaOpusMob/
npm run docs:build   # statični build u docs/.vitepress/dist/
```

Online verzija: https://leonlisinski.github.io/OperaOpusMob/

## Konfiguracija API-ja

API adresa dolazi iz **Core PIN odgovora** (`auth.serverpath`) — nema hardkodiranog URL-a u kodu aplikacije.

Za lokalni razvoj s mock podacima koristite web preview s presretanjem `fetch` poziva (npr. Playwright route interception) — produkcijski API endpoint nije u repozitoriju.

## Cursor / AI kontekst

Pravila projekta su u `.cursor/rules/`. Prije netrivijalne promjene koristite skill `plan-project-change` i provjerite utjecaj na sva tri UI modela (`servis`, `dgl`, `gen`) gdje je primjenjivo.
