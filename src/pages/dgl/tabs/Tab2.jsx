import { IonBackButton, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonNav, IonNote, IonPage, IonTextarea, IonTitle, IonToolbar, useIonRouter, useIonToast } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import { createRef, memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import SignaturePad from 'react-signature-canvas'
import DnevniIzvjestajList from '../List';
import { saveComment } from '../store';
import TabsTitle from './TabsTitle';


const Tab2 = () => {
  const [present] = useIonToast();

  const presentToast = () => {
    present({
      message: 'Uspješno spremljeno!',
      duration: 800,
      position: 'bottom',
      color: 'medium'
    });
  }


  const commentRef = createRef();
  const dispatch = useDispatch()
  const router = useIonRouter();

  const listItem = useSelector((state) => state.docs.data);
  const sifdv = useSelector((state) => state.docs.sifdv);

  useEffect(() => {
    setTimeout(() => {
      if (commentRef.current) {
        commentRef.current.setFocus();
      }
    }, 300);

  }, [commentRef]);

  const onClickSpremi = async (e) => {
    const comment = commentRef.current.value;
    dispatch(saveComment(comment));
    presentToast();
  }

  const goBack = () => {
    
    router.push(`/docs/dgl/${sifdv}`, 'none');
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            {/* <IonNav root={() => <DnevniIzvjestajList />}></IonNav> */}
            <IonButton onClick={() => goBack()}>
              <IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
            </IonButton>
          </IonButtons>
          <IonTitle>
            <TabsTitle />
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding" >
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="small"><TabsTitle /></IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonTextarea placeholder="Komentar" autoGrow={true} style={{ border: '1px solid #ccc', minHeight: 150 }} ref={commentRef} value={listItem?.komentar} disabled={listItem?.editable == false}>

        </IonTextarea>

      </IonContent>
      {listItem?.editable &&
        <IonFooter>
          <IonToolbar className='ion-text-center'>
            <div style={{ padding: 12 }}>
              <IonButton onClick={onClickSpremi} expand='block' color={'dark'} fill={'solid'}>Spremi</IonButton>
            </div>
          </IonToolbar>
        </IonFooter>
      }
    </IonPage>
  );
};

export default memo(Tab2);
