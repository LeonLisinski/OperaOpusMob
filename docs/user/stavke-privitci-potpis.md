# Stavke, privitci i potpis

Ovi dijelovi su dostupni kao **tabovi na dnu** ekrana dokumenta (v. [Dokumenti](./dokumenti)).

## Stavke

Tab **Stavke** prikazuje popis stavki dokumenta (artikli, usluge, radovi…).

### Pregled

- Svaki redak prikazuje polja definirana konfiguracijom modula
- Dokument se učitava pri otvaranju taba - kratko se prikazuje placeholder (skeleton) dok se podaci dohvaćaju

### Dodavanje i uređivanje

Ako je dokument **urediv** i modul to podržava:

- **+ Novi** - dodavanje nove stavke
- Dodir na postojeću stavku - uređivanje (ako stavka nije zaključana)

Forma stavke koristi ista polja kao glavni dokument (tekst, datum, šifrarnici…).

::: warning Važno
Uređivanje stavki **radi samo ako je modul konfiguriran** s odgovarajućim postavkama na serveru (`queries.dst.azur` u JSON layoutu). Ako konfiguracija ne postoji, tab može prikazati stavke ali **spremanje neće raditi**.

Brisanje stavki, promjena statusa stavke i potvrda količine **nisu implementirani** u Expo verziji.
:::

## Tab Rad

Neki moduli imaju i tab **Rad** - zaseban popis radnih stavki (isti ekran kao Stavke, drugi tip podataka). Prikazuje se samo kad modul to definira.

## Privitci

Tab **Privitci** prikazuje datoteke vezane uz dokument.

### Pregled

Popis privitaka s nazivom datoteke. Dodir na privitak **preuzima i otvara** datoteku (PDF, slika…) preko sustavnog dijela/viewer-a.

### Dodavanje

Gumb **Dodaj** (ili slično) otvara odabir datoteke s uređaja. Odabrana datoteka se šalje na server.

Tab **Privitci** prikazuje se samo za **dgl** module koji imaju konfiguraciju privitaka. Za **gen** module privitci nisu implementirani.

## Potpis

Tab **Potpis** omogućuje:

1. **Unos imena i e-maila** (predpopunjeno iz dokumenta ako je konfigurirano)
2. **Crtanje potpisa** prstom/stylusom na platnu
3. **Spremanje** - potpis se šalje na server i po konfiguraciji generira/se šalje izvještaj (REPX)

Tab se prikazuje samo kad:

- modul je tipa **dgl**
- dokument ima omogućen potpis (`tabpotpisvisible`)
- modul ima konfiguraciju potpisa/izvještaja

::: tip
Crtanje potpisa zahtijeva **Android ili iOS uređaj**. Na web pregledniku potpis možda neće raditi ispravno.
:::

## Sažetak dostupnosti tabova

| Tab | Uvjet prikaza |
|---|---|
| Info | Uvijek |
| Stavke | Modul ima stavke |
| Rad | Modul ima radne stavke |
| Privitci | dgl modul + konfiguracija privitaka |
| Potpis | dgl modul + dokument dopušta potpis |

Ako tab ne vidite, vaš modul ili dokument to ne podržava - to je očekivano ponašanje, ne greška aplikacije.
