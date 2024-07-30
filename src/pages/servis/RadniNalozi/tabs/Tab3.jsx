import { IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonPage, IonRefresher, IonRefresherContent, IonTitle, IonToolbar, useIonAlert, useIonRouter } from '@ionic/react';
import { add, arrowBack } from 'ionicons/icons';
import moment from 'moment';
import { memo, useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DetailAzur from '../components/DetailAzur';
import TabsTitle from './TabsTitle';

import './Tab3.css';
import { changeStatus, deleteDst } from '../store';

const Tab3 = () => {
  const router = useIonRouter();

  const dispatch = useDispatch()
  const [presentAlert] = useIonAlert();

  const sifdv = useSelector((state) => state.servis.radniNalozi?.sifdv);

  const [showModal, setShowModal] = useState(false);
  const [modalItem, setModalItem] = useState(null);




  const list = useSelector((state) => state.servis?.radniNalozi?.datadet);
  const listItem = useSelector((state) => state.servis.radniNalozi?.data);

  const goBack = () => {
    //router.push('/servis/radninalozi', 'none');
    router.push(`/servis/radninalozi/${sifdv}`, 'none');
  }

  const onNewClick = async (e) => {
    e.preventDefault();
    handleShowModal(null);
  }

  const onHideModal = (e) => {
    setShowModal(false);
  }

  const onItemClick = async (e, item) => {

    e.preventDefault();
    if (!listItem?.editable)
      return;

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

  const renderList = () => {
    return (
      <IonList>
        {list && list.map((item, i) => {
          return (
            <IonItemSliding>
              {listItem?.editable  &&
                <IonItemOptions side="start">
                  <IonItemOption style={{minWidth:100}} color="danger" onClick={(e) => onClickObrisi(e, item)}>Obriši</IonItemOption>
                </IonItemOptions>
              }
              <IonItem className={`ion-no-padding ${item.kontrolirano == true ? 'item-background-color' : ''}`} button onClick={(e) => onItemClick(e, item)} detail={true} key={i} >
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: item.indcolor }}></div>
                <IonLabel style={{ paddingLeft: 15 }}>
                  <h3><strong>{item.artikl}</strong></h3>
                  {item.opisartikla &&
                    <p>{item.opisartikla}&nbsp;</p>
                  }
                  <p><i>Količina:</i> <strong>{item.kol}</strong></p>
                </IonLabel>
              </IonItem>
              {listItem?.editable  &&
                <IonItemOptions>
                  <IonItemOption style={{minWidth:100}} color={item.kontrolirano == 1 ? 'primary' : 'success' } onClick={(e) => onClickChangeStatus(e, item)}>{item.kontrolirano ? 'Poništi' : 'Završi' }</IonItemOption>
                </IonItemOptions>
              }
            </IonItemSliding>
          )


        })}
      </IonList>

      //   return <IonItem key={i}>
      //   <IonLabel>{x.korime}</IonLabel>
      // </IonItem>


    );
  }

  const handleRefresh = () => {

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

        {listItem?.editable  &&
        <>
          <IonFab horizontal='end' vertical='bottom' slot="fixed">
            <IonFabButton onClick={(e) => onNewClick(e)} >
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>
          <DetailAzur showModal={showModal} item={modalItem} onHideModal={onHideModal}></DetailAzur>
        </>
        }
      </IonContent>
    </IonPage>
  );
};

export default memo(Tab3);
