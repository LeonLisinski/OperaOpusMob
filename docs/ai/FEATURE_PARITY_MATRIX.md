# Feature Parity Matrix

Prati status migracije po funkcionalnoj cjelini. Nije popis svih 757 JSON layout datoteka niti svih tenant varijanti.

Android i iOS su ravnopravne ciljane platforme (v. `TARGET_ARCHITECTURE.md`) — stupac "Testirani tenant" koristi oblik `tenant (platforma)`. Cjelina se ne smije označiti `verified` dok paritet nije potvrđen na **obje** platforme.

Zadnji runtime review: **2026-07-31**, tenant **ooZJUKIC** / PIN `jukic001` → ERP `svam` → App PIN `plusplus`, **Android** (Expo). iOS još nije prošao isti checklist.

## Statusi

| Status | Značenje |
|---|---|
| `not-analyzed` | Cjelina još nije detaljno analizirana za potrebe migracije |
| `analyzed` | Trenutno ponašanje je dokumentirano, migracija nije počela |
| `planned` | Plan promjene postoji i odobren je |
| `in-progress` | Implementacija u `expo/` je u tijeku |
| `parity-review` | Implementacija postoji; djelomično ili potpuno potvrđena na jednoj platformi |
| `verified` | Paritet potvrđen na test tenantu na Android **i** iOS |
| `blocked` | Migracija blokirana vanjskim faktorom |
| `v2` | Namjerno izvan v1 — v. `V2_BACKLOG.md` |

## Matrica

| Područje | Ionic izvor | Layout/API/SQL | Expo status | Testirani tenant | Kriterij pariteta | Otvoreni problemi / bilješke | Dokumentacija |
|---|---|---|---|---|---|---|---|
| Core PIN | `UnlockCore.tsx` | `/data` + `spPinCoreAzur` | parity-review | ooZJUKIC (Android) | Valjan core PIN → auth konfiguracija | Runtime OK na Androidu; iOS nepotvrđen | `CURRENT_ARCHITECTURE.md` §5.2 |
| ERP login | `Login.tsx` | `/login` | parity-review | ooZJUKIC (Android) | Isti uid/pwd → user/connection | Runtime OK (`svam`); iOS nepotvrđen | §5.2 |
| App PIN | `UnlockApp.jsx` | `spPinAppAzur` | parity-review | ooZJUKIC (Android) | Otključavanje daje isti unlocked | Runtime OK (`plusplus`); iOS nepotvrđen | §5.2 |
| Kontrolni centar | `TabAplikacije.jsx` | `spMob_Menu_Query` | parity-review | ooZJUKIC (Android) | Prikaz aplikacija / zaključanost | Favoriti/Profil → v2; Postavke u header ikoni | §5.5, §7.5 |
| Meni i moduli | `Modules.tsx` | `spMob_Menu_Query` table2 | parity-review | ooZJUKIC (Android) | Navigacija po `module.url` | `dgl`/`gen` OK; `/servis/*` → Alert „nije implementiran” (Faza 4) | §7.5 |
| Generička lista | `dgl/List`, `gen/List` | `/doclayouts`, `queries.*.list` | parity-review | ooZJUKIC (Android) | Ista lista/polja za isti modul | RNint, RNodr, CRM Upiti potvrđeni na Androidu | §3.1, §7.3 |
| Filteri i pretraga | dgl/gen store filter | `filterdefaults`, `statusi`, `searchfields` | parity-review | ooZJUKIC (Android) | Isti SP parami; pretraga nad listom | Date picker OK; badge filtera vizualno OK; **filter cache po modulu** (Upiti↔RN) potvrđen u sesiji 2026-07-31 | §8.4 |
| Detalj dokumenta | `Tab1` / `TabInfo` | `*ViewItems`, `visiblefield` | parity-review | ooZJUKIC (Android) | Isti prikaz polja/sekcija | Info tab na RN i Upiti OK | §7.3 |
| Uređivanje forme | `MasterAzur` | `*EditItems`, azur SP | parity-review | ooZJUKIC (Android) | Kontrole + spremanje | Datumi, text, memo, sifarnik OK; memo „Odabir teksta” → v2 | §7.4 |
| Stavke (dst) | `Tab3`, `DetailAzurNew` | `dst*`, `spMob_*_DST_*` | parity-review | ooZJUKIC (Android) | CRUD + swipe flagovi s retka | Runtime patch `dst.azur/delete` iz list SP; `parentdstid` u JSON; sati `dstdatum2temp` HHmm; swipe/podstavke/Rad tab — Android OK | §7.3, §9.4 |
| Šifrarnici | `search.jsx` | `spMob_*_Sifarnici` | parity-review | ooZJUKIC (Android) | simple/advanced rezultati | CRM: ne slati `azurFieldKey` kao SP param — popravljeno i potvrđeno | §7.4 |
| Privitci (dgl) | `TabPrivitci.jsx` | `/saveatt`, `/getatt`, `prilozi` | parity-review | ooZJUKIC (Android) | Lista/upload/open | Tab + lista viđeni; puni upload/open checklist na uređaju još kratak | §10.4 |
| Potpis + REPX (dgl) | `Tab4.jsx` | `insertSignature`, `/repxreport` | parity-review | ooZJUKIC (Android) | Potpis + izvještaj | SP prima samo Signature/Text/TextField (bez email parama); native canvas — potvrditi još jednom na iOS | §10.2, §10.5 |
| gen Akcije (kreiraj RN) | `TabAkcije.jsx` | `queries.gla.createdoc` | parity-review | ooZJUKIC (Android) | Kreiraj RN → otvori dgl | CreateDoc ne vraća sifdv → lookup preko `spMob_ZJUKIC_DGL_Query`; prebacivanje CC na RN modul; povratak na Upite s filter cache | plan Faza 2 |
| Postavke | `TabPostavke` | local prefs | parity-review | - | Dark mode, verzija, reset, odjava | Web preview ranije; Android smoke u auth sesiji | §12 |
| Odjava | `logOut` | Preferences `user` | parity-review | ooZJUKIC (Android) | Briše samo user | OK | §5.4 |
| Legacy `/servis/*` | `src/pages/servis/` | hardkod SP | analyzed | - | Isti ekrani kao Ionic servis | **Nije u Expo**; inventar menija = sljedeći korak v1 | plan Faza 4 |
| Push | Capacitor push demo | - | v2 | - | - | `V2_BACKLOG.md` | - |
| CC Favoriti / Profil | CC tabovi | - | v2 | - | - | `V2_BACKLOG.md` | - |

## Review log — 2026-07-31 (Android / ooZJUKIC)

### Potvrđeno u sesiji
- Auth lanac: Core PIN → ERP login → App PIN → CC → moduli
- dgl RN (npr. RNint / RNodr): lista, filteri, detalj, forma, stavke, Rad, podstavke
- gen CRM Upiti: Info + Akcije → kreiraj RN → otvori → kontekst RN; povratak na Upite s pamćenjem filtera
- SP payload ispravke: `parentdstid` u jsonUpdatedValues; potpis bez email SP parama; CRM sifarnik bez `azurFieldKey`; sati HHmm za `dstdatum2temp`
- UI: date picker confirm; filter badge clip; filter cache po modulu

### Još za zatvoriti v1 (izvan same matrice)
1. iOS isti checklist (niti jedna cjelina nije `verified` bez iOS)
2. Inventar `/servis/*` u aktivnom meniju → port ili potvrda da nije u upotrebi
3. EAS Android + iOS release/preview build
4. Privitci: svjesni upload + open na uređaju (kratki smoke)
5. Potpis: end-to-end save + REPX na uređaju (Android već djelomično; iOS obavezno)

### Namjerno van v1
Push, Favoriti, Profil, memo „Odabir teksta”, kamera u privitcima, EAS OTA — v. `V2_BACKLOG.md`.
