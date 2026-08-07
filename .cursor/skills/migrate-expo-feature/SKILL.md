---
name: migrate-expo-feature
description: Migrira jednu funkcionalnu cjelinu iz Ionic aplikacije u Expo uz dokazanu funkcionalnu jednakost. Koristi se za prijenos ekrana, modula ili flowa iz src/ u expo/, i za odluku je li migrirana cjelina spremna da zamijeni Ionic verziju.
disable-model-invocation: true
---

# Migracija funkcionalne cjeline u Expo

Migrira se **vertikalna cjelina**: ekran → state → service → API → layout. Ne pojedinačna komponenta.

## Preduvjeti

Ne kreći bez ovoga:

- Odobren plan (`plan-project-change`) za tu cjelinu
- Snimljeno ponašanje Ionic verzije (korak 1)
- Poznati tenanti koje cjelina dira i dostupnost njihovih layouta

## Koraci

### 1. Snimi ponašanje Ionic verzije — prije pisanja koda

Ovo je najvažniji korak i najčešće se preskoči. Pročitaj Ionic izvor i zapiši:

- Redoslijed poziva pri ulasku u ekran (npr. `dgl/List.jsx:initLoad` → `setSifDv` → `getDocsLayout` → `getSettings` → `getFilterDefaults` → `getStatuses` → `getList`)
- Koje layout ključeve čita i što radi kad ključ nedostaje
- Koji su default filteri i odakle dolaze
- Što se događa na grešku, na prazan rezultat, na pull-to-refresh
- Koja polja idu u `azur` poziv i u kojem obliku

Rezultat je **popis kriterija jednakosti**, ne opis koda.

### 2. Odredi što se ne prenosi

Prođi tablicu obrazaca u pravilu 20 i zapiši koje od njih ova cjelina sadrži. Za svaki: koji je ciljni obrazac i zašto je bolji. Ako cjelina postoji u dvije ili tri varijante (`servis`, `dgl`, `gen`), migrira se **jedna generička** — navedi koje su razlike varijanti i kako ih ciljna implementacija pokriva.

### 3. Implementiraj u `expo/`

Slojevi prema pravilu 20. Bez tenant imena u kodu. Layout se čita, ne prepisuje.

### 4. Dokaži jednakost

Za svaki kriterij iz koraka 1: usporedi Ionic i Expo na **istom tenantu i istom `sifdv`**, s istim podacima.

| Provjera | Kako |
|---|---|
| Isti podaci u listi | isti filter, isti broj i redoslijed stavaka |
| Isti API pozivi | usporedi request body-je |
| Iste vrijednosti u formi | polje po polje prema `*EditItems` |
| Isto spremanje | usporedi `azur` params |
| Isto ponašanje na grešku | isti scenarij greške |

Razlika koja je **namjerna** (npr. bolji prikaz greške) se zapisuje kao odluka. Razlika koja nije namjerna je bug.

### 5. Provjeri na više tenanta (Android za v1)

Tenant: najmanje jedan s osnovnim layoutom i jedan s tenant-specifičnim override-om. Ako cjelina dira tenanta čiji layout nemamo — to je **nepoznanica**, ne "prošlo".

Platforma: **v1 = Android** (Ionic produkcija). iOS checklist = **v2** (`V2_BACKLOG.md`, D038). `verified` za v1 ne zahtijeva iOS.

### 6. Zapiši status

Ažuriraj red cjeline u `docs/ai/FEATURE_PARITY_MATRIX.md` — status je jedan od: `not-analyzed`, `analyzed`, `planned`, `in-progress`, `parity-review`, `verified`, `blocked`. `verified` smije upisati samo nakon koraka 4 i 5 (dokazana jednakost na ≥ 2 tenanta gdje je to moguće, **Android**). Ionic verzija ostaje netaknuta.

## Obavezne provjere

- [ ] Kriteriji jednakosti zapisani **prije** pisanja Expo koda
- [ ] Sve tri varijante (`servis`, `dgl`, `gen`) analizirane, ciljna pokriva razlike
- [ ] Svih 5 tipova kontrola (`date`, `simple`, `advanced`, `memo`, `text`) radi ako ih cjelina koristi; `serija` ako layout koristi
- [ ] Testirano na ≥ 2 tenanta na **Androidu** (iOS → v2)
- [ ] Rollback opisan
- [ ] Ionic `src/` nije mijenjan

## Zabranjeno

- Prevoditi Ionic komponente jednu po jednu u React Native ekvivalente.
- Pisati Expo kod prije nego su kriteriji jednakosti zapisani.
- Ukloniti ili mijenjati Ionic implementaciju.
- "Poboljšati" poslovno pravilo usput. Poboljšanje je zaseban, odobren zadatak.
- Zaobići layout i hardkodirati polja jer je brže.
- Proglasiti cjelinu gotovom bez provjere na tenant varijanti.

## Kriteriji završetka

Cjelina radi u `expo/`, svaki kriterij jednakosti je provjeren i zabilježen, namjerne razlike su zapisane kao odluke, testirano na najmanje dva tenanta na Androidu (iOS → v2), rollback postoji, Ionic je netaknut, i dokumentacijski utjecaj je zapisan.
