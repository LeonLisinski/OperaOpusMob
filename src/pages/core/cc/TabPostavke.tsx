import { Device } from '@capacitor/device';
import { IonContent, IonIcon, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonPage, IonToggle } from '@ionic/react';
import { codeOutline, colorFilterOutline, lockClosedOutline, phonePortraitOutline, refresh, refreshOutline, server, serverOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Header from '../../../components/Header';


const TabPostavke: React.FC = () => {
  const state = useSelector((state: any) => state);
  const auth = state?.auth;
  const connection = auth?.connection;

  const [deviceId, setDeviceId] = useState('...');

  const styles = {
    container: `
      margin: 0 auto;
      height: 300px;
      `,
    sign: `
      width: 100%;
      height: 100%;
      `
  };


  useEffect(() => {

      const getDeviceId = async () => {
        const device = await Device.getId();
        setDeviceId(device.uuid);
      }
      
      getDeviceId();

  }, [])



  return (
    <IonPage className='svam-header' >
      <Header title='Kontrolni centar - postavke'></Header>
      <IonContent fullscreen>
        <IonItemGroup>
          <IonItemDivider color={'light'}>
            <IonIcon slot='start' icon={serverOutline}></IonIcon> 
            <IonLabel>Konekcija:</IonLabel>
          </IonItemDivider>
          <IonItem>
            <IonLabel className="ion-text-wrap">
              <h3>Server</h3>
              <strong><p>{connection?.server}</p></strong>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel className="ion-text-wrap">
              <h3>Baza</h3>
              <strong><p>{auth?.db}</p></strong>
            </IonLabel>
          </IonItem>
          <IonItem lines={'none'}>
            <IonLabel className="ion-text-wrap">
              <h3>API</h3>
              <strong><p>{auth?.api}</p></strong>
            </IonLabel>
          </IonItem>
          <IonItemDivider color={'light'}>
            <IonIcon slot='start' icon={phonePortraitOutline}></IonIcon> 
            <IonLabel>Uređaj:</IonLabel>
          </IonItemDivider>
          <IonItem lines={'none'}>
            <IonLabel className="ion-text-wrap">
              <h3>Uuid</h3>
              <strong><p>{deviceId}</p></strong>
            </IonLabel>
          </IonItem>
          <IonItemDivider color={'light'}>
            <IonIcon slot='start' icon={refreshOutline}></IonIcon> 
            <IonLabel>Reset </IonLabel>
          </IonItemDivider>
          <IonItem detail={true}>
            <IonLabel>Resetiraj autorizacijske postavke</IonLabel>
          </IonItem>
          <IonItem lines={'none'} detail={true}>
            <IonLabel>Resetiraj sve postavke</IonLabel>
          </IonItem>
          
          <IonItemDivider color={'light'}>
            <IonIcon slot='start' icon={colorFilterOutline}></IonIcon> 
            <IonLabel>Izgled <span style={{ color: '#aaa' }}><i>(u izradi)</i></span>:</IonLabel>
          </IonItemDivider>
          <IonItem lines={'none'}>
            <IonLabel>Dark mode</IonLabel>
            <IonToggle slot="end" color="dark" ></IonToggle>
          </IonItem>
          <IonItemDivider color={'light'}>
            <IonIcon slot='start' icon={lockClosedOutline}></IonIcon> 
            <IonLabel>Sigurnost <span style={{ color: '#aaa' }}><i>(u izradi)</i></span>:</IonLabel>
          </IonItemDivider>
          <IonItem>
            <IonLabel>Zapamti prijavu</IonLabel>
            <IonToggle slot="end" checked ></IonToggle>
          </IonItem>

        </IonItemGroup>

      </IonContent>
    </IonPage>
  );
};

export default TabPostavke;
