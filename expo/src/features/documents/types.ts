/**
 * Minimalni kontrakti za JSON-driven generičku listu/detalj — samo polja koja
 * stvarno koristimo u ovoj vertikali (v. MobLayoutsControls/*ListItem.json,
 * *ViewItems.json, queries.json). Nepoznata polja iz JSON-a se ignoriraju u
 * layoutContract.ts, ne modeliraju se ovdje unaprijed.
 */

export type FieldValueType = 'text' | 'date' | 'url' | 'multiline';

export interface ListFieldDef {
  /** Točan ključ retka iz SP odgovora — može sadržavati razmake (npr. "broj radnog naloga"). */
  field: string;
  type?: FieldValueType;
  format?: string;
  class?: string;
}

export interface ListItemLayoutGroup {
  label?: string;
  classmain?: string;
  class?: string;
  fields: ListFieldDef[];
}

export interface ViewFieldDef {
  field: string;
  caption?: string;
  type?: FieldValueType;
  format?: string;
  urlcaption?: string;
  /** false = bez donje linije/razmaka između ovog i sljedećeg polja (vizualni hint, ne kritično). */
  lines?: boolean;
  /** Ime drugog polja u istom retku čija falsy vrijednost sakriva ovo polje/sekciju. */
  visiblefield?: string;
  class?: string;
}

export interface ViewSection {
  caption: string;
  visiblefield?: string;
  items: ViewFieldDef[];
}

export interface QueryDef {
  sp: string;
  params?: Record<string, unknown>;
}

export type EditControlType = 'date' | 'simple' | 'advanced' | 'memo' | 'text';

/**
 * Ovisnost jedne kontrole o odabiru u šifrarnik pretraživaču (v. src/pages/dgl/components/
 * MasterAzur.jsx onSearchModalConfirm). `action: 'azur'` kopira polja IZ odabranog retka
 * (`selectFieldKey`/`selectFieldText`/`azurFieldKey`) U ciljno polje forme
 * (`controlFieldKey`/`controlFieldText`/`controlAzurFieldKey`). `action: 'reset'` briše
 * ciljno polje (`selectFieldKey`/`selectFieldText`/`azurFieldKey` ovdje su ciljne kontrole).
 */
export interface EditFieldDependency {
  action: 'azur' | 'reset';
  selectFieldKey?: string;
  selectFieldText?: string;
  azurFieldKey?: string;
  controlFieldKey?: string;
  controlFieldText?: string;
  controlAzurFieldKey?: string;
}

/** Jedna kontrola forme iz *EditItems.json — v. .cursor/rules/30-api-database-layouts.mdc. */
export interface EditFieldDef {
  type: EditControlType;
  caption: string;
  /** Ključ prikazane vrijednosti u editValues (za simple/advanced/date/text/memo). */
  selectFieldKey: string;
  /** Ključ prikazanog teksta u editValues — samo simple/advanced. */
  selectFieldText?: string;
  /** Ključ vrijednosti koja se šalje na SP prilikom spremanja. */
  azurFieldKey: string;
  /** Šifrarnik akcija za spMob_*_Sifarnici (samo simple/advanced). */
  entity?: string;
  debaunce?: number;
  /** Ključ u editValues čija vrijednost ide kao parentId u šifrarnik upit. */
  parentIdFieldKey?: string;
  disabled?: 'allways' | 'edit';
  dependencies?: EditFieldDependency[];
}

export type EditControlValues = Record<string, unknown>;

/** Tip stavke u Tab3 — filtrira se po polju `tip` iz SP odgovora (v. src/pages/dgl/tabs/Tab3.jsx). */
export type DstLineKind = 'stavke' | 'rad';

export interface StatusFilterItem {
  id: string | number;
  name: string;
  indcolor?: string | null;
  checked: boolean;
}

export interface DocumentFilter {
  datumod: string;
  datumdo: string;
  samomoje: boolean;
  statuses: StatusFilterItem[];
}

/** Normalizirani, provjereni layout modula — spreman za renderiranje i za /data pozive. */
export interface ModuleLayout {
  listItems: ListItemLayoutGroup[];
  viewItems: ViewSection[];
  listQuery: QueryDef;
  filterDefaultsQuery?: QueryDef;
  statusiQuery?: QueryDef;
  settingsQuery?: QueryDef;
  editItems: EditFieldDef[];
  /** Default vrijednosti/makroi (npr. "#today") — spajaju se sirovo u payload, isto kao Ionic saveDGL/saveGla. */
  editItemsExtends: Record<string, unknown>;
  /** Samo za `gen` module (dgl uvijek koristi spWeb_UpdateDGL — v. src/pages/dgl/store/index.jsx saveDGL). */
  azurQuery?: QueryDef;
  /** queries.{group}.sifarnici — override zadanog spMob_DGL_Sifarnici (v. search.jsx). */
  sifarniciQuery?: QueryDef;
  /** queries.dst.list — dohvat stavki dokumenta (v. dgl/store getListItem). Opcionalno; gen moduli često nemaju dst. */
  dstListQuery?: QueryDef;
  dstListItems: ListItemLayoutGroup[];
  dstListItemsRad: ListItemLayoutGroup[];
  /**
   * queries.dst.azur — spremanje stavke. NAMJERNO nema hardkodiranog fallbacka (za razliku od
   * Ionic src/pages/dgl/store saveDoc koji uvijek zove spMob_ZJUKIC_DST_Azur bez obzira na
   * tenanta — v. DECISION_LOG.md D025). Ako nedostaje, spremanje stavke se odbija s jasnom
   * porukom umjesto tihog poziva tuđeg tenant SP-a.
   */
  dstAzurQuery?: QueryDef;
  dstEditItems: EditFieldDef[];
  dstEditItemsExtends: Record<string, unknown>;
  dstEditItemsRad: EditFieldDef[];
  dstEditItemsRadExtends: Record<string, unknown>;
  /**
   * queries.{group}.prilozi — popis privitaka (v. src/pages/dgl/store getPrivitci,
   * src/pages/dgl/tabs/TabPrivitci.jsx). U Ionicu je tab "Privitci" ožičen samo u dgl
   * MainTabs.tsx — gen ekvivalent (TabPrivitci.jsx, getPrivitci) postoji u kodu ali je
   * ruta zakomentirana u gen/tabs/MainTabs.tsx (mrtav kod, v. DECISION_LOG.md D027), pa
   * se ovo polje u Expo koristi samo za `route.kind === 'dgl'` iako gen tenant JSON-i
   * (npr. CRM/Upiti) uredno definiraju `gla.prilozi`.
   */
  priloziQuery?: QueryDef;
  /**
   * properties.json (dio /doclayouts odgovora) — samo polja koja koristi tab "Potpis"
   * (v. src/pages/dgl/tabs/Tab4.jsx). Ostala polja iz properties.json (ako ih tenant doda)
   * se namjerno ne modeliraju dok se ne pojavi stvarna potreba.
   */
  properties: SignatureReportProperties;
}

/**
 * properties.json polja za tab "Potpis" (potpis + generiranje/slanje REPX izvještaja) —
 * v. src/pages/dgl/tabs/Tab4.jsx, MobLayoutsControls/*\/properties.json. Sva polja su
 * opcionalna jer ih tenanti bez ovog taba (tabpotpisvisible=false) ne definiraju.
 */
export interface SignatureReportProperties {
  /** Naziv REPX izvještaja koji se generira/šalje uz potpis (queries.dst nije uključen). */
  reportName?: string;
  /** Polje u SP retku dokumenta iz kojeg se predpuni ime potpisnika. */
  signatureTextSelectField?: string;
  /** Polje u SP retku dokumenta iz kojeg se predpuni email potpisnika. */
  signatureEmailSelectField?: string;
  /** Naziv polja pod kojim se ime potpisnika sprema u spMob_DGL_Azur (insertSignature). */
  signatureTextAzurField?: string;
  /** Naziv polja pod kojim se email potpisnika sprema u spMob_DGL_Azur (insertSignature). */
  signatureEmailAzurField?: string;
  /** Test email koji, ako je postavljen, ZAMJENJUJE (ne dopunjuje) primarni mailTo. */
  testEmail?: string;
  /** Ako je true, generirani PDF se odmah preuzima i otvara na uređaju nakon spremanja. */
  signatureOpenPdf?: boolean;
}

export type ModuleKind = 'dgl' | 'gen';

/**
 * Izvedeno iz ModuleMenuEntry.url (npr. "/docs/dgl/RNele" ili "/gen/list/CRM/Upiti") —
 * v. src/AppMain.tsx rute. Nosi sve što treba za dohvat layouta i liste bez
 * ikakve provjere imena tenanta u kodu (v. .cursor/rules/20-architecture-and-expo.mdc).
 */
export interface ModuleRoute {
  kind: ModuleKind;
  /** Primarni folder za /doclayouts (uključuje sifgrupe kod dgl modula ako postoji). */
  folder: string;
  /** Folder bez sifgrupe — koristi se ako primarni vrati prazan layout (samo dgl). */
  fallbackFolder?: string;
  listItemKey: 'dglListItem' | 'glaListItem';
  viewItemsKey: 'dglViewItems' | 'glaViewItems';
  editItemsKey: 'dglEditItems' | 'glaEditItems';
  editItemsExtendsKey: 'dglEditItemsExtends' | 'glaEditItemsExtends';
  queryGroupKey: 'dgl' | 'gla';
  /** Ključ zapisa u redovima liste/spremanja — "dglid" za dgl, "id" za gen (v. src/pages/{dgl,gen}/store getGla, saveDGL/saveGla). */
  idField: 'dglid' | 'id';
  sifdv?: string;
  app?: string;
  module?: string;
}
