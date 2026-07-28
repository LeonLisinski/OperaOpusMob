# Korisnička dokumentacija

Upute za korištenje **Opera Mobile** aplikacije — mobilnog klijenta za OperaOpus ERP (SvamPlus).

Ova dokumentacija opisuje **samo funkcionalnosti koje su implementirane** u Expo verziji aplikacije. Ako neka opcija nije vidljiva na vašem uređaju, vjerojatno je ovisna o konfiguraciji vašeg tenant-a ili modula.

## Tko koristi aplikaciju

Opera Mobile služi terenskim i uredskim korisnicima ERP-a: serviserima, prodajnicima, skladištarima i drugim ulogama koje imaju pristup mobilnim modulima (npr. radni nalozi, CRM upiti, narudžbe).

## Osnovni tok rada

```
Aktivacija uređaja (Core PIN)
        ↓
Prijava u ERP (korisničko ime + lozinka)
        ↓
Kontrolni centar (odabir aplikacije)
        ↓
Otključavanje aplikacije (App PIN, ako je zaključana)
        ↓
Moduli → Popis dokumenata → Detalj / uređivanje
```

## Sadržaj

| Uputa | Opis |
|---|---|
| [Prvi koraci i prijava](./pocetak) | Aktivacija PIN-om, prijava, ponovna aktivacija |
| [Kontrolni centar](./kontrolni-centar) | Aplikacije, moduli, otključavanje |
| [Dokumenti](./dokumenti) | Popis, pretraga, filter, detalj, uređivanje |
| [Stavke, privitci i potpis](./stavke-privitci-potpis) | Tabovi unutar dokumenta |
| [Postavke](./postavke) | Izgled, konekcija, odjava, reset |

## Što trenutno nije dostupno

Sljedeće **nije** u Expo verziji ili nije podržano za sve module:

- **Servis moduli** (`servis/*`) — hardkodirani moduli iz stare aplikacije, još nisu migrirani
- **Push notifikacije** — nisu implementirane
- **Tabovi Favoriti i Profil** na kontrolnom centru — nisu u trenutnom opsegu
- **Uređivanje stavki** — radi samo ako je modul konfiguriran s odgovarajućim JSON postavkama (v. [Stavke](./stavke-privitci-potpis))
- **Potpis** — prikazuje se samo kad dokument i modul to dopuštaju

Za detaljan status po funkcionalnosti v. [Feature Parity Matrix](/ai/FEATURE_PARITY_MATRIX).
