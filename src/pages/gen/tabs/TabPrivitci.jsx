import { IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonPage, IonRefresher, IonRefresherContent, IonTitle, IonToolbar, useIonAlert, useIonRouter } from '@ionic/react';
import { add, arrowBack, camera } from 'ionicons/icons';
import moment from 'moment';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DetailAzur from '../components/DetailAzur';
import TabsTitle from './TabsTitle';

import './TabPrivitci.css';
import { changeStatus, deleteDst, getPrivitci, setDstDataEdit } from '../store';
import DetailAzurNew from '../components/DetailAzurNew';
import { usePhotoGallery } from '../../../hooks/usePhotoGallery';

const TabPrivitci = () => {
    const router = useIonRouter();

    const dispatch = useDispatch()
    const [presentAlert] = useIonAlert();

    const sifdv = useSelector((state) => state.docs.sifdv);
    const layouts = useSelector((state) => state.docs.layouts);
    const { takePhoto } = usePhotoGallery();
    

    useEffect(() => {
        populateList();
    }, []);


    const populateList = async () => {
        await dispatch(getPrivitci());
    }


    const list = useSelector((state) => state.docs.privitci);
    const listItem = useSelector((state) => state.docs.data);


    const onItemClick = async (e, item) => {
        window.open(item.putanja, "_blank", "noreferrer");
    }

    const renderList = () => {

        return (
            <IonList>
                {list && list.map((item, i) => {
                    return <IonItem className='ion-no-padding' button onClick={(e) => onItemClick(e, item)} detail={true} key={i} >
                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: item.indcolor }}></div>
                            <IonLabel style={{ paddingLeft: 15 }}>
                                {item.naziv}
                            </IonLabel>
                        </IonItem>
                })}
            </IonList>
        );
    }


	const handleRefresh = async (e) => {
		//await populateData();
		e.detail.complete();

	}

    const goBack = () => {
        router.push(`/docs/dgl/${sifdv}`, 'none');
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
                        <TabsTitle />werewrwr
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
                {/* <IonFab horizontal='end' vertical='bottom' slot="fixed">
                    <IonFabButton onClick={(e) => takePhoto()} >
                        <IonIcon icon={camera} />
                    </IonFabButton>
                </IonFab> */}
            </IonContent>
        </IonPage>
    );
};

export default memo(TabPrivitci);
