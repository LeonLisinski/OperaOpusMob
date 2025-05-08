import { Preferences } from '@capacitor/preferences';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const logOut = createAsyncThunk('auth/user/userLoggedOut', async (comment, { dispatch, getState }) => {

    await Preferences.remove({ key: 'user' });

    dispatch(setLogOut(null));

    

    // const dglid=data.newdglid[0].dglid;
    
    // dispatch(setDglId(dglid))
    // dispatch(getListItem(data.newdglid[0].dglid))
    // return data
});



export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        api: null,
        db: null,
        layoutprefix: null,
        user: null,
        connection: null,
    },
    reducers: {
        setApi: (state, action) => {
            const data = action.payload;
            state.layoutprefix = data.layoutprefix;
            state.api = data.serverpath;
            state.db = data.db;
        },
        setUser: (state, action) => {
            const data = action.payload;
            console.log('setUser', action.payload)
            state.user = data.user && data.user[0];
            state.connection = data.connection;
        },
        setLogOut: (state, action) => {
            state.user = null;
        },
    }
})

export const { setApi, setUser, setLogOut } = authSlice.actions

export default authSlice.reducer