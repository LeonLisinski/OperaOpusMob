# Postavke

Postavke otvarate ikonom **zupčanika** gore desno na Kontrolnom centru.

## Informacije o aplikaciji

| Sekcija | Što prikazuje |
|---|---|
| **Verzija** | Broj verzije aplikacije |
| **Konekcija** | API server, baza podataka, tenant |
| **Uređaj** | Identifikator instalacije (UUID) |

Ove informacije korisne su podršci kad prijavljujete problem.

## Izgled

Odabir načina rada sučelja:

| Opcija | Ponašanje |
|---|---|
| **Sustav** | Prati postavke telefona (preporučeno) |
| **Svijetla** | Uvijek svijetla tema |
| **Tamna** | Uvijek tamna tema |

Promjena je trenutna - ne treba ponovno pokretati aplikaciju.

## Sesija

### Odjava

**Odjava** zatvara vašu ERP sesiju.

- Briše se korisničko ime/lozinka iz aplikacije
- Uređaj **ostaje aktiviran** (Core PIN)
- Otključane aplikacije **ostaju otključane**

Sljedeći put trebate samo ponovnu **prijavu** (korisničko ime + lozinka).

## Napredne akcije

### Ponovna aktivacija

Vraća na **Core PIN** ekran za registraciju uređaja na tenant. Koristite kad:

- mijenjate tenant (druga tvrtka/baza)
- podrška traži ponovnu registraciju uređaja

Nakon aktivacije morate se **ponovno prijaviti**.

### Resetiraj sve postavke

Briše **sve lokalne podatke** aplikacije - kao da je prvi put instalirana:

- aktivacija uređaja
- prijava
- otključane aplikacije
- postavke izgleda

::: danger
Koristite samo kad podrška to eksplicitno traži ili kad aplikacija ne radi ispravno nakon ostalih koraka.
:::

## Na dnu ekrana

Prikazuje se **Opera Mobile · SvamPlus** i broj verzije aplikacije.
