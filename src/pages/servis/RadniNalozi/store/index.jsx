import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import moment from 'moment';
import { getData, getAttachemnt } from '../../../../utils/dataHelper';

export const getList = createAsyncThunk('servis/radninalozi/list', async (id, { dispatch, getState }) => {
    const originalData = getState().servis.radniNalozi;
    const auth = getState()?.auth;
    const sifdv = getState().servis.radniNalozi.sifdv;

    const statuses = originalData.filter?.statuses?.filter(item => item.checked == true).map(item => item.id).join(',');

    const queries = [{
        query: 'spMob_DGL_RadniNalozi_Query',
        params: {
            action: 'get',
            datumod: originalData?.filter.datumod,
            datumdo: originalData?.filter.datumdo,
            korime: auth?.user?.korime,
            statusi: statuses,
            sifdv: sifdv
        },
        commandType: 'sp'
    }]

    const data = await getData({ queries }, auth);
    return data
});

export const getGla = createAsyncThunk('servis/radninalozi/getgla', async (id, { dispatch, getState }) => {
    const auth = getState()?.auth;

    const queries = [{
        query: 'spMob_DGL_RadniNalozi_Query',
        params: {
            action: 'get',
            korime: auth?.user?.korime,
            dglid: id,
        },
        commandType: 'sp'
    }]

    const data = await getData({ queries }, auth);
    
    await dispatch(getListItem(data[0]));
    dispatch(getList());
});

export const copyRNfromUpit = createAsyncThunk('servis/radninalozi/getgla', async (id, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const docs = getState().docs;
    const query = docs.layouts.queries.dgl.list;

    const queries = [{
        query: query.sp,
        params: {
            ...query.params,
            korime: auth?.user?.korime,
            dglid: id,
        },
        commandType: 'sp'
    }]

    const data = await getData({ queries }, auth);

    console.log('copyRNfromUpit', data);

    dispatch(getListItem(data[0]));



    // await dispatch(setSifDv('RNsec'));
    // await dispatch(setItemData(data[0]));
    // await dispatch(getListItem(data[0]));
    //dispatch(getList());
});


export const getFilterDefaults = createAsyncThunk('servis/radninalozi/filterDefaults', async (fake, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const queries = [{
        query: 'spMob_DGL_RadniNalozi_Query',
        params: {
            action: 'getDefaults',
            korime: auth?.user?.korime,
        },

    }]

    const data = await getData({ queries }, auth);
    return data[0];
});

export const getStatuses = createAsyncThunk('servis/radninalozi/statusi', async (fake, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const queries = [{
        query: 'spMob_DGL_RadniNalozi_Query',
        params: {
            action: 'getStatusi',
            korime: auth?.user?.korime
        },

    }]

    const data = await getData({ queries }, auth);
    return data
});

export const setSearchText = createAsyncThunk('servis/radninalozi/searchText', async (text, { dispatch, getState }) => {
    const originalData = getState().servis.radniNalozi.originaldata;

    text = text.toLowerCase();

    const filteredData = originalData.filter(x => {
        return x.nazpartnera.toLowerCase().includes(text) ||
            x.nazpred?.toLowerCase().includes(text) ||
            x.brojdokumenta?.toLowerCase().includes(text) ||
            x.napomena7?.toLowerCase().includes(text) 
            // || (x.nazpred && x.nazpred.toLowerCase().includes(text))

    });

    dispatch(setSearchList(filteredData));
});


export const getListItem = createAsyncThunk('servis/radninalozi/listitem', async (item, { dispatch, getState }) => {
    const auth = getState()?.auth;

    dispatch(setItemData(item))

    const queries = [{
        query: 'spMob_DGL_RadniNalozi_Query',
        params: {
            action: 'getDet',
            korime: auth?.user?.korime,
            dglid: item.dglid
        },
        commandType: 'sp'
    }]

    const data = await getData({ queries }, auth);
    dispatch(setItemDataDet(data));

});

export const getListDet = createAsyncThunk('servis/radninalozi/listidet', async (d, { dispatch, getState }) => {
    const auth = getState()?.auth;

    const dglid = getState().servis.radniNalozi.data.dglid;

    const queries = [{
        query: 'spMob_DGL_RadniNalozi_Query',
        params: {
            action: 'getDet',
            korime: auth?.user?.korime,
            dglid: dglid
        },
        commandType: 'sp'
    }]

    const data = await getData({ queries }, auth);
    dispatch(setItemDataDet(data));

});




export const saveDGL = createAsyncThunk('servis/radninalozi/saveDGL', async (saveData, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const sifOsobe = auth.user?.sifosobe;

    const sifdv = getState().servis.radniNalozi.sifdv;

    const queries = [{
        query: 'spWeb_UpdateDGL',
        params: {
            sifdv: sifdv,
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
    


    //await dispatch(setDglId(dglid));
    await dispatch(getGla(dglid));
    return dglid;
});


export const saveDoc = createAsyncThunk('servis/radninalozi/saveDoc', async (saveData, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const dglid = getState().servis.radniNalozi.data.dglid;

    const queries = [{
        query: 'spMob_DST_RadniNalozi_Azur',
        params: {
            action: 'update',
            dglid: dglid,
            dstid: saveData.formData?.dstid,
            kolicina: saveData.formData?.kolicina,
            sifart: saveData.formData?.sifart,
            opis: saveData.formData?.opis
        },
        commandType: 'sp'
    }]

    await getData({ queries }, auth);


    dispatch(getListDet(0));
    
});

export const changeStatus = createAsyncThunk('servis/radninalozi/changestatus', async (dstId, { dispatch, getState }) => {
    const auth = getState()?.auth;
    //const dglid = getState().servis.radniNalozi.data.dglid;

    const queries = [{
        query: 'spMob_DST_RadniNalozi_Azur',
        params: {
            action: 'changeStatus',
            dstid: dstId,
        },
        commandType: 'sp'
    }]

    await getData({ queries }, auth);


    dispatch(getListDet(0));
    
});


export const changeStatusDgl = createAsyncThunk('servis/radninalozi/changestatus', async (dglId, { dispatch, getState }) => {
    const auth = getState()?.auth;
    //const dglid = getState().servis.radniNalozi.data.dglid;

    const queries = [{
        query: 'spMob_DGL_RadniNalozi_Azur',
        params: {
            action: 'changeStatusToClose',
            dglId: dglId,
        },
        commandType: 'sp'
    }]

    await getData({ queries }, auth);


    dispatch(getList());
    
});

export const deleteDst = createAsyncThunk('servis/radninalozi/deletedst', async (dstId, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const queries = [{
        query: 'spMob_DST_RadniNalozi_Azur',
        params: {
            action: 'deleteDst',
            dstid: dstId,
        },
        commandType: 'sp'
    }]
    await getData({ queries }, auth);

    dispatch(getListDet(0));
    
});



export const saveSignature = createAsyncThunk('servis/radninalozi/saveSignature', async (signature, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const dglid = getState().servis.radniNalozi.data.dglid;

    const queries = [{
        query: 'spMob_DGL_Azur',
        params: {
            action: 'insertSignature',
            dglid: dglid,
            signature: signature
        },
        commandType: 'sp'
    }]

    await getData({ queries }, auth);
});



export const saveComment = createAsyncThunk('servis/radninalozi/saveComment', async (comment, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const dglid = getState().servis.radniNalozi.data.dglid;
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

    dispatch(setItemDataComment(comment));
    //dispatch(getListItem(dglid));
    dispatch(getList());
    // const dglid=data.newdglid[0].dglid;
    // dispatch(setDglId(dglid))
    // dispatch(getListItem(data.newdglid[0].dglid))
    // return data
});

export const getPrivitci = createAsyncThunk('servis/radninalozi/getPrivitci', async (d, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const dglid = getState().servis.radniNalozi.data.dglid;


    const queries = [{
        query: "spMob_DGL_RadniNalozi_Query",
        params: {
            action: 'getPrilozi',
            korime: auth?.user?.korime,
            dglid: dglid
        },
        commandType: 'sp'
    }]

    const data = await getData({ queries }, auth);
    await dispatch(setPrivitci(data));
});

export const getPrivitak = createAsyncThunk('servis/radninalozi/getPrivitak', async (id, { dispatch, getState }) => {
    const auth = getState()?.auth;

    const data = await getAttachemnt({id: id}, auth);

    await dispatch(setPrivitak(data));
    return data;
});




export const radniNaloziSlice = createSlice({
    name: 'servis/radninalozi',
    initialState: {
        sifdv: null,
        list: null,
        searchtext: null,
        originaldata: null,
        data: null,        
        datadet: null,
        privitak: null,
        privitci: null,
        loading: false,
        error: '',
        filterdefaults: null,
        filter: {
            datumod: moment(new Date()).subtract(100, "days").format('YYYY-MM-DD'),
            datumdo: moment(new Date()).format('YYYY-MM-DD'),
            statuses: null
        },
        filtertemp: null

    },
    reducers: {
        setSifDv: (state, action) => {
            const data = action.payload;
            state.sifdv = data;
        },
        setItemData: (state, action) => {
            const data = action.payload;
            state.data = data;
        },
        setItemDataComment: (state, action) => {
            const data = action.payload;
            if (state.data) {
                state.data.komentar = data;
            }
        },
        setItemDataDet: (state, action) => {
            const data = action.payload;
            state.datadet = data;
        },
        setSearchList: (state, action) => {
            const data = action.payload;
            state.list = data;
        },

        setFilter: (state, action) => {
            const filter = {...state.filter, ...action.payload}
            state.filter = filter;
        },
        setFilterTemp: (state, action) => {
            const filter = {...state.filter}
            state.filtertemp = filter;
        },

        setFilterTempValues: (state, action) => {
            const filter = {...state.filtertemp, ...action.payload}
            state.filtertemp = filter;
        },

        setFilterStatuses: (state, action) => {
            const item = action.payload;
            const array = [...state.filter.statuses];
            var foundIndex = array.findIndex(x => x.id == item.id);
            array[foundIndex] = item;
            state.filter.statuses = array;
        },
        setFilterTempStatuses: (state, action) => {
            const item = action.payload;
            const array = [...state.filtertemp.statuses];
            var foundIndex = array.findIndex(x => x.id == item.id);
            array[foundIndex] = item;
            state.filtertemp.statuses = array;
        },
        setApplyFilters: (state, action) => {
            state.filter = {...state.filtertemp}
        },
        setPrivitci: (state, action) => {
            const data = action.payload;
            state.privitci = data;
        },
        setPrivitak: (state, action) => {
            const data = action.payload;
            state.privitak = data;
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
            .addCase(getStatuses.fulfilled, (state, action) => {
                const data = action.payload;

                const statusiChecked = state.filterdefaults?.statusichecked?.split(',');
                const dataFinal = data.map(item => 
                    {
                        const isChecked = statusiChecked?.includes(item.id.toString()) 
                        return (
                            {
                            ...item, 
                            checked: isChecked
                            }
                        )
                    }
                );

                state.filter.statuses = dataFinal;
            })
            .addCase(getFilterDefaults.fulfilled, (state, action) => {
                const data = action.payload;
                state.filterdefaults = data;
                state.filter.datumod = moment(data.datumod).format('YYYY-MM-DD');
                state.filter.datumdo = moment(data.datumdo).format('YYYY-MM-DD');
            })
        //[getList.fulfilled]: (state, action) => action.payload,
    }

})

export const { setSifDv, setItemData, setItemDataDet, setItemDataComment, setSearchList, setPrivitci, setPrivitak, setFilter, setFilterTemp, setFilterTempValues, setFilterStatuses, setFilterTempStatuses, setApplyFilters} = radniNaloziSlice.actions


export const selectRadniNalozi = ({ servis }) => {
    return servis.radniNalozi
}
// export const selectListItem = ({ servis }) => {
//     return servis.radniNalozi?.data
// }

export default radniNaloziSlice.reducer