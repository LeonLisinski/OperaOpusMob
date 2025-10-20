import { IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonFooter, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonSearchbar, IonText, IonTextarea, IonTitle, IonToolbar, useIonRouter, useIonAlert, IonItemSliding, IonItemOptions, IonItemOption } from '@ionic/react';
import moment from 'moment';
import { createRef, memo, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from '../../../components/datetime/datepicker';
import Search from '../../../components/search/simple/search';

import { saveDGL, saveDoc, selectDocs, setItemDataEdit, setItemDataEditValues } from '../store';


const MasterAzur = (props) => {
    const dispatch = useDispatch()
    const router = useIonRouter();
    const modal = useRef(null);

    const [presentAlert] = useIonAlert();

    const storeDocs = useSelector(selectDocs);
    const layouts = useSelector((state) => state.docs.layouts);

    const [dataNew, setDataNew] = useState({})


    const searchModalPropsDefaults = {
        showModal: false,
        entity: '',
        parentId: '',
        type: '',
        debaunce: 200,
        selectFieldKey: null,
        selectFieldText: null
    }


    const [searchModalProps, setSearchModalProps] = useState(
        { ...searchModalPropsDefaults }
    );

    const [dateModalProps, setDateModalProps] = useState(
        {
            showModal: false,
            selectFieldKey: null
        }
    );


    const [title, setTitle] = useState('Unos novog dokumenta');

    useEffect(() => {
        if (!props.showModal)
            return;



        if (props.item?.dglid) {
            dispatch(setItemDataEdit());
            setTitle(`Editiranje - ${props.item["broj radnog naloga"]}`);
        } else {
            dispatch(setItemDataEdit('reset'));
        }
    }, [props.showModal]);


    function onWillDismiss(e) {
        props.onHideModal(e);
    }

    const onDateModalConfirm = (e) => {


        var selectValue = {};
        selectValue[dateModalProps.selectFieldKey] = e;
        dispatch(setItemDataEditValues(selectValue));

        var azurValue = {};
        azurValue[dateModalProps.azurFieldKey] = e;
        setDataNew((prevState) => ({ ...prevState, ...azurValue }));

        setDateModalProps((prevState) => ({ ...prevState, showModal: false }));
    }

    const onSearchModalConfirm = async (e) => {
        var selectValue = {};
        selectValue[searchModalProps.selectFieldKey] = e.id;
        selectValue[searchModalProps.selectFieldText] = e.name;

        await dispatch(setItemDataEditValues(selectValue));

        var azurValue = {};
        let values = {...dataNew};

        azurValue[searchModalProps.azurFieldKey] = e.id;
        values = {...values, ...azurValue};

        console.log('onSearchModalConfirm azurValue', values);

        setSearchModalProps((prevState) => ({ ...prevState, showModal: false }));

        await searchModalProps.dependencies?.map(async (dependency) => {
            if (dependency.action == 'reset') {
                
                selectValue = {};
                selectValue[dependency.selectFieldKey] = null;
                selectValue[dependency.selectFieldText] = null;
                await dispatch(setItemDataEditValues(selectValue));
                azurValue = {};
                azurValue[dependency.azurFieldKey] = null;
                values = {...values, ...azurValue};
            }
            else if (dependency.action == 'azur') {
                selectValue = {};
                selectValue[dependency.controlFieldKey] = e[dependency.selectFieldKey];
                selectValue[dependency.controlFieldText] = e[dependency.selectFieldText];
                await dispatch(setItemDataEditValues(selectValue));
                azurValue = {};
                azurValue[dependency.controlAzurFieldKey] = e[dependency.azurFieldKey];
                values = {...values, ...azurValue};
            }
        })

        console.log('onSearchModalConfirm azurValueFinall', values);
        setDataNew((prevState) => ({ ...prevState, ...values }));
    }
    


    const handleShowModal = (layoutItem) => {


        const layoutItemSpread = { ...layoutItem, ...layoutItem.search };

        console.log("layoutItemSpread", layoutItemSpread);

        var parentIdValue = {};
        if (layoutItem.parentIdFieldKey) {
            parentIdValue['parentId'] = storeDocs.dataEdit[layoutItem.parentIdFieldKey];
        }


        setSearchModalProps((prevState) => (
            {
                ...searchModalPropsDefaults,
                showModal: true,
                ...layoutItemSpread,
                ...parentIdValue
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
        dispatch(setItemDataEditValues(selectValue));

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
        let formData = { ...dataNew };

        //const data = await dispatch(saveDGL({ dglid: storeDocs.data?.dglid, formData: formData }))

        try {
            var response = await dispatch(saveDGL({ dglid: storeDocs.data?.dglid, formData: formData }))

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

        props.onHideModal(e);

        if (!props.item?.dglid) {
            router.push('/docs/dgltabs');
        }

    }

    const renderForm = () => {

        return layouts && layouts?.dglEditItems?.map((item, index) => {
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

        let value;


        // if (!storeDocs.data && storeDocs?.settings?.dgldefaults && item?.selectFieldKey && item?.selectFieldText) {
        //     value = storeDocs?.settings?.dgldefaults[item?.selectFieldText];

        //     if (value) {
        //         var azurValue = {};
        //         azurValue[item?.selectFieldKey] = storeDocs?.settings?.dgldefaults[item?.selectFieldKey];
        //         setDataNew((prevState) => ({ ...prevState, ...azurValue }));
        //     }

        // } else {
        value = storeDocs.dataEdit && storeDocs.dataEdit[item?.selectFieldText];
        //}




        var fill = 'outline';
        if (value)
            fill = 'solid';


        return <IonButton className='ion-text-wrap' style={{ height: 44 }} onClick={() => handleShowModal(item)} expand="block" disabled={checkDisabledValue(item)} fill={fill}>
            {value}
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

        const value = storeDocs.dataEdit && storeDocs.dataEdit[item?.selectFieldKey];
        return <IonInput mode="ios" value={value} style={{ border: '1px solid #ccc' }} type={item.type} placeholder={item.placeholder || "..."} onIonInput={(e) => handleTextChange(e, { selectFieldKey: item.selectFieldKey, azurFieldKey: item.azurFieldKey })} disabled={checkDisabledValue(item)}>
        </IonInput>
    }

    const renderMemoControl = (item) => {
        const value = storeDocs.dataEdit && storeDocs.dataEdit[item?.selectFieldKey];
        return (


            <IonItemSliding >
                <IonItem className={`ion-no-padding`} button  >
                    <IonTextarea mode="ios" placeholder="..." autoGrow={true} value={value} style={{ border: '1px solid #ccc', minHeight: 150, whiteSpace: 'pre-wrap' }} onIonInput={(e) => handleTextChange(e, { selectFieldKey: item.selectFieldKey, azurFieldKey: item.azurFieldKey })} disabled={checkDisabledValue(item)}>
                    </IonTextarea>
                </IonItem>
                {item.search && 
                <IonItemOptions side="end">
                    <IonItemOption style={{ minWidth: 100 }} color="primary" onClick={() => handleShowModal(item)}>Odabir<br></br>teksta</IonItemOption>
                </IonItemOptions>
                }
            </IonItemSliding>
        )


    }

    const checkDisabledValue = (item) => {
        if (item.disabled) {
            if (item.disabled == "allways") {
                return true;
            } else if (item.disabled == "edit" && item.data) {
                return true;
            }
        }
        return false;
    }

    const renderDateControlValue = (item) => {


        let value;

        // if (!storeDocs.data && storeDocs?.settings?.dgldefaults && item?.selectFieldKey) {
        //     value = storeDocs?.settings?.dgldefaults[item?.selectFieldKey];
        //     if (value) {
        //         var azurValue = {};
        //         azurValue[item?.selectFieldKey] = value;
        //         setDataNew((prevState) => ({ ...prevState, ...azurValue }));
        //     }
        // } else {
        value = storeDocs.dataEdit && storeDocs.dataEdit[item?.selectFieldKey];
        // }

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
                    <Search entity={searchModalProps.entity} showModal={searchModalProps.showModal} type={searchModalProps.type} onClick={onSearchModalConfirm} onHideModal={onHideModal} debaunce={searchModalProps.debaunce} parentId={searchModalProps.parentId} azurFieldKey={searchModalProps.azurFieldKey}></Search>
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

export default MasterAzur;