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

Cilj je **ista aplikacija, modernizirana i dovršena** — ne novi proizvod od nule:

- **Expo/React Native** — **v1 = Android** (Play, paritet s Ionic produkcijom); **iOS** (TestFlight / App Store / runtime checklist) = **v2** (`V2_BACKLOG.md`, D038). Kod ostaje portable.
- **Zadržati JSON-driven model** — prilagodbe po klijentu kroz `MobLayoutsControls/` i `spMob_*` procedure, bez obaveznog Store releasea za svaku sitnicu (kao web pristup).
- **Ne dirati API** dok radi; promjene prvenstveno kroz layout JSON i SQL.
- **Dovršiti** što je u Ionic originalu nedovršeno ili loše (push, servis moduli, mrtvi tabovi, hardkodi) — push i iOS u v2.
- Ionic original je brzo sklopljen — **referenca ponašanja**, ne uzor kvalitete; bugove u Expo-u ne replicirati namjerno.

Ovo **nije** mehaničko prepisivanju Ionic komponenti u React Native.

**Ciljne platforme:** Ionic produkcija je Android-only. Expo **v1** = Android Play. iOS ostaje dugoročni cilj (portable kod), ali **objava i parity checklist su v2** (D038). Huawei uređaji koje SvamPlus klijenti koriste imaju Google Play Services, pa se Huawei ne tretira kao zasebna platforma.

## Test okruženje

1. **Core PIN:** `jukic001`
2. **ERP login:** korisnik `svam`
3. **App PIN:** `plusplus` (nakon odabira aplikacije)

Read-only pristup **produkcijskim tenant bazama** moguć po dogovoru — korisno za provjeru `spMob_*` prije izmjene JSON layouta.

## Backend i layouti

- ASP.NET API: folder **`API/`** u repou (TFS, reference-only).
- Opera Web: folder **`OperaWeb/`** (TFS `WebERP/OperaWeb`, reference-only).
- **Dispečer (Slavonija Bus):** folder **`Dispecer/`** — klon s TFS `WebERP/Dispecer` (`http://devops:8080/tfs/DefaultCollection/WebERP/_git/Dispecer`). Reference-only za kasnije mobilne značajke po uzoru na web; **ne mijenjati** kao dio Opera Mobile migracije. Unutar klona postoji i `Dispecer/mobile/` (zaseban Expo kontekst) + `Dispecer/docs/`.
- Layouti: **`\\operaweb\c$\inetpub\wwwroot\Opera\MobLayoutsControls`** — održavaju konzultanti + tim.

## Pravilo tijekom migracije

**Ionic aplikacija (`src/`) ostaje produkcijska referenca dok Expo ekvivalent nema dokazanu funkcionalnu jednakost**, po modulu i po tenantu. Stara implementacija se ne uklanja prije potvrđenog pariteta. Postupak je detaljno opisan u [`MIGRATION_STRATEGY.md`](MIGRATION_STRATEGY.md) i skillu `migrate-expo-feature`.

## Zašto je jednostavnost održavanja i konfiguracije prioritet

Sustav već ima mehanizam koji smanjuje potrebu za objavom nove verzije aplikacije - JSON layouti u `MobLayoutsControls/` koji definiraju liste, forme i SP mapiranje po tenantu preko API endpointa `/doclayouts`. Taj mehanizam se **zadržava i unapređuje**, ne zamjenjuje nečim što bi ponovno vezalo svaku sitnu prilagodbu uz release ciklus. Detalji su u `CURRENT_ARCHITECTURE.md` i `docs/technical/layouts/` (kad nastane).
