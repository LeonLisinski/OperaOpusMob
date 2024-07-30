import { configureStore } from '@reduxjs/toolkit'
import createReducer from './rootReducer';

export default configureStore({
  reducer: createReducer(),
})