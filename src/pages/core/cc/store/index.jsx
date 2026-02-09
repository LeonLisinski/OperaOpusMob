import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import getData from '../../../../utils/dataHelper';

export const getMenu = createAsyncThunk('core/cc/getMenu', async (radnikId, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const queries = [{
        query: 'spMob_Menu_Query',
        params: {
            action: 'get',
            korIme: auth?.user?.korime
        },
        commandType: 'sp'
    }]
    const data = await getData({ queries }, auth);
    return (data);
});

export const selectAppByCode = createAsyncThunk('core/cc/selectAppByCode', async (code, { dispatch, getState }) => {
    const apps = getState()?.core.cc.apps;

    var foundIndex = apps.findIndex(x => x.code == code);
    if (foundIndex >= 0) {
        dispatch(selectApp(apps[foundIndex]));
    }
});

export const selectModuleBySifDv = createAsyncThunk('core/cc/selectModuleBySifDv', async (d, { dispatch, getState }) => {
    const apps = getState()?.core.cc.apps;

    const foundIndex = apps.findIndex(x => x.code == d.code);
    const app = apps[foundIndex];
    const modules = app.items[0].items;

    const foundModuleIndex = modules.findIndex(x => x.sifdv == d.sifdv);

    if (foundModuleIndex >= 0) {
        dispatch(selectModule(modules[foundModuleIndex]));
    }
});

export const ccSlice = createSlice({
    name: 'core/cc',
    initialState: {
        loadgin: false,
        apps: [
        ],
        selectedApp: null,
        selectedModule: null,
        unlocked: [],
    },
    reducers: {
        unlockApp: (state, action) => {
            const items = action.payload;
            state.unlocked = [items]

            const array = [...state.apps];

            items.map(item => {
                var foundIndex = array.findIndex(x => x.code == item.code);
                array[foundIndex].unlocked = true;
            })

            state.apps = array;
        },
        setUnlockedApp: (state, action) => {
            const data = action.payload;
            const array = [...state.apps];

            if (data) {
                state.unlocked = data;
                data.map(item => {
                    var foundIndex = array.findIndex(x => x.code == item.code);
                    if (foundIndex >= 0) {
                        array[foundIndex].unlocked = true;
                    }
                    state.apps = array;
                })

            }
        },

        selectApp: (state, action) => {
            const data = action.payload;
            state.selectedApp = data;
        },
        selectModule: (state, action) => {
            const data = action.payload;
            state.selectedModule = data;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMenu.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(getMenu.fulfilled, (state, action) => {
                const dataApps = action.payload.table1;

                const dataMenu = action.payload.table2;

                dataApps.map(item => {
                    const menus = dataMenu.filter(obj => {
                        return obj.appid === item.appid;
                    });
                    item.items = [];
                    item.items.push({title: 'Moduli', items: menus});
                })

                state.unlocked && state.unlocked.map(item => {
                    var foundIndex = dataApps.findIndex(x => x.code == item.code);
                    if (foundIndex >= 0) {
                        dataApps[foundIndex].unlocked = true;
                    }
                })
                state.loading = false;
                state.apps = dataApps;
            })
        }

})

export const { selectApp, selectModule, unlockApp, setUnlockedApp } = ccSlice.actions


export default ccSlice.reducer