import { configureStore } from '@reduxjs/toolkit';

import authReducer from '@/features/auth/authSlice';
import coreReducer from '@/features/core/coreSlice';
import documentsReducer from '@/features/documents/documentsSlice';

/**
 * Dokument engine drži cijele SP liste u Reduxu (list/originalList/dstLines) —
 * isto kao Ionic docs store. Serializable/immutable middleware u __DEV__ onda
 * legitimo prelazi default prag 32ms i spamaju LogBox. Provjere ostaju uključene
 * (hvataju Date/Map/non-JSON u akcijama); samo dižemo prag i isključujemo
 * poznate velike putanje iz deep walk-a.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    core: coreReducer,
    documents: documentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        warnAfter: 128,
        ignoredPaths: [
          'documents.list',
          'documents.originalList',
          'documents.dstLines',
          'documents.attachments',
          'documents.filterCache',
        ],
        // Payload tih fulfilled akcija = cijela SP lista; deep-check je skup, ne signal bug-a.
        ignoredActions: [
          'documents/loadModule/fulfilled',
          'documents/refreshList/fulfilled',
          'documents/applyFilters/fulfilled',
          'documents/loadLines/fulfilled',
          'documents/openRadniNalogFromUpit/fulfilled',
          'documents/loadAttachments/fulfilled',
        ],
      },
      immutableCheck: {
        warnAfter: 128,
        ignoredPaths: [
          'documents.list',
          'documents.originalList',
          'documents.dstLines',
          'documents.attachments',
          'documents.filterCache',
        ],
      },
    }),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
