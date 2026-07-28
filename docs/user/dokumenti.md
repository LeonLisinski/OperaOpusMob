# Dokumenti

Modul otvara **popis dokumenata** - radnih naloga, upita, narudžbi ili drugih zapisa ovisno o modulu.

## Popis dokumenata

Svaki redak prikazuje polja definirana konfiguracijom modula (npr. broj dokumenta, datum, partner, status). Boja lijeve trake i sadržaj retka mogu varirati po tenant-u.

### Pretraga

Gore na popisu nalazi se **polje za pretragu**. Upis filtrira prikazani popis po poljima koja modul podržava za pretragu (konfiguracija `searchfields`).

Pretraga radi **lokalno** nad već učitanim podacima - ne šalje novi upit na server pri svakom znaku.

### Filter

Gumb **Filter** otvara prozor s tri sekcije:

| Sekcija | Sadržaj |
|---|---|
| **Statusi** | Odabir jednog ili više statusa dokumenta |
| **Razdoblje** | Brzi odabir (npr. danas, tjedan, mjesec) |
| **Ostalo** | Datumi od/do, dodatne opcije ovisno o modulu |

- **Primijeni** - primjenjuje filter i osvježava popis s servera
- **Reset** (gore desno) - vraća filter na zadane vrijednosti
- **Odustani** - zatvara bez primjene

Datumi se unose ručno u formatu **YYYY-MM-DD** (npr. `2026-07-28`).

::: tip
Ako vam tipkovnica prekriva polja u filteru, skrolajte - ekran se automatski pomiče kad fokusirate polje.
:::

### Novi dokument

Ako modul to dopušta, gore desno je gumb **+ Novi**. Otvara praznu formu za unos novog dokumenta.

Dostupnost ovisi o tipu modula i postavkama - nije svaki modul dopušta kreiranje novih zapisa s mobitela.

## Detalj dokumenta

Dodirnite redak na popisu da otvorite **detalj**. Prikazuju se sekcije i polja prema konfiguraciji modula (read-only prikaz).

### Tabovi na dnu

Ovisno o modulu i dokumentu, na dnu ekrana mogu biti tabovi:

| Tab | Sadržaj |
|---|---|
| **Info** | Osnovni podaci dokumenta |
| **Stavke** | Popis stavki dokumenta |
| **Rad** | Radne stavke (ako modul ima oba tipa) |
| **Privitci** | Datoteke vezane uz dokument |
| **Potpis** | Potpis i slanje izvještaja |

Nisu svi tabovi uvijek vidljivi - ovisi o modulu i stanju dokumenta.

## Uređivanje dokumenta

Ako je dokument **urediv** (nije zaključan), na detalju je akcija **Uredi** (ili slično) koja otvara **formu za uređivanje**.

### Tipovi polja u formi

| Tip | Kako se koristi |
|---|---|
| Tekst | Slobodan unos |
| Datum | Unos u formatu YYYY-MM-DD |
| Šifrarnik (simple) | Dodir na polje → odabir iz popisa |
| Šifrarnik (advanced) | Upis min. 2 znaka → pretraga na serveru → odabir |
| Memo | Višeredni tekst |

Neka polja mogu biti **onemogućena** ovisno o pravilima modula (npr. samo pri uređivanju, ne pri kreiranju).

Pritiskom **Spremi** podaci se šalju na server. **Odustani** vraća na detalj bez spremanja.

::: warning
Funkcija "Odabir teksta" na memo poljima iz stare aplikacije **nije implementirana** u Expo verziji.
:::

## Povratak na popis

Koristite **natrag** (strelica gore lijevo) da se vratite na popis dokumenata. Filter i pretraga ostaju kakvi ste ih postavili.
