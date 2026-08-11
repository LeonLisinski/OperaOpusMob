# Feature Parity Matrix

Prati status migracije po funkcionalnoj cjelini. Nije popis svih 757 JSON layout datoteka niti svih tenant varijanti.

Android je **v1 produkcijska** platforma (Ionic referenca je Android-only). iOS ostaje cilj koda (portable Expo), ali **runtime paritet + App Store idu u v2** (`V2_BACKLOG.md`, D038). Stupac "Testirani tenant" koristi oblik `tenant (platforma)`. Za v1, cjelina može biti `verified` nakon potvrde na **Androidu**; iOS se ne blokira kao uvjet v1 zatvaranja.

Zadnji runtime review: **2026-07-31**, tenant **ooZJUKIC** / PIN `jukic001` → ERP `svam` → App PIN `plusplus`, **Android** (Expo). MEDIVA Android smoke 2026-08-07 (u tijeku / OK po testeru). iOS checklist → v2.

## Statusi

| Status | Značenje |
|---|---|
| `not-analyzed` | Cjelina još nije detaljno analizirana za potrebe migracije |
| `analyzed` | Trenutno ponašanje je dokumentirano, migracija nije počela |
| `planned` | Plan promjene postoji i odobren je |
| `in-progress` | Implementacija u `expo/` je u tijeku |
| `parity-review` | Implementacija postoji; djelomično ili potpuno potvrđena na Androidu |
| `verified` | Paritet potvrđen na test tenantu na **Androidu** (v1). iOS potvrda = v2. |
| `blocked` | Migracija blokirana vanjskim faktorom |
| `v2` | Namjerno izvan v1 — v. `V2_BACKLOG.md` |

## Matrica

| Područje | Ionic izvor | Layout/API/SQL | Expo status | Testirani tenant | Kriterij pariteta | Otvoreni problemi / bilješke | Dokumentacija |
|---|---|---|---|---|---|---|---|
| Core PIN | `UnlockCore.tsx` | `/data` + `spPinCoreAzur` | parity-review | ooZJUKIC (Android) | Valjan core PIN → auth konfiguracija | Runtime OK na Androidu; iOS → v2 | `CURRENT_ARCHITECTURE.md` §5.2 |
| ERP login | `Login.tsx` | `/login` | parity-review | ooZJUKIC (Android) | Isti uid/pwd → user/connection | Runtime OK (`svam`); iOS → v2 | §5.2 |
| App PIN | `UnlockApp.jsx` | `spPinAppAzur` | parity-review | ooZJUKIC (Android) | Otključavanje daje isti unlocked | Runtime OK (`plusplus`); iOS → v2 | §5.2 |
| Kontrolni centar | `TabAplikacije.jsx` | `spMob_Menu_Query` | parity-review | ooZJUKIC (Android) | Prikaz aplikacija / zaključanost | Favoriti/Profil → v2; Postavke u header ikoni | §5.5, §7.5 |
| Meni i moduli | `Modules.tsx` | `spMob_Menu_Query` table2 | parity-review | ooZJUKIC (Android) | Navigacija po `module.url` | `dgl`/`gen` OK; `/servis/*` → alias dgl + fallback (Faza 4; MIDA runtime nepotvrđen) | §7.5 |
| Generička lista | `dgl/List`, `gen/List` | `/doclayouts`, `queries.*.list` | parity-review | ooZJUKIC (Android) | Ista lista/polja za isti modul | RNint, RNodr, CRM Upiti potvrđeni na Androidu | §3.1, §7.3 |
| Filteri i pretraga | dgl/gen store filter | `filterdefaults`, `statusi`, `searchfields` | parity-review | ooZJUKIC (Android) | Isti SP parami; pretraga nad listom | Date picker OK; badge filtera vizualno OK; **filter cache po modulu** (Upiti↔RN) potvrđen u sesiji 2026-07-31 | §8.4 |
| Detalj dokumenta | `Tab1` / `TabInfo` | `*ViewItems`, `visiblefield` | parity-review | ooZJUKIC (Android) | Isti prikaz polja/sekcija | Info tab na RN i Upiti OK | §7.3 |
| Uređivanje forme | `MasterAzur` | `*EditItems`, azur SP | parity-review | ooZJUKIC (Android) | Kontrole + spremanje | Datumi, text, memo, sifarnik OK; memo „Odabir teksta” → v2 | §7.4 |
| Stavke (dst) | `Tab3`, `DetailAzurNew` | `dst*`, `spMob_*_DST_*` | parity-review | ooZJUKIC (Android); MEDIVA smoke u tijeku | CRUD + swipe flagovi s retka | Runtime patch `dst.azur/delete` iz list SP; `parentdstid` u JSON; sati `dstdatum2temp` HHmm; swipe/podstavke/Rad tab — Android OK; **`serija` kontrola** (`spMob_DST_Ser` / SearchSer) portana u Expo 2026-08-07 — MEDIVA runtime potvrditi | §7.3, §9.4 |
| Šifrarnici | `search.jsx` | `spMob_*_Sifarnici` | parity-review | ooZJUKIC (Android) | simple/advanced rezultati | CRM: ne slati `azurFieldKey` kao SP param — popravljeno i potvrđeno; **`serija` nije šifrarnik** (zaseban modal, D037) | §7.4 |
| Privitci (dgl) | `TabPrivitci.jsx` | `/saveatt`, `/getatt`, `prilozi` | parity-review | ooZJUKIC (Android) | Lista/upload/open | Tab + lista viđeni; puni upload/open checklist na uređaju još kratak | §10.4 |
| Potpis + REPX (dgl) | `Tab4.jsx` | `insertSignature`, `/repxreport` | parity-review | ooZJUKIC (Android) | Potpis + izvještaj | SP prima samo Signature/Text/TextField (bez email parama); native canvas — iOS potvrda → v2 | §10.2, §10.5 |
| gen Akcije (kreiraj RN) | `TabAkcije.jsx` | `queries.gla.createdoc` | parity-review | ooZJUKIC (Android) | Kreiraj RN → otvori dgl | CreateDoc ne vraća sifdv → lookup preko `spMob_ZJUKIC_DGL_Query`; prebacivanje CC na RN modul; povratak na Upite s filter cache | plan Faza 2 |
| Postavke | `TabPostavke` | local prefs | parity-review | - | Dark mode, verzija, reset, odjava | Web preview ranije; Android smoke u auth sesiji | §12 |
| Odjava | `logOut` | Preferences `user` | parity-review | ooZJUKIC (Android) | Briše samo user | OK | §5.4 |
| Legacy `/servis/*` | `src/pages/servis/` | hardkod SP | parity-review | MIDA (SQL meni) | Meni URL vodi na radni ekran | Expo: alias → dgl + fallback. Runtime na MIDA **nije prioritet** dok se ne dokaže aktivna upotreba. DNIZ write komentar / Favoriti → van fokusa / v2 | `SERVIS_INVENTORY.md` |
| Raspored (SB) | — (novo u Expo) | Disp + `MobKorisnik` | parity-review | ooSLABUS NT / Android | Lista + tabovi; push → Aktualno | UI + Expo push token smokean na `com.opera.mobile`; v. `SLABUS_RASPORED_DESIGN.md`, D039 | § raspored |
| Push (SB) | Capacitor demo | Expo Push + FCM V1 na EAS | parity-review | SB Android | Token save + tap navigacija | Generički Opera push / iOS APNs → v2; preview package bez `google-services.json` | D039, `V2_BACKLOG.md` |
| CC Favoriti / Profil | CC tabovi | - | v2 | - | - | Van fokusa | `V2_BACKLOG.md` |

## Review log — 2026-07-31 (Android / ooZJUKIC)

### Potvrđeno u sesiji
- Auth lanac: Core PIN → ERP login → App PIN → CC → moduli
- dgl RN (npr. RNint / RNodr): lista, filteri, detalj, forma, stavke, Rad, podstavke
- gen CRM Upiti: Info + Akcije → kreiraj RN → otvori → kontekst RN; povratak na Upite s pamćenjem filtera
- SP payload ispravke: `parentdstid` u jsonUpdatedValues; potpis bez email SP parama; CRM sifarnik bez `azurFieldKey`; sati HHmm za `dstdatum2temp`
- UI: date picker confirm; filter badge clip; filter cache po modulu

### Još za zatvoriti v1 (izvan same matrice)
1. Novi Android build + smoke: Jasika/MEDIVA stavke Azur override, Adriateh potpis `db`, App unlock race (lokalne izmjene — v. `docs/preuzimanje/`)
2. EAS / Play rollout kad QA zatvori checklist
3. Privitci: svjesni upload + open na uređaju (kratki smoke)
4. Potpis + REPX E2E na Androidu (nakon `db` fix builda)

### Namjerno van v1 / van trenutnog fokusa
**iOS**, CC Favoriti/Profil, memo „Odabir teksta”, kamera u privitcima, EAS OTA, DNIZ write komentar — v. `V2_BACKLOG.md` / dogovor tima. MIDA `/servis` runtime nije prioritet dok se ne dokaže aktivna upotreba.
