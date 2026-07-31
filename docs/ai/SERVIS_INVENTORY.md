# Inventar legacy `/servis/*` (2026-07-31)

## Ionic opseg

| URL | Ekrani | SP (hardkod) |
|---|---|---|
| `/servis/radninalozi/:sifdv` | Lista + tabovi Info / Komentari / Rad / Privitci / Potpis | `spMob_DGL_RadniNalozi_Query`, `spMob_DST_RadniNalozi_Azur`, `spMob_DGL_RadniNalozi_Azur`, `spWeb_UpdateDGL`, `spMob_DGL_Azur` |
| `/servis/dnevniizvjestaj` | Lista + Unos / Komentar (Arhiva disabled) | `spMob_DGL_DnevniIzvjestaj_Query`, `spWeb_UpdateDGL` (`DNIZ`), `spMob_DGL_Azur` |

Nema JSON layouta u `MobLayoutsControls` za servis URL-ove — UI i SP su u kodu (`src/pages/servis/`).

## Meni po tenantu (read-only `spMob_Menu_Query`)

| Tenant DB | `/servis/radninalozi` | `/servis/dnevniizvjestaj` | `/docs/dgl/*` |
|---|---|---|---|
| **ooZJUKIC_20260722_MOB** (test) | ne (zakomentirano) | ne (zakomentirano) | da (RNint, RNodr, RNele, InterRN) |
| **ooMEDIVA_20260305** | ne | ne | da (`/docs/dgl/SRN`) |
| **ooMIDA_20260217** | **da** (`…/SRN`) | **da** | ne (dgl redovi zakomentirani) |
| ooADRIATEH_20260521 | ne | ne | da |
| ooASURA_BILLING_NT | ne | ne | ne u SP tekstu |

Zaključak: moderniji tenanti (Jukić, Mediva) već idu na **dgl**. **MIDA** (i slični stari meniji) i dalje aktivno koriste `/servis/*`.

`servis-mobile` App PIN-ova u OperaMobile: ~121 — to **nije** broj tenanata na legacy URL-u; većina PIN-ova može biti na dgl meniju.

## Preklapanje s Expo dgl engineom

Radni nalozi (servis) ≈ dgl dokumenti: lista, filter, detalj, stavke, privitci, potpis, isti `/saveatt`/`/getatt`/`/repxreport`.

Razlike servisa:
- hardkod UI (nema `dglListItem` JSON)
- tab **Komentari** (`insertComment`) — u dgl često mrtav/zakomentiran
- zatvaranje naloga (`changeStatusToClose`)
- fiksni REPX `rptServisniRadniNalog_MIDA`
- **DNIZ** — zasebna vertikala, nema layout foldera u repou

## Expo implementacija (2026-07-31)

| URL | `layoutSource` | Ponašanje |
|---|---|---|
| `/servis/radninalozi/:sifdv` | `servis-rn` | Alias na dgl engine + `servisRnFallback` (SP + UI) |
| `/servis/dnevniizvjestaj` | `servis-dniz` | dgl `sifdv=DNIZ` + `servisDnizFallback` |

Kod: `moduleRouting.ts`, `servisRnFallback.ts`, `servisDnizFallback.ts`, `fallbackLayouts/servis-*`.

### Namjerno još ne (paritet kasnije)
- RN tab **Komentari** (`insertComment`) — dgl Info može pokazati polje; zaseban tab nije portan
- DNIZ tab **Komentar** (write) — komentar je read-only u view/listi
- Zatvaranje naloga `changeStatusToClose`
- Kamera u privitcima (i u Ionicu većinom mrtva)

### Test
- Jukić: bez promjene (meni već `/docs/dgl/*`)
- MIDA (ili meni s `/servis/...`): ulaz u modul → lista → detalj → (RN) stavke
