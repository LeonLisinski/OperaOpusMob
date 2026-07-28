# API i state

## API klijent

Svi HTTP pozivi idu kroz `src/services/api/client.ts`:

- **`fetch`** (bez Axios/React Query)
- **Basic Auth** - credentials iz Core PIN odgovora
- Strukturirane greške kao `ApiError`

### Glavni endpointi

| Endpoint | Namjena |
|---|---|
| `/data` | Stored procedure pozivi (JSON body) |
| `/login` | ERP prijava `{ db, uid, pwd }` |
| `/doclayouts` | Dohvat JSON layouta |
| `/saveatt` | Upload privitka |
| `/getatt` | Download privitka |
| `/repxreport` | Generiranje PDF izvještaja (potpis) |

Implementacija endpointa **nije u repozitoriju** - ugovor se replicira iz Ionic `src/utils/dataHelper.js` i potvrđenih SP definicija.

## Auth flow - storage

| Ključ | Sadržaj | Storage |
|---|---|---|
| Core config | server, db, api credentials | Secure Store |
| User + connection | ERP korisnik, tenant DB veza | Secure Store |
| Unlocked apps | Lista otključanih aplikacija | AsyncStorage |
| Theme preference | light/dark/system | AsyncStorage |

PIN se **namjerno ne sprema** (v. Decision Log D013).

## Redux - authSlice

Glavni thunkovi:

| Thunk | Akcija |
|---|---|
| `bootstrapSession` | Učitaj storage → postavi stanje |
| `unlockCore` | Core PIN → spremi config |
| `loginErp` | ERP login → spremi user |
| `logout` | Briše user + connection |
| `reactivateCore` | Briše core → natrag na PIN |
| `resetApp` | Briše sve lokalno |

## Redux - coreSlice

| Thunk | Akcija |
|---|---|
| `fetchMenu` | `spMob_Menu_Query` → aplikacije + moduli |
| `unlockApp` | App PIN → označi app unlocked |

## Redux - documentsSlice

Centralni engine za dgl/gen module.

| Thunk / akcija | Akcija |
|---|---|
| `loadDocumentModule` | Layout + filter defaults + lista |
| `refreshDocumentList` | Ponovni dohvat liste (s filterom) |
| `openFilterEditor` / filter akcije | Privremeni i primijenjeni filter |
| `selectListItem` | Odabir retka → detalj |
| `startEditForm` / `saveDocument` | Uređivanje glave dokumenta |
| `loadDocumentLines` | Stavke / rad |
| `saveDstLine` | Spremanje stavke (`queries.dst.azur`) |
| `loadAttachments` / `uploadAttachments` / `openAttachment` | Privitci |
| `submitSignature` | Potpis + REPX |

State drži: `route`, `layout`, `list`, `filter`, `selectedItem`, `editForm`, `dstLines`, `attachments`, status objekte po operaciji.

## Normalizacija odgovora

`responseNormalizers.ts` - API ponekad vraća različite oblike (npr. `ServerPath` vs `serverpath`). Normalizacija je na granici API sloja, ne u komponentama.

## Device identity

`deviceIdentity.ts` generira **UUID po instalaciji** (Secure Store) za PIN registraciju. To je namjerna razlika u odnosu na Capacitor `Device.getId()` - v. D012.

## Makroi u JSON-u

Vrijednosti poput `#today`, `#sifosobe`, `#coid` u layoutu **ne rješava klijent** - šalju se na backend koji ih zamjenjuje. Expo ne duplicira tu logiku.

## Debugging

1. Provjeriti Redux state (React DevTools)
2. Provjeriti mrežne pozive (Flipper, Chrome DevTools na webu)
3. Za SQL: read-only MCP alati na disp SQL serverima (samo SELECT)
4. Usporediti s Ionic ponašanjem za isti modul/tenant

Nepotvrđeno ponašanje API-ja → `docs/ai/OPEN_QUESTIONS.md`, ne pretpostavka u kodu.
