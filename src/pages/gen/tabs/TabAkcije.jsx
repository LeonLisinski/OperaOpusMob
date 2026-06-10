import { IonAlert, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonRefresher, IonRefresherContent, IonTitle, IonToolbar, useIonAlert, useIonRouter } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import moment from 'moment';
import { memo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DetailAzur from '../components/DetailAzur';
import TabsTitle from './TabsTitle';

import './TabAkcije.css';
import { createDoc, getPrivitci, copyRNfromUpit, getSifDvById } from '../store';
import { selectAppByCode, selectModuleBySifDv } from '../../core/cc/store';
import { getDocsLayout, getFilterDefaults, getListItem, getSettings, getStatuses, setSifDv } from '../../dgl/store';

const TabAkcije = () => {

    const router = useIonRouter();

    const dispatch = useDispatch()
    const [presentAlert] = useIonAlert();

    const storeRoot = useSelector((state) => state.gen);

    const onClickKreirajNoviDokument = async () => {

        try {
            const data = await dispatch(createDoc());

            if (data.error) {

                presentAlert({
                    header: 'Greška',
                    message: data.error.message,
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

            if (data.payload) {
                console.log('payload', data)
                //brojdokumenta: "2-0968-26" dglid: 36054

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
                                openSRN(data.payload[0]);
                            },
                        }
                    ]
                })
            }

        } catch (ex) {
            
        }       
    }

    const openSRN = async (payload) => {

        await dispatch(setSifDv(payload.sifdv));

        await dispatch(selectAppByCode('servis-mobile'));
        await dispatch(selectModuleBySifDv({ code: 'servis-mobile', sifdv: payload.sifdv }));
        await dispatch(getDocsLayout());

        await dispatch(getSettings());

        //await dispatch(setSifDv('RNele'));
        await dispatch(getFilterDefaults());
        await dispatch(getStatuses());

        const data = await dispatch(copyRNfromUpit(payload.dglid));
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
