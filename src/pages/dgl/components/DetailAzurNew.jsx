import { IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonFooter, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonSearchbar, IonText, IonTextarea, IonTitle, IonToolbar, useIonAlert, useIonRouter } from '@ionic/react';
import moment from 'moment';
import { createRef, memo, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from '../../../components/datetime/datepicker';
import Search from '../../../components/search/simple/search';

import { getListItem, saveDGL, saveDoc, selectDocs, setDstDataEditReset, setDstDataEditValues } from '../store';


const DetailAzurNew = (props) => {
    
    const dispatch = useDispatch()
    const router = useIonRouter();
    const modal = useRef(null);

    const storeDocs = useSelector(selectDocs);

    const layouts = useSelector((state) => state.docs.layouts);
    const docs = useSelector((state) => state.docs);

    const [dataNew, setDataNew] = useState({})

    const [presentAlert] = useIonAlert();


    const searchModalPropsDefaults = {
        showModal: false,
        entity: '',
        parentId: '',
        type: '',
        debaunce: 200,
        selectFieldKey: null,
        selectFieldText: null,
        searchItems: null
    }


    const [searchModalProps, setSearchModalProps] = useState(
        {...searchModalPropsDefaults}
    );

    const [dateModalProps, setDateModalProps] = useState(
        {
            showModal: false,
            selectFieldKey: null
        }
    );


    const [title, setTitle] = useState();

    useEffect(() => {

        setDataNew({});

        if (storeDocs.dstDataEdit) {
            setTitle('Editiranje stavke');
        } else if (props.parentId)
            setTitle('Unos nove podstavke');
        else {
            setTitle('Unos nove stavke');
        }

        // if (!props.showModal)
        //     return;

        // if (storeDocs.dstDataEdit?.dglid) {
        //     dispatch(setItemDataEdit());
        //     setTitle(`Editiranje - ${storeDocs.dstDataEdit["broj radnog naloga"]}`);
        // } else {
        //     dispatch(setItemDataEdit('reset'));
        // }
    }, [props.showModal]);


    function onWillDismiss(e) {
        props.onHideModal(e);
    }

    const onDateModalConfirm = (e) => {


        var selectValue = {};
        selectValue[dateModalProps.selectFieldKey] = e;
        dispatch(setDstDataEditValues(selectValue));

        var azurValue = {};
        azurValue[dateModalProps.azurFieldKey] = e;
        setDataNew((prevState) => ({ ...prevState, ...azurValue }));

        setDateModalProps((prevState) => ({ ...prevState, showModal: false }));
    }

    const onSearchModalConfirm = async (e) => {
        var selectValue = {};
        selectValue[searchModalProps.selectFieldKey] = e.id;
        selectValue[searchModalProps.selectFieldText] = e.name;

        await dispatch(setDstDataEditValues(selectValue));

        var azurValue = {};


        azurValue[searchModalProps.azurFieldKey] = e.id;
        setDataNew((prevState) => ({ ...prevState, ...azurValue }));


        setSearchModalProps((prevState) => ({ ...prevState, showModal: false }));

        searchModalProps.dependencies.map(async (dependency) => {
            if (dependency.action == 'reset') {
                selectValue = {};
                selectValue[dependency.selectFieldKey] = null;
                selectValue[dependency.selectFieldText] = null;
                await dispatch(setDstDataEditValues(selectValue));
                azurValue = {};
                azurValue[dependency.azurFieldKey] = null;
                setDataNew((prevState) => ({ ...prevState, ...azurValue }));
            }
            else if (dependency.action == 'azur') {
                selectValue = {};
                selectValue[dependency.controlFieldKey] = e[dependency.selectFieldKey];
                selectValue[dependency.controlFieldText] = e[dependency.selectFieldText];
                await dispatch(setDstDataEditValues(selectValue));
                azurValue = {};
                azurValue[dependency.controlAzurFieldKey] = e[dependency.azurFieldKey];;
                setDataNew((prevState) => ({ ...prevState, ...azurValue }));
            }
        })
    }


    const getLayoutEditItems = () => {
        if (storeDocs.dstTip == 'rad') 
            return layouts.dstEditItemsRad;
        
        return layouts.dstEditItems;
    }

    const handleShowModal = (layoutItem) => {

        var parentIdValue = {};
        if (layoutItem.parentIdFieldKey) {
            parentIdValue['parentId'] = storeDocs.dstDataEdit[layoutItem.parentIdFieldKey];
        }

        let jsonFormValues = null;
        
        console.log('storeDocs.dstDataEdit', storeDocs.dstDataEdit );

        if (storeDocs.dstDataEdit) {
            jsonFormValues = {jsonFormValues: JSON.stringify(storeDocs.dstDataEdit)};
        }

        setSearchModalProps((prevState) => (
            {
                ...searchModalPropsDefaults,
                showModal: true,
                ...layoutItem,
                ...parentIdValue,
                ...jsonFormValues
            }
        )
        );
    }

    const handleShowDateModal = ({ selectFieldKey, azurFieldKey }) => {
        setDateModalProps((prevState) => (
            {
                ...prevState,
                showModal: true,
                selectFieldKey: selectFieldKey,
                azurFieldKey: azurFieldKey
            }
        )
        );
    }

    const handleTextChange = (e, { selectFieldKey, azurFieldKey }) => {
        
        const value = e.detail.value;
        var selectValue = {};
        selectValue[selectFieldKey] = value;
        dispatch(setDstDataEditValues(selectValue));

        var azurValue = {};
        azurValue[azurFieldKey] = value;
        setDataNew((prevState) => ({ ...prevState, ...azurValue }));
    }



    const onHideModal = (e) => {
        setSearchModalProps((prevState) => ({ ...prevState, showModal: false }));
    }

    const onHideDateModal = (e) => {
        setDateModalProps((prevState) => ({ ...prevState, showModal: false }));
    }


    const onClickSpremi = async (e) => {

        let parent = {};
        if (props.parentId) {
            parent = { parentdstid: props.parentId, s:2 }
        }

        let formData = { ...{dstid: storeDocs.dstDataEdit.dstid}, ...parent, ...dataNew };
    
        try {
            var response = await dispatch(saveDoc({ parentId: props.parentId, formData: formData }));
            
            if (response.error) {

                presentAlert({
                    header: 'Greška',
                    message: response.error.message,
                    buttons: [
                      {
                        text: 'Ok',
                        role: 'cancel',
                        handler: () => {
                          
                        },
                      }
                    ]
                  })
                return;
            }
            modal.current?.dismiss();
        } catch (ex) {
            console.log(ex);
        }

        
        

        // const data = await dispatch(saveDGL({ dglid: storeDocs.data?.dglid, formData: formData }))

        // props.onHideModal(e);

        // if (!storeDocs.dstDataEdit?.dglid) {
        //     router.push('/docs/dgltabs');
        // }
    }

    const renderForm = () => {
        
        return layouts && getLayoutEditItems()?.map((item, index) => {
            return <div style={{ paddingBottom: 8 }}>
                <IonLabel>{item.caption}:</IonLabel>
                {item.type == 'date' && renderDateControl(item)}
                {(item.type == 'simple' || item.type == 'advanced') && renderSearchControl(item)}
                {item.type == 'memo' && renderMemoControl(item)}
                {item.type == 'text' && renderTextControl(item)}

            </div>
        })
    }

    const renderSearchControl = (item) => {
        const value = storeDocs.dstDataEdit && storeDocs.dstDataEdit[item?.selectFieldText];
        var fill = 'outline';
        if (value) 
            fill = 'solid';

        return <IonButton className='ion-text-wrap' onClick={() => handleShowModal(item)} expand="block" disabled={checkDisabledValue(item)}  fill={fill}>
            {storeDocs.dstDataEdit && storeDocs.dstDataEdit[item?.selectFieldText]}
        </IonButton>
    }

    const renderDateControl = (item) => {
        const value = renderDateControlValue(item);
        var fill = 'outline';
        if (value) 
            fill = 'solid';

        return <IonButton mode="ios" className='ion-text-wrap' onClick={() => handleShowDateModal({ selectFieldKey: item.selectFieldKey, azurFieldKey: item.azurFieldKey })} expand="block" disabled={checkDisabledValue(item)} fill={fill}>
            {value}
        </IonButton>
    }

    const renderTextControl = (item) => {
        const value = storeDocs.dstDataEdit && storeDocs.dstDataEdit[item?.selectFieldKey];



        return <IonInput mode="ios" value={value} style={{ border: '1px solid #ccc' }} type={item.inputType || 'text'} format={item.format} placeholder={item.placeholder || "..."} onIonInput={(e) => handleTextChange(e, { selectFieldKey: item.selectFieldKey, azurFieldKey: item.azurFieldKey })} disabled={checkDisabledValue(item)}>
        </IonInput>
    }

    const renderMemoControl = (item) => {
        const value = storeDocs.dstDataEdit && storeDocs.dstDataEdit[item?.selectFieldKey];
        return <IonTextarea mode="ios" placeholder="..." autoGrow={true} value={value} style={{ border: '1px solid #ccc', minHeight: 150, whiteSpace: 'pre-wrap' }} onIonInput={(e) => handleTextChange(e, { selectFieldKey: item.selectFieldKey, azurFieldKey: item.azurFieldKey })} disabled={checkDisabledValue(item)}>
        </IonTextarea>
    }

    const checkDisabledValue = (item) => {
        if ( item.disabled) {
            if (item.disabled == "allways") {
                return true;
            } else if (item.disabled == "edit" && storeDocs.dstDataEdit) {
                return true;
            }
        }
        return false;
    }

    const renderDateControlValue = (item) => {
        const value = storeDocs.dstDataEdit && storeDocs.dstDataEdit[item?.selectFieldKey];
        if (value) {
            return moment(value).format(item.format || "DD.MM.YYYY.");
        }
        return null;
    }


    return (
        <>

            <IonModal isOpen={props.showModal} ref={modal} onWillDismiss={(ev) => onWillDismiss(ev)}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle size="small">{title}</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={() => modal.current?.dismiss()}>Odustani</IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>

                <IonContent className="searchForm ion-padding">
                    {renderForm()}
                    <Search entity={searchModalProps.entity} showModal={searchModalProps.showModal} type={searchModalProps.type} onClick={onSearchModalConfirm} onHideModal={onHideModal} debaunce={searchModalProps.debaunce} parentId={searchModalProps.parentId} items={searchModalProps.searchItems} jsonFormValues={searchModalProps.jsonFormValues}></Search>
                </IonContent>

                <IonFooter>
                    <IonToolbar className='ion-text-center'>
                        <div style={{ padding: 12 }}>
                            <IonButton onClick={onClickSpremi} expand='block' color={'dark'} fill={'solid'}>Spremi</IonButton>
                        </div>
                    </IonToolbar>
                </IonFooter>
            </IonModal>

            <DatePicker showModal={dateModalProps.showModal} onModalConfirm={onDateModalConfirm} onHideModal={onHideDateModal} ></DatePicker>

        </>
    );
};

export default DetailAzurNew;