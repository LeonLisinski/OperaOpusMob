import { Action, combineReducers } from '@reduxjs/toolkit';
import auth from '../../src/pages/auth/store';
import core from '../../src/pages/core/store';
import servis from '../../src/pages/servis/store';
import docs from '../pages/dgl/store';
import gen from '../pages/gen/store';

const createReducer = (asyncReducers) => (state, action) => {
  const combinedReducer = combineReducers({
    core,
    servis,
    docs,
    gen,
    auth,
    ...asyncReducers,
  });

  /*
	Reset the redux store when user logged out
	 */

  //console.log('actionType', action.type);
  if (action.type === 'auth/user/userLoggedOut/fulfilled') {
    //state = undefined;
  }

  return combinedReducer(state, action);
};

export default createReducer;
