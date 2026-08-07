---
outline: false
---

# Decision Log

ADR-light format: kratak zapis odluke, razloga i posljedica. Nove odluke se dodaju na dno s rastućim ID-em, postojeće se ne prepisuju - ako se odluka promijeni, dodaje se nova stavka koja referencira staru.

## D001

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** Expo aplikacija ide u `expo/` folder unutar istog repozitorija (`ERP-IONIC7`), ne u zaseban repozitorij

**Razlog:** Zajednička povijest, lakše dijeljenje dokumentacije i konteksta za mali tim; izbjegava sinkronizacijski trošak dva repoa tijekom duge migracije

**Posljedice:** `src/` i `expo/` koegzistiraju dok paritet nije dokazan; potrebna jasna granica da se izbjegne međusobno zagađenje ovisnosti/konfiguracije

## D002

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** Ionic aplikacija (`src/`) ostaje produkcijska referenca dok Expo ekvivalent nema dokazani paritet po modulu i tenantu

**Razlog:** Produkcijski korisnici ne smiju izgubiti funkcionalnost tijekom migracije; nagli prekid Ionic verzije nosi neprihvatljiv poslovni rizik

**Posljedice:** Dvostruko održavanje tijekom prijelaznog razdoblja (v. `KNOWN_RISKS.md`); svaka migrirana cjelina mora proći `parity-review` prije rollouta

## D003

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** Markdown je source of truth za dokumentaciju

**Razlog:** Jednostavno za diff/review u Gitu, ne zahtijeva poseban alat za pisanje, čitljivo i AI-ju i ljudima

**Posljedice:** Sav sadržaj dokumentacije (`docs/`) piše se u Markdownu; HTML prikaz je izveden, ne primarni

## D004

**Datum:** 2026-07-27 · **Status:** `approved, not implemented`

**Odluka:** Planirani alat za HTML prikaz dokumentacije je VitePress

**Razlog:** Lagan, Markdown-native static site generator; dobra podrška za Mermaid; ne zahtijeva veliku konfiguraciju

**Posljedice:** Implementacija odgođena do kasnije serije; ne utječe na trenutni Markdown sadržaj

## D005

**Datum:** 2026-07-27 · **Status:** `approved, not implemented`

**Odluka:** Planirani format dijagrama je Mermaid

**Razlog:** Dijagrami kao tekst, verzionirani zajedno s dokumentacijom, bez vanjskog alata za crtanje

**Posljedice:** Postojeći dijagrami u `CURRENT_ARCHITECTURE.md` već su u Mermaid formatu; budući dijagrami slijede isti format

## D006

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** `MobLayoutsControls/` se prvo tretira kao verzionirana snimka za analizu, ne kao automatski deploy source

**Razlog:** Trenutna lokalna kopija ne pokriva sve tenante (klijenti s vlastitim API serverom nisu obuhvaćeni) i sadrži 34 nevalidne JSON datoteke - nije sigurno tretirati je kao potpuni izvor istine dok se to ne provjeri

**Posljedice:** `MobLayoutsControls/` još nije pod Git kontrolom niti dio build/deploy procesa; ta odluka se revidira kad se pokrivenost i valjanost potvrde

## D007

**Datum:** 2026-07-27 · **Status:** `approved, not implemented`

**Odluka:** Validator JSON layouta će u početku biti report-only (samo prijavljuje probleme, ne blokira ništa)

**Razlog:** Backend očito tolerira barem dio od 34 nevalidne datoteke u produkciji; strogi validator koji nešto blokira prije razumijevanja backend ponašanja mogao bi lažno prijaviti ispravne slučajeve kao greške

**Posljedice:** Validator nije dio ove serije; kad nastane, ne smije se koristiti kao gate za deploy dok se ne dokaže pouzdanim

## D008

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** Dokumentacija se gradi postupno, po stvarnoj potrebi, ne stvaranjem desetaka praznih stranica unaprijed

**Razlog:** Prazna dokumentacija stvara lažan dojam pokrivenosti i troši vrijeme na održavanje strukture bez sadržaja

**Posljedice:** `docs/technical/` i `docs/user/` ostaju prazni dok ne postoji stvaran sadržaj za njih; `docs/ai/` se popunjava samo dokazanim činjenicama

## D009

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** Expo aplikacija se razvija ravnopravno za Android i iOS od početka; Huawei se ne tretira kao zasebna platforma

**Razlog:** Ionic je Android-only referenca, ali ciljana aplikacija treba pokriti obje platforme da migracija ima smisla dugoročno; ciljani Huawei uređaji koriste Google Play Services pa nemaju poseban tehnički zahtjev

**Posljedice:** Arhitektura, biblioteke i funkcionalnosti u `expo/` moraju podržavati obje platforme od Faze 3 nadalje (`MIGRATION_STRATEGY.md`); push provider/arhitektura ostaje decision pending dok se ne analiziraju backend, FCM i iOS APNs zahtjevi (`TARGET_ARCHITECTURE.md`)

## D010

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** Expo scaffold kreiran s Expo SDK 57 (default template), Expo Router (file-based, `app/`), Redux Toolkit + React Redux i `expo-dev-client`

**Razlog:** Zadovoljava potvrđene ciljne principe (`TARGET_ARCHITECTURE.md`); Redux Toolkit izbjegava trošak učenja nove state biblioteke za tim koji ga već poznaje iz `src/`; `expo-dev-client` je preduvjet za buduće native module (kamera, potpis) bez Expo Go ograničenja

**Posljedice:** Scaffold ne sadrži poslovnu logiku, auth ni API pozive - samo tehnički temelj (theme tokeni, prazan store, početni ekran); `FEATURE_PARITY_MATRIX.md` se ne mijenja jer scaffold nije funkcionalni paritet; iOS `bundleIdentifier` nije postavljen i mora se odlučiti prije prvog iOS native builda

## D011

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** Prva vertikala (`session bootstrap → Core PIN → login → kontrolni centar → App PIN → moduli`) implementirana preko Expo Router route grupa `(auth)`/`(app)`, centralnog `fetch` API klijenta (bez Axios/React Query) i domenskog storage sloja (`expo-secure-store` + AsyncStorage)

**Razlog:** Zadovoljava zadane granice zadatka (bez novih HTTP/validacijskih biblioteka); route grupe daju jasniji flow od plošne liste ruta i prirodno odgovaraju `PrivateRoute` granici

**Posljedice:** Request/response oblici prema `spPinCoreAzur`, `/login`, `spPinAppAzur`, `spMob_Menu_Query` repliciraju postojeći Ionic ugovor (potvrđeno SQL definicijama procedura); poslovna logika i API pozivi žive isključivo u `features/*` slice-ovima i thunkovima, ne u route komponentama

## D012

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** Identitet uređaja za PIN registraciju je vlastiti generirani UUID (perzistiran u Secure Store), ne `Application.getAndroidId()` ni `Application.getIosIdForVendorAsync()`

**Razlog:** Capacitor `Device.getId()` (koji stara aplikacija šalje kao `DeviceUuid`/`DeviceSerial`) je već sam po sebi generirani, po-instalaciji perzistirani UUID - nije OS Android ID niti hardverski serijski broj; Android ID (preživljava reinstalaciju) i iOS vendor ID (resetira se s brisanjem svih app istog vendora) imaju drugačiju i međusobno različitu trajnost pa nijedan nije pouzdan ekvivalent

**Posljedice:** `expo-application`/`expo-device` se ipak koriste za `DeviceIsVirtual`/`DeviceManufacturer`/`DeviceModel`/`DeviceVersion` i za dijagnostički `platformDeviceId`; backend ugovor (parametri SP-ova) ostaje nepromijenjen, mijenja se samo izvor vrijednosti - zabilježeno u `expo/src/services/device/deviceIdentity.ts`

## D013

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** PIN (Core i App) se ne perzistira nigdje u Expo aplikaciji, za razliku od moguće implicitne pohrane u Ionic `auth` Preferences zapisu (koji sprema cijeli sirovi API odgovor, uključujući `Pin` polje)

**Razlog:** Eksplicitan zahtjev zadatka (PIN sigurnost); ne utječe na API ugovor niti na promatrano ponašanje korisnika, isključivo je pooštrenje pohrane u novom klijentu

**Posljedice:** `authSlice.ts` `unlockCore` thunk svjesno izostavlja `raw.pin` prilikom mapiranja u `CoreConfig` prije spremanja

## D014

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** Jedan generički module-engine (`expo/src/features/documents/`) opslužuje i `dgl` (po `sifdv`) i `gen` (po `{app}/{module}`) module tipove kroz zajedničku shemu (`ListItemLayoutGroup`, `ViewSection`), umjesto dva paralelna Expo ekvivalenta koji zrcale `src/pages/dgl/` i `src/pages/gen/`

**Razlog:** Oba Ionic modula koriste identičnu JSON shemu za `*ListItem.json`/`*ViewItems.json`/`queries.json`, samo drugi prefiks ključeva (`dgl`/`dst` vs `gla`) - `moduleRouting.ts` parsira `module.url` (`/docs/dgl/:sifdv` ili `/gen/list/:app/:module`) i vraća isti `ModuleRoute` oblik; izbjegava se obrazac "tri paralelna modula" koji `20-architecture-and-expo.mdc` eksplicitno navodi kao nešto što se ne prenosi u `expo/`

**Posljedice:** Novi modul tip zahtijeva samo novi unos u `resolveModuleRoute`, ne novi ekran/slice; `servis/*` (hardkodirani SP-ovi) namjerno ostaje izvan ovog enginea jer nema JSON layout

## D015

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** Read-only detalj dokumenta ne radi zaseban API poziv za header polja - koristi isti redak koji je već dohvaćen listom

**Razlog:** Potvrđeno u Ionic izvoru: `docsSlice`/`genSlice` `getGla`/`getListItem` ne rade "get by id" upit za prikaz zaglavlja, već ponovno koriste `queries.{dgl,gla}.list` SP ili već postojeći redak - `dglViewItems`/`glaViewItems` samo biraju koja polja istog retka se prikazuju i grupiraju

**Posljedice:** Detalj ekran (`documents/detail.tsx`) čita `state.documents.selectedItem` postavljen pri odabiru retka u listi; ako SP za listu ne vraća sva polja koja `*ViewItems.json` očekuje, ta polja će se prikazati kao prazna (`-`) - nije potvrđeno runtime testom

## D016

**Datum:** 2026-07-27 · **Status:** `approved, temporary`

**Odluka:** Gumb **„Aktivacija"** na kontrolnom centru (`apps.tsx`) je privremena dev kontrola za testiranje Core PIN / DeviceUuid flowa

**Razlog:** Tijekom migracije test tenant zahtijeva brz povratak na unlock ekran bez brisanja storagea; nema ekvivalenta u produkcijskom Ionic UI-ju

**Posljedice:** **Ukloniti prije produkcijskog rollouta**; korisnik može i dalje koristiti „Ponovno unesi Core PIN" na login ekranu

## D017

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** Centralni `ThemeProvider` s preferencijom `light` / `dark` / `system`, perzistencijom u AsyncStorage (`session.themePreference`) i ažuriranjem StatusBar + `expo-system-ui` pozadine

**Razlog:** Jedan izvor semantic tokena umjesto hardkodiranog light moda; `system` prati OS shemu

**Posljedice:** Dev toggle (ciklus light→dark→system) na kontrolnom centru dok ne postoji ekran Postavki; komponente koriste `useTheme().colors`

## D018

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** Generički filter/pretraga u `documentsSlice`: server-side filter preko postojećih `queries.*.list` SP parametara; klijentska pretraga nad `originalList` prema `settings.searchfields` bez debounce-a

**Razlog:** Paritet s Ionic `dgl`/`gen` store-ovima - pretraga ne ide na server; filteri dolaze iz JSON layouta, ne hardkodirani po tenantu

**Posljedice:** Filter modal koristi native `Modal` (pageSheet), ne nova UI biblioteka; datumi su ručni YYYY-MM-DD unos (MVP)

## D019

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** Uređivanje forme (`documents/form.tsx`) je puni ekran s `presentation: 'modal'` u Expo Router stacku, ne novi custom modal sloj; "Novi"/"Uredi" akcije su tekstualni gumbi u navigacijskom headeru (`HeaderTextButton`), ne floating action button

**Razlog:** Konzistentno s ostatkom Expo aplikacije koji već koristi tekstualne header akcije (npr. filter, odjava); FAB uvodi novi vizualni jezik bez postojećeg presedana u `expo/` i nije opravdan za jednu akciju po ekranu

**Posljedice:** `HeaderTextButton.tsx` je sada zajednička komponenta za sve header tekstualne akcije; forma dijeli isti `documents/form` route i `documentsSlice` edit state za `dgl` i `gen` (nema paralelne implementacije po kind-u)

## D020

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** `saveDocumentForm` bira SP i parametre po `route.kind`: `dgl` uvijek zove `spWeb_UpdateDGL` (hardkodirano, isto kao Ionic `saveDGL`), `gen` koristi `layout.azurQuery` (`queries.gla.azur` iz JSON-a, isto kao Ionic `saveGla`)

**Razlog:** Potvrđeno u Ionic izvoru (`src/pages/dgl/store` vs `src/pages/gen/store`) - ne pretpostavka; kopiranje asimetrije je ispravno jer odražava stvarnu backend razliku, ne slučajnu nedosljednost koju treba "popraviti"

**Posljedice:** Ako `gen` layout nema `queries.gla.azur`, spremanje se odbija s jasnom porukom umjesto tihog pada; nema client-side validacije praznog novog zapisa (Ionic dopušta spremanje praznog zapisa, backend postavlja defaultse)

## D021

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** Datum u formi za uređivanje ostaje ručni YYYY-MM-DD tekstualni unos (isto kao D018 za filter), bez nove date-picker biblioteke

**Razlog:** Dosljednost UX-a unutar cijele generičke module vertikale; izbjegava novu ovisnost dok stvarna potreba (npr. korisnička pritužba na format) nije potvrđena

**Posljedice:** Ako se kasnije uvede date picker, treba primijeniti na filter i formu istovremeno da UX ostane dosljedan

## D022

**Datum:** 2026-07-27 · **Status:** `approved (bugfix)`

**Odluka:** `sifarniciQuery`/`azurQuery` u `ModuleLayout` čitaju `queries.gla.{sifarnici,azur}` samo za `gen` module; za `dgl` su uvijek `undefined`, bez obzira postoji li `queries.dgl.sifarnici`/`queries.dgl.azur` u JSON-u

**Razlog:** Potvrđeno u izvoru: `src/pages/dgl/components/MasterAzur.jsx` poziva `<Search>` bez `sp` prop-a (uvijek default `spMob_DGL_Sifarnici`) i `saveDGL` uvijek zove hardkodirani `spWeb_UpdateDGL` - čak i kad `queries.dgl.azur`/`queries.dgl.sifarnici` postoje u JSON-u (potvrđeno u `MobLayoutsControls/ERVadmin/queries.json`), Ionic ih ne čita za dgl. Prije ovog ispravka Expo bi čitao i koristio taj override, što bi bio funkcionalni odmak od reference, ne paritet

**Posljedice:** Pronađeno tijekom kritične provjere nakon implementacije forme; ispravljeno u `layoutContract.ts` prije bilo kakvog runtime testa na pravom tenantu

## D023

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** `EditFormField`/`documents/form.tsx` namjerno NE kopira ponašanje `src/pages/gen/components/MasterAzur.jsx onSearchModalConfirm` gdje se `searchModalProps.dependencies.map(...)` poziva bez `?.` - u Ionic GEN formi to baca `TypeError` za svako `simple`/`advanced` polje bez `dependencies` u JSON-u (potvrđeno: većina polja u `MobLayoutsControls/CRM/Upiti/glaEditItems.json` nema `dependencies`)

**Razlog:** Ovo je stvaran bug u referentnoj Ionic aplikaciji, ne namjerno ponašanje koje treba replicirati (`10-change-safety.mdc` traži svjesnu odluku, ne slijepo kopiranje); dgl varijanta istog koda već koristi `?.` pa je ova nedosljednost i unutar samog Ionic koda

**Posljedice:** Expo koristi `field.dependencies?.forEach(...)` posvuda (bez razlike dgl/gen); vrijedi provjeriti s timom je li ovaj Ionic crash poznat/prijavljen na produkciji za GEN module

## D024

**Datum:** 2026-07-27 · **Status:** `approved, supersedes D016`

**Odluka:** Implementiran puni ekran `expo/app/(app)/settings.tsx` (verzija, konekcija, uređaj, izgled kao 3-way izbor, reset akcije) kao ekvivalent `src/pages/core/cc/TabPostavke.tsx`; time je D016 (privremeni "Aktivacija" gumb) i dio D017 (dev ciklus teme na kontrolnom centru) razriješen - oba su uklonjena iz `apps.tsx` i zamijenjena jednim gumbom "Postavke"

**Razlog:** Ionic TabPostavke već ima "Resetiraj autorizacijske postavke" i "Resetiraj sve postavke" retke koji rade točno ono što je D016 privremeno rješavao dev gumbom - ispravno mjesto za tu akciju je ekran Postavki, ne kontrolni centar

**Posljedice:** "Zapamti prijavu" red iz Ionic izvora namjerno izostavljen (hardkodiran `checked`, bez stvarne funkcije, označen "u izradi" u izvorniku - nema ponašanja koje treba prenijeti); build datum (Ionic `build-info.json`) nema Expo ekvivalent pa se prikazuje samo `Constants.expoConfig.version`

## D025

**Datum:** 2026-07-27 · **Status:** `superseded by D026 (spremanje)`

**Odluka:** CRUD nad stavkama dokumenta (spremanje/brisanje/promjena statusa/potvrda količine) NIJE implementiran u Expo - namjerno preskočeno dok se ne donese odluka o pristupu

**Razlog:** Ionic `dgl/store/index.jsx` (`saveDoc`, `changeStatus`, `deleteDst`, `dstPotvrdaKolcine`, `dstDeletePotvrdaKolcine`) hardkodira SP-ove jednog konkretnog tenanta (`spMob_ZJUKIC_DST_Azur`, `spMob_DST_RadniNalozi_Azur`) izravno u "generičkom" dgl kodu; potvrđeno da nijedan `queries.json` u `MobLayoutsControls/` ne definira `dst.azur` - ovi SP nazivi ne postoje nigdje u JSON konfiguraciji, samo hardkodirani u izvoru. Za bilo koji dgl tenant osim ZJUKIC/RadniNalozi ova funkcionalnost u Ionicu vjerojatno poziva pogrešan SP

**Posljedice:** Read-only stavke (`documents/lines.tsx`) rade preko konfigurabilnog `queries.dst.list` i nisu pogođene. Prije nastavka treba odabrati: (a) replicirati isti hardkod radi bit-for-bit pariteta, (b) uvesti `queries.dst.azur` override mehanizam u JSON s fallbackom, ili (c) potvrditi s timom/backendom stvarni doseg ovog problema po tenantima - v. `FEATURE_PARITY_MATRIX.md`

## D026

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** Implementirano spremanje/izmjena stavke (`saveDstLine`, `documents/dst-form.tsx`) preko `queries.dst.azur` čitanog iz JSON layouta - BEZ fallbacka na bilo koji hardkodirani tenant SP. Ako `dst.azur` nedostaje, spremanje se odbija jasnom porukom umjesto tihog poziva tuđeg SP-a. `changeStatus`/`deleteDst`/`dstPotvrdaKolcine`/`dstDeletePotvrdaKolcine` (druga hardkodirana SP grana, `spMob_DST_RadniNalozi_Azur`) ostaju izvan opsega - to su sekundarne swipe akcije u Tab3.jsx (`cmddelete`/`cmdpotvrdakolicine`/`cmddeletepotvrdakolicine`), a `changeStatus` je uopće nepovezan ni s jednim UI elementom u Ionic izvoru (mrtav kod)

**Razlog:** Provjerom `queries.json` za svih 10 tenant foldera s `dstEditItems.json` potvrđena je konzistentna konvencija imenovanja `spMob_{TENANT}_DST_Query` za `dst.list` (ASURA, MEDIVA, SDMS, ZJUKIC) - snažan dokaz da isti obrazac (`spMob_{TENANT}_DST_Azur`) vrijedi i za spremanje, pa je čitanje `dst.azur` iz JSON-a ispravan nastavak postojećeg obrasca, ne nova izmišljena arhitektura. Odbijanje bez konfiguracije je sigurnije od nasumičnog poziva tuđeg tenant SP-a (v. R08 u `KNOWN_RISKS.md`)

**Posljedice:** Nijedan tenant trenutno nema `queries.dst.azur` u JSON-u pa je CRUD stavki danas funkcionalno neaktivan dok se JSON ne dopuni - to je zaseban zadatak po `.cursor/rules/10-change-safety.mdc` pravilo 3 (izmjena `MobLayoutsControls/`), nije napravljeno u ovoj seriji. `editValues`/`editFormData`/`EditFormField`/`SifarnikSearchModal` dijele se s glavnom formom dokumenta (`documents/form.tsx`) jer je JSON shema kontrola identična; `dstEditContext` (dstId/parentId/kind) je jedino novo stanje

## D027

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** Implementiran tab "Privitci" (`documents/attachments.tsx`, `queries.{group}.prilozi`, upload preko `/saveatt`, preuzimanje preko `/getatt`) - SAMO za `route.kind === 'dgl'`, iako `queries.gla.prilozi` postoji i u gen tenant JSON-ima (npr. `MobLayoutsControls/CRM/Upiti/queries.json`)

**Razlog:** `src/pages/gen/tabs/MainTabs.tsx` ima rutu `tabPrivitci` eksplicitno ZAKOMENTIRANU (mrtav kod) - GEN modul u produkciji nema Privitci tab, samo Info i Akcije. `src/pages/gen/store/index.jsx` `getPrivitci` je isto mrtav kod koji dodatno čita krivi state slice (`getState().docs` umjesto `getState().gen`) i nikad nije mogao raditi ispravno ni da je ruta bila aktivna. Dodavanje Privitci taba za gen bi bila nova funkcionalnost, ne paritet - izvan opsega ovog zadatka

**Posljedice:** Ako se gen Privitci ikad zatraži, `moduleHasAttachments` treba proširiti provjeru s `route.kind === 'dgl'` na oboje, uz svjestan odabir treba li čitati `queries.gla.prilozi` (postoji u JSON-u) - mehanizam (`priloziQuery` preko `route.queryGroupKey`) je već generički i to bi bila samo promjena jednog uvjeta

## D028

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** Za listu privitaka nije uveden JSON layout (nema `dglPriloziListItem` ili slično) - redak prikazuje `item.naziv`, hardkodirano u kodu, isto kao Ionic `TabPrivitci.jsx` (`<IonLabel>{item.naziv}</IonLabel>`). Preuzimanje/otvaranje datoteke ide preko `expo-file-system` (`File`/`Directory` iz `Paths.cache`) + `expo-sharing` (`shareAsync`) umjesto Capacitor `Filesystem` + `@capawesome-team/capacitor-file-opener`; upload datoteke ide preko `expo-document-picker` + `File.base64()` umjesto `@capawesome/capacitor-file-picker`

**Razlog:** Ionic ne konfigurira prikaz retka privitka kroz JSON ni za jedan tenant (nema `prilozi`-specifičnog `*ListItem.json` ključa u cijelom `MobLayoutsControls/`) - uvođenje JSON konfigurabilnosti ovdje bi bio nepotreban overengineering za jedno polje. Odabrane Expo biblioteke su službena Expo zamjena za odgovarajuće Capacitor pluginove (SDK 57 stabilna `File`/`Directory` API, ne zastarjeli `expo-file-system/legacy`)

**Posljedice:** `expo-sharing` dodan kao config plugin u `app.json` (automatski od `npx expo install`); `servis/RadniNalozi` vertikala ima svoju odvojenu, eksperimentalnu implementaciju istog koncepta (`FilesAdd.tsx`, `usePhotoGallery.ts` - kamera, veći dio zakomentiran/neaktivan) koja nije dirana jer `servis/*` namjerno ostaje izvan generičkog document engine-a (v. D014); runtime testirano na web preview-u samo do granice mock layouta koji ne definira `dgl.prilozi` (bootstrap → modul → dokument → prazan tab bar, bez pada aplikacije) - interaktivni upload/otvaranje NIJE runtime testiran (nativne biblioteke nedostupne na webu, mock nema `prilozi` konfiguraciju)

## D029

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** Implementiran tab "Potpis" (`documents/signature.tsx`) - otkriveno da je Ionic `src/pages/dgl/tabs/Tab4.jsx` u stvarnosti JEDAN spojeni ekran: potpis (canvas) + generiranje/slanje REPX izvještaja emailom, ne dvije odvojene funkcionalnosti kako je ranije predviđeno u roadmapu. Implementirano zajedno kao jedan `submitSignature` thunk: (1) `spMob_DGL_Azur action=insertSignature` (generički SP, isti za sve dgl tenante - nije D025-tip tenant hardkod), zatim (2) ako `properties.reportName` postoji, `POST /repxreport` (`generateReportRequest`), zatim (3) ako `properties.signatureOpenPdf === true`, preuzimanje+otvaranje PDF-a preko istog `saveAndOpenFile` helpera koji koriste i privitci

**Razlog:** Potvrđeno čitanjem `Tab4.jsx` `onClickSpremi`→`createAndOpenPdf`→`getBase64StringReport` u cijelosti - nije pretpostavka. `gen/tabs/TabPotpis.jsx` postoji u izvoru ali mu je ruta u `gen/tabs/MainTabs.tsx` eksplicitno zakomentirana (isti obrazac mrtvog koda kao D027 Privitci) - Potpis je implementiran SAMO za `route.kind === 'dgl'`, gated na `item.tabpotpisvisible` (identično Ionic `dgl/tabs/MainTabs.tsx` `listItem.tabpotpisvisible` uvjetu)

**Posljedice:** `saveAndOpenAttachment` preimenovan/generaliziran u `services/files/fileViewer.ts` `saveAndOpenFile` (dijeli se s privitcima, direktorij promijenjen iz `opera-privitci` u `opera-dokumenti`) jer isti obrazac (spremi base64 u cache, otvori share sheet) sada koristi i privitke i izvještaje - nije nova apstrakcija, samo uklanjanje duplikata unutar iste sesije

## D030

**Datum:** 2026-07-27 · **Status:** `approved (nova ovisnost)`

**Odluka:** Za potpis canvas dodana nova ovisnost `react-native-signature-canvas` (+ peer `react-native-webview`) umjesto pisanja vlastite implementacije

**Razlog:** Direktan Expo/React Native ekvivalent Ionic `react-signature-canvas`; verzija 5.1.0, aktivno održavana (izdanje unutar zadnjeg mjeseca, 191k tjednih preuzimanja, 43 zavisna paketa), službeno podržava Expo (uklj. New Architecture preko WebView interop sloja) - provjereno prije dodavanja, ne nagađanje. Alternativa bez WebView-a (`expo-signature-canvas`, Skia-bazirana) razmotrena i odbačena zbog bitno manje zrelosti/usvojenosti

**Posljedice:** Interaktivno crtanje potpisa NIJE runtime testirano - `react-native-webview` eksplicitno ne podržava web platformu ("React Native WebView does not support this platform", potvrđeno u web preview-u), pa je test na webu ograničen na prikaz ekrana, predpunjavanje imena/emaila iz `properties.signatureTextSelectField`/`signatureEmailSelectField`, i graceful no-op na "Spremi" (knjižnica sama loguje upozorenje umjesto pada aplikacije). Stvarno crtanje/spremanje potpisa treba potvrditi na Android/iOS uređaju ili simulatoru

## D031

**Datum:** 2026-07-27 · **Status:** `approved (nova ovisnost), supersedes D024 dio o "Postavke" gumbu`

**Odluka:** UI/UX redizajn ekrana (Kontrolni centar, Postavke, filter, tab loading) - isključivo prezentacijski krug, bez promjene funkcionalnosti/API-ja/SQL-a/JSON layouta. Dodana nova ovisnost `@expo/vector-icons` za ikone (Postavke gumb, ikone aplikacija, lock/reset/odjava ikone)

**Razlog:** Provjerom `node_modules`/`package-lock.json` utvrđeno da `@expo/vector-icons` NIJE tranzitivna ovisnost `expo` paketa u ovom projektu (pogrešna pretpostavka u planu) - eksplicitno zatraženo i odobreno prije dodavanja jer ikone dosljedno diraju velik broj ekrana. Službena Expo biblioteka, bez native config/build koraka, isti Ionicons set koji Ionic već koristi za `app.icon` nazive

**Posljedice:** `apps.tsx`: novi `AppCard.tsx` (ikona iz `app.icon`, boja iz `app.color` - polja su već postojala u `AppMenuEntry`, samo se nisu prikazivala), 2-stupčana mreža, "Postavke" premješten u ikonu gore desno (`_layout.tsx` `apps` ruta sad `headerShown: false`, cijeli header gradi `apps.tsx` sam), "Odjava" premješten u `settings.tsx` (nova sekcija "Sesija")

## D032

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** Brand identitet dodan preko obojenog "hero" pojasa (`colors.primary`) na vrhu Kontrolnog centra s OperaOpus logotipom - replicira Ionic `TabAplikacije.jsx`/`TabAplikacije.scss` (`.main-content { background: #496c60 }` + `assets/operaopus.svg`, near-bijeli SVG namijenjen tamnoj pozadini, potvrđeno čitanjem oba izvora), ne izmišljen dizajn

**Razlog:** Logotip rasterizuran u PNG (`expo/assets/images/operaopus-logo.png`, iz `public/assets/operaopus.svg` preko jednokratnog `npx sharp-cli`) umjesto korištenja SVG-a direktno kroz `expo-image` - dokumentirani GitHub issue-i (expo/expo #23669) pokazuju da lokalni `require()`-ani SVG kroz `expo-image` zna renderirati prazno na iOS-u; PNG je pouzdaniji bez dodatne ovisnosti (`react-native-svg`)

**Posljedice:** Konverzija je jednokratna (izvršena preko `npx --yes sharp-cli`, nije dodana u `package.json` jer je build-time alat, ne runtime ovisnost); izvorni `public/assets/operaopus.svg` ostaje netaknut u `src/`-referenci

## D033

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** Filter dokumenata (`DocumentFilterModal.tsx`) preuređen iz dva Statusi/Ostalo taba u jedan kontinuirani scroll s tri jasno odvojene sekcije (Statusi / Razdoblje / Ostalo), i uvezan na isti `Screen scroll keyboardAware` mehanizam koji koriste `documents/form.tsx`/`dst-form.tsx`/`signature.tsx`

**Razlog:** Prije ovog popravka modal je koristio običan `ScrollView` bez ikakve zaštite od tipkovnice - datumska polja u "Ostalo" tabu nisu imala scroll-to-field ponašanje kao ostale forme (potvrđeno čitanjem, ne pretpostavka). Spajanje tabova u jedan scroll uklanja dodatni tap za pristup datumima, bez nove ovisnosti (korisnik eksplicitno odabrao "preraditi postojeći modal" umjesto npr. `@gorhom/bottom-sheet`)

**Posljedice:** "Reset" akcija premještena iz footera (gdje je dijelila red s "Primijeni") u header (tekstualna akcija pored "Odustani"), footer sada ima samo "Primijeni" preko punog reda

## D034

**Datum:** 2026-07-27 · **Status:** `approved`

**Odluka:** Dodan `SkeletonListLoader.tsx` (pulsirajući placeholder redovi) kao zamjena za puni-ekran `LoadingState` (centrirani spinner+tekst) na tabovima Stavke/Rad (`documents/lines.tsx`) i Privitci (`documents/attachments.tsx`)

**Razlog:** Puni-ekran spinner na praznom platnu pri svakom prebacivanju taba djeluje kao neugodan "prekid" nasuprot ostatku liste - skeleton koji nagovještava oblik retka je uobičajen mobilni obrazac za ovaj slučaj. Implementirano RN `Animated` API-jem (bez nove ovisnosti za shimmer/skeleton biblioteku)

**Posljedice:** Isključivo prezentacijska izmjena - uvjet `dstLinesStatus.loading \|\| attachmentsStatus.loading` i sami thunkovi u `documentsSlice.ts` nisu mijenjani (provjereno diffom); `LoadingState.tsx` ostaje u upotrebi drugdje (npr. inicijalni bootstrap)

## D035

**Datum:** 2026-07-28 · **Status:** `approved` (vlasnik projekta)

**Odluka:** Potvrđen smisao migracije i operativni kontekst: ista aplikacija modernizirana u Expo-u; JSON layouti + SP-ovi kao primarni mehanizam prilagodbe; API se ne dira dok radi; Ionic original je brzo sklopljen i ima propuste — referenca ponašanja, ne uzor kvalitete; test tenanti `jukic001`, `svam`, `plusplus`; layouti na operawebu održavaju konzultanti/tim; EAS/Store build zadnji korak; push cilj na Android i iOS.

**Razlog:** Usklađivanje dokumentacije, rules i AI konteksta s objašnjenjem vlasnika projekta kako se stvarno radi i što je prioritet održivosti.

**Posljedice:** Ažurirani `00-project-context.mdc`, `10-change-safety.mdc` (#10), `30-api-database-layouts.mdc`, `PROJECT_CONTEXT.md`, `OPEN_QUESTIONS.md` (razriješene stavke #1, #4, #13, #14, #17 i djelomično ostale).

## D036

**Datum:** 2026-07-28 · **Status:** `approved` (vlasnik projekta)

**Odluka:** Paritet = **sve što danas radi u Ionic originalu** treba raditi u Expo-u (po modulu/tenantu gdje je u produkciji omogućeno). Test flow: **jukic001 → login svam → app PIN plusplus**. CRUD stavki uključuje **swipe akcije** koje backend vrati na retku (`cmddelete`, `cmdpotvrdakolicine`, `cmddeletepotvrdakolicine`, `cmdpodstavke`) — ovisi o firmi/SP-u, ne o mobilnom hardkodu. "Odabir teksta" na memo poljima **ne implementirati u Expo-u** dok se ne potvrdi da ga netko koristi (vjerojatno mrtav dio originala).

**Razlog:** Pojašnjenje vlasnika projekta; usklađivanje prioriteta i test okruženja.

**Posljedice:** `OPEN_QUESTIONS.md`, `FEATURE_PARITY_MATRIX.md` (stavke), `PROJECT_CONTEXT.md`, `00-project-context.mdc` ažurirani. Expo backlog: swipe akcije na `documents/lines.tsx`, `queries.dst.azur` u JSON-u po tenantu (odobren zadatak), runtime test na jukic001.

## D037

**Datum:** 2026-08-07 · **Status:** `approved`

**Odluka:** Tip kontrole `serija` u Expo dst formi ide kao **zaseban** `SerijaSearchModal` + `fetchSerijaRows` (`spMob_DST_Ser`), ne kao proširenje `SifarnikSearchModal`. Odabir retka hardkodira `{ sifart, sifsklad, skladiste, artikl, sifser: row.serija }` u `editValues` i `editFormData` — isto kao Ionic `onSearchModalSerijaConfirm` (ignora layout `azurFieldKey`). Layout JSON se ne mijenja; nepotpuni `serija` redovi (bez `selectFieldKey`/`azurFieldKey`) i dalje se preskaču u `layoutContract`.

**Razlog:** Ionic `SearchSer` koristi drugi SP, drugi oblik retka, toggle filtere i multi-field confirm — drugačiji ugovor od `spMob_DGL_Sifarnici`. Kopiranje Ionic `handleChange` klijentskog filtera na kraju i `uuidv4()` na svakom renderu namjerno izostavljeno.

**Posljedice:** MEDIVA `mediva/SRN` validna `serija` polja se prikazuju; runtime smoke na MEDIVA tabletu još treba potvrditi. Jukić dst forme bez `serija` u layoutu nepromijenjene.

## D038

**Datum:** 2026-08-07 · **Status:** `approved` (vlasnik projekta)

**Odluka:** **iOS** (runtime parity checklist, TestFlight, App Store) ide u **v2**. Expo **v1** = Android Play paritet s Ionic produkcijom. Kod u `expo/` ostaje portable (ne uvoditi Android-only API bez potrebe); v2 nije greenfield iOS app nego provjera + objava.

**Razlog:** Ionic nikad nije imao iOS build; produkcijski klijenti (uklj. MEDIVA) su na Androidu. Blokirati v1 na iOS checklist usporava zamjenu Ionica bez koristi za trenutne korisnike.

**Posljedice:** `V2_BACKLOG.md`, `FEATURE_PARITY_MATRIX.md` (`verified` = Android za v1), `PROJECT_CONTEXT.md`, `OPEN_QUESTIONS.md` #12.

