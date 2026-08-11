# Održavanje dokumentacije

Dokumentacija mora pratiti **stvarno** ponašanje sustava - ne plan, ne namjeru. Svaka funkcionalna promjena (dodavanje, brisanje, izmjena logike, API-ja, layouta, arhitekture) mora se provjeriti kroz popis mjesta u nastavku.

## Osnovno pravilo

1. **Prvo utvrdi što se promijenilo** - ponašanje, podaci, arhitektura ili samo izgled.
2. **Otvori odgovarajuće dokumente** prema tablici u nastavku.
3. **Ne piši nepotvrđeno kao činjenicu** - nepoznato ide u [`OPEN_QUESTIONS.md`](/ai/OPEN_QUESTIONS), arhitektonske odluke u [`DECISION_LOG.md`](/ai/DECISION_LOG).
4. **`docs/ai/` je kanonski izvor** - `technical/` i `user/` referenciraju ga, ne dupliciraju ga proturječnim tvrdnjama.

## Hijerarhija dokumenata

| Razina | Folder | Za koga | Što sadrži |
|---|---|---|---|
| Preuzimanje | `docs/preuzimanje/` | Developer na handoffu | Expo/EAS, lokalni rad, Git, MCP kratko |
| AI / arhitektura | `docs/ai/` | Tim, Cursor, arhitekti | Dokazano stanje, odluke, rizici, paritet, migracija |
| Tehnička | `docs/technical/` | Developeri | Setup, struktura, build, održavanje docs |
| Korisnička | `docs/user/` | Krajnji korisnici | Upute za ekrane i tokove u aplikaciji |

Ako `technical/` ili `user/` proturječe `docs/ai/`, **`docs/ai/` je mjerodavan** dok se ne provjeri i uskladi.

## Kada ažurirati

| Vrsta promjene | Primjer | Obavezno ažurirati |
|---|---|---|
| **Nova funkcionalnost** | Novi ekran, modul, API poziv | `FEATURE_PARITY_MATRIX`, `technical/` (struktura/API), `user/` ako korisnik vidi promjenu |
| **Izmjena logike** | Drugi tok spremanja, novi uvjet prikaza | `technical/api-i-state` ili `struktura`, `user/` ako se mijenja korak korisnika, `FEATURE_PARITY_MATRIX` ako Expo/Ionic paritet |
| **Brisanje / uklanjanje** | Uklonjen gumb, modul, endpoint | Isto + ukloni zastarjele odlomke iz `user/`; označi u matrici pariteta |
| **Arhitektura / odluka** | Novi slice, drugi storage, novi engine | `DECISION_LOG`, `TARGET_ARCHITECTURE` ili `CURRENT_ARCHITECTURE`, `SYSTEM_MAP` ako se mijenja mapa područja |
| **Rizik ili blokada** | Nepoznat API, SQL bez pristupa | `KNOWN_RISKS`, `OPEN_QUESTIONS` |
| **Setup / build** | Nova ovisnost, EAS, env varijabla | `technical/okruzenje`, `technical/build`, po potrebi `preuzimanje/` |
| **JSON layout** | Novi field tip, SP mapiranje | `technical/json-layouti`, po potrebi `CURRENT_ARCHITECTURE` §7 |
| **Samo vizual (UI)** | Boja, razmak, font | Dokumentacija **nije** obavezna osim ako korisnik traži |
| **Samo docs site** | VitePress tema, CSS | `docs/.vitepress/` - ne dira `ai/` osim ako se ne mijenja sadržaj |

## Checklist po vrsti promjene

### Nova ili izmijenjena funkcionalnost (Expo)

- [ ] [`FEATURE_PARITY_MATRIX.md`](/ai/FEATURE_PARITY_MATRIX) - status, runtime napomena, platforma
- [ ] [`technical/struktura`](/technical/struktura) - nove mape, rute, slice-ovi
- [ ] [`technical/api-i-state`](/technical/api-i-state) - novi endpointi, storage ključevi
- [ ] [`user/`](/user/) - koraci na ekranu ako je funkcionalnost vidljiva korisniku
- [ ] [`SYSTEM_MAP.md`](/ai/SYSTEM_MAP) - ako je novo područje u kodu

### Promjena samo u Ionic referenci (`src/`)

- [ ] [`CURRENT_ARCHITECTURE.md`](/ai/CURRENT_ARCHITECTURE) - ako se mijenja dokazano ponašanje reference
- [ ] [`FEATURE_PARITY_MATRIX.md`](/ai/FEATURE_PARITY_MATRIX) - ako utječe na plan pariteta
- [ ] Expo docs **ne** pretpostavljaju paritet dok nije implementiran

### Arhitektonska odluka

- [ ] Novi unos u [`DECISION_LOG.md`](/ai/DECISION_LOG) (Dxxx format)
- [ ] [`TARGET_ARCHITECTURE.md`](/ai/TARGET_ARCHITECTURE) - samo potvrđeni principi
- [ ] [`MIGRATION_STRATEGY.md`](/ai/MIGRATION_STRATEGY) - ako mijenja faze ili kriterije

### Nepoznato / rizik

- [ ] [`OPEN_QUESTIONS.md`](/ai/OPEN_QUESTIONS) - novo pitanje ili zatvaranje postojećeg
- [ ] [`KNOWN_RISKS.md`](/ai/KNOWN_RISKS) - novi ili ažurirani rizik s vlasnikom

### Korisnički vidljiva promjena

- [ ] Odgovarajuća stranica u [`docs/user/`](/user/)
- [ ] [`user/index.md`](/user/) - pregled „što nije dostupno“ ako se mijena opseg

## Mapiranje: što dira koji dokument

| Područje u kodu | Prvi dokumenti za provjeru |
|---|---|
| `expo/app/`, `expo/src/` | `technical/struktura`, `FEATURE_PARITY_MATRIX`, `user/` |
| `src/` (Ionic) | `CURRENT_ARCHITECTURE`, `SYSTEM_MAP` |
| `MobLayoutsControls/` | `technical/json-layouti`, `CURRENT_ARCHITECTURE` §7, `KNOWN_RISKS` |
| Auth, PIN, session | `CURRENT_ARCHITECTURE` §5, `technical/api-i-state`, `user/pocetak` |
| Redux / state | `technical/api-i-state`, `technical/struktura` |
| Backend API (izvan repoa) | `OPEN_QUESTIONS` - ne izmišljati; potvrditi pa `CURRENT_ARCHITECTURE` §6 |
| CI, build, docs deploy | `technical/build`, `.github/workflows/docs.yml` |

## Postupak u timu

1. **Prije implementacije** (srednje/velike promjene): plan promjene mora imati točku „dokumentacijski utjecaj“ (skill `plan-project-change`).
2. **Uz implementaciju**: ažuriraj docs u istom PR-u/commitu kad je moguće - ne odgađaj na „kasnije“.
3. **Nakon mergea**: GitHub Actions automatski gradi docs ako se mijenja `docs/**` - provjeri live stranicu nakon deploya.
4. **Review**: provjeri da tekst opisuje **što kod stvarno radi**, ne što bi trebao raditi.

## Brisanje i zastarjelost

- Ukloni ili označi zastarjelo u **svim** dokumentima gdje se tema spominje (ne samo u jednoj datoteci).
- U `FEATURE_PARITY_MATRIX` koristi jasan status (npr. uklonjeno, odgođeno, zatvoreno).
- U `DECISION_LOG` ne briši stare odluke - dodaj novu odluku koja ih supersede-a ako je potrebno.

## Online dokumentacija

- **URL:** https://leonlisinski.github.io/OperaOpusMob/
- **Deploy:** push na `main` s promjenama u `docs/**` pokreće `.github/workflows/docs.yml`
- **Lokalno:** `cd docs && npm run docs:dev`

## Povezano

- [Build i testiranje](./build) - kratki podsjetnik na docs nakon build promjena
- [Karta sustava](/ai/SYSTEM_MAP) - gdje u kodu tražiti kontekst
- [README](../README.md) - pregled cijele docs strukture
