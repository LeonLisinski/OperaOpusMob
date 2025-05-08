import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import moment from 'moment';
import getData, { getDocsDefinitions } from '../../../utils/dataHelper';


export const getSettings = createAsyncThunk('gen/getSettings', async (id, { dispatch, getState }) => {
    const gen = getState().gen;
    const auth = getState()?.auth;

    const query = gen.layouts.queries.core.settings;

    const queries = [{
        query: query.sp,
        params: {
            ...query.params,
            korime: auth?.user?.korime,
            sifosobe: auth?.user?.sifosobe,
        },
        commandType: 'sp'
    }]

    const data = await getData({ queries }, auth);
    return data
});


export const getList = createAsyncThunk('gen/getList', async (id, { dispatch, getState }) => {
    const gen = getState().gen;
    const auth = getState()?.auth;

    const statuses = gen.filter?.statuses?.filter(item => item.checked == true).map(item => item.id).join(',');

    const query = gen.layouts.queries.gla.list;
    const queries = [{
        query: query.sp,
        params: {
            ...query.params,
            korime: auth?.user?.korime,
            datumod: gen.filter.datumod,
            datumdo: gen.filter.datumdo,
            samomoje: gen.filter?.samomoje,
            statusi: statuses
        },
        commandType: 'sp'
    }]

    const data = await getData({ queries }, auth);
    return data
});

export const getGla = createAsyncThunk('gen/getGla', async (id, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const gen = getState().gen;
    const query = gen.layouts.queries.gla.list;

    const queries = [{
        query: query.sp,
        params: {
            ...query.params,
            korime: auth?.user?.korime,
            id: id
        },
        commandType: 'sp'
    }]

    const data = await getData({ queries }, auth);
    dispatch(getListItem(data[0]));
    dispatch(getList());
});

export const getFilterDefaults = createAsyncThunk('gen/getFilterDefaults', async (fake, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const gen = getState().gen;
    const query = gen.layouts.queries.gla.filterdefaults;

    const queries = [{
        query: query.sp,
        params: {
            ...query.params,
            korime: auth?.user?.korime
        },

    }]

    const data = await getData({ queries }, auth);
    return data[0];
});

export const getStatuses = createAsyncThunk('gen/getStatuses', async (fake, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const gen = getState().gen;
    const query = gen.layouts.queries.gla.statusi;

    const queries = [{
        query: query.sp,
        params: {
            ...query.params,
            korime: auth?.user?.korime
        },

    }]

    const data = await getData({ queries }, auth);
    return data
});

export const getDocsLayout = createAsyncThunk('gen/getDocsLayout', async (fake, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const gen = getState().gen;

    const folder = {
        //folder: `${gen.app}\\${gen.module}`
        folder: `${gen.app}/${gen.module}`
    }

    const data = await getDocsDefinitions({ ...folder }, auth);
    return data;
});

export const createDoc = createAsyncThunk('gen/createDoc', async (fake, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const gen = getState().gen;
    const query = gen.layouts.queries.gla.createdoc;
    const app = gen.app;
    const module = gen.module;

    const queries = [{
        query: query.sp,
        params: {
            ...query.params,
            app: app,
            module: module,            
            korime: auth?.user?.korime,
            sifosobe: auth?.user?.sifosobe,
            id: gen.data.id
        },
        commandType: 'sp'
    }]

    const data = await getData({ queries }, auth);
    return data;
});

export const copyRNfromUpit = createAsyncThunk('gen/copyRNfromUpit', async (id, { dispatch, getState }) => {
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
    return data;
});

export const setSearchText = createAsyncThunk('gen/searchText', async (text, { dispatch, getState }) => {
    const originalData = getState().docs.originaldata;
    const searchFields = JSON.parse(getState().docs.settings.searchfields);

    text = text.toLowerCase().replace('č', 'c').replace('ć', 'c').replace('š', 's').replace('đ', 'd').replace('ž', 'z');


    const filteredData = originalData.filter(x => {
        let value = false;
        searchFields.map(field => {
            console.log('searchFields', searchFields);
            if (x[field.toLowerCase()] && x[field.toLowerCase()].toLowerCase().replace('č', 'c').replace('ć', 'c').replace('š', 's').replace('đ', 'd').replace('ž', 'z').includes(text)) {
                value = true;
            }
        })
        return value;
    });

    dispatch(setSearchList(filteredData));
});


export const getListItem = createAsyncThunk('gen/getListItem', async (item, { dispatch, getState }) => {
    // const auth = getState()?.auth;

    // const gen = getState().gen;
    // const query = gen.layouts.queries.det.list;

    dispatch(setItemData(item))

    // const queries = [{
    //     query: query.sp,
    //     params: {
    //         ...query.params,
    //         korime: auth?.user?.korime,
    //         sifosobe: auth?.user?.sifosobe,
    //         samomoje: docs.filter?.samomoje,
    //         dglid: item.dglid
    //     },
    //     commandType: 'sp'
    // }]

    // const data = await getData({ queries }, auth);
    // dispatch(setItemDataDet(data));

});

export const getPrivitci = createAsyncThunk('gen/getPrivitci', async (d, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const docs = getState().docs;

    const dglid = docs.data.dglid;
    const query = docs.layouts.queries.dgl.prilozi;

    const queries = [{
        query: query.sp,
        params: {
            ...query.params,
            korime: auth?.user?.korime,
            dglid: dglid
        },
        commandType: 'sp'
    }]

    const data = await getData({ queries }, auth);
    dispatch(setPrivitci(data));

});


export const saveGla = createAsyncThunk('gen/saveGla', async (saveData, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const gen = getState().gen;
    
    const layouts = gen.layouts;
    const app = gen.app;
    const module = gen.module;

    const query = layouts.queries.gla.azur;


    /*const sifOsobe = auth.user?.sifosobe;
    , izradilasifosobe: sifOsobe*/
    
    const queries = [{
        query: query?.sp,
        params: {
            ...query.params,
            app: app,
            module: module,
            korime: auth.user.korime,
            sifosobe: auth.user.sifosobe,
            id: saveData.id,
            dglJson:  JSON.stringify({...saveData.formData, ...layouts.glaEditItemsExtends})
        },
        commandType: 'sp'
    }]
    console.log('aaa', queries);

    const data = await getData({ queries }, auth);

    

    let id;
    if (saveData?.id) {
        id = saveData.id;
    } else {
        id=data[0].id;
    }
    
    //await dispatch(setDglId(dglid));
    await dispatch(getGla(id));
    return id;
});



export const changeStatus = createAsyncThunk('gen/changeStatus', async (dstId, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const dglData = getState()?.docs.data;
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
    dispatch(getListItem(dglData));    
});


export const changeStatusDgl = createAsyncThunk('gen/changeStatusDgl', async (dglId, { dispatch, getState }) => {
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

export const deleteDst = createAsyncThunk('gen/deleteDst', async (dstId, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const dglData = getState().docs.data;
    const queries = [{
        query: 'spMob_DST_RadniNalozi_Azur',
        params: {
            action: 'deleteDst',
            dstid: dstId,
        },
        commandType: 'sp'
    }]
    await getData({ queries }, auth);

    dispatch(getListItem(dglData));
    
});

export const dstPotvrdaKolcine = createAsyncThunk('gen/dstPotvrdaKolcine', async (dstId, { dispatch, getState }) => {
    const dglData = getState().docs.data;

    const auth = getState()?.auth;
    const queries = [{
        query: 'spMob_ZJUKIC_DST_Azur',
        params: {
            action: 'potvrdaKolicine',
            dstid: dstId,
        },
        commandType: 'sp'
    }]
    await getData({ queries }, auth);


    dispatch(getListItem(dglData));
    
});

export const dstDeletePotvrdaKolcine = createAsyncThunk('gen/dstDeletePotvrdaKolcine', async (dstId, { dispatch, getState }) => {
    const dglData = getState().docs.data;
    const auth = getState()?.auth;
    const queries = [{
        query: 'spMob_ZJUKIC_DST_Azur',
        params: {
            action: 'deletePotvrdaKolicine',
            dstid: dstId,
        },
        commandType: 'sp'
    }]
    await getData({ queries }, auth);

    dispatch(getListItem(dglData));
});



export const saveSignature = createAsyncThunk('gen/saveSignature', async (data, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const dglData = getState().docs.data;
    const dglid = dglData.dglid;
    const layouts = getState().docs.layouts;

    const queries = [{
        query: 'spMob_DGL_Azur',
        params: {
            action: 'insertSignature',
            dglid: dglid,
            signature: data.signature,
            signatureText: data.signatureText,
            signatureTextField: layouts.properties.signatureTextAzurField
        },
        commandType: 'sp'
    }]

    
    await dispatch(setItemDataSignature(data.signatureText));

    await getData({ queries }, auth);
});

export const saveSignatureText = createAsyncThunk('gen/saveSignatureText', async (data, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const dglData = getState().docs.data;
    const dglid = getState().docs.data.dglid;
    const layouts = getState().docs.data.docs.layouts;

    const queries = [{
        query: 'spMob_DGL_Azur',
        params: {
            action: 'insertSignature',
            dglid: dglid,
            signature: data.signature,
            signatureText: data.signatureText,
            signatureTextField: layouts.properties.signatureTextAzurField
        },
        commandType: 'sp'
    }]

    

    await getData({ queries }, auth);
});



export const saveComment = createAsyncThunk('gen/saveComment', async (comment, { dispatch, getState }) => {
    const auth = getState()?.auth;
    const dglid = getState().docs.dglid;
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


export const docsSlice = createSlice({
    name: 'gen',
    initialState: {
        settings: null,
        sifdv: null,
        app: null,
        module: null,
        layouts: {},
        list: null,
        listItemLayout: {

        },
        privitci: null,
        searchtext: null,
        originaldata: null,
        data: null,
        dataEdit: null,
        dstDataEdit: null,
        dataEditNew: null,
        datadet: null,
        loading: false,
        error: '',
        filterdefaults: null,
        filter: {
            datumod: moment(new Date()).subtract(100, "days").format('YYYY-MM-DD'),
            datumdo: moment(new Date()).format('YYYY-MM-DD'),
            samomoje: true,
            statuses: null
        },
        filtertemp: null

    },
    reducers: {
        setProps: (state, action) => {
            const data = action.payload;
            state.app = data.app;
            state.module = data.module;
        },
        setItemData: (state, action) => {
            const data = action.payload;
            state.data = data;
            //state.dataEdit = {...data};
        },
        setItemDataSignature: (state, action) => {
            state.data[state.layouts.properties.signatureTextSelectField] = action.payload;
            //state.dataEdit = {...data};
        },
        setItemDataEdit: (state, action) => {
            if (action.payload == 'reset') {
                state.data = null;
                state.dataEdit = null;
            } 
            else {
                state.dataEdit = {...state.data};
            }
        },
        setPrivitci: (state, action) => {
            const data = action.payload;
            state.privitci = data;
        },
        setItemDataEditValues: (state, action) => {
            const data = {...state.dataEdit, ...action.payload}
            state.dataEdit = data;
        },
        setDstDataEdit: (state, action) => {
            const data = action.payload;
            state.dstDataEdit = {...data};
        },
        setDstDataEditReset: (state, action) => {
            state.dstDataEdit = null;
        },
        setDstDataEditValues: (state, action) => {
            const data = {...state.dstDataEdit, ...action.payload}
            state.dstDataEdit = data;
        },
        setDstTip: (state, action) => {
            const data = action.payload;
            state.dstTip = data;
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
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(getSettings.fulfilled, (state, action) => {
                const data = action.payload;
                state.settings = {...state.settings, ...data.table1[0]};
                state.settings = {...state.settings, dgldefaults: data.table2[0]};
                state.settings = {...state.settings, dstdefaults: data.table3[0]};
            })
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
                state.error = action.error.message;
            })
            .addCase(saveGla.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })            
            .addCase(getDocsLayout.fulfilled, (state, action) => {
                const data = action.payload;
                state.layouts = {...state.layouts, ...data};
                
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

export const { setProps, setItemData, setItemDataSignature, setItemDataEdit, setPrivitci, setItemDataEditValues, setDstDataEdit, setDstDataEditReset, setDstDataEditValues, setDstTip, setItemDataDet, setItemDataComment, setSearchList, setFilter, setFilterTemp, setFilterTempValues, setFilterStatuses, setFilterTempStatuses, setApplyFilters} = docsSlice.actions


export const selectDocs = ({ gen }) => {
    return gen
}

export default docsSlice.reducer