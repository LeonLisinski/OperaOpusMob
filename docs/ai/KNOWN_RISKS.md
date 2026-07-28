# Known Risks

Za svaki rizik: vjerojatnost, utjecaj, dokaz (referenca na `CURRENT_ARCHITECTURE.md` gdje je moguće), ublažavanje, vlasnik/potreban izvor odgovora, status.

## Sigurnost

### R01 - Hardkodirani Basic Auth (`test:123`) u svim API pozivima

- **Vjerojatnost:** visoka (aktivno u svakom requestu danas)
- **Utjecaj:** visok - svatko tko dekompilira APK ili presretne promet dobiva valjane API kredencijale
- **Dokaz:** `CURRENT_ARCHITECTURE.md` §5.3, `src/utils/dataHelper.js:116`
- **Ublažavanje:** ne mijenja se dok backend strana autentikacije nije razriješena (`.cursor/rules/10-change-safety.mdc` pravilo 9); rješenje čeka backend odluku o pravoj autentikaciji
- **Vlasnik / izvor odgovora:** backend tim / vlasnik `/login` implementacije
- **Status:** otvoreno, namjerno neblokirano dok backend nije spreman

### R02 - Cleartext HTTP za dio klijenata

- **Vjerojatnost:** visoka za pogođene tenante (potvrđeno u Android manifestu)
- **Utjecaj:** visok - promet nešifriran za te klijente
- **Dokaz:** `CURRENT_ARCHITECTURE.md` §12 (`usesCleartextTraffic=true`, `network_security_config.xml`)
- **Ublažavanje:** zahtijeva HTTPS na strani klijentskog servera; van kontrole ovog repozitorija
- **Vlasnik / izvor odgovora:** infrastruktura pogođenog klijenta (npr. Zaštita Jukić)
- **Status:** otvoreno

### R03 - Nepotvrđeni backend flowovi

- **Vjerojatnost:** visoka (velik dio ponašanja je inferiran, ne dokazan)
- **Utjecaj:** srednji do visok - pogrešna pretpostavka o kontraktu može uzrokovati bug koji se otkrije tek u produkciji
- **Dokaz:** `OPEN_QUESTIONS.md` - cijela lista
- **Ublažavanje:** Faza 2 migracijske strategije eksplicitno cilja potvrdu kontrakata prije Expo implementacije
- **Vlasnik / izvor odgovora:** backend tim
- **Status:** otvoreno

## Funkcionalnost i tehnički dug

### R04 - Nedovršene push notifikacije, i to samo za Android

- **Vjerojatnost:** visoka (potvrđeno stanje koda)
- **Utjecaj:** srednji - funkcionalnost postoji kao Android-only demo, ne poslovni flow; ciljna Expo aplikacija treba push na obje platforme, pa se rješenje ne može jednostavno prenijeti
- **Dokaz:** `CURRENT_ARCHITECTURE.md` §12, `PushNotificationsContainer.tsx` (FCM/`google-services.json`, nema APNs konfiguracije)
- **Ublažavanje:** planirano u Fazi 8 migracijske strategije, uz preduvjet analize backenda, FCM-a i iOS APNs zahtjeva prije nego se odabere provider (`TARGET_ARCHITECTURE.md`)
- **Vlasnik / izvor odgovora:** backend/infra tim za server-side dio; potreban Apple Developer nalog za APNs stranu
- **Status:** otvoreno

### R05 - Neusklađene verzije Android/npm

- **Vjerojatnost:** visoka (potvrđeno - `package.json` 2.0.1 vs `versionName` 1.0)
- **Utjecaj:** nizak do srednji - zbunjuje pri debagiranju i podršci, ne utječe direktno na rad aplikacije
- **Dokaz:** `CURRENT_ARCHITECTURE.md` §11.4
- **Ublažavanje:** uskladiti proces izdanja da automatski sinkronizira verzije; izvan opsega ove serije
- **Vlasnik / izvor odgovora:** tim odgovoran za release proces
- **Status:** otvoreno

### R06 - Dupliciranje servis/dgl/gen

- **Vjerojatnost:** visoka (potvrđeno arhitekturom)
- **Utjecaj:** visok za dugoročno održavanje - svaka promjena zajedničke logike mora se provjeriti na tri mjesta
- **Dokaz:** `CURRENT_ARCHITECTURE.md` §3.1, §10
- **Ublažavanje:** Expo migracija cilja generalizaciju kroz Faze 5, 6 i 9 (`MIGRATION_STRATEGY.md`)
- **Vlasnik / izvor odgovora:** razvojni tim
- **Status:** planirano rješavanje kroz migraciju

### R07 - Miješani JavaScript i TypeScript

- **Vjerojatnost:** visoka (potvrđeno - `.jsx` store-ovi, `.tsx` komponente)
- **Utjecaj:** srednji - slabija sigurnost tipova, teže održavanje za tim bez duboke specijalizacije
- **Dokaz:** `CURRENT_ARCHITECTURE.md` §12
- **Ublažavanje:** Expo aplikacija kreće s jasnim TypeScript kontraktima (`TARGET_ARCHITECTURE.md`); Ionic kod se ne refaktorira usput (`.cursor/rules/10-change-safety.mdc` pravilo 7)
- **Vlasnik / izvor odgovora:** razvojni tim
- **Status:** rješava se u ciljnoj arhitekturi, ne retroaktivno u `src/`

### R08 - Tenant-specifična logika u zajedničkom kodu

- **Vjerojatnost:** potvrđeno - `src/pages/dgl/store` CRUD nad stavkama (`saveDoc`, `changeStatus`, `deleteDst`, `dstPotvrdaKolcine`, `dstDeletePotvrdaKolcine`) hardkodira `spMob_ZJUKIC_DST_Azur`/`spMob_DST_RadniNalozi_Azur` za sve dgl tenante. Provjerom `queries.json` u 10 tenant foldera koji imaju `dstEditItems.json` (RNhig/RNint/RNteh/RNsec → ASURA, SRN → MEDIVA, ERVadmin → SDMS, SRNI/SRNjas/NARd/NARd2 → ZJUKIC) potvrđeno da hardkod odgovara stvarnom tenantu samo za 4 od 10 (ZJUKIC-obitelj); za ASURA/MEDIVA/SDMS poziva SP drugog tenanta
- **Utjecaj:** visok za ciljnu arhitekturu - princip "bez tenant-specifičnih `if` provjera" zahtijeva mehanizam koji u Ionicu ne postoji za ovaj slučaj
- **Dokaz:** `CURRENT_ARCHITECTURE.md` §9.4, `DECISION_LOG.md` D025/D026, `OPEN_QUESTIONS.md` #16
- **Ublažavanje:** Expo `documentsSlice.saveDstLine` čita `queries.dst.azur` iz JSON layouta (isti obrazac kao već postojeći `queries.dst.list`) umjesto hardkoda; ako polje nedostaje, spremanje se jasno odbija umjesto tihog poziva tuđeg SP-a. Mehanizam je implementiran, ali nijedan tenant `queries.json` još ne definira `dst.azur` - dok se ne doda (po istoj konvenciji imenovanja kao `dst.list`, npr. `spMob_ASURA_DST_Azur`), CRUD stavki u Expo aplikaciji ostaje neaktivan za sve tenante. Dodavanje tog polja u `MobLayoutsControls/` zahtijeva zaseban odobren zadatak po `.cursor/rules/10-change-safety.mdc` pravilo 3
- **Vlasnik / izvor odgovora:** backend/razvojni tim - potvrditi stvarni naziv `*_DST_Azur` SP-a po tenantu prije dodavanja u JSON
- **Status:** mehanizam implementiran u Expo (`queries.dst.azur`); JSON konfiguracija po tenantu ostaje otvorena

## Layout sustav

### R09 - 34 nestandardna ili nevalidna JSON layouta

- **Vjerojatnost:** potvrđeno (34 od 757 JSON datoteka u lokalnoj snimci)
- **Utjecaj:** srednji - nepoznato ponašanje na Expo strani ako se parsira strože nego trenutni backend
- **Dokaz:** `CURRENT_ARCHITECTURE.md` §7.7
- **Ublažavanje:** validator planiran kao report-only (`DECISION_LOG.md` D007), ne kao blokirajući gate
- **Vlasnik / izvor odgovora:** osoba koja održava layoute po tenantu
- **Status:** otvoreno, praćeno

### R10 - Zasebni layouti na klijentskim serverima

- **Vjerojatnost:** potvrđeno za barem klijente s vlastitim API serverom (npr. Jukić, Ruve)
- **Utjecaj:** visok za potpunost analize - snimka ne pokriva te tenante
- **Dokaz:** `CURRENT_ARCHITECTURE.md` §7.7
- **Ublažavanje:** ti serveri se moraju analizirati odvojeno prije nego što se za njih donese bilo koja migracijska odluka
- **Vlasnik / izvor odgovora:** tim koji ima pristup tim serverima
- **Status:** otvoreno (v. `OPEN_QUESTIONS.md`)

### R11 - Nedostatak povijesti i rollbacka layouta

- **Vjerojatnost:** potvrđeno (nema Git povijesti, ručni `.bak` fajlovi)
- **Utjecaj:** visok - greška u produkcijskom layoutu nema brz i pouzdan put unazad
- **Dokaz:** `CURRENT_ARCHITECTURE.md` §7.7
- **Ublažavanje:** `MobLayoutsControls/` se tretira prvo kao verzionirana snimka (`DECISION_LOG.md` D006); puna Git integracija je buduća odluka, izvan opsega ove serije
- **Vlasnik / izvor odgovora:** tim koji upravlja deploymentom layouta
- **Status:** djelomično ublaženo ovom serijom (postoji snimka), potpuno rješenje otvoreno

## Migracija

### R12 - Rizik paralelnog održavanja Ionic i Expo aplikacije

- **Vjerojatnost:** visoka - izravna posljedica odluke D002
- **Utjecaj:** visok za mali tim - dva koda za isto ponašanje tijekom cijele migracije
- **Dokaz:** `PROJECT_CONTEXT.md`, `DECISION_LOG.md` D002
- **Ublažavanje:** migracija po vertikalama s jasnim kriterijem završetka po fazi (`MIGRATION_STRATEGY.md`), da se razdoblje paralelnog održavanja skrati po modulu čim prije je moguće
- **Vlasnik / izvor odgovora:** razvojni tim, tempo određuje realni kapacitet
- **Status:** prihvaćen kao nužna posljedica sigurne migracije

### R13 - Pravila i dokumentacija postanu preteški za tim

- **Vjerojatnost:** srednja - rizik raste ako se doda previše procesa odjednom
- **Utjecaj:** srednji - tim prestane stvarno koristiti rules/skills/dokumentaciju ako postanu teret
- **Dokaz:** eksplicitno naveden razlog za smanjenje opsega prve serije (rules/skills prije dokumentacije, bez VitePress/validatora)
- **Ublažavanje:** postupno uvođenje (`DECISION_LOG.md` D008); Always kontekst ograničen na `00-project-context` i najkritičniji dio `10-change-safety`; ostalo se aktivira po potrebi
- **Vlasnik / izvor odgovora:** razvojni tim, samoprovjera kroz redovnu upotrebu
- **Status:** aktivno praćeno kroz postupan pristup serijama

### R14 - Tim nema iskustva s razvojem i objavom za iOS

- **Vjerojatnost:** visoka - Ionic aplikacija je uvijek bila Android-only (nema `ios/` foldera, nema potvrđenog prijašnjeg iOS builda), tim je mali i bez mobilne specijalizacije
- **Utjecaj:** visok - App Store review proces, code signing/certifikati, TestFlight distribucija i iOS-specifična ograničenja (npr. background rad, push) su novo područje za tim
- **Dokaz:** `PROJECT_CONTEXT.md`, `00-project-context.mdc` (Ionic "Android only")
- **Ublažavanje:** iOS se uvodi od Faze 3 (temeljna arhitektura), ne tek na kraju, da se rano otkriju platformska ograničenja; Faza 10 rollouta prati Android i iOS odvojeno po tempu
- **Vlasnik / izvor odgovora:** razvojni tim; treba li vanjska pomoć za prvi App Store release je otvoreno pitanje
- **Status:** otvoreno
