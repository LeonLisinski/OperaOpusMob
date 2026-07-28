# Struktura projekta

Expo aplikacija u `expo/` organizirana je po funkcionalnim vertikalama, ne po kopiji Ionic mape.

## Mape

```
expo/
├── app/                    Expo Router - samo rute i tanki screen wrapperi
│   ├── index.tsx           Bootstrap (session → redirect)
│   ├── (auth)/             Core PIN, ERP login
│   └── (app)/              Autentificirani dio
│       ├── apps.tsx        Kontrolni centar
│       ├── settings.tsx    Postavke
│       ├── app-unlock.tsx  App PIN
│       ├── modules/        Popis modula
│       └── documents/      Lista, detalj, forma, stavke, privitci, potpis
├── src/
│   ├── components/         Dijeljene UI komponente
│   ├── features/           Poslovna logika po domeni
│   │   ├── auth/           Core PIN, login, logout, storage
│   │   ├── core/           Aplikacije, moduli, App PIN
│   │   └── documents/      Generički engine za dgl + gen module
│   ├── services/           API, storage, device, files
│   ├── store/              Redux store + typed hookovi
│   └── theme/              Boje, spacing, tipografija, tema
└── assets/                 Ikone, splash, logotip
```

## Načelo: rute vs logika

| Sloj | Odgovornost |
|---|---|
| `app/**/*.tsx` | Navigacija, layout opcije, povezivanje s Redux-om |
| `src/features/*` | Thunkovi, reduceri, poslovna pravila |
| `src/services/*` | HTTP, perzistencija, device identity |
| `src/components/*` | Prezentacijske komponente bez poslovne logike |

Route komponente **ne pozivaju API direktno** - koriste dispatch thunkova.

## Tok autentifikacije

```
app/index.tsx
  → bootstrapSession (authSlice)
  → nema core?  → (auth)/unlock
  → nema user?  → (auth)/login
  → inače       → (app)/apps
```

## Tok dokumenata

```
modules/[code].tsx          odabir modula
  → documents/list.tsx      popis (loadDocumentModule)
  → documents/detail.tsx    read-only detalj
  → documents/form.tsx      uređivanje / novi
  → documents/lines.tsx     stavke / rad (tab)
  → documents/attachments.tsx
  → documents/signature.tsx
```

`DocumentTabBar` na dnu povezuje tabove - vidljivost ovisi o modulu i dokumentu.

## Redux moduli

| Slice | Sadržaj |
|---|---|
| `auth` | Core config, user, connection, bootstrap, login/unlock status |
| `core` | Popis aplikacija, odabrana app, moduli, App PIN unlock |
| `documents` | Layout, lista, filter, odabrani dokument, stavke, privitci, forma |

## Tema

`src/theme/` definira:

- `colors` - light/dark palete, brand `#496C60`
- `spacing`, `typography`, `radius`, `shadows`
- `ThemeProvider` + `useTheme()` hook

Komponente koriste tokene, ne hardkodirane boje.

## Što namjerno nije u expo/

| Ionic (`src/`) | Status u Expo |
|---|---|
| `pages/servis/` | Nije migrirano - hardkodirani SP-ovi |
| `pages/dgl/` + `pages/gen/` | Zamijenjeno jednim `documents` engineom |
| Capacitor plugini | Zamijenjeno Expo ekvivalentima |

Jedan generički engine opslužuje **dgl** i **gen** module preko JSON layouta - v. [JSON layouti](./json-layouti).
