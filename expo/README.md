# Opera Mobile — Expo aplikacija

Ciljna cross-platform (Android + iOS) implementacija Opera Mobile aplikacije. Ionic aplikacija u `../src/` ostaje produkcijska referenca dok ova aplikacija ne dokaže funkcionalni paritet — v. `../docs/ai/MIGRATION_STRATEGY.md`.

## Pokretanje

```bash
npm install
npx expo start
```

U izlazu terminala odaberi otvaranje u development buildu, Android emulatoru ili iOS simulatoru.

## Struktura

- `app/` — Expo Router rute (file-based routing).
- `src/components/` — dijeljene komponente.
- `src/store/` — Redux Toolkit store i typed hookovi.
- `src/theme/` — centralizirani boje, spacing i tipografija tokeni.

## Provjere

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

## Dokumentacija

Arhitektonske granice i migracijska pravila su u `../.cursor/rules/` i `../docs/ai/`, ne u ovom README-u.
