# Open Questions

Pitanja koja stvarno utječu na arhitektonske ili migracijske odluke. Kad odgovor postane poznat, upisuje se u polje "Odgovor" i pitanje se, ako time prestaje biti otvoreno, premješta u `DECISION_LOG.md` ili `CURRENT_ARCHITECTURE.md` prema prirodi odgovora.

## 1. Lokacija backend repozitorija

- **Zašto je važno:** bez pristupa backend kodu, sve pretpostavke o API ponašanju su inferirane iz klijenta, ne dokazane.
- **Što blokira:** potvrdu bilo kojeg kontrakta u Fazi 2 migracije; točnost `CURRENT_ARCHITECTURE.md` §6 i §7.
- **Tko vjerojatno zna:** backend tim / osoba koja održava ASP.NET API servis.
- **Status:** djelomično razriješeno — backend kod je u repou kao `API/` (reference-only).
- **Odgovor:** `API/Service.Gen/` (Web API kontroleri, rute `/api/data`, `/api/login`, …), `API/Service.Helpers/` (SQL, JSON transformacije, login logika). Produkcijski deploy i konfiguracija (`Web.config`, connection stringovi) nisu potvrđeni iz ovog repoa.

## 2. Implementacija `/login` endpointa

- **Zašto je važno:** klijent šalje `{ db, uid, pwd }` i očekuje `user[]` + `connection`, ali validacijska logika, hashing lozinke i točna struktura odgovora nisu vidljivi iz repozitorija.
- **Što blokira:** definiranje TypeScript kontrakta za auth u Expo aplikaciji (Faza 3–4); odluku mijenja li se autentikacijski mehanizam (blokirano i pravilom `10-change-safety.mdc` #9).
- **Tko vjerojatno zna:** backend tim.
- **Status:** djelomično razriješeno — kod je u `API/Service.Gen/Controllers/LoginController.cs` i `API/Service.Helpers/Helpers/Login.cs`.
- **Odgovor:** Request `{ db, uid, pwd }` s Basic Auth; validacija preko `auth.Accounts` (salt/hash ili AD domena); uspjeh vraća `{ user: DataTable→JSON niz, connection: { server, database, uid, password:"**********" } }`; greška HTTP 400 s JSON string porukom (npr. `"Pogrešna lozinka!"`). SQL aliasi korisnika su lowercase (`korime`, `sifosobe`, …) — v. `Login.cs` GetLoginData.

## 3. Implementacija `/doclayouts` i fallback pravila

- **Zašto je važno:** uključuje točan JSON schema layout datoteka, ponašanje kad datoteka ne postoji ili nije validna (v. 34 nevalidne datoteke u `CURRENT_ARCHITECTURE.md` §7.7). Mapiranje `spPinCoreAzur` (`ServerPath` → `serverpath`) **potvrđeno** u `API/Service.Helpers/Helpers/ConvertDtToJson.cs` (lowercase stupci + singlerow flatten).
- **Što blokira:** definiranje TypeScript tipa za layout u Expo aplikaciji; odluku hoće li validator (report-only, `DECISION_LOG.md` D007) uopće moći provjeriti nešto smisleno bez poznavanja stvarnog parsera.
- **Tko vjerojatno zna:** backend tim.
- **Status:** otvoreno.
- **Odgovor:** —

## 4. Obrada makroa `#today` i `#coid`

- **Zašto je važno:** ako se ovi makroi koriste unutar JSON layouta ili SP parametara, njihova obrada (klijent vs. backend, točna zamjena vrijednosti) mora biti replicirana identično u Expo klijentu.
- **Što blokira:** ispravnu implementaciju filtera/upita u generičkom modulu (Faza 5–6 migracije) svugdje gdje se makroi pojavljuju.
- **Tko vjerojatno zna:** backend tim ili osoba koja je pisala/održava JSON layoute.
- **Status:** otvoreno.
- **Odgovor:** —

## 5. Server-side push infrastruktura, FCM projekt i iOS APNs

- **Zašto je važno:** klijent ima FCM konfiguraciju (`google-services.json`) i demo push stranicu za Android, ali nije potvrđeno postoji li server-side servis koji šalje notifikacije niti koji je FCM projekt aktivan. Za iOS dodatno treba APNs certifikat/ključ i Apple Developer nalog, koji danas vjerojatno ne postoje jer aplikacija nikad nije bila na iOS-u — to nije potvrđeno.
- **Što blokira:** cijelu Fazu 8 migracijske strategije (push notifikacije) i odluku o push provideru i arhitekturi u `TARGET_ARCHITECTURE.md`; ta odluka se namjerno ne zaključuje dok se backend, FCM i iOS APNs zahtjevi ne analiziraju.
- **Tko vjerojatno zna:** backend/infra tim za server-side i FCM; poslovni vlasnik za postojanje/otvaranje Apple Developer naloga.
- **Status:** otvoreno.
- **Odgovor:** —

## 6. Način deploymenta layouta

- **Zašto je važno:** nije potvrđeno gdje točno na file sustavu API servera žive JSON layouti, ni kako se promjena datoteke distribuira (ručno kopiranje, skripta, drugo).
- **Što blokira:** odluku treba li Expo migracija promijeniti proces deploya layouta ili ga zadržati identičnim (`DECISION_LOG.md` D006 privremeno rješava ovo tretiranjem snimke kao read-only referencu).
- **Tko vjerojatno zna:** osoba koja administrira `operaweb` server i klijentske servere.
- **Status:** otvoreno.
- **Odgovor:** —

## 7. Tko mijenja layoute

- **Zašto je važno:** nepoznato je postoji li formalni proces (npr. samo developeri, ili i netehnički korisnici preko nekog alata) za izmjenu JSON layouta, što utječe na to koliko strog validator ima smisla uvesti. Uz to, nije potvrđeno tko održava tenant `spMob_*` procedure i kako se te procedure sinkroniziraju s pripadajućim layout JSON-om (npr. kad se promijeni SP potpis, mora li se ručno uskladiti layout).
- **Što blokira:** dizajn budućeg workflowa za layout izmjene i odluku o strogosti validatora; procjenu rizika neusklađenosti SP-a i layouta u Fazi 2 migracije.
- **Tko vjerojatno zna:** tim koji trenutno održava `MobLayoutsControls` i tim koji piše `spMob_*` procedure.
- **Status:** otvoreno.
- **Odgovor:** —

## 14. Je li `/layouts` (`getDefinitions()`) endpoint još aktivan na backendu

- **Zašto je važno:** u klijentskom kodu se koristi rijetko i djeluje kao legacy put, ali bez uvida u backend nije potvrđeno je li stvarno napušten ili ga još koristi neki tenant.
- **Što blokira:** odluku smije li se taj endpoint izostaviti iz Expo API clienta bez gubitka funkcionalnosti za neki tenant.
- **Tko vjerojatno zna:** backend tim.
- **Status:** otvoreno.
- **Odgovor:** —

## 8. Dostupnost layouta sa zasebnih klijentskih servera

- **Zašto je važno:** lokalna snimka (762 datoteke) pokriva samo tenante na `erp.svamplus.hr`; klijenti s vlastitim API serverom (npr. Zaštita Jukić, Ruve) imaju odvojene kopije koje nisu obuhvaćene ovom analizom.
- **Što blokira:** potpunost `CURRENT_ARCHITECTURE.md` i procjenu stvarnog opsega Faze 10 (rollout po tenantima) za te klijente.
- **Tko vjerojatno zna:** tim koji ima pristup infrastrukturi tih klijenata.
- **Status:** otvoreno.
- **Odgovor:** —

## 9. Read-only pristup reprezentativnoj tenant bazi

- **Zašto je važno:** dosadašnji SQL uvid pokriva samo `OperaMobile`; `spMob_*` procedure i stvarna struktura poslovnih podataka (npr. `spMob_Menu_Query` result set kolone) nisu bile dostupne za provjeru.
- **Što blokira:** potvrdu SQL kontrakata u Fazi 2 migracije; točnost dijelova `CURRENT_ARCHITECTURE.md` §9.4 koji su trenutno inferirani iz klijentskog koda, ne iz same baze.
- **Tko vjerojatno zna:** DBA ili backend tim koji upravlja pristupom tenant bazama.
- **Status:** otvoreno.
- **Odgovor:** —

## 10. Aktivni i napušteni tenanti

- **Zašto je važno:** `OperaMobile.dbo.Server`/`PinCore` sadrži zapise za više klijenata (SVAM, MIDA, MEDIVA, Zaštita Jukić, Ruve, MBFRIGO, ASURA, Adriateh, Jasika i drugi), ali nije potvrđeno koji su trenutno aktivni u produkciji naspram napuštenih/testnih zapisa.
- **Što blokira:** realan opseg Faze 10 (rollout po tenantima) — bez ovoga se ne zna koliko tenanta stvarno treba migrirati.
- **Tko vjerojatno zna:** poslovni/support tim SvamPlusa.
- **Status:** otvoreno.
- **Odgovor:** —

## 11. Postojeći Play Store i CI/CD proces

- **Zašto je važno:** repozitorij ne sadrži CI konfiguraciju ni dokumentaciju o objavi na Play Store; nepoznato je radi li se to ručno i tko je za to zadužen.
- **Što blokira:** planiranje Expo build/release procesa (EAS Build/Update) i usklađivanje s postojećim procesom da ne dođe do paralelnih, nekonzistentnih načina objave.
- **Tko vjerojatno zna:** osoba koja trenutno radi Android release.
- **Status:** otvoreno.
- **Odgovor:** —

## 12. iOS build i distribucija za Ionic aplikaciju (povijesno pitanje, ne za Expo opseg)

- **Zašto je važno:** riješeno je da je **iOS potvrđen kao ravnopravna ciljana platforma za Expo aplikaciju** (v. `TARGET_ARCHITECTURE.md`, `PROJECT_CONTEXT.md`) — to više nije otvoreno pitanje. Ostaje nepoznato je li Ionic aplikacija ikad imala iOS build (repozitorij ne sadrži `ios/` folder), što je čisto povijesna činjenica bez utjecaja na Expo opseg.
- **Što blokira:** ništa za Expo migraciju; zanimljivo je samo za potpunost `CURRENT_ARCHITECTURE.md`.
- **Tko vjerojatno zna:** poslovni vlasnik proizvoda.
- **Status:** djelomično razriješeno — opseg za Expo potvrđen, povijesna činjenica o Ionic iOS buildu ostaje nepoznata.
- **Odgovor:** Expo aplikacija razvija se za Android i iOS ravnopravno (odluka `DECISION_LOG.md`). Ionic iOS status: nepoznato.

## 13. Postoji li testni tenant, testni PIN i testni korisnik namijenjen razvoju

- **Zašto je važno:** bez stabilnog testnog okruženja, provjera funkcionalnog pariteta (Faze 4–9 migracije, `FEATURE_PARITY_MATRIX.md`) rizikuje testiranje na stvarnim produkcijskim podacima klijenta.
- **Što blokira:** svaki `parity-review` korak u migracijskoj strategiji dok ne postoji siguran tenant za ponovljivo testiranje.
- **Tko vjerojatno zna:** razvojni tim / osoba koja upravlja `OperaMobile` PIN registrom.
- **Status:** otvoreno.
- **Odgovor:** —

## 15. Stvarno ponašanje "odabir teksta" pretrage na memo poljima (`dglEditItems.*.search`)

- **Zašto je važno:** nekoliko `dgl` layouta (npr. `zjukic/RNele`, `adriateh/156EV`, `jasika/SRN` — ukupno 8 tenant foldera) definira `search: { type, entity, debaunce }` na `memo` poljima ("Odabir teksta" akcija u `src/pages/dgl/components/MasterAzur.jsx renderMemoControl`). Čitanjem `src/components/search/simple/search.jsx` i `MasterAzur.jsx handleShowModal`/`onSearchModalConfirm` ispada da odabir retka **zamjenjuje cijeli memo tekst odabranim `id`** (ne `name`, ne append) — arhitektonski neobično za "odabir teksta". Provjerom `spMob_DGL_Sifarnici` definicije na dva dostupna SQL servera (SQL2019, SQL2022 preko `user-disp-sql-*-readonly`), akcije koje se koriste u tim layoutima (`napomena`, `napomena6`, `napomena8`, `napomena9`, `napomena12`) **ne postoje** u toj proceduri (nema `ELSE` grane, pa poziv vraća prazan rezultat) — ne postoji dokaz da funkcija ikad radi na tim primjercima baze.
- **Što blokira:** implementaciju ove pod-funkcionalnosti u Expo formi (`EditFormField`/`SifarnikSearchModal`); trenutno je namjerno izostavljena (memo polja se prikazuju bez "Odabir teksta" opcije) dok se ne potvrdi stvarno ponašanje na produkcijskom tenantu koji je koristi.
- **Tko vjerojatno zna:** backend tim (može li postojati tenant-specifična varijanta `spMob_DGL_Sifarnici` s tim akcijama) ili netko tko je stvarno koristio ovu tipku na terenu (zjukic/adriateh/jasika).
- **Status:** otvoreno.
- **Odgovor:** —

## 16. Točan naziv `*_DST_Azur` SP-a po tenantu (za `queries.dst.azur`)

- **Zašto je važno:** `src/pages/dgl/store/index.jsx` hardkodira `spMob_ZJUKIC_DST_Azur` (spremanje, potvrda/brisanje potvrde količine) i `spMob_DST_RadniNalozi_Azur` (promjena statusa, brisanje stavke) izravno u "generičkom" dgl kodu, ne preko `queries.json`. Expo sada čita `queries.dst.azur` iz JSON-a (v. `DECISION_LOG.md` D026) po istoj konvenciji imenovanja koja se već koristi za `dst.list` (`spMob_ASURA_DST_Query`, `spMob_MEDIVA_DST_Query`, `spMob_SDMS_DST_Query`, `spMob_ZJUKIC_DST_Query` — potvrđeno u `queries.json` za RNhig/RNint/RNteh/RNsec, SRN, ERVadmin, SRNI/SRNjas/NARd/NARd2), ali **ne pretpostavlja** da `spMob_{TENANT}_DST_Azur` stvarno postoji na bazi svakog tenanta — to nije potvrđeno SQL uvidom (read-only pristup ne uključuje SP definicije po svim ~250 tenant baza).
- **Što blokira:** dodavanje `queries.dst.azur` u `MobLayoutsControls/{RNhig,RNint,RNteh,RNsec,SRN,ERVadmin,SRNI,SRNjas,NARd,NARd2}/queries.json` — bez potvrde točnog naziva SP-a po tenantu, dodavanje pogrešne vrijednosti bi bilo jednako loše kao postojeći Ionic hardkod. Ovo je zaseban zadatak po `.cursor/rules/10-change-safety.mdc` pravilo 3 (izmjena `MobLayoutsControls/`), namjerno nije napravljeno u ovoj seriji.
- **Tko vjerojatno zna:** backend/razvojni tim — koji dgl tenanti stvarno koriste unos/izmjenu stavki u produkciji, i postoji li doista `spMob_{TENANT}_DST_Azur` za ASURA/MEDIVA/SDMS (za ZJUKIC-obitelj je već hardkodiran u Ionicu, dakle vjerojatno potvrđeno da postoji).
- **Status:** otvoreno.
- **Odgovor:** —

## 17. `/saveatt` i `/getatt` (privitci) ne postoje u lokalnoj `API/` referenci — koristi li se doista taj endpoint u produkciji

- **Zašto je važno:** `src/utils/dataHelper.js` (`saveAttachments`, `getAttachemnt`) zove `${api}/saveatt` i `${api}/getatt`, i to je jedini kontrakt koji Expo `attachmentsApi.ts` replicira (v. `DECISION_LOG.md` D027/D028). Lokalna `API/` referenca (`API/Service.Gen/Controllers/UploadController.cs`) ima potpuno drugačiju rutu — `POST /api/uploadPrilozi` — koja prima `multipart/form-data` (polja `db`/`fieldKey`/`fieldValue` + `httpRequest.Files`), ne JSON `{ db, parameters: { dglid, files } }` koji Ionic frontend stvarno šalje. Nema nijednog `Route` atributa za `saveatt`/`getatt` bilo gdje u `API/` folderu.
- **Što blokira:** ništa direktno — Expo implementacija repliciravno postojeći, dokazano radeći Ionic frontend request oblik, ne oblik iz lokalne API reference (koja je po `.cursor/rules/00-project-context.mdc` ionako izvan ovog repozitorija/nepotvrđena kao trenutna produkcijska verzija). Ako se ikad javi potreba za promjenom backend ugovora, netko bi mogao pogrešno pretpostaviti da `UploadController.cs` odražava stvarno ponašanje.
- **Tko vjerojatno zna:** backend tim — je li `API/` folder zastarjela/djelomična kopija stvarnog servisa, ili `saveatt`/`getatt` postoje u nekom drugom kontroleru koji trenutno nije dostupan lokalno.
- **Status:** otvoreno (ne blokira, samo dokumentira nesigurnost).
- **Odgovor:** —
