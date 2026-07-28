# Open Questions

Pitanja koja stvarno utječu na arhitektonske ili migracijske odluke. Kad odgovor postane poznat, upisuje se u polje "Odgovor" i pitanje se, ako time prestaje biti otvoreno, premješta u `DECISION_LOG.md` ili `CURRENT_ARCHITECTURE.md` prema prirodi odgovora.

## 1. Lokacija backend repozitorija

- **Status:** **razriješeno** (2026-07-28, vlasnik projekta).
- **Odgovor:** Lokalni `API/` je ista verzija kao produkcija — skinut s TFS-a. Koristi se kao reference-only uz Ionic klijent. Mogu postojati propusti u samoj mobilnoj/API integraciji jer je original brzo sklapan — ne pretpostavljati da je svaki controller u `API/` potpun za sve rute koje Ionic zove.

## 2. Implementacija `/login` endpointa

- **Status:** djelomično razriješeno - kod je u `API/Service.Gen/Controllers/LoginController.cs` i `API/Service.Helpers/Helpers/Login.cs`. **Ne mijenjati auth** dok backend tim ne odluči drugačije (pravilo 10 #9).

## 3. Implementacija `/doclayouts` i fallback pravila

- **Status:** otvoreno — original može imati propuste; backend tolerira nevalidan JSON (34 datoteke). Detalj parsera i fallback pravila i dalje treba potvrditi iz `API/` + ponašanja na operawebu.
- **Odgovor:** -

## 4. Obrada makroa `#today` i `#coid`

- **Status:** **razriješeno za Expo razvoj** (ne treba duplicirati logiku u klijentu).
- **Odgovor:** U `*EditItemsExtends.json` (npr. `"datumopcije": "#today"`, `"cokreiraoid": "#coid"`) mobilna app **ne zamjenjuje** te stringove — šalju ih kao parametre pri spremanju, **backend/SQL ih zamjenjuje** stvarnim datumom ili ID-jem korisnika (isti obrazac kao web). Expo šalje sirovo, kao Ionic.

## 5. Server-side push infrastruktura, FCM projekt i iOS APNs

- **Status:** otvoreno — **cilj je push na Android i iOS** u Expo aplikaciji. Server-side dio, FCM/APNs certifikati i Apple Developer nalog još nisu mapirani.

## 6. Način deploymenta layouta

- **Status:** djelomično razriješeno.
- **Odgovor:** Layouti po klijentu/modulu u **`MobLayoutsControls`** na shareu `\\operaweb\c$\inetpub\wwwroot\Opera\MobLayoutsControls`. Konzultanti/tim ih sastavljaju i stavljaju na server. Točan deploy workflow (ručno vs. skripta) nije formaliziran — potvrditi s timom.

## 7. Tko mijenja layoute

- **Status:** djelomično razriješeno.
- **Odgovor:** Konzultanti + razvojni tim. Sinkronizacija SP ↔ JSON layout i dalje nije dokumentirana.

## 14. Je li `/layouts` (`getDefinitions()`) endpoint još aktivan

- **Status:** **razriješeno — ne koristi se.**
- **Odgovor:** U Ionicu postoji funkcija `getDefinitions()` koja bi zvala `{SERVICE_DOMAIN}/layouts`, ali **nema nijednog poziva** u kodu. Svi moduli koriste **`/doclayouts`** (`getDocsDefinitions`). Legacy dead code — **ne implementirati u Expo-u**.

## 8. Dostupnost layouta sa zasebnih klijentskih servera

- **Status:** djelomično razriješeno (struktura u repou).
- **Odgovor:** Isti mehanizam — **`MobLayoutsControls`** na API serveru klijenta. U repou dvije varijante putanje:

  - **S prefiksom tenanta:** `zjukic/RNele`, `asura/RNteh`, `sdms/ERVadmin`, …
  - **Modul u korijenu:** `RNhig`, `SRN`, `SRNI` — SP prefix iz `queries.json` (npr. `RNhig` → `spMob_ASURA_*`, `SRN` → `spMob_MEDIVA_*`).

  Klijent s vlastitim serverom (IP) ima **svoju kopiju** foldera — usporediti pri rolloutu, ne pretpostaviti identičnost s operaweb snimkom.

## 9. Read-only pristup reprezentativnoj tenant bazi

- **Jednostavno:** ERP baza tenanta sadrži `spMob_*` procedure. Read-only SQL služi za provjeru naziva SP-ova prije upisa u `queries.json`.
- **Status:** djelomično — MCP na `OperaMobile` + SQL20xx; **vlasnik može dodati read-only prod baze** po potrebi.
- **Odgovor:** Test: **jukic001 → login svam → app PIN plusplus**.

## 10. Aktivni i napušteni tenanti

- **Status:** otvoreno.
- **Odgovor:** **jukic001** = test (`PinCore`, Active=true). **plusplus** = app PIN, ne core PIN. Produkcija ≈ klijenti na IP serverima. Popis aktivnih PIN-ova nije formaliziran.

## 11. Postojeći Play Store i CI/CD proces

- **Status:** djelomično razriješeno.
- **Odgovor:** **Cilj:** automatizirani buildovi preko **Expo/EAS** za Store — **zadnji korak** migracije, ne sada. Trenutni Ionic release proces nije u repou.

## 13. Postoji li testni tenant, testni PIN i testni korisnik namijenjen razvoju

- **Status:** **razriješeno** (2026-07-28, precizirano).
- **Odgovor:** **Core PIN `jukic001`** → **ERP korisnik `svam`** → **App PIN `plusplus`**.

## 12. iOS build (Ionic povijest)

- **Status:** djelomično — Expo = Android + iOS. Ionic vjerojatno **nikad nije imao** iOS build (`ios/` folder ne postoji).

## 15. "Odabir teksta" na memo poljima

- **Status:** **procjena: ne u Expo-u** dok se ne potvrdi korištenje u produkciji.
- **Odgovor:** Vjerojatno mrtav/krivo sklopljen dio originala (SP grane nedostaju). Expo: memo bez te tipke.

## 16. Naziv `*_DST_Azur` SP-a po tenantu

- **Status:** djelomično — SQL2022 potvrđuje `spMob_ASURA_DST_Azur`, `spMob_ZJUKIC_DST_Azur`. **`queries.dst.azur` nigdje u JSON-u** — Ionic hardkodira u store-u.
- **Odgovor:** Swipe akcije (Obriši, Potvrdi količinu) koriste **druge SP akcije** — v. D036, FEATURE_PARITY_MATRIX. Prije JSON izmjene provjeriti SP na bazi tenanta.

## 17. `/saveatt` i `/getatt` vs. lokalni `API/`

- **Status:** **razriješeno za Expo razvoj.**
- **Odgovor:** **Ionic u produkciji koristi** `{auth.api}/saveatt` i `/getatt` (vidi `TabPrivitci.jsx`, `dataHelper.js`). U lokalnom `API/` možda nema istoimenog controllera (npr. postoji `uploadPrilozi`) — vjerojatno **rupa u API snapshotu ili druga ruta u deployu**. Expo **replicira Ionic request**; API ne dirati ako na serveru radi.
