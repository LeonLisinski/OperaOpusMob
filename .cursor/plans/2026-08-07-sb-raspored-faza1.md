# SB Raspored — Faza 1 (pregled voznog reda)

Datum: 2026-08-07 · Opseg: srednji · Status: **odobreno / implementirano (Faza 1)**  
Izvor: `docs/ai/SLABUS_RASPORED_DESIGN.md` · Dispečer TFS `3ceb123`

## 1. Zahtjev

U Expo Opera Mobile, za app `raspored-mobile`, umjesto prazne liste modula prikazati **read-only** raspored vožnji vozača (Nadolazeće / Povijest), paritet s Disp mobile pregledom. Bez Prihvati/Odbij, bez pusha, bez EAS/builda.

## 2. Postojeći obrazac

- Ulazak u app: `expo/app/(app)/apps.tsx` + `app-unlock.tsx` → danas uvijek `modules/[code]`.
- Tenant `/data` SP pozivi: `expo/src/services/api/documentsApi.ts` / isti Basic + `db` obrazac.
- Disp referenca UI: `Dispecer/mobile` (Nadolazeće danas+6, Povijest); web SP ugovor od kolege.
- Dizajn: `docs/ai/SLABUS_RASPORED_DESIGN.md` §5–7, §12 Faza 1.

## 3. Relevantne datoteke

| Put | Uloga |
|---|---|
| `expo/app/(app)/apps.tsx` | Grana: `raspored-mobile` → `/raspored` umjesto modules |
| `expo/app/(app)/app-unlock.tsx` | Ista grana nakon App PIN-a |
| `expo/app/(app)/_layout.tsx` | Stack screen za raspored |
| `expo/app/(app)/raspored/index.tsx` (novo) | Glavni ekran Nadolazeće/Povijest |
| `expo/src/features/raspored/*` (novo) | API, tipovi, kartica, slice/hook po postojećem feature obrascu |
| `docs/ai/SLABUS_RASPORED_DESIGN.md` | Ažurirati status Faze 1 kad gotovo |
| `Dispecer/` | Samo referenca — ne mijenjati |

## 4. API endpointi

`POST {auth.core.apiBaseUrl}/data` — oblik od kolege:

```json
{
  "db": "ooSLABUS",
  "queries": [{
    "query": "spDispVozniRed",
    "commandtype": "sp",
    "params": {
      "DatumOd": "2026-08-08",
      "DatumDo": "2026-08-08",
      "SifOsobe": "00123"
    }
  }]
}
```

- `db` = tenant iz sesije (`auth` / core), ne hardkod.
- `SifOsobe` = `auth.user.sifosobe` (ERP SEC login — Faza 1).
- Uskladiti casing `commandtype` / `commandType` s postojećim Expo `getData` helperom (isti kao Ionic/Disp).

## 5. SQL objekti

- `spDispVozniRed` na tenant bazi.
- Referenca za analizu polja: `ooSLABUS_20260423_NT` @ SQL2022.
- Ne deployamo SQL iz Expo zadatka; Faza 2+ SP-ovi (`DispRasporedObavijest*`, `MobKorisnik*`) **ne** ulaze u Fazu 1.

## 6. JSON layouti

Nema. `MobLayoutsControls` se ne dira.

## 7. Utjecaj na druge module

- `servis` / `dgl` / `gen`: bez promjene ponašanja.
- Zajedničko: samo navigacijska grana po `app.code === 'raspored-mobile'` u apps/unlock; ostali appovi i dalje na `modules/[code]`.

## 8. Utjecaj na druge klijente i tenante

- Samo tenanti s PinApp `raspored-mobile` (SB). Drugi tenanti ne vide granu.
- Runtime API: produkcija `dispapi`; lokalni SQL smoke na snapshotu.

## 9. Sloj implementacije

**Samo Expo** (`expo/`). Ne API/, ne SQL deploy, ne Dispecer web, ne layout JSON.

## 10. Rizici i otvorena pitanja

| Rizik | Mitigacija |
|---|---|
| ERP `sifosobe` ≠ vozač u Disp | Smoke na stvarnom PIN-u; prazna lista nije crash |
| Polje „bus“ vs registracija | Kartica: vrijeme, ruta, registracija; bus ako SP vrati jasno polje |
| Auth MOB / push | Izvan Faze 1 (odluka kasnije) |
| Casing `/data` body | Prati postojeći Expo helper + kolegin ugovor |

**Prije koda — odgovori vlasnika:** vidi chat (test PIN / je li Faza 1 samo pregled potvrđena).

## 11. Plan testiranja

1. Tenant **bez** `raspored-mobile` → CC nepromijenjen.  
2. SB: Core → ERP → CC → App PIN Raspored → ekran rasporeda (ne moduli).  
3. Nadolazeće: danas…+6; kartice s vremenom/rutom/reg.  
4. Povijest: tjedni unazad; pull-to-refresh.  
5. Natrag na CC; Servis app i dalje JSON put.  
6. `tsc` / lint na dirnutim datotekama.

## 12. Kriteriji prihvaćanja

- [ ] `raspored-mobile` otvara custom raspored, ne `modules/[code]`.
- [ ] Poziv `spDispVozniRed` s `DatumOd`/`DatumDo`/`SifOsobe` iz sesije.
- [ ] Read-only; nema Prihvati/Odbij; nema push registracije u ovom PR-u.
- [ ] Ostali appovi nepromijenjeni.
- [ ] Nema izmjena `MobLayoutsControls/`, `src/`, `API/`, produkcijskih configa.

## Documentation impact

- `docs/ai/SLABUS_RASPORED_DESIGN.md` — status Faze 1.
- Po potrebi kratka crtica u `FEATURE_PARITY_MATRIX` / `DECISION_LOG` nakon mergea.
- Ne dirati Disp docs u `Dispecer/`.
