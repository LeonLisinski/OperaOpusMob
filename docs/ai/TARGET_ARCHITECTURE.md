# Target Architecture

> **Status: Draft — nije konačno odobreno.** Ovo su principi oko kojih postoji suglasnost smjera, ne finalna specifikacija. Odluke označene kao "Decision pending" se ne implementiraju dok se ne zaključe.

## Potvrđeni ciljni principi

- **Expo/React Native aplikacija u `expo/`** — nastaje kao zaseban folder u istom repozitoriju, ne zamjenjuje `src/` odmah.
- **Android i iOS su ravnopravne ciljane platforme.** Ionic aplikacija (`src/`) je Android-only produkcijska referenca, ali Expo aplikacija se razvija za obje platforme od početka — iOS nije naknadna opcija. Arhitektura, odabrane biblioteke (navigacija, state, storage, kamera, potpis, push) i implementirane funkcionalnosti moraju raditi na oba OS-a; funkcionalnost koja postoji samo na jednoj platformi je iznimka koja se eksplicitno opravdava, ne default.
- **Huawei se ne tretira kao zasebna platforma.** Ciljani Huawei uređaji koriste Google Play Services, pa se tretiraju kao standardni Android — nema posebnog tehničkog zahtjeva ni AppGallery/HMS sloja.
- **Ionic (`src/`) ostaje produkcijska referenca** tijekom cijele migracije, dok Expo ekvivalent nema dokazanu funkcionalnu jednakost po modulu i tenantu (v. `MIGRATION_STRATEGY.md`, `FEATURE_PARITY_MATRIX.md`).
- **Migracija po vertikalnim funkcionalnim cjelinama** (npr. auth, pa jedan generički modul kraj-do-kraja), ne po horizontalnim slojevima (svi ekrani pa sav state pa sav API).
- **Zajednički API client** — jedan sloj za sve pozive prema `/data`, `/login`, `/doclayouts`, `/repxreport` i privitke, analogan ulozi `dataHelper.js` u Ionic aplikaciji, ali s jasnim tipiziranim ugovorom.
- **Centraliziran error handling** — greške s API-ja i mreže se obrađuju na jednom mjestu, ne lokalno u svakoj komponenti (za razliku od trenutnog `IonAlert` po komponenti).
- **Jasno odvajanje slojeva**: screens, components, hooks, state, services i API sloj su odvojene odgovornosti s jasnom granicom, ne miješani kao u dijelu postojećeg koda.
- **Generička logika odvojena od tenant konfiguracije** — zajednički kod ne smije ovisiti o tome koji je tenant aktivan; tenant razlike idu kroz konfiguraciju/layout, ne kroz grananje u kodu.
- **JSON-driven UI ostaje važan mehanizam** — sposobnost promjene liste/forme/SP mapiranja bez nove verzije aplikacije se čuva i u ciljnoj arhitekturi, u nekom obliku (točan mehanizam je dio otvorenih odluka niže).
- **Bez tenant-specifičnih `if` provjera u zajedničkim komponentama** — izravan nastavak principa razdvajanja generičke logike i tenant konfiguracije, primijenjen na razini code review-a.
- **Jasni TypeScript kontrakti za API i layoute** — tipovi za request/response oblike i za JSON layout strukturu, umjesto netipiziranog `fetch` i `any` layout objekata.
- **Testabilna arhitektura** — struktura koda mora omogućavati testiranje bez punog mock-anja cijele aplikacije (preduvjet, ne trenutna praksa u Ionic kodu).
- **Dokumentacija kao dio Definition of Done** — svaka netrivijalna promjena ažurira odgovarajući dokument u `docs/ai/` (i kasnije `docs/technical/`), definirano u `.cursor/rules/40-testing-and-documentation.mdc`.

## Decision pending

Sljedeće odluke **nisu** donesene. Ne implementiraj ih dok se ne zaključe i ne upišu u `DECISION_LOG.md`.

### Navigacija: Expo Router ili React Navigation

- **Kriteriji:** usklađenost s file-based routing pristupom ako se odabere, kompleksnost nested/tab navigacije potrebne za `MainTabs` ekvivalent, learning curve za tim bez React Native iskustva, kompatibilnost s deep linkovima ako zatrebaju.

### State management: Redux Toolkit, Zustand ili drugo

- **Kriteriji:** postojeći tim već poznaje Redux Toolkit (trenutno u `src/`) — cijena prebacivanja mora biti opravdana konkretnom prednošću; količina asinkronog stanja (API pozivi, cache) koju treba modelirati; jednostavnost za tim bez specijalizacije.

### EAS Update strategija

- **Kriteriji:** je li potrebna mogućnost isporuke JS izmjena bez app store review-a; kako se to uklapa uz postojeći JSON-layout mehanizam koji već rješava dio te potrebe; trošak i pouzdanost EAS servisa za produkcijske klijente.

### Push notification provider i arhitektura

- **Odluka se ne zaključuje dok se ne analizira:** postojeći backend (postoji li server-side servis koji šalje notifikacije), postojeća FCM konfiguracija (`google-services.json`) korištena za Android, i zahtjevi za iOS APNs (Apple Push Notification service — potreban za push na iOS, nema Android ekvivalent u FCM-u).
- **Kriteriji:** treba li Expo Notifications, native FCM/APNs SDK-ovi ili treća strana; status server-side push infrastrukture (v. `OPEN_QUESTIONS.md`); mora podržavati obje platforme jednako, ne samo Android kao danas.

### Offline model

- **Kriteriji:** trenutna aplikacija nema offline sloj (v. `CURRENT_ARCHITECTURE.md` §8.4) — treba li ciljna arhitektura uvesti jedan, i ako da, za koje flowove (npr. rad na terenu bez signala); cijena implementacije i testiranja nasuprot stvarnoj poslovnoj potrebi.

### Finalna struktura generičkog module enginea

- **Kriteriji:** kako zamijeniti tri paralelna modela (`servis`/`dgl`/`gen`) jednim ili manjim brojem generičkih pristupa bez gubitka fleksibilnosti koju layout sustav danas pruža; kompatibilnost s postojećim JSON strukturama (`glaListItem`, `dglEditItems`, itd.) ili potreba za novom shemom.

## Napomena

Ovaj dokument se ažurira kad se neka od gornjih odluka donese — premjesti se iz "Decision pending" u `DECISION_LOG.md` s razlogom, i ovdje ostaje samo kratka referenca na taj zapis.
