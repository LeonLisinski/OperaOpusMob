---
name: trace-and-analyze-impact
description: Prati podatak ili funkcionalnost kroz cijeli tok Opera Mobile sustava (UI, state, API, SQL, JSON layout, tenant) i utvrđuje što bi promjena pogodila. Koristi se kad nije jasno odakle podatak dolazi, prije diranja zajedničke logike, ili za popunjavanje točaka 2–8 plana promjene.
---

# Praćenje toka i analiza utjecaja

Dva su smjera: **naprijed** (imam polje na ekranu, gdje nastaje?) i **unatrag** (mijenjam SP, koga to dira?). Postupak je isti, redoslijed obrnut.

## Potrebni ulazi

Barem jedno: naziv polja na ekranu, putanja datoteke, naziv SP-a, endpoint, ili naziv layout datoteke. Plus, ako je poznato: tenant i `sifdv`.

## Redoslijed praćenja

```
UI komponenta
  → Redux store (thunk)
    → dataHelper funkcija
      → API endpoint
        → queries.json (koji SP)
          → SP u tenant bazi
            → tenant varijanta layouta
```

### Korak 1 — UI

Nađi komponentu. Ako renderira iz layouta, polje **nije** u kodu nego u JSON-u:

| Renderer | Layout ključ |
|---|---|
| `List.jsx` | `dglListItem` / `glaListItem` |
| `tabs/Tab1.jsx`, `tabs/TabInfo.jsx` | `dglViewItems` / `glaViewItems` |
| `components/MasterAzur.jsx` | `dglEditItems` / `glaEditItems` |
| `tabs/Tab3.jsx`, `tabs/TabStavke.jsx` | `dstListItem` / `dstListItemRad` |
| `components/DetailAzurNew.jsx` | `dstEditItems` / `dstEditItemsRad` |

### Korak 2 — state

Thunk u `src/pages/<modul>/store/index.jsx`. Zabilježi je li naziv SP-a hardkodiran u kodu ili dolazi iz `layouts.queries.*`. To određuje pravi sloj promjene.

### Korak 3 — transport

`src/utils/dataHelper.js`. Zabilježi endpoint i oblik envelope-a.

### Korak 4 — SQL

Ako je SP u `OperaMobile`, pročitaj definiciju read-only preko MCP-a. Ako je `spMob_*`, u tenant je bazi i **nije dostupan** — označi kao nepoznato, ne pretpostavljaj.

### Korak 5 — layout i tenant

Nađi sve varijante iste datoteke:

```bash
# svi tenanti koji imaju taj modul
Get-ChildItem MobLayoutsControls -Recurse -Filter dglEditItems.json | Select-Object FullName

# svi layouti koji spominju taj SP
rg -l "spMob_XYZ" MobLayoutsControls
```

## Obavezne provjere

Prije zaključka da je nešto "samo na jednom mjestu", provjeri sva četiri:

- [ ] `src/pages/servis/**`
- [ ] `src/pages/dgl/**`
- [ ] `src/pages/gen/**`
- [ ] `MobLayoutsControls/**` (sve tenant varijante, ne samo jedna)

Dodatno:

- [ ] Zajedničke komponente: `src/components/search/**`, `src/components/datetime/**`
- [ ] Je li isti SP naveden u `queries.json` više tenanta
- [ ] Postoje li tenanti čiji layout nemamo (vlastiti API server) — tada je utjecaj **nepoznat**, ne "nema utjecaja"

## Rezultat

```markdown
## Tok: <što se prati>

UI: <datoteka:linija>  →  layout ključ <ako postoji>
State: <thunk, datoteka:linija>  →  SP iz koda | iz queries.json
Transport: <funkcija u dataHelper.js>  →  <endpoint>
SQL: <naziv SP-a>  ·  baza: OperaMobile | tenant (nedostupno)
Layout: <popis datoteka i tenanta>

## Pogođeno
- Moduli: ...
- Tenanti: ...
- Nepoznato: ...
```

## Zabranjeno

- Zaključiti opseg iz jednog `rg` pogotka.
- Pretpostaviti ponašanje `spMob_*` procedure.
- Izostaviti tenante čiji layout nije dostupan — oni se navode kao nepoznanica.
- Izvršiti bilo koji SQL osim čitanja.

## Kriteriji završetka

Tok je zapisan od UI-ja do SQL-a s dokazima (putanja:linija), sve četiri obavezne provjere su odrađene, i popis pogođenih modula i tenanta postoji — uključujući eksplicitno navedene nepoznanice.
