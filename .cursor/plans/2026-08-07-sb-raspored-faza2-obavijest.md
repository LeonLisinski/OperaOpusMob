# Raspored Faza 2 — primanje / potvrda

Datum: 2026-08-07 · Opseg: srednji · Status: u implementaciji (odobreno u chatu: Potvrdi bez Odbij, po danu)

## 1. Zahtjev
Vozač vidi poslane dane (`POSLANO`) u Aktualno, potvrđuje (samo Potvrdi), tek onda ulaze u Aktualno/Sutra kao raspored.

## 2. Postojeći obrazac
Disp: `DispRasporedObavijest` + `spDispRasporedObavijestList` / `Save` (`odgovor`). Expo Faza 1: samo `spDispVozniRed`.

## 3–9. Sažetak
- API: `POST {api}/data` → List + Save `Action=odgovor` `Status=PRIHVACENO`
- SQL: tenant `ooSLABUS*` (NT snapshot ima POSLANO za 4146)
- Layout: ne
- Sloj: Expo `features/raspored` + `rasporedApi`
- Bez pusha

## 10. Rizici
Dani bez obavijesti nestaju iz Aktualno (namjerno). Povijest ostaje nefiltrirana.

## 11–12. Test
Login `svam`/4146, Aktualno vidi POSLANO 07–09.08., Potvrdi → dan prelazi u potvrđeni popis; Sutra samo ako PRIHVACENO.
