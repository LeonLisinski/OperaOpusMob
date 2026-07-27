---
name: fix-root-cause-bug
description: Dijagnosticira bug u Opera Mobile aplikaciji do stvarnog uzroka i određuje pravi sloj popravka prije bilo kakve izmjene. Koristi se za prijave grešaka od korisnika ili podrške, za pogrešne podatke na ekranu, i kad simptom pokazuje na UI ali uzrok može biti u layoutu, API-ju ili SQL-u.
---

# Popravak uzroka, ne simptoma

Simptom je uvijek na ekranu. Uzrok je rijetko tamo. U ovom sustavu uzrok može biti u pet slojeva i **popravak na krivom sloju sakrije problem umjesto da ga riješi**.

## Potrebni ulazi

Prije dijagnoze prikupi:

- Što korisnik radi, što očekuje, što dobije
- **Koji tenant i koji `sifdv` / modul** — bez toga ne možeš provjeriti pravi layout
- Verzija aplikacije (`Postavke` → Verzija) i uređaj
- Događa li se svim korisnicima tog tenanta ili jednom
- Radi li ista stvar u drugom modulu ili kod drugog tenanta

Ako nedostaje tenant ili modul, **traži ih prije analize**.

## Koraci

### 1. Reproduciraj ili dokaži da ne možeš

Ako reprodukcija nije moguća, zapiši zašto (nemamo taj tenant, nemamo layout, nemamo pristup serveru). Nastavak je tada analiza, ne popravak.

### 2. Odredi sloj

Prati tok skillom `trace-and-analyze-impact`, pa svrstaj:

| Simptom | Vjerojatan sloj | Prvo provjeri |
|---|---|---|
| Polje se ne prikazuje ili ima krivu oznaku | JSON layout | `dglViewItems` / `dglListItem` tog tenanta |
| Polje je prazno, layout izgleda ispravno | SP ne vraća stupac | `queries.json` → koji SP se zove |
| Radi kod jednog tenanta, ne kod drugog | tenant layout ili tenant SP | usporedi obje varijante layouta |
| Greška tek nakon spremanja | `azurFieldKey` ili SP `Azur` | `*EditItems` mapiranje |
| Ekran puca / bijeli ekran | mobilni kod | renderer koji čita layout |
| Radi u `dgl`, ne u `gen` (ili obrnuto) | duplicirana logika | oba store-a |

### 3. Dokaži uzrok

Uzrok je dokazan kad možeš reći: **"ako promijenim X, simptom nestaje, i znam zašto."** Do tada je hipoteza.

### 4. Odredi pravi popravak

Pitaj: da isti problem sutra prijavi drugi tenant, bi li ovaj popravak i njima pomogao?

- Da → ispravan sloj.
- Ne, jer je specifičnost tog tenanta → popravak ide u **layout ili SP**, ne u mobilni kod.
- Da, ali samo uz `if` po tenantu → **krivi sloj** (pravilo 20).

### 5. Popravi i dokaži

Test koji bi pao prije popravka, prolazi poslije.

## Obavezne provjere

- [ ] Uzrok je dokazan, ne pretpostavljen
- [ ] Provjereno postoji li isti problem u `servis`, `dgl`, `gen`
- [ ] Provjereno je li isti layout obrazac kod drugih tenanta pogrešan
- [ ] Popravak je na sloju koji koristi svim pogođenima
- [ ] Ako je uzrok u layoutu ili SP-u — izmjena traži zasebno odobrenje (pravilo 10)

## Zabranjeno

- Popraviti simptom u komponenti kad je uzrok u podacima ili layoutu.
- Dodati `if` po tenantu, `sifdv` ili nazivu klijenta u zajednički kod.
- Dodati defenzivni `?.` ili `|| ''` koji sakrije da podatak nedostaje, bez objašnjenja zašto nedostaje.
- Mijenjati layout ili SP bez odobrenja, čak i kad je uzrok tamo.
- Popraviti usput i nešto drugo što si primijetio.

## Kriteriji završetka

Uzrok je imenovan s dokazom, popravak je na obrazloženom sloju, test pokriva regresiju, provjereno je da isti bug ne postoji u drugim modulima i kod drugih tenanta, i dokumentacijski utjecaj je zapisan.
