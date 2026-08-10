import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { hydrateUnlockedApps, mergeUnlockedApps, resetCore } from '@/features/core/coreSlice';
import { resetDocuments } from '@/features/documents/documentsSlice';
import { clearPushForSifOsobe } from '@/features/push/registerPush';
import { coreUnlockRequest, erpLoginRequest } from '@/services/api/authApi';
import { extractKorime, extractTenantDatabase, normalizeAppUnlockResponse, normalizeLoginUser } from '@/services/api/responseNormalizers';
import { getDeviceIdentity } from '@/services/device/deviceIdentity';
import {
  clearCoreActivationStorage,
  clearUserSessionStorage,
  getStoredConnection,
  getStoredCoreConfig,
  getStoredUnlockedApps,
  getStoredUser,
  resetAllSessionStorage,
  setStoredConnection,
  setStoredCoreConfig,
  setStoredUnlockedApps,
  setStoredUser,
} from '@/services/storage/sessionStorage';
import type { RootState } from '@/store';
import { toUserMessage } from '@/types/api';

import type { CoreConfig, ErpConnection, ErpUser } from './types';

function resolveSifOsobeFromUser(user: ErpUser | null | undefined): string | null {
  if (!user) return null;
  const raw = (user as Record<string, unknown>).sifosobe ?? (user as Record<string, unknown>).SifOsobe;
  if (raw == null) return null;
  const value = String(raw).trim();
  return value.length > 0 ? value : null;
}

/** Best-effort CLEAR_TOKEN prije brisanja sesije — ne smije baciti van. */
async function clearPushTokenFromAuthState(state: RootState): Promise<void> {
  const core = state.auth.core;
  const user = state.auth.user;
  const connection = state.auth.connection;
  if (!core?.apiBaseUrl) return;
  const sifOsobe = resolveSifOsobeFromUser(user);
  if (!sifOsobe) return;
  const tenantDb = extractTenantDatabase(connection as Record<string, unknown> | null, core.db);
  await clearPushForSifOsobe({
    apiBaseUrl: core.apiBaseUrl,
    tenantDb,
    sifOsobe,
  });
}

export type BootstrapStatus = 'idle' | 'loading' | 'ready';

interface RequestStatus {
  loading: boolean;
  error: string | null;
}

interface AuthState {
  bootstrapStatus: BootstrapStatus;
  core: CoreConfig | null;
  user: ErpUser | null;
  connection: ErpConnection | null;
  coreUnlock: RequestStatus;
  login: RequestStatus;
}

const initialState: AuthState = {
  bootstrapStatus: 'idle',
  core: null,
  user: null,
  connection: null,
  coreUnlock: { loading: false, error: null },
  login: { loading: false, error: null },
};

interface BootstrapResult {
  core: CoreConfig | null;
  user: ErpUser | null;
  connection: ErpConnection | null;
}

/**
 * Čita spremljeno stanje i odlučuje na koji korak aplikacija kreće — bez pozivanja
 * ijednog poslovnog API-ja. Oštećeni/zastarjeli zapisi su već filtrirani u
 * sessionStorage.ts (get* funkcije vraćaju null i čiste neispravan zapis).
 */
export const bootstrapSession = createAsyncThunk<BootstrapResult, void>('auth/bootstrapSession', async (_, { dispatch }) => {
  const core = await getStoredCoreConfig();
  if (!core) {
    return { core: null, user: null, connection: null };
  }

  const user = await getStoredUser();
  const connection = user ? await getStoredConnection() : null;
  const unlockedApps = await getStoredUnlockedApps();
  dispatch(hydrateUnlockedApps(unlockedApps));

  return { core, user, connection };
});

export const unlockCore = createAsyncThunk<CoreConfig, { pin: string }, { state: RootState; rejectValue: string }>(
  'auth/unlockCore',
  async ({ pin }, { dispatch, getState, rejectWithValue }) => {
    try {
      const device = await getDeviceIdentity();
      const raw = await coreUnlockRequest(pin, device);
      if (!raw?.serverpath || !raw?.db) {
        return rejectWithValue('Poslužitelj nije vratio ispravnu konfiguraciju aplikacije.');
      }

      const config: CoreConfig = {
        apiBaseUrl: raw.serverpath,
        db: raw.db,
        layoutprefix: raw.layoutprefix ?? null,
      };
      // raw.pin se namjerno ne uzima u obzir - PIN se ne smije trajno spremati.
      await setStoredCoreConfig(config);

      // spPinCoreAzur vraća table2 = već otključane aplikacije za ovaj PinCore (Ionic ih
      // ne sprema eksplicitno, ali Expo ih koristi da ne traži App PIN ako su već vezane).
      const preUnlocked = normalizeAppUnlockResponse(raw.table2);
      const mergedUnlocked = mergeUnlockedApps(getState().core.unlockedApps, preUnlocked);
      await setStoredUnlockedApps(mergedUnlocked);
      dispatch(hydrateUnlockedApps(mergedUnlocked));

      return config;
    } catch (error) {
      return rejectWithValue(toUserMessage(error));
    }
  },
  {
    condition: (_, { getState }) => !getState().auth.coreUnlock.loading,
  },
);

export const loginErp = createAsyncThunk<
  { user: ErpUser; connection: ErpConnection },
  { username: string; password: string },
  { state: RootState; rejectValue: string }
>(
  'auth/loginErp',
  async ({ username, password }, { getState, rejectWithValue }) => {
    const core = getState().auth.core;
    if (!core) {
      return rejectWithValue('Nedostaje aktivacija aplikacije. Ponovno unesite šifru za otključavanje.');
    }

    try {
      const raw = await erpLoginRequest({ apiBaseUrl: core.apiBaseUrl, db: core.db, uid: username, pwd: password });
      const rawUser = normalizeLoginUser(raw.user);
      const korime = rawUser ? extractKorime(rawUser) : null;
      if (!rawUser || !korime) {
        return rejectWithValue('Poslužitelj nije vratio ispravne podatke o korisniku.');
      }

      const user = { ...rawUser, korime } as ErpUser;
      const rawConnection = (raw.connection ?? {}) as Record<string, unknown>;
      const connection: ErpConnection = {
        ...rawConnection,
        database: extractTenantDatabase(rawConnection, core.db),
      };
      await setStoredUser(user);
      await setStoredConnection(connection);
      return { user, connection };
    } catch (error) {
      return rejectWithValue(toUserMessage(error));
    }
  },
  {
    condition: (_, { getState }) => !getState().auth.login.loading,
  },
);

/**
 * Odjava briše samo korisničku sesiju — core aktivacija ostaje, isto ponašanje
 * kao postojeći `logOut` thunk (src/pages/auth/store/index.jsx). Stanje modul-enginea
 * (odabrani modul, layout, lista) se briše da sljedeći korisnik na istom uređaju
 * ne vidi ostatke prethodne sesije.
 */
export const logout = createAsyncThunk<void, void, { state: RootState }>(
  'auth/logout',
  async (_, { dispatch, getState }) => {
    await clearPushTokenFromAuthState(getState());
    await clearUserSessionStorage();
    dispatch(resetDocuments());
  },
);

/**
 * Ponovna Core PIN aktivacija — briše spremljenu aktivaciju i sesiju, zadržava
 * identitet uređaja (Android ID). Korisnik ide natrag na ekran za Core PIN.
 */
export const reactivateCore = createAsyncThunk<void, void, { state: RootState }>(
  'auth/reactivateCore',
  async (_, { dispatch, getState }) => {
    await clearPushTokenFromAuthState(getState());
    await clearCoreActivationStorage();
    dispatch(resetCore());
    dispatch(resetDocuments());
  },
);

/** Potpuni reset aplikacije — briše i installation ID uređaja. */
export const resetApp = createAsyncThunk<void, void, { state: RootState }>(
  'auth/resetApp',
  async (_, { dispatch, getState }) => {
    await clearPushTokenFromAuthState(getState());
    await resetAllSessionStorage();
    dispatch(resetCore());
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapSession.pending, (state) => {
        state.bootstrapStatus = 'loading';
      })
      .addCase(bootstrapSession.fulfilled, (state, action) => {
        state.bootstrapStatus = 'ready';
        state.core = action.payload.core;
        state.user = action.payload.user;
        state.connection = action.payload.connection;
      })
      .addCase(bootstrapSession.rejected, (state) => {
        // Bootstrap koji baci grešku ne smije zaglaviti splash - ponašaj se kao prazan storage.
        state.bootstrapStatus = 'ready';
      })
      .addCase(unlockCore.pending, (state) => {
        state.coreUnlock.loading = true;
        state.coreUnlock.error = null;
      })
      .addCase(unlockCore.fulfilled, (state, action) => {
        state.coreUnlock.loading = false;
        state.core = action.payload;
      })
      .addCase(unlockCore.rejected, (state, action) => {
        state.coreUnlock.loading = false;
        state.coreUnlock.error = action.payload ?? 'Otključavanje nije uspjelo.';
      })
      .addCase(loginErp.pending, (state) => {
        state.login.loading = true;
        state.login.error = null;
      })
      .addCase(loginErp.fulfilled, (state, action) => {
        state.login.loading = false;
        state.user = action.payload.user;
        state.connection = action.payload.connection;
      })
      .addCase(loginErp.rejected, (state, action) => {
        state.login.loading = false;
        state.login.error = action.payload ?? 'Prijava nije uspjela.';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.connection = null;
      })
      .addCase(reactivateCore.fulfilled, (state) => {
        state.core = null;
        state.user = null;
        state.connection = null;
        state.coreUnlock.error = null;
        state.login.error = null;
      })
      .addCase(resetApp.fulfilled, () => ({
        // Storage je već prazan — bootstrapSession bi samo potvrdio null core/user.
        // bootstrapStatus mora ostati 'ready': inače redirect na /(auth)/unlock
        // zaobilazi app/index.tsx, a (app)/_layout vrti spinner dok status nije ready.
        ...initialState,
        bootstrapStatus: 'ready' as const,
      }));
  },
});

export default authSlice.reducer;
