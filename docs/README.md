# Opera Mobile dokumentacija

Razvojna i projektna dokumentacija migracije mobilnog klijenta OperaOpus ERP-a (SvamPlus) s Ionic/Capacitor aplikacije na Expo/React Native.

Ionic aplikacija (`src/`) je postojeća produkcijska referenca. Expo aplikacija je ciljana zamjena koja se razvija ravnopravno za Android i iOS.

## Najvažniji dokumenti

- [Karta sustava](ai/SYSTEM_MAP.md) — glavna ulazna točka, gdje je što u sustavu
- [Kontekst projekta](ai/PROJECT_CONTEXT.md) — poslovni kontekst i cilj migracije
- [Trenutna arhitektura](ai/CURRENT_ARCHITECTURE.md) — dokazano stanje Ionic aplikacije
- [Ciljna arhitektura](ai/TARGET_ARCHITECTURE.md) — potvrđeni principi za Expo (status: Draft)
- [Strategija migracije](ai/MIGRATION_STRATEGY.md) — faze migracije s kriterijima završetka
- [Otvorena pitanja](ai/OPEN_QUESTIONS.md) — što još blokira pojedine odluke

## Struktura

```
docs/
├── ai/            kanonska dokumentacija
├── technical/      dokumentacija za developere — nastaje u sljedećim serijama
└── user/          dokumentacija za korisnike aplikacije — nastaje u sljedećim serijama
```

### `docs/ai/`

Kanonski izvor istine o sustavu: potvrđene činjenice, arhitektonske odluke, poznati rizici i otvorena pitanja. Ovo je dokumentacija koju Cursor prvo čita da razumije projekt bez ponovnog istraživanja cijelog repozitorija.

| Dokument | Sadržaj |
|---|---|
| [`PROJECT_CONTEXT.md`](ai/PROJECT_CONTEXT.md) | Poslovni kontekst, tim, cilj migracije |
| [`SYSTEM_MAP.md`](ai/SYSTEM_MAP.md) | Glavna ulazna točka — gdje je što i kada to otvoriti |
| [`CURRENT_ARCHITECTURE.md`](ai/CURRENT_ARCHITECTURE.md) | Trenutno stanje Ionic aplikacije, dokazano iz koda i baze |
| [`TARGET_ARCHITECTURE.md`](ai/TARGET_ARCHITECTURE.md) | Planirani smjer za Expo — samo potvrđeni principi, status Draft |
| [`MIGRATION_STRATEGY.md`](ai/MIGRATION_STRATEGY.md) | Faze migracije s preduvjetima i kriterijima završetka |
| [`FEATURE_PARITY_MATRIX.md`](ai/FEATURE_PARITY_MATRIX.md) | Status migracije po funkcionalnoj cjelini |
| [`DECISION_LOG.md`](ai/DECISION_LOG.md) | Donesene odluke, s razlogom i posljedicama |
| [`KNOWN_RISKS.md`](ai/KNOWN_RISKS.md) | Rizici s dokazom, ublažavanjem i vlasnikom |
| [`OPEN_QUESTIONS.md`](ai/OPEN_QUESTIONS.md) | Pitanja koja blokiraju odluke, s statusom |

### `docs/technical/` (planirano)

Dokumentacija za developere i buduće održavatelje: razvojno okruženje, kako dodati modul, debugging, build i deployment. Referencirat će `docs/ai/` umjesto da ponavlja iste činjenice.

### `docs/user/` (planirano)

Upute za krajnje korisnike aplikacije, na hrvatskom, organizirane po zadatku. Ne dokumentira funkcionalnost koja još ne postoji.

## Što je kanonski izvor

`docs/ai/` je izvor istine za arhitektonske činjenice i odluke. `docs/technical/` i `docs/user/` će te činjenice referencirati ili prevoditi u praktične upute, ne duplicirati. Ako neka tvrdnja u `technical/` ili `user/` proturječi `docs/ai/`, `docs/ai/` je mjerodavan dok se ne provjeri i uskladi.

## Kada se dokumentacija ažurira

Dokumentacija se mijenja samo kad se promijeni **stvarno ponašanje, arhitektura ili način održavanja** — ne za svaku sitnu izmjenu koda. Svaki plan promjene (`.cursor/skills/plan-project-change`) mora navesti dokumentacijski utjecaj; svaki pregled (`.cursor/skills/review-and-document`) provjerava da je dokumentacija usklađena sa stvarnom implementacijom, ne s planom.

Nepotvrđeno se ne piše kao potvrđeno. Ono što nije provjereno ide u `OPEN_QUESTIONS.md`, ne u opis arhitekture.
