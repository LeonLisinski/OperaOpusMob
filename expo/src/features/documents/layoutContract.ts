import type {
  EditControlType,
  EditFieldDef,
  EditFieldDependency,
  ListFieldDef,
  ListItemLayoutGroup,
  ModuleLayout,
  ModuleRoute,
  QueryDef,
  SignatureReportProperties,
  ViewFieldDef,
  ViewSection,
} from './types';
import { mergeRouteLayoutFallback } from './layoutContentPatches';

export type LayoutValidationResult = { ok: true; layout: ModuleLayout } | { ok: false; error: string };

/**
 * Validira i normalizira sirovi /doclayouts odgovor prema poznatoj shemi
 * (v. MobLayoutsControls/*ListItem.json, *ViewItems.json, queries.json).
 * Nepoznata ili neispravna polja se tiho preskaču (dev log), ne ruše ekran —
 * jedino nedostatak liste za dohvat podataka (queries.{group}.list.sp) je
 * stvarna greška jer bez nje generička lista ne može pozvati /data.
 */
export function normalizeModuleLayout(raw: unknown, route: ModuleRoute): LayoutValidationResult {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'Layout modula nije pronađen ili je prazan.' };
  }

  const record = mergeRouteLayoutFallback(raw as Record<string, unknown>, route);

  const listQuery = readListQuery(record.queries, route.queryGroupKey);
  if (!listQuery) {
    return { ok: false, error: 'Definicija upita za listu nedostaje u layoutu modula.' };
  }

  const dstListQuery = readNamedQuery(record.queries, 'dst', 'list') ?? undefined;
  const dstAzurQuery = readNamedQuery(record.queries, 'dst', 'azur') ?? undefined;

  return {
    ok: true,
    layout: {
      listItems: readListItemGroups(
        resolveLayoutArray(record, route.listItemKey, route.kind === 'gen' ? ['listItem', 'ListItem'] : []),
        { required: true, label: route.listItemKey },
      ),
      viewItems: readViewSections(resolveLayoutArray(record, route.viewItemsKey, route.kind === 'gen' ? ['viewItems', 'ViewItems'] : [])),
      listQuery,
      filterDefaultsQuery: readNamedQuery(record.queries, route.queryGroupKey, 'filterdefaults') ?? undefined,
      statusiQuery: readNamedQuery(record.queries, route.queryGroupKey, 'statusi') ?? undefined,
      settingsQuery: readNamedQuery(record.queries, 'core', 'settings') ?? undefined,
      editItems: readEditFields(
        resolveLayoutArray(record, route.editItemsKey, route.kind === 'gen' ? ['editItems', 'EditItems'] : []),
        { required: true, label: route.editItemsKey },
      ),
      editItemsExtends: readPlainObject(record[route.editItemsExtendsKey]),
      // `queries.dgl.azur`/`queries.dgl.sifarnici` postoje u nekim JSON layoutima (npr.
      // ERVadmin), ali src/pages/dgl/store saveDGL i src/components/search/simple/search.jsx
      // (pozvan bez `sp` prop-a iz dgl/MasterAzur.jsx) ih NIKAD ne čitaju za dgl module —
      // dgl uvijek koristi spWeb_UpdateDGL i default spMob_DGL_Sifarnici. Čitanje je namjerno
      // ograničeno na `gen`, inače bi override u JSON-u tiho promijenio ponašanje koje Ionic
      // stvarno nema.
      azurQuery: route.kind === 'gen' ? (readNamedQuery(record.queries, route.queryGroupKey, 'azur') ?? undefined) : undefined,
      sifarniciQuery:
        route.kind === 'gen' ? (readNamedQuery(record.queries, route.queryGroupKey, 'sifarnici') ?? undefined) : undefined,
      createDocQuery:
        route.kind === 'gen' ? (readNamedQuery(record.queries, route.queryGroupKey, 'createdoc') ?? undefined) : undefined,
      dstListQuery,
      // dst* layouti su opcionalni — gen moduli (npr. CRM/Upiti) ih nemaju; ne warnati.
      dstListItems: readListItemGroups(record.dstListItem, {
        required: !!dstListQuery,
        label: 'dstListItem',
      }),
      dstListItemsRad: readListItemGroups(record.dstListItemRad, { required: false }),
      dstAzurQuery,
      dstDeleteQuery: readNamedQuery(record.queries, 'dst', 'delete') ?? undefined,
      dstEditItems: readEditFields(record.dstEditItems, {
        required: !!dstAzurQuery,
        label: 'dstEditItems',
      }),
      dstEditItemsExtends: readPlainObject(record.dstEditItemsExtends),
      dstEditItemsRad: readEditFields(record.dstEditItemsRad, { required: false }),
      dstEditItemsRadExtends: readPlainObject(record.dstEditItemsRadExtends),
      priloziQuery: readNamedQuery(record.queries, route.queryGroupKey, 'prilozi') ?? undefined,
      properties: readSignatureProperties(record.properties),
    },
  };
}

function readSignatureProperties(raw: unknown): SignatureReportProperties {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  const record = raw as Record<string, unknown>;
  const properties: SignatureReportProperties = {};
  if (typeof record.reportName === 'string') properties.reportName = record.reportName;
  if (typeof record.signatureTextSelectField === 'string') properties.signatureTextSelectField = record.signatureTextSelectField;
  if (typeof record.signatureEmailSelectField === 'string') properties.signatureEmailSelectField = record.signatureEmailSelectField;
  if (typeof record.signatureTextAzurField === 'string') properties.signatureTextAzurField = record.signatureTextAzurField;
  if (typeof record.signatureEmailAzurField === 'string') properties.signatureEmailAzurField = record.signatureEmailAzurField;
  if (typeof record.testEmail === 'string') properties.testEmail = record.testEmail;
  if (typeof record.signatureOpenPdf === 'boolean') properties.signatureOpenPdf = record.signatureOpenPdf;
  return properties;
}

function devWarn(message: string, detail?: unknown) {
  if (__DEV__) {
    console.warn(`[documents/layoutContract] ${message}`, detail);
  }
}

function resolveLayoutArray(record: Record<string, unknown>, primaryKey: string, alternateKeys: string[]): unknown {
  const keys = [primaryKey, ...alternateKeys];
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value) && value.length > 0) {
      return value;
    }
  }
  for (const key of keys) {
    if (Array.isArray(record[key])) {
      return record[key];
    }
  }
  return undefined;
}

function readListQuery(rawQueries: unknown, group: 'dgl' | 'gla'): QueryDef | null {
  if (!rawQueries || typeof rawQueries !== 'object') {
    devWarn('queries.json nedostaje ili nije objekt.', rawQueries);
    return null;
  }
  const groupNode = (rawQueries as Record<string, unknown>)[group];
  if (!groupNode || typeof groupNode !== 'object') {
    devWarn(`queries.${group} nedostaje.`, rawQueries);
    return null;
  }
  const listNode = (groupNode as Record<string, unknown>).list;
  if (!listNode || typeof listNode !== 'object') {
    devWarn(`queries.${group}.list nedostaje.`, groupNode);
    return null;
  }
  const sp = (listNode as Record<string, unknown>).sp;
  if (typeof sp !== 'string' || sp.length === 0) {
    devWarn(`queries.${group}.list.sp nije ispravan string.`, listNode);
    return null;
  }
  const params = (listNode as Record<string, unknown>).params;
  return { sp, params: params && typeof params === 'object' ? (params as Record<string, unknown>) : undefined };
}

function readNamedQuery(
  rawQueries: unknown,
  group: 'dgl' | 'gla' | 'core' | 'dst',
  name: string,
): QueryDef | null {
  if (!rawQueries || typeof rawQueries !== 'object') {
    return null;
  }
  const groupNode = (rawQueries as Record<string, unknown>)[group];
  if (!groupNode || typeof groupNode !== 'object') {
    return null;
  }
  const node = (groupNode as Record<string, unknown>)[name];
  if (!node || typeof node !== 'object') {
    return null;
  }
  const sp = (node as Record<string, unknown>).sp;
  if (typeof sp !== 'string' || sp.length === 0) {
    return null;
  }
  const params = (node as Record<string, unknown>).params;
  return { sp, params: params && typeof params === 'object' ? (params as Record<string, unknown>) : undefined };
}

function readListItemGroups(
  raw: unknown,
  options: { required?: boolean; label?: string } = {},
): ListItemLayoutGroup[] {
  if (!Array.isArray(raw)) {
    if (options.required) {
      devWarn(
        `${options.label ?? 'ListItem'} layout nije niz — lista će se prikazati bez definiranih polja.`,
        raw,
      );
    }
    return [];
  }
  return raw
    .map((entry, index) => {
      if (!entry || typeof entry !== 'object') {
        devWarn(`ListItem[${index}] nije objekt, preskačem.`, entry);
        return null;
      }
      const record = entry as Record<string, unknown>;
      const fields = readListFields(record.fields);
      if (fields.length === 0) {
        return null;
      }
      const group: ListItemLayoutGroup = { fields };
      if (typeof record.label === 'string') group.label = record.label;
      if (typeof record.classmain === 'string') group.classmain = record.classmain;
      if (typeof record.class === 'string') group.class = record.class;
      return group;
    })
    .filter((group): group is ListItemLayoutGroup => group !== null);
}

function readListFields(raw: unknown): ListFieldDef[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }
      const record = entry as Record<string, unknown>;
      if (typeof record.field !== 'string' || record.field.length === 0) {
        return null;
      }
      const field: ListFieldDef = { field: record.field };
      if (isFieldValueType(record.type)) field.type = record.type;
      if (typeof record.format === 'string') field.format = record.format;
      if (typeof record.class === 'string') field.class = record.class;
      return field;
    })
    .filter((field): field is ListFieldDef => field !== null);
}

function readViewSections(raw: unknown): ViewSection[] {
  if (!Array.isArray(raw)) {
    devWarn('ViewItems layout nije niz — detalj će se prikazati bez sekcija.', raw);
    return [];
  }
  return raw
    .map((entry, index) => {
      if (!entry || typeof entry !== 'object') {
        devWarn(`ViewItems[${index}] nije objekt, preskačem.`, entry);
        return null;
      }
      const record = entry as Record<string, unknown>;
      const items = readViewFields(record.items);
      if (typeof record.caption !== 'string' || items.length === 0) {
        return null;
      }
      const section: ViewSection = { caption: record.caption, items };
      if (typeof record.visiblefield === 'string') section.visiblefield = record.visiblefield;
      return section;
    })
    .filter((section): section is ViewSection => section !== null);
}

function readViewFields(raw: unknown): ViewFieldDef[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }
      const record = entry as Record<string, unknown>;
      if (typeof record.field !== 'string' || record.field.length === 0) {
        return null;
      }
      const field: ViewFieldDef = { field: record.field };
      if (typeof record.caption === 'string') field.caption = record.caption;
      if (isFieldValueType(record.type)) field.type = record.type;
      if (typeof record.format === 'string') field.format = record.format;
      if (typeof record.urlcaption === 'string') field.urlcaption = record.urlcaption;
      if (typeof record.lines === 'boolean') field.lines = record.lines;
      if (typeof record.visiblefield === 'string') field.visiblefield = record.visiblefield;
      if (typeof record.class === 'string') field.class = record.class;
      return field;
    })
    .filter((field): field is ViewFieldDef => field !== null);
}

function isFieldValueType(value: unknown): value is ListFieldDef['type'] {
  return value === 'text' || value === 'date' || value === 'url' || value === 'multiline';
}

function isEditControlType(value: unknown): value is EditControlType {
  return (
    value === 'date' ||
    value === 'simple' ||
    value === 'advanced' ||
    value === 'memo' ||
    value === 'text' ||
    value === 'serija' ||
    value === 'bool'
  );
}

/**
 * Stariji layouti drže Da/Ne kao type:"text". Dok server JSON ne dobije type:"bool",
 * pretvaramo poznate caption-e u bool kontrolu (bez tenant if-a).
 */
const LEGACY_BOOL_CAPTIONS = new Set([
  'osiguranje pokriće',
  'prijava osiguranju',
  'poslan zahtjev',
  'uslikana šteta',
  'izvid štete',
  'uslikan popravak',
  'polica osiguranja',
]);

function coerceLegacyBoolField(field: EditFieldDef): EditFieldDef {
  if (field.type !== 'text') {
    return field;
  }
  if (!LEGACY_BOOL_CAPTIONS.has(field.caption.trim().toLowerCase())) {
    return field;
  }
  return { ...field, type: 'bool' };
}

function readPlainObject(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  return raw as Record<string, unknown>;
}

function readEditFields(
  raw: unknown,
  options: { required?: boolean; label?: string } = {},
): EditFieldDef[] {
  if (!Array.isArray(raw)) {
    if (options.required) {
      devWarn(`${options.label ?? 'EditItems'} layout nije niz — forma će se prikazati bez polja.`, raw);
    }
    return [];
  }
  return raw
    .map((entry, index) => {
      if (!entry || typeof entry !== 'object') {
        devWarn(`EditItems[${index}] nije objekt, preskačem.`, entry);
        return null;
      }
      const record = entry as Record<string, unknown>;
      if (!isEditControlType(record.type)) {
        devWarn(`EditItems[${index}].type nije podržan tip kontrole, preskačem.`, record.type);
        return null;
      }
      if (typeof record.selectFieldKey !== 'string' || record.selectFieldKey.length === 0) {
        devWarn(`EditItems[${index}] nema selectFieldKey, preskačem.`, record);
        return null;
      }
      // Bez azurFieldKey = read-only prikaz (npr. SRNs „Sati rada“) — Ionic i dalje crta polje.
      const azurFieldKey =
        typeof record.azurFieldKey === 'string' && record.azurFieldKey.length > 0
          ? record.azurFieldKey
          : undefined;
      if (!azurFieldKey && record.type !== 'text' && record.type !== 'memo' && record.type !== 'date') {
        devWarn(`EditItems[${index}] nema azurFieldKey, preskačem (nije display tip).`, record);
        return null;
      }
      const field: EditFieldDef = {
        type: record.type,
        caption: typeof record.caption === 'string' ? record.caption : '',
        selectFieldKey: record.selectFieldKey,
      };
      if (azurFieldKey) field.azurFieldKey = azurFieldKey;
      if (typeof record.selectFieldText === 'string') field.selectFieldText = record.selectFieldText;
      if (typeof record.entity === 'string') field.entity = record.entity;
      if (typeof record.debaunce === 'number') field.debaunce = record.debaunce;
      if (typeof record.parentIdFieldKey === 'string') field.parentIdFieldKey = record.parentIdFieldKey;
      if (record.disabled === 'allways' || record.disabled === 'edit') field.disabled = record.disabled;
      const dependencies = readEditDependencies(record.dependencies);
      if (dependencies.length > 0) field.dependencies = dependencies;
      return coerceLegacyBoolField(field);
    })
    .filter((field): field is EditFieldDef => field !== null);
}

function readEditDependencies(raw: unknown): EditFieldDependency[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }
      const record = entry as Record<string, unknown>;
      if (record.action !== 'azur' && record.action !== 'reset') {
        return null;
      }
      const dependency: EditFieldDependency = { action: record.action };
      if (typeof record.selectFieldKey === 'string') dependency.selectFieldKey = record.selectFieldKey;
      if (typeof record.selectFieldText === 'string') dependency.selectFieldText = record.selectFieldText;
      if (typeof record.azurFieldKey === 'string') dependency.azurFieldKey = record.azurFieldKey;
      if (typeof record.controlFieldKey === 'string') dependency.controlFieldKey = record.controlFieldKey;
      if (typeof record.controlFieldText === 'string') dependency.controlFieldText = record.controlFieldText;
      if (typeof record.controlAzurFieldKey === 'string') dependency.controlAzurFieldKey = record.controlAzurFieldKey;
      return dependency;
    })
    .filter((dependency): dependency is EditFieldDependency => dependency !== null);
}
