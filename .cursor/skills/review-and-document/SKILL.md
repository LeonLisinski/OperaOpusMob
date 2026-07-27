---
name: review-and-document
description: Pregledava završenu promjenu na Opera Mobile projektu protiv odobrenog plana i ažurira dokumentaciju prema stvarnoj implementaciji. Koristi se prije zatvaranja zadatka, prije pull requesta, i kad treba utvrditi je li promjena spremna prema Definition of Done.
disable-model-invocation: true
---

# Pregled i dokumentiranje

Pregled se radi **protiv plana**, ne protiv dojma. Dokumentacija se ažurira **protiv koda**, ne protiv plana.

## Potrebni ulazi

Odobreni plan iz `.cursor/plans/` i diff promjene. Ako plana nema jer je promjena bila trivijalna, pregled je kraći ali se i dalje radi.

## Dio A — pregled implementacije

### 1. Protiv plana

Za svaki kriterij prihvaćanja iz plana: zadovoljen / nije / promijenjen uz obrazloženje. Ako je implementacija odstupila od plana, odstupanje se zapisuje — ne prešućuje.

### 2. Protiv pravila

- [ ] Nema tenant imena ni `if` po tenantu u zajedničkom kodu (pravilo 20)
- [ ] Slojevi poštovani: komponenta ne zove API izravno (pravilo 20)
- [ ] Nema hardkodiranih hex boja u komponenti (pravilo 50)
- [ ] Nije mijenjano ništa izvan opsega: `src/`, layouti, konfiguracije, baza (pravilo 10)
- [ ] Nema novih ovisnosti bez odobrenja

### 3. Protiv sustava

- [ ] Isti problem ne postoji u drugim modulima
- [ ] Tenant varijante provjerene, ili je nepoznanica eksplicitno navedena
- [ ] Testovi postoje i pokrivaju rizik iz plana

### 4. Nalaz

```markdown
## Nalaz pregleda — <naziv>

Kriteriji prihvaćanja: X/Y zadovoljeno
Odstupanja od plana: ...

🔴 Blokira: ...
🟡 Za razmotriti: ...
🟢 Opcionalno: ...

Preporuka: spremno | doraditi | vratiti na plan
```

## Dio B — dokumentacija

Struktura `docs/technical/` i `docs/user/` **još nije kreirana**. Do tada se ovaj dio svodi na provjeru da je `Documentation impact` u planu popunjen i točan, te da su zaostale obveze zabilježene.

Kad dokumentacija zaživi, postupak je:

1. **Utvrdi stvarno stanje iz koda**, ne iz plana. Pročitaj što je stvarno implementirano.
2. **Nađi pogođene stranice.** Samo one koje opisuju promijenjeno ponašanje.
3. **Ažuriraj minimalno.** Ne prepisuj stranicu zbog jedne rečenice.
4. **Ukloni zastarjelo.** Zastarjela uputa je gora od nikakve.
5. **Provjeri obje publike.** Tehnička i korisnička dokumentacija ne smiju tvrditi suprotno.
6. **Provjeri linkove i build.**

### Korisnička dokumentacija

Hrvatski, jezik korisnika, organizirano po zadatku. Terminologija doslovno iz aplikacije. Nedovršena funkcionalnost se **ne opisuje kao postojeća** — označi status ili izostavi. Screenshot samo za stabilan, stvarno postojeći ekran.

## Zabranjeno

- Tvrditi da je dokumentacija ažurirana bez usporedbe sa stvarnom implementacijom.
- Odobriti promjenu koja je izvan opsega plana, i kad je poboljšanje.
- Popravljati nalaze iz pregleda usput bez zapisa.
- Pisati dokumentaciju za funkcionalnost koja još ne postoji.
- Mijenjati dokumentaciju kad promjena nema utjecaja na ponašanje ni održavanje.

## Kriteriji završetka

Svaki kriterij prihvaćanja je ocijenjen, odstupanja zapisana, nalaz ima jasnu preporuku, dokumentacijski utjecaj je razriješen ili zabilježen kao zaostala obveza, i nijedan 🔴 nalaz nije otvoren.
