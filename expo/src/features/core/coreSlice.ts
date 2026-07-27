import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { appUnlockRequest } from '@/services/api/authApi';
import { fetchMenuRequest } from '@/services/api/menuApi';
import { normalizeAppUnlockResponse, normalizeMenuResponse, extractTenantDatabase } from '@/services/api/responseNormalizers';
import { getDeviceIdentity } from '@/services/device/deviceIdentity';
import { setStoredUnlockedApps } from '@/services/storage/sessionStorage';
import type { RootState } from '@/store';
import { toUserMessage } from '@/types/api';

import type { AppMenuEntry, ModuleGroup, ModuleMenuEntry, UnlockedAppEntry } from './types';

interface RequestStatus {
  loading: boolean;
  error: string | null;
}

interface CoreState {
  apps: AppMenuEntry[];
  selectedApp: AppMenuEntry | null;
  selectedModule: ModuleMenuEntry | null;
  unlockedApps: UnlockedAppEntry[];
  menu: RequestStatus;
  appUnlock: RequestStatus;
}

const initialState: CoreState = {
  apps: [],
  selectedApp: null,
  selectedModule: null,
  unlockedApps: [],
  menu: { loading: false, error: null },
  appUnlock: { loading: false, error: null },
};

export function mergeUnlockedApps(existing: UnlockedAppEntry[], incoming: UnlockedAppEntry[]): UnlockedAppEntry[] {
  const byCode = new Map<string, UnlockedAppEntry>();
  for (const entry of existing) {
    byCode.set(entry.code.trim().toLowerCase(), entry);
  }
  for (const entry of incoming) {
    byCode.set(entry.code.trim().toLowerCase(), entry);
  }
  return Array.from(byCode.values());
}

function applyUnlockedFlags(apps: AppMenuEntry[], unlockedApps: UnlockedAppEntry[]): AppMenuEntry[] {
  const unlockedCodes = new Set(unlockedApps.map((entry) => entry.code.trim().toLowerCase()));
  return apps.map((app) => ({
    ...app,
    unlocked: unlockedCodes.has(app.code.trim().toLowerCase()),
  }));
}

function mapMenuResponse(raw: unknown, unlockedApps: UnlockedAppEntry[]): AppMenuEntry[] {
  const { table1, table2 } = normalizeMenuResponse(raw);
  const unlockedCodes = new Set(unlockedApps.map((entry) => entry.code));

  return table1.map((app) => {
    const code = String(app.code ?? '');
    const appModules = table2.filter((item) => item.appid === app.appid) as ModuleMenuEntry[];
    const group: ModuleGroup = { title: 'Moduli', items: appModules };

    return {
      ...app,
      appid: app.appid as number | string,
      code,
      title: String(app.title ?? code),
      unlocked: unlockedCodes.has(code),
      items: [group],
    } satisfies AppMenuEntry;
  });
}

function mapUnlockedApps(raw: unknown): UnlockedAppEntry[] {
  return normalizeAppUnlockResponse(raw);
}

export const fetchMenu = createAsyncThunk<AppMenuEntry[], void, { state: RootState; rejectValue: string }>(
  'core/fetchMenu',
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const { core, user, connection } = state.auth;

    if (!core || !user) {
      return rejectWithValue('Sesija nije spremna za dohvat izbornika.');
    }

    try {
      const tenantDb = extractTenantDatabase(connection as Record<string, unknown>, core.db);
      const raw = await fetchMenuRequest({
        apiBaseUrl: core.apiBaseUrl,
        tenantDb,
        korime: user.korime,
      });
      return mapMenuResponse(raw, state.core.unlockedApps);
    } catch (error) {
      return rejectWithValue(toUserMessage(error));
    }
  },
  {
    condition: (_, { getState }) => !getState().core.menu.loading,
  },
);

export const unlockApp = createAsyncThunk<
  UnlockedAppEntry[],
  { pin: string; appCode: string },
  { state: RootState; rejectValue: string }
>(
  'core/unlockApp',
  async ({ pin, appCode }, { getState, rejectWithValue }) => {
    const core = getState().auth.core;
    if (!core) {
      return rejectWithValue('Nedostaje aktivacija aplikacije.');
    }

    try {
      const device = await getDeviceIdentity();
      const raw = await appUnlockRequest({
        pin,
        appCode,
        tenantDb: core.db,
        deviceUuid: device.installationId,
      });
      const unlockedApps = mapUnlockedApps(raw);
      if (unlockedApps.length === 0) {
        return rejectWithValue(
          'Otključavanje nije uspjelo. Ponovno unesite Core PIN na ovom uređaju, zatim pokušajte opet.',
        );
      }
      const normalizedCode = appCode.trim().toLowerCase();
      const includesRequestedApp = unlockedApps.some((entry) => entry.code.trim().toLowerCase() === normalizedCode);
      if (!includesRequestedApp) {
        return rejectWithValue(
          'Unesena šifra ne otključava ovu aplikaciju. Servis i CRM imaju zasebne App PIN-ove — unesite šifru dodijeljenu za ovaj modul.',
        );
      }
      const mergedUnlocked = mergeUnlockedApps(getState().core.unlockedApps, unlockedApps);
      await setStoredUnlockedApps(mergedUnlocked);
      return mergedUnlocked;
    } catch (error) {
      return rejectWithValue(toUserMessage(error));
    }
  },
  {
    condition: (_, { getState }) => !getState().core.appUnlock.loading,
  },
);

const coreSlice = createSlice({
  name: 'core',
  initialState,
  reducers: {
    hydrateUnlockedApps: (state, action: PayloadAction<UnlockedAppEntry[]>) => {
      state.unlockedApps = action.payload;
    },
    selectApp: (state, action: PayloadAction<AppMenuEntry>) => {
      state.selectedApp = action.payload;
    },
    selectModule: (state, action: PayloadAction<ModuleMenuEntry>) => {
      state.selectedModule = action.payload;
    },
    resetCore: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenu.pending, (state) => {
        state.menu.loading = true;
        state.menu.error = null;
      })
      .addCase(fetchMenu.fulfilled, (state, action) => {
        state.menu.loading = false;
        state.apps = action.payload;
      })
      .addCase(fetchMenu.rejected, (state, action) => {
        state.menu.loading = false;
        state.menu.error = action.payload ?? 'Dohvat izbornika nije uspio.';
      })
      .addCase(unlockApp.pending, (state) => {
        state.appUnlock.loading = true;
        state.appUnlock.error = null;
      })
      .addCase(unlockApp.fulfilled, (state, action) => {
        state.appUnlock.loading = false;
        state.unlockedApps = action.payload;
        state.apps = applyUnlockedFlags(state.apps, action.payload);
        if (state.selectedApp) {
          const code = state.selectedApp.code.trim().toLowerCase();
          const unlocked = action.payload.some((entry) => entry.code.trim().toLowerCase() === code);
          state.selectedApp = { ...state.selectedApp, unlocked };
        }
      })
      .addCase(unlockApp.rejected, (state, action) => {
        state.appUnlock.loading = false;
        state.appUnlock.error = action.payload ?? 'Otključavanje aplikacije nije uspjelo.';
      });
  },
});

export const { hydrateUnlockedApps, selectApp, selectModule, resetCore } = coreSlice.actions;
export default coreSlice.reducer;
