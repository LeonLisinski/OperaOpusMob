---
layout: home

hero:
  name: "Opera Mobile"
  text: "Razvojna dokumentacija"
  tagline: Migracija mobilnog klijenta OperaOpus ERP-a iz Ionic/Capacitor u Expo/React Native — SvamPlus
  actions:
    - theme: brand
      text: Karta sustava
      link: /ai/SYSTEM_MAP
    - theme: alt
      text: Feature Parity Status
      link: /ai/FEATURE_PARITY_MATRIX
    - theme: alt
      text: Decision Log
      link: /ai/DECISION_LOG

features:
  - icon: 📱
    title: Expo/React Native
    details: Ciljana platforma — Android i iOS iz jedne codebase, moderan UI/UX, Expo Router navigacija, Redux Toolkit state management.

  - icon: 🔒
    title: JSON konfigurabilnost
    details: 757 JSON layouta u MobLayoutsControls/ definiraju UI i SP mapiranje po tenantu — bez promjene koda aplikacije za klijentske prilagodbe.

  - icon: 📊
    title: Feature Parity Matrix
    details: Svaka funkcionalna cjelina praćena je od Ionic reference do Expo implementacije s runtime statusom i vezom na arhitektonske odluke.

  - icon: 🗃️
    title: Decision Log
    details: 34 arhitektonske odluke (D001–D034) s razlogom, posljedicama i statusom — od tehnologije i ovisnosti do tenant-specifičnih rubnih slučajeva.

  - icon: ⚠️
    title: Poznati rizici
    details: Dokumentirani rizici s dokazom, ublažavanjem i vlasnikom — bez skrivanja nepoznatog kao poznatog.

  - icon: ❓
    title: Otvorena pitanja
    details: Pitanja koja blokiraju odluke, s osobom zaduženom za odgovor i referentnim materijalom.
---

## Struktura dokumentacije

| Dokument | Sadržaj |
|---|---|
| [Karta sustava](/ai/SYSTEM_MAP) | Glavna ulazna točka — gdje je što u sustavu |
| [Kontekst projekta](/ai/PROJECT_CONTEXT) | Poslovni kontekst, tim, cilj migracije |
| [Trenutna arhitektura](/ai/CURRENT_ARCHITECTURE) | Ionic aplikacija — dokazano stanje iz koda i baze |
| [Ciljna arhitektura](/ai/TARGET_ARCHITECTURE) | Expo principi — samo potvrđeni, status Draft |
| [Strategija migracije](/ai/MIGRATION_STRATEGY) | Faze migracije s preduvjetima i kriterijima završetka |
| [Feature Parity Matrix](/ai/FEATURE_PARITY_MATRIX) | Status svake funkcionalnosti (Ionic → Expo) |
| [Decision Log](/ai/DECISION_LOG) | Sve arhitektonske odluke s razlogom i posljedicama |
| [Poznati rizici](/ai/KNOWN_RISKS) | Sigurnosni, funkcionalni i migracijski rizici |
| [Otvorena pitanja](/ai/OPEN_QUESTIONS) | Što još blokira pojedine odluke |
