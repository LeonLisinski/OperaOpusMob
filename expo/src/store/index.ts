import { configureStore } from '@reduxjs/toolkit';

import authReducer from '@/features/auth/authSlice';
import coreReducer from '@/features/core/coreSlice';
import documentsReducer from '@/features/documents/documentsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    core: coreReducer,
    documents: documentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
