# v2 backlog — namjerno izvan Expo v1

Stavke koje **nisu** u opsegu prve produkcijske Expo verzije. v1 cilj = 1/1 paritet s onim što Ionic korisnici stvarno koriste (**Android** — Ionic produkcija je Android-only).

| Feature | Razlog odgode |
|---|---|
| **iOS runtime paritet + App Store / TestFlight** | Ionic nikad nije imao iOS build. v1 = Android Play (isti package). iOS checklist, signing, TestFlight i App Store idu u v2 (odluka 2026-08-07). Kod u `expo/` i dalje mora biti portable; v2 = provjera i objava, ne greenfield. |
| Push notifikacije (Android + iOS) | Ionic je demo; nema produkcijskog backend flowa |
| CC tab Favoriti | Prazan ekran (`NoData`) — nema poslovne vrijednosti |
| CC tab Profil | UX dorada; podaci djelomično u Postavkama |
| Memo „Odabir teksta” | Vjerojatno mrtav/kriv kod u Ionicu (`OPEN_QUESTIONS.md` #15) |
| Kamera / photo gallery u privitcima | Nije u Ionic dgl privitcima (samo FilePicker); servis put djelomično mrtav. Dogovoreno ostaje v2 (2026-07-31). |
| EAS OTA updates | Nakon stabilnog v1 store releasea |
| Generalizacija servis → samo dgl layouti | Dugoročno smanjenje duplog koda |
