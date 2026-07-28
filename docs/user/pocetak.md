# Prvi koraci i prijava

## Prvo pokretanje — aktivacija uređaja

Kad aplikaciju prvi put otvorite na uređaju, prikazuje se ekran **Opera Mobile** s poljem za **šifru za otključavanje aplikacije** (Core PIN).

1. Unesite **8-znamenkasti Core PIN** koji ste dobili od SvamPlus-a (aktivacija licence).
2. Pritisnite **Otključaj**.

Ako je PIN ispravan, uređaj se registrira i prelazite na ekran za prijavu. Ako PIN nije ispravan, prikazuje se poruka o grešci — možete pokušati ponovno.

::: tip Napomena
Core PIN se **ne sprema** u aplikaciji. Koristi se samo jednom pri aktivaciji (ili ponovnoj aktivaciji).
:::

## Prijava u ERP

Na ekranu **Prijava** unesite:

- **Korisničko ime** — vaš ERP korisnički račun
- **Lozinka** — lozinka za taj račun

Gore desno (ili u blizini naslova) prikazuje se **oznaka baze** (tenant) na koju ste aktivirani — npr. naziv vaše tvrtke/baze.

Pritisnite **Prijava**. Uspješna prijava vodi na **Kontrolni centar**.

## Sljedeća pokretanja

Ako ste već aktivirani i prijavljeni, aplikacija vas automatski vodi na odgovarajući ekran:

| Stanje | Gdje idete |
|---|---|
| Uređaj nije aktiviran | Core PIN ekran |
| Aktiviran, niste prijavljeni | Prijava |
| Prijavljeni | Kontrolni centar |

## Ponovna aktivacija

Ako trebate promijeniti tenant (druga baza) ili ponovno registrirati uređaj:

- Na ekranu **Prijava** — link **Ponovna aktivacija**
- U **Postavkama** — akcija **Ponovna aktivacija**

Oba vode natrag na Core PIN ekran. Nakon uspješne aktivacije morate se **ponovno prijaviti**.

::: warning
Ponovna aktivacija ne briše podatke na serveru, ali lokalno resetira vezu uređaja s tenant-om.
:::

## Problemi s prijavom

| Simptom | Što provjeriti |
|---|---|
| "Pogrešna lozinka" | Korisničko ime i lozinka u ERP-u |
| Greška mreže | Internet veza, dostupnost API servera |
| Core PIN ne prolazi | Ispravnost PIN-a, istek licence — kontaktirajte SvamPlus podršku |
| Kriva baza nakon aktivacije | Ponovna aktivacija s ispravnim PIN-om |
