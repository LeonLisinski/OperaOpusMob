# Opera Mobile dokumentacija

Razvojna i projektna dokumentacija migracije mobilnog klijenta OperaOpus ERP-a (SvamPlus) s Ionic/Capacitor aplikacije na Expo/React Native.

**Online verzija:** https://leonlisinski.github.io/OperaOpusMob/

Ionic aplikacija (`src/`) je postojeća produkcijska referenca. Expo aplikacija je ciljana zamjena koja se razvija ravnopravno za Android i iOS.

## Najvažniji dokumenti

- [Karta sustava](ai/SYSTEM_MAP.md) - glavna ulazna točka, gdje je što u sustavu
- [Kontekst projekta](ai/PROJECT_CONTEXT.md) - poslovni kontekst i cilj migracije
- [Trenutna arhitektura](ai/CURRENT_ARCHITECTURE.md) - dokazano stanje Ionic aplikacije
- [Ciljna arhitektura](ai/TARGET_ARCHITECTURE.md) - potvrđeni principi za Expo (status: Draft)
- [Strategija migracije](ai/MIGRATION_STRATEGY.md) - faze migracije s kriterijima završetka
- [Otvorena pitanja](ai/OPEN_QUESTIONS.md) - što još blokira pojedine odluke

## Struktura

```
docs/
├── user/           upute za korisnike aplikacije
├── technical/      dokumentacija za developere
└── ai/             kanonska arhitektura i migracija
```

**Online verzija:** https://leonlisinski.github.io/OperaOpusMob/

### `docs/user/`

Upute za krajnje korisnike aplikacije, na hrvatskom, organizirane po zadatku. Opisuje samo funkcionalnosti implementirane u Expo verziji.

| Dokument | Sadržaj |
|---|---|
| [Pregled](user/index.md) | Tko koristi app, osnovni tok, što nije dostupno |
| [Prvi koraci](user/pocetak.md) | Core PIN, prijava, ponovna aktivacija |
| [Kontrolni centar](user/kontrolni-centar.md) | Aplikacije, App PIN, moduli |
| [Dokumenti](user/dokumenti.md) | Popis, filter, detalj, uređivanje |
| [Stavke, privitci, potpis](user/stavke-privitci-potpis.md) | Tabovi unutar dokumenta |
| [Postavke](user/postavke.md) | Izgled, odjava, reset |

### `docs/technical/`

Dokumentacija za developere: razvojno okruženje, struktura koda, JSON layouti, API/state, build.

| Dokument | Sadržaj |
|---|---|
| [Pregled](technical/index.md) | Brzi start, tehnologije, granice |
| [Okruženje](technical/okruzenje.md) | Instalacija, pokretanje, provjere |
| [Struktura](technical/struktura.md) | Mape, rute, Redux, tema |
| [JSON layouti](technical/json-layouti.md) | MobLayoutsControls, queries.json |
| [API i state](technical/api-i-state.md) | Endpointi, slice-ovi, storage |
| [Build](technical/build.md) | Native build, testiranje, ograničenja |
| [Održavanje dokumentacije](technical/odrzavanje-dokumentacije.md) | Kada i gdje ažurirati docs nakon promjena |

### `docs/ai/`

Kanonski izvor istine o sustavu: potvrđene činjenice, arhitektonske odluke, poznati rizici i otvorena pitanja. Ovo je dokumentacija koju Cursor prvo čita da razumije projekt bez ponovnog istraživanja cijelog repozitorija.

| Dokument | Sadržaj |
|---|---|
| [`PROJECT_CONTEXT.md`](ai/PROJECT_CONTEXT.md) | Poslovni kontekst, tim, cilj migracije |
| [`SYSTEM_MAP.md`](ai/SYSTEM_MAP.md) | Glavna ulazna točka - gdje je što i kada to otvoriti |
| [`CURRENT_ARCHITECTURE.md`](ai/CURRENT_ARCHITECTURE.md) | Trenutno stanje Ionic aplikacije, dokazano iz koda i baze |
| [`TARGET_ARCHITECTURE.md`](ai/TARGET_ARCHITECTURE.md) | Planirani smjer za Expo - samo potvrđeni principi, status Draft |
| [`MIGRATION_STRATEGY.md`](ai/MIGRATION_STRATEGY.md) | Faze migracije s preduvjetima i kriterijima završetka |
| [`FEATURE_PARITY_MATRIX.md`](ai/FEATURE_PARITY_MATRIX.md) | Status migracije po funkcionalnoj cjelini |
| [`DECISION_LOG.md`](ai/DECISION_LOG.md) | Donesene odluke, s razlogom i posljedicama |
| [`KNOWN_RISKS.md`](ai/KNOWN_RISKS.md) | Rizici s dokazom, ublažavanjem i vlasnikom |
| [`OPEN_QUESTIONS.md`](ai/OPEN_QUESTIONS.md) | Pitanja koja blokiraju odluke, s statusom |

## Što je kanonski izvor

`docs/ai/` je izvor istine za arhitektonske činjenice i odluke. `docs/technical/` i `docs/user/` će te činjenice referencirati ili prevoditi u praktične upute, ne duplicirati. Ako neka tvrdnja u `technical/` ili `user/` proturječi `docs/ai/`, `docs/ai/` je mjerodavan dok se ne provjeri i uskladi.

## Kada se dokumentacija ažurira

Dokumentacija mora **pratiti stvarno ponašanje** - dodavanja, brisanja, izmjene logike, API-ja, layouta i arhitekture. Detaljan popis mjesta i checklist: **[Održavanje dokumentacije](technical/odrzavanje-dokumentacije.md)**.

Sažetak:

- Svaka **funkcionalna** promjena ide kroz checklist (matrica pariteta, `technical/`, `user/`, po potrebi `docs/ai/`).
- **Arhitektonske odluke** → `DECISION_LOG.md`; **nepoznato** → `OPEN_QUESTIONS.md`; **rizici** → `KNOWN_RISKS.md`.
- **`docs/ai/`** je kanonski izvor; `technical/` i `user/` ga ne smiju proturječiti.
- Samo vizualne promjene ne zahtijevaju docs osim ako tim eksplicitno traži.
- Plan većih promjena mora navesti dokumentacijski utjecaj; review provjerava usklađenost s **implementacijom**, ne s planom.
