# System Map

Ovo je glavna ulazna točka za orijentaciju u projektu. Cilj je da se ovaj dokument učita prvi, umjesto da se sustav istražuje iznova svaki put.

| Područje | Glavne datoteke / folderi | Odgovornost | Kada otvoriti | Povezani dokument |
|---|---|---|---|---|
| Ionic bootstrap i routing | `src/main.tsx`, `src/App.tsx`, `src/AppMain.tsx` | Mount aplikacije, cold start (`checkRememberMe`), sve rute, `PrivateRoute` | Pratiš li tok od pokretanja aplikacije do prvog ekrana; dodaješ novu rutu | `CURRENT_ARCHITECTURE.md` §3–4 |
| Auth (core PIN, login, app PIN) | `src/pages/auth/`, `src/pages/core/cc/components/UnlockApp.jsx`, `src/components/PrivateRoute.tsx` | Tri faze autentikacije, Preferences ključevi `auth`/`user`/`connection`/`unlocked` | Diraš login/PIN flow, sesiju ili zaštitu ruta | `CURRENT_ARCHITECTURE.md` §5 |
| API backend (reference-only) | `API/Service.Gen/Controllers/`, `API/Service.Helpers/` | ASP.NET Web API servis - izvor istine za endpointe, auth, JSON transformacije SP odgovora | Potvrđuješ stvarni API ugovor (request/response) pri Expo migraciji; **ne mijenjaj** kod u `API/` | `CURRENT_ARCHITECTURE.md` §6 |
| Redux storeovi | `src/pages/*/store/index.jsx`, `src/store/rootReducer.ts`, `src/store/store.tsx` | State po modulu: `auth`, `core.cc`, `servis.*`, `docs` (=dgl), `gen` | Pratiš odakle dolazi state na ekranu ili dodaješ novi thunk | `CURRENT_ARCHITECTURE.md` §8 |
| `servis/` modul (legacy) | `src/pages/servis/` (npr. `RadniNalozi/`, `DnevniIzvjestaj/`) | Hardkodirani ekrani i fiksni SP-ovi po modulu | Radiš na Radnim nalozima ili Dnevnom izvještaju | `CURRENT_ARCHITECTURE.md` §3.1, §10.2 |
| `dgl/` modul (generički po dokumentu) | `src/pages/dgl/` | JSON-driven UI po `sifdv`, referentna generička implementacija | Radiš na generičkim dokumentima ili uspoređuješ s `gen/` | `CURRENT_ARCHITECTURE.md` §3.1, §7, §10.1 |
| `gen/` modul (generički po app/module) | `src/pages/gen/` | JSON-driven UI po `{app}/{module}`, paralelna implementacija `dgl/` | Radiš na modulima poput CRM Upiti | `CURRENT_ARCHITECTURE.md` §3.1, §7, §10.3 |
| `MobLayoutsControls/` | `MobLayoutsControls/**/*.json` | JSON definicije liste/view/edit forme i SP mapiranja po tenantu, izvan Git povijesti do sad | Mijenjaš ili analiziraš ponašanje jednog tenanta bez diranja koda | `CURRENT_ARCHITECTURE.md` §7, `KNOWN_RISKS.md` |
| Centralna `OperaMobile` baza | SQL Server `OperaMobile` (izvan repoa) - tablice `PinCore`, `PinApp`, `Server`, `App`, `Token`; SP-ovi `spPinCoreAzur`, `spPinAppAzur` | Registar uređaja, PIN-ova, servera i licenci aplikacija | Pratiš unlock/licenciranje ili biranje tenant baze | `CURRENT_ARCHITECTURE.md` §9.1–9.3 |
| Tenant ERP baze | SQL Server, po klijentu (npr. `ooMIDA_20230124`) - `spMob_*` procedure | Poslovni podaci, meni, dokumenti, stavke | Pratiš poslovnu logiku ili dodaješ/mijenjaš SP poziv | `CURRENT_ARCHITECTURE.md` §9.4–9.5 |
| Android build | `android/`, `capacitor.config.ts` | Capacitor Android projekt, native konfiguracija | Diraš native postavke, permissione ili build | `CURRENT_ARCHITECTURE.md` §11 |
| Expo aplikacija (cilj) | `expo/app/`, `expo/src/` (`components/`, `features/`, `services/`, `store/`, `theme/`) | React Native / Expo — v1 Android; auth, CC, dgl/gen dokumenti, raspored (SB), push token | Radiš na Expo migraciji | `TARGET_ARCHITECTURE.md`, `FEATURE_PARITY_MATRIX.md`, [`Upute za preuzimanje`](../preuzimanje/index.md) |
| Expo auth/core vertikala | `expo/app/(auth)/`, `expo/app/(app)/`, `expo/src/features/auth/`, `expo/src/features/core/`, `expo/src/services/api/`, `expo/src/services/storage/`, `expo/src/services/device/` | Session bootstrap, Core PIN, ERP login, CC, App PIN, moduli | Auth / CC / API klijent | `CURRENT_ARCHITECTURE.md` §5, §7.5, `FEATURE_PARITY_MATRIX.md` |
| Expo generički module-engine | `expo/app/(app)/documents/`, `expo/src/features/documents/`, `expo/src/services/api/{layoutsApi,documentsApi,reportsApi}.ts` | JSON-driven dgl/gen (lista, filter, detalj, forma, stavke, privitci, potpis) | Dokumenti / layout field tipovi | `FEATURE_PARITY_MATRIX.md`, `DECISION_LOG.md` |
| Expo raspored + push (SB) | `expo/app/(app)/raspored/`, `expo/src/features/raspored/`, `expo/src/features/push/` | Raspored UI + Expo push token / navigacija na Aktualno | SB raspored ili push | `SLABUS_RASPORED_DESIGN.md`, D039 |
| Referentni web projekt (reference-only) | `OperaWeb/`, `Dispecer/` | Web Opera / Disp — referenca, ne mobilni UX | Principi / SB Disp | - |
| Cursor rules i skills | `.cursor/rules/`, `.cursor/skills/` | Granice i postupci | Prije netrivijalne promjene | `docs/ai/`, `docs/preuzimanje/` |

## Kako se snaći u nepoznatoj temi

1. Provjeri ovu tablicu za područje i otvori povezani dokument.
2. Ako pitanje nije pokriveno dokumentacijom, koristi skill `trace-and-analyze-impact` da pratiš stvarni tok kroz kod, layout i bazu.
3. Ako je odgovor stvarno nepoznat (npr. backend ponašanje izvan repoa), provjeri je li već u `OPEN_QUESTIONS.md` prije nego pretpostaviš odgovor.

## Svi dokumenti u `docs/ai/`

[`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) · [`CURRENT_ARCHITECTURE.md`](CURRENT_ARCHITECTURE.md) · [`TARGET_ARCHITECTURE.md`](TARGET_ARCHITECTURE.md) · [`MIGRATION_STRATEGY.md`](MIGRATION_STRATEGY.md) · [`FEATURE_PARITY_MATRIX.md`](FEATURE_PARITY_MATRIX.md) · [`DECISION_LOG.md`](DECISION_LOG.md) · [`KNOWN_RISKS.md`](KNOWN_RISKS.md) · [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md)

## Napomena o dokumentima

- `CURRENT_ARCHITECTURE.md` opisuje **samo** dokazano trenutno stanje.
- `TARGET_ARCHITECTURE.md` opisuje **samo** potvrđene ciljne principe (status: Draft).
- Ne miješaj ta dva konteksta kad pišeš kod ili dokumentaciju.
