# JSON layouti

UI i mapiranje na stored procedure definiraju **JSON datoteke po tenant-u** u mapi `MobLayoutsControls/`.

Expo aplikacija ne hardkodira izgled ekrana — učitava layout s API-ja (`/doclayouts`) prema modulu.

## Organizacija

```
MobLayoutsControls/
└── {tenant}/
    └── {sifdv}/              # dgl modul (npr. RN, CRM)
        └── {sifgrupe}/       # podgrupa (opcionalno)
            ├── dglListItem.json
            ├── dglViewItems.json
            ├── dglEditItems.json
            ├── dglEditItemsExtends.json
            ├── dstListItem.json
            ├── dstEditItems.json
            ├── queries.json
            └── properties.json   # potpis/izvještaj (opcionalno)
```

Za **gen** module struktura je `{tenant}/{app}/{module}/` s prefiksima `gla`/`dst` umjesto `dgl`.

## Ključne datoteke

| Datoteka | Namjena |
|---|---|
| `*ListItem.json` | Redak na popisu dokumenata |
| `*ViewItems.json` | Read-only detalj (sekcije, polja) |
| `*EditItems.json` | Forma za uređivanje |
| `*EditItemsExtends.json` | Dodatna polja pri spremanju (makroi `#today`, `#sifosobe`…) |
| `dstListItem.json` | Redak stavke |
| `dstEditItems.json` | Forma stavke |
| `queries.json` | SP mapiranje — list, filter, azur, prilozi… |
| `properties.json` | Konfiguracija potpisa i REPX izvještaja |

## queries.json — API mapiranje

Primjer strukture (pojednostavljeno):

```json
{
  "dgl": {
    "list": { "sp": "spMob_DGL_Query", "params": { ... } },
    "filterdefaults": { ... },
    "statusi": { ... },
    "settings": { ... },
    "azur": { ... },
    "prilozi": { "sp": "...", "params": { ... } }
  },
  "dst": {
    "list": { ... },
    "azur": { ... }
  }
}
```

Expo `documentsSlice` koristi ove ključeve za pozive na `/data`. Ako ključ **ne postoji**, funkcionalnost se ne nudi ili prikazuje grešku — aplikacija ne izmišlja SP.

## Tipovi kontrola u formi

Podržani tipovi u `*EditItems.json` (Expo):

| type | Komponenta |
|---|---|
| `text` | TextField |
| `date` | TextField (YYYY-MM-DD) |
| `memo` | TextField multiline |
| `simple` | SifarnikSearchModal (lokalni popis) |
| `advanced` | SifarnikSearchModal (server pretraga) |

Polja mogu imati `disabled: "allways"` / `"edit"`, `visiblefield`, `dependencies` — logika je u `EditFormField.tsx` i `documentsSlice`.

## Odabir layout foldera

`moduleRouting.ts` parsira `module.url` iz menija:

| URL obrazac | Tip | Folder |
|---|---|---|
| `/docs/dgl/{sifdv}` | dgl | `{sifdv}/{sifgrupe}` ili `{sifdv}` |
| `/gen/list/{app}/{module}` | gen | `{app}/{module}` |

## Što ne dirati bez odobrenja

Pravilo projekta: **nijedan layout u `MobLayoutsControls/` se ne mijenja** bez eksplicitnog zadatka za taj layout. Promjena layouta utječe na sve korisnike tog tenant-a.

## Validacija

U repozitoriju postoji ~757 JSON datoteka; dio ima sintaksne greške koje backend ipak tolerira. Validator (report-only) je planiran ali nije implementiran — v. `docs/ai/DECISION_LOG.md` D006, D007.

## Dodavanje podrške za novi modul

1. Provjeriti da `module.url` odgovara poznatom obrascu (`dgl` ili `gen`)
2. Provjeriti da postoje potrebni JSON fajlovi na API serveru za tenant
3. Za stavke: provjeriti `queries.dst.list` i `queries.dst.azur`
4. Za privitci: `queries.dgl.prilozi` (ili ekvivalent)
5. Testirati na stvarnom tenant-u — web preview s mock layoutom ne pokriva sve

Detaljna shema polja: `.cursor/rules/30-api-database-layouts.mdc`
