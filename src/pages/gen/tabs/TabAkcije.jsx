import { IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonPage, IonRefresher, IonRefresherContent, IonTitle, IonToolbar, useIonAlert, useIonRouter } from '@ionic/react';
import { add, arrowBack, camera } from 'ionicons/icons';
import moment from 'moment';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DetailAzur from '../components/DetailAzur';
import TabsTitle from './TabsTitle';

import './TabAkcije.css';
import { changeStatus, createDoc, deleteDst, getPrivitci, setDstDataEdit, copyRNfromUpit } from '../store';
import DetailAzurNew from '../components/DetailAzurNew';
import { usePhotoGallery } from '../../../hooks/usePhotoGallery';
import { selectAppByCode } from '../../core/cc/store';
import { getListItem } from '../../dgl/store';

const TabAkcije = () => {
    const router = useIonRouter();

    const dispatch = useDispatch()
    const [presentAlert] = useIonAlert();

    const storeRoot = useSelector((state) => state.gen);


    const onClickKreirajNoviDokument = async () => {
		const data = await dispatch(createDoc());
        if (data.payload) {
            presentAlert({
                header: `Kreiran je radni nalog broj: '${data.payload[0].brojdokumenta}'. Želite li ga otvoriti?`,
                buttons: [
                  {
                    text: 'Odustani',
                    role: 'cancel',
                    handler: () => {
                        router.push(`/gen/list/${storeRoot.app}/${storeRoot.module}`, 'none');
                    },
                  },
                  {
                    text: 'Otvori',
                    role: 'confirm',
                    handler: () => {
                        openSRN(data.payload[0].dglid);
                    },
                  },
                ]
              })
        }

	}

    const openSRN = async (id) => {
        const data = await dispatch(copyRNfromUpit(id));
        await dispatch(selectAppByCode('servis-mobile'));

        console.log('data.payload[0]', data.payload[0]);


        await dispatch(getListItem(data.payload[0]));
        router.push('/docs/dgltabs/tab1', 'none');
    }





	const handleRefresh = async (e) => {
		//await populateData();
		e.detail.complete();

	}

    const goBack = () => {
        router.push(`/gen/list/${storeRoot.app}/${storeRoot.module}`, 'none');
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
            <IonContent fullscreen className="ion-padding">
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large"><TabsTitle /></IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh} >
                    <IonRefresherContent >
                    </IonRefresherContent>
                </IonRefresher>
                <IonButton expand='full' fill='solid' color='dark' onClick={onClickKreirajNoviDokument}>Kreiraj radni nalog</IonButton>
            </IonContent>
        </IonPage>
    );
};

export default memo(TabAkcije);
