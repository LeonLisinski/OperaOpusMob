---
name: plan-project-change
description: Izrađuje plan promjene za Opera Mobile prije implementacije, s pragom od 12 obaveznih točaka i dokumentacijskim utjecajem. Koristi se za svaku srednju ili veliku promjenu — novi modul, izmjena zajedničke logike, migracija funkcionalnosti, promjena API ili layout ponašanja.
disable-model-invocation: true
---

# Plan promjene

Rezultat je datoteka u `.cursor/plans/`, ne poruka u chatu. Implementacija ne kreće bez odobrenja čovjeka.

## Kada koristiti

| Opseg | Postupak |
|---|---|
| Trivijalno (tipfeler, string, boja u tokenu) | Bez plana. Provjeri postojeći obrazac, izmijeni, testiraj. |
| Malo i lokalno (jedna komponenta, bez API/SQL/layout utjecaja) | Kratki plan: obrazac, datoteke, rizik, test. |
| Srednje i veliko | Puni plan — svih 12 točaka niže. |

Ako nisi siguran u opseg, tretiraj kao srednje.

## Potrebni ulazi

Zahtjev korisnika, i ako postoje: broj ticketa, pogođeni tenant, `sifdv` ili modul, screenshot problema.

Ako zahtjev nije jasan definiran, **prvo ga razjasni** — nejasan zahtjev je razlog za zaustavljanje, ne za pretpostavku.

## Koraci

1. **Pronađi postojeći obrazac.** Kako se ista ili najsličnija stvar već radi? Traži u `src/`, `MobLayoutsControls/`, i bazi. Ne izmišljaj novi obrazac dok postojeći nije analiziran.
2. **Prati puni flow** kroz UI → navigacija → state → service/API → endpoint → SQL/SP → JSON layout → tenant konfiguracija → rezultat korisniku. Za detaljno praćenje koristi skill `trace-and-analyze-impact`.
3. **Provjeri sve varijante:** `servis`, `dgl`, `gen`, drugi moduli, drugi tenanti.
4. **Odredi pravi sloj** promjene (v. pravilo 30, sekcija "Pravi sloj promjene").
5. **Napiši plan** prema predlošku niže.
6. **Stani i traži odobrenje.**

## Predložak plana

Spremi kao `.cursor/plans/YYYY-MM-DD-<kratki-naziv>.md`:

```markdown
# <Naziv promjene>

Datum: YYYY-MM-DD · Opseg: mali | srednji | veliki · Status: prijedlog

## 1. Zahtjev
Što se traži i zašto, u jednoj do tri rečenice.

## 2. Postojeći obrazac
Gdje se ista stvar već radi, s putanjama. Ako obrazac ne postoji — reci to izrijekom.

## 3. Relevantne datoteke
Popis s putanjama i ulogom svake.

## 4. API endpointi
Koji se koriste, s oblikom requesta. Nepotvrđeno označi.

## 5. SQL objekti
Procedure, tablice, viewovi. Naznači jesu li u `OperaMobile` ili tenant bazi.

## 6. JSON layouti
Koje datoteke i koji tenanti. Ako se layout mijenja — traži zasebno odobrenje.

## 7. Utjecaj na druge module
`servis` / `dgl` / `gen` / zajedničke komponente.

## 8. Utjecaj na druge klijente i tenante
Koje tenante dira. Ako se ne može provjeriti (npr. layout je na klijentskom serveru) — označi kao nepoznato.

## 9. Sloj implementacije
Expo / zajednička arhitektura / JSON layout / API / SQL / OperaMobile / tenant baza. S obrazloženjem.

## 10. Rizici i otvorena pitanja
Regresijski rizici imenovani konkretno. Otvorena pitanja s time tko odgovara.

## 11. Plan testiranja
Što se testira, kako, i što bi značilo da je promjena pokvarila nešto drugo.

## 12. Kriteriji prihvaćanja
Provjerljive tvrdnje, ne "radi ispravno".

## Documentation impact
- Mijenja li se tehničko ponašanje: da/ne — koje stranice
- Mijenja li se korisnički flow: da/ne — koji zadatak
- Treba li screenshot: da/ne
- Treba li zapisati arhitektonsku odluku: da/ne

## Rollback
Što se točno vraća i kako, ako promjena pukne u produkciji.
```

## Obavezne provjere

- Svaka tvrdnja u planu ima dokaz: putanja, naziv funkcije, endpoint ili SQL objekt.
- Nepotvrđeno je označeno kao **nepoznato**, s time što treba pronaći ili pitati.
- Nema subjektivnih procjena sigurnosti.

## Zabranjeno

- Implementirati bilo što prije odobrenja plana.
- Pisati plan bez čitanja stvarnog koda ("po sjećanju" ili samo iz dokumentacije).
- Preskočiti točku jer "nije relevantna" bez pisanog obrazloženja.
- Predložiti široki refactor kao dio nepovezanog zadatka.

## Kriteriji završetka

Plan postoji kao datoteka, ima svih 12 točaka plus `Documentation impact` i `Rollback`, svaka tvrdnja ima dokaz, i korisnik je izričito odobrio ili tražio izmjene.
