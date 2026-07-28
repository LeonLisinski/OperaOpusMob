# Project Context

## Tvrtka i proizvod

Opera Mobile je poslovna mobilna aplikacija tvrtke SvamPlus - mobilni klijent za **OperaOpus ERP**, vlastiti ERP sustav tvrtke. Aplikaciju koriste stvarni klijenti u produkciji (servisne tvrtke, CRM korisnici, radni nalozi na terenu i drugi poslovni moduli), preko više tenanta s vlastitim ERP bazama i, kod nekih, vlastitim API serverima. Broj i struktura klijenata tvrtke SvamPlus izvan Opera Mobile korisnika nije predmet ove dokumentacije.

Ovo je projekt tvrtke s produkcijskim korisnicima, ne interni eksperiment. Svaka promjena ima stvarnu cijenu ako pokvari nešto što klijent koristi.

## Tim i posljedice za arhitekturu

Mali razvojni tim (~5 ljudi) bez specijalizacije za mobilni razvoj mora moći:

- razumjeti sustav bez oslanjanja na jednu osobu koja "sve zna"
- dodati ili prilagoditi modul bez duboke ekspertize u React Native
- prilagoditi ponašanje po klijentu bez objave nove verzije aplikacije, gdje god je to razumno

Ove posljedice izravno oblikuju arhitektonske odluke: prednost jednostavnom i dokumentiranom pred elegantnim ali teško održivim, zadržavanje JSON-driven konfiguracije kao mehanizma prilagodbe, i izbjegavanje uzoraka koji zahtijevaju specijalističko znanje za svakodnevno održavanje.

## Trenutno stanje

Aplikacija je izgrađena na Ionic React + Capacitor (v6), objavljena za Android. Detaljno stanje je u [`CURRENT_ARCHITECTURE.md`](CURRENT_ARCHITECTURE.md) - ovaj dokument ga ne ponavlja.

## Cilj migracije

Cilj je Expo/React Native aplikacija koja čuva postojeće poslovno ponašanje, ostaje kompatibilna s postojećim API-jem i bazama, modernizira UI/UX i pojednostavljuje dugoročno održavanje. Ovo **nije** mehaničko prepisivanje Ionic komponenti u React Native - cilj je kontrolirana migracija poslovnih flowova u smisleniju ciljnu arhitekturu, uz smanjenje postojećeg dupliciranja (`servis` / `dgl` / `gen`).

**Ciljne platforme:** trenutna Ionic aplikacija je Android-only produkcijska referenca. Expo aplikacija se razvija **ravnopravno za Android i iOS** - iOS nije naknadna opcija nego dio ciljne aplikacije od početka, pa arhitektura, odabrane biblioteke i implementirane funkcionalnosti moraju podržavati obje platforme. Huawei uređaji koje SvamPlus klijenti koriste imaju Google Play Services, pa se Huawei ne tretira kao zasebna platforma ni poseban tehnički zahtjev.

Ciljna arhitektura je tek djelomično definirana - v. [`TARGET_ARCHITECTURE.md`](TARGET_ARCHITECTURE.md) (status: Draft).

## Pravilo tijekom migracije

**Ionic aplikacija (`src/`) ostaje produkcijska referenca dok Expo ekvivalent nema dokazanu funkcionalnu jednakost**, po modulu i po tenantu. Stara implementacija se ne uklanja prije potvrđenog pariteta. Postupak je detaljno opisan u [`MIGRATION_STRATEGY.md`](MIGRATION_STRATEGY.md) i skillu `migrate-expo-feature`.

## Zašto je jednostavnost održavanja i konfiguracije prioritet

Sustav već ima mehanizam koji smanjuje potrebu za objavom nove verzije aplikacije - JSON layouti u `MobLayoutsControls/` koji definiraju liste, forme i SP mapiranje po tenantu preko API endpointa `/doclayouts`. Taj mehanizam se **zadržava i unapređuje**, ne zamjenjuje nečim što bi ponovno vezalo svaku sitnu prilagodbu uz release ciklus. Detalji su u `CURRENT_ARCHITECTURE.md` i `docs/technical/layouts/` (kad nastane).
