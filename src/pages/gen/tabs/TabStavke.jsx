import { IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonPage, IonRefresher, IonRefresherContent, IonTitle, IonToolbar, useIonAlert, useIonRouter } from '@ionic/react';
import { add, arrowBack, lockClosed } from 'ionicons/icons';
import moment from 'moment';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DetailAzur from '../components/DetailAzur';
import TabsTitle from './TabsTitle';

import './TabStavke.css';
import { changeStatus, deleteDst, dstDeletePotvrdaKolcine, dstPotvrdaKolcine, setDstDataEdit, setDstDataEditReset, setDstTip } from '../store';
import DetailAzurNew from '../components/DetailAzurNew';
import { useParams } from 'react-router';
import { usePhotoGallery } from '../../../hooks/usePhotoGallery';

const TabStavke = () => {
    const router = useIonRouter();
    const params = useParams();

    const dispatch = useDispatch()
    const [presentAlert] = useIonAlert();

    const id = useSelector((state) => state.gen.id);
    const layouts = useSelector((state) => state.gen.layouts);

    const [showModal, setShowModal] = useState(false);
    const [modalItem, setModalItem] = useState(null);




    


    const list = useSelector((state) => {
        return state.gen.datadet.filter(x => x.tip == params.tip);

    });
    const listItem = useSelector((state) => state.gen.data);


	useEffect(() => {
		dispatch(setDstTip(params.tip));
	}, [params.tip]);


    const goBack = () => {
        //router.push(`/docs/dgl/${sifdv}`, 'none');
    }

    const onNewClick = async (e) => {
        e.preventDefault();
        await dispatch(setDstDataEditReset());
        handleShowModal(null);
    }

    const onHideModal = (e) => {
        setShowModal(false);
    }

    const onItemClick = async (e, item) => {

        if (item.locked) {
            return;
        }
            

        e.preventDefault();
        if (!listItem?.editable)
            return;

        await dispatch(setDstDataEdit(item));
        handleShowModal(item);
        //dispatch(setDglId(null));
        //await dispatch(setItemData(null));
        //router.push('/servis/dnevniizvjestaj/tabs');
    }

    const onClickChangeStatus = async (e, item) => {
        dispatch(changeStatus(item.dstid));
    }

    const onClickObrisi = async (e, item) => {

        presentAlert({
            header: 'Potvrdite brisanje',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {

                    },
                },
                {
                    text: 'OK',
                    role: 'confirm',
                    handler: () => {
                        dispatch(deleteDst(item.dstid));
                    },
                },
            ]
        })
        //dispatch(setDglId(null));
        //await dispatch(setItemData(null));

        //router.push('/servis/dnevniizvjestaj/tabs');
    }

    const onClickPotvrdaKolicine = async(e, item, index) => {
        dispatch(dstPotvrdaKolcine(item.dstid));
        closeSlidingItem(index);
    }

    const onClickDeletePotvrdaKolicine = async(e, item, index) => {
        dispatch(dstDeletePotvrdaKolcine(item.dstid));
        closeSlidingItem(index);
    }

    const closeSlidingItem = (index) => {
		const slidingItem = document.getElementById(`slidingItem${index}`);
		slidingItem?.close();
	}


    const renderList = () => {

        return (
            <IonList>
                {list && list.map((item, i) => {
                    return <IonItemSliding id={`slidingItem${i}`} key={`slidingItem${i}`}>                
                        <IonItem className={`ion-no-padding ${item.indclassname}`} button onClick={(e) => onItemClick(e, item)} detail={true} key={i} >
                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: item.indcolor }}></div>
                            <IonLabel style={{ paddingLeft: 15 }}>
                                {
                                    getLayoutListItem().map((layoutItem, i) => {
                                        return renderListItem(layoutItem, item);
                                    })
                                }
                                <div style={{ position: 'absolute', top: 0, left: 5, color: '#333', fontSize: 10 }}>{i + 1}.</div>
                                {item.locked == true && 
                                    <div style={{ position: 'absolute', top: 4, right:4, color: 'gray', fontSize: 14 }}><IonIcon slot="icon-only" icon={lockClosed}></IonIcon></div>
                                }
                            </IonLabel>
                        </IonItem>
                        {/* {listItem?.deletable &&
                                <IonItemOptions side="start">
                                    <IonItemOption style={{ minWidth: 100 }} color="danger" onClick={(e) => onClickObrisi(e, item)}>Obriši</IonItemOption>
                                </IonItemOptions>
                            } */}
                        <IonItemOptions side="end">
                            {item?.deletable &&
                                <IonItemOptions side="start">
                                    <IonItemOption style={{ minWidth: 100 }} color="danger" onClick={(e) => onClickObrisi(e, item)}>Obriši</IonItemOption>
                                </IonItemOptions>
                            } 
                            {item?.cmdpotvrdakolicine &&
                                <IonItemOption style={{ minWidth: 100 }} color="primary" onClick={(e) => onClickPotvrdaKolicine(e, item, i)}>Potvrdi<br></br>količinu</IonItemOption>
                            }
                            {item?.cmddeletepotvrdakolicine &&
                                <IonItemOption style={{ minWidth: 100 }} color="danger" onClick={(e) => onClickDeletePotvrdaKolicine(e, item, i)}>Ukloni<br></br>potvrđenu<br></br>količinu</IonItemOption>
                            }
                        </IonItemOptions>
                    </IonItemSliding>
                })}
            </IonList>
        );
    }

    const getLayoutListItem = () => {
        if (params.tip == 'rad') 
            return layouts.dstListItemRad;
        
        return layouts.dstListItem;
    }

	const renderListItem = (layoutItem, item) => {

		const mainLabel = layoutItem["label"] && <span className='item-lbl'>{layoutItem["label"]}: </span>;
		const response = layoutItem.fields.map((field, index) => {
			const value = getItemValue(field, item, index);
			return value && <><span className={`${layoutItem['class']}`}>{value}</span></>
		})
		return response.length>0 && response[0]!='' && <p>{mainLabel}{response}</p>;
	}

	const getItemValue = (layoutItem, item, index) => {

		let value = item[layoutItem["field"]];
		if (!value)
			return '';

		if (layoutItem.format) {
			if (layoutItem.type == 'date') {
				value = moment(value).format('DD.MM.YYYY')
			}
		}
		return <>{index > 0 ? <span>&nbsp;&nbsp;&nbsp;</span> : ''}<span className={layoutItem.class}>{value}</span></>;
	} 


	const handleRefresh = async (e) => {
		//await populateData();
		e.detail.complete();

	}

    const handleShowModal = (item) => {
        setModalItem(item)
        setShowModal(true);
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => goBack()}>
                            <IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
                        </IonButton>
                    </IonButtons>
                    <IonTitle>
                        <TabsTitle />
                    </IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large"><TabsTitle /></IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh} >
                    <IonRefresherContent >
                    </IonRefresherContent>
                </IonRefresher>
                
                {list && list.length > 0 && renderList()}

                {listItem?.editable &&
                    <>
                        <IonFab horizontal='end' vertical='bottom' slot="fixed">
                            <IonFabButton onClick={(e) => onNewClick(e)} >
                                <IonIcon icon={add} />
                            </IonFabButton>
                        </IonFab>
                        <DetailAzurNew showModal={showModal} item={modalItem} onHideModal={onHideModal}></DetailAzurNew>
                    </>
                }


            </IonContent>
        </IonPage>
    );
};

export default memo(TabStavke);
