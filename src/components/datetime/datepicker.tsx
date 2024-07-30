import { IonBackButton, IonButton, IonButtons, IonContent, IonDatetime, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonSearchbar, IonTitle, IonToolbar } from '@ionic/react';
import { createRef, useEffect, useRef, useState } from 'react';

import { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import moment from 'moment';



interface ContainerProps {
  onModalConfirm: any;
  onHideModal: any,
  showModal: boolean;
  value: any;
  control: any;
}

const DatePicker: React.FC<ContainerProps> = (props) => {

  const modal = useRef<HTMLIonModalElement>(null);
  
  const [dataValue, setDataValue] = useState(props.value);


  function onWillDismiss(ev: CustomEvent<OverlayEventDetail>) {
    props.onHideModal(ev);
  }

  const onIonChange = (e: any) => {
    
    if (!e.detail.value)
      return;

    const val = moment(e.detail.value).format('YYYY-MM-DD');
    props.onModalConfirm(val);
    modal.current?.dismiss();
  }


  return (
    <IonModal isOpen={props.showModal} ref={modal} onWillDismiss={(ev) => onWillDismiss(ev)}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="end">
            <IonButton onClick={() => modal.current?.dismiss()}>Odustani</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
          <IonDatetime
              presentation='date'
              doneText="Potvrdi"
              cancelText='Odustani'
              size="cover"
              onIonChange={(e) => onIonChange(e)}
              showDefaultButtons={true}
          ></IonDatetime>
      </IonContent>

    </IonModal>
  );
};

export default DatePicker;
