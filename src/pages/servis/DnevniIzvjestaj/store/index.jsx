import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getData } from '../../../../utils/dataHelper';
import moment from 'moment';

export const getList = createAsyncThunk('servis/dnevniizvjestaj/list', async (fake, { dispatch, getState }) => {
    const originalData = getState().servis.dnevniIzvjestaj;
    const auth = getState()?.auth;

    const queries = [{
        query: 'spMob_DGL_DnevniIzvjestaj_Query',
        params: {
            action: 'getByUser',
            datumod: originalData?.filter.datumod,
            datumdo: originalData?.filter.datumdo,
            korime: auth?.user?.korime,
        },
        commandType: 'sp'
    }]

    const data = await getData({ queries }, auth);
    return data
});

export const getListItem = createAsyncThunk('servis/dnevniizvjestaj/listitem', async (dglid, { dispatch, getState }) => {

    const auth = getState()?.auth;

    const queries = [{
        query: 'spMob_DGL_DnevniIzvjestaj_Query',
        params: {
            action: 'getByUser',
            korime: auth?.user?.korime,
            dglid: dglid
        },
        commandType: 'sp'
    }]

    const data = await getData({ queries }, auth);

    dispatch(setItemData(data[0]))

    return data
});

export const getFilterDefaults = createAsyncThunk('servis/dnevniizvjestaj/filterDefaults', async (fake, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const queries = [{
        query: 'spMob_DGL_DnevniIzvjestaj_Query',
        params: {
            action: 'getDefaults',
            korime: auth?.user?.korime,
        },

    }]

    const data = await getData({ queries }, auth);
    return data[0];
});

export const saveDoc = createAsyncThunk('servis/dnevniizvjestaj/saveDoc', async (saveData, { dispatch, getState }) => {
    
    const auth = getState()?.auth;
    const sifOsobe=getState()?.auth?.user?.sifosobe;
    
    const queries = [{
        query: 'spWeb_UpdateDGL',
        params: {
            sifdv: 'DNIZ',
            dglid: saveData.dglid,
            dglJson:  JSON.stringify({...saveData.formData, izradilasifosobe: sifOsobe})
        },
        commandType: 'sp'
    }]

    const data = await getData({ queries }, auth);

    

    let dglid;
    if (saveData.dglid) {
        dglid = saveData.dglid;
    } else {
        dglid=data.newdglid[0].dglid;
    }
    
    await dispatch(getListItem(dglid));
    dispatch(getList());
    return data
});

export const saveComment = createAsyncThunk('servis/dnevniizvjestaj/saveDoc', async (comment, { dispatch, getState }) => {

    const auth = getState()?.auth;

    const dglid = getState().servis.dnevniIzvjestaj.data.dglid;
    const queries = [{
        query: 'spMob_DGL_Azur',
        params: {
            action: 'insertComment',
            dglid: dglid,
            komentar: comment
        },
        commandType: 'sp'
    }]

    await getData({ queries }, auth);
    dispatch(getListItem(dglid));
    dispatch(getList());


    // const dglid=data.newdglid[0].dglid;
    
    // dispatch(setDglId(dglid))
    // dispatch(getListItem(data.newdglid[0].dglid))
    // return data
});

export const setSearchText = createAsyncThunk('servis/dnevniizvjestaj/searchText', async (text, { dispatch, getState }) => {
    const originalData = getState().servis.dnevniIzvjestaj.originaldata;

    text = text.toLowerCase();

    const filteredData = originalData.filter(x => {
        return x.nazpartnera.toLowerCase().includes(text) ||
            x.nazpred?.toLowerCase().includes(text) ||
            x.brojdokumenta?.toLowerCase().includes(text) ||
            x.komentar?.toLowerCase().includes(text) 
            // || (x.nazpred && x.nazpred.toLowerCase().includes(text))

    });

    dispatch(setSearchList(filteredData));
});

export const dnevniIzvjestajSlice = createSlice({
    name: 'servis/dnevniizvjestaj',
    initialState: {
        //dglid: null,
        searchtext: null,
        list: null,
        originaldata: null,
        data: null,
        loading: false,
        filter: {
            datumod: moment(new Date()).subtract(3, "days").format('YYYY-MM-DD'),
            datumdo: moment(new Date()).format('YYYY-MM-DD')
        },
        filtertemp: null
    },
    reducers: {
        setItemData: (state, action) => {
            const data = action.payload;
            state.data = data;
        },
        changeValue: (state, action) => {
            state.data = action.payload
        },
        // setDglId: (state, action) => {
        //     state.dglid = action.payload;
        // },
        setFilter: (state, action) => {
            const filter = {...state.filter, ...action.payload}
            state.filter = filter;
        },
        setFilterTemp: (state, action) => {
            const filter = {...state.filter}
            state.filtertemp = filter;
        },
        setSearchList: (state, action) => {
            const data = action.payload;
            state.list = data;
        },
        setFilterTempValues: (state, action) => {
            const filter = {...state.filtertemp, ...action.payload}
            state.filtertemp = filter;
        },
        setApplyFilters: (state, action) => {
            state.filter = {...state.filtertemp}
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(getList.pending, (state, action) => {
            state.loading = true;
        })
        .addCase(getList.fulfilled, (state, action) => {
            const data = action.payload;
            state.loading = false;
            state.list = data;
            state.originaldata = data;
        })
        .addCase(getList.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message
        })
        // .addCase(getFilterDefaults.fulfilled, (state, action) => {
        //     const data = action.payload;
        //     state.filterdefaults = data;
        //     state.filter.datumod = moment(data.datumod).format('YYYY-MM-DD');
        //     state.filter.datumdo = moment(data.datumdo).format('YYYY-MM-DD');
        // })
        ;
        //[getList.fulfilled]: (state, action) => action.payload,
    }



})

export const { changeValue, setItemData, setFilter, setFilterTemp, setApplyFilters, setFilterTempValues, setSearchList } = dnevniIzvjestajSlice.actions

export const selectList = ({ servis }) => {
    //console.log('selectlist', servis.dnevniIzvjestaj?.list);
    return servis.dnevniIzvjestaj?.list
}

export const selectListItem = ({ servis }) => {
    return servis.dnevniIzvjestaj?.data
}

export const selectDnevniIzvjestaj = ({ servis }) => {
    return servis.dnevniIzvjestaj
}

export default dnevniIzvjestajSlice.reducer