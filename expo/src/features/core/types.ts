/** Aplikacija otključana preko spPinAppAzur — perzistira se u cijelosti kao lista. */
export interface UnlockedAppEntry {
  code: string;
  db: string;
}

export interface ModuleMenuEntry {
  appid: number | string;
  title: string;
  icon?: string | null;
  url?: string | null;
  sifdv?: string | number;
  [key: string]: unknown;
}

export interface ModuleGroup {
  title: string;
  items: ModuleMenuEntry[];
}

/** Aplikacija iz spMob_Menu_Query (table1), obogaćena grupiranim modulima (table2) i `unlocked` statusom. */
export interface AppMenuEntry {
  appid: number | string;
  code: string;
  title: string;
  icon?: string | null;
  color?: string | null;
  url?: string | null;
  unlocked: boolean;
  items: ModuleGroup[];
  [key: string]: unknown;
}
