import { combineReducers } from '@reduxjs/toolkit';
import dnevniIzvjestaj from '../DnevniIzvjestaj/store';
import radniNalozi from '../RadniNalozi/store';

const reducer = combineReducers({
  dnevniIzvjestaj,
  radniNalozi
});

export default reducer;
