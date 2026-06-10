import { Device } from '@capacitor/device';
import { IonContent, IonIcon, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonPage, IonToggle } from '@ionic/react';
import { build, codeOutline, colorFilterOutline, lockClosedOutline, phonePortraitOutline, refresh, refreshOutline, server, serverOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Header from '../../../components/Header';
import { moon } from 'ionicons/icons';
import './TabPostavke.scss';

import buildInfo from "./../../../build-info.json";



const TabPostavke: React.FC = () => {
  const state = useSelector((state: any) => state);
  const auth = state?.auth;
  const connection = auth?.connection;

  const [deviceId, setDeviceId] = useState('...');
  const [isDarkMode, setIsDarkMode] = useState(false);


  //ovo pribacit na login ekran 
  useEffect(() => {
    const getDarkModePreference = async () => {
      const saved = localStorage.getItem('darkMode');
      const enabled = saved ? JSON.parse(saved) : false;
      setIsDarkMode(enabled);
      applyDarkMode(enabled);
    };

    getDarkModePreference();
  }, []);

  const applyDarkMode = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('ion-palette-dark');
    } else {
      document.documentElement.classList.remove('ion-palette-dark');
    }
  };

  const handleDarkModeChange = (e: any) => {
    const enabled = e.detail.checked;
    setIsDarkMode(enabled);
    localStorage.setItem('darkMode', JSON.stringify(enabled));
    applyDarkMode(enabled);
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
          <IonItemDivider color={isDarkMode ? 'dark' : 'light'}>
            <IonIcon slot='start' icon={build}></IonIcon>
            <IonLabel>Verzija:</IonLabel>
          </IonItemDivider>
          <IonItem>
            <IonLabel className="ion-text-wrap">
              <strong><p>{buildInfo.version} | Build: {buildInfo.buildDate}</p></strong>
            </IonLabel>
          </IonItem>
          <IonItemDivider color={isDarkMode ? 'dark' : 'light'}>
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
          <IonItemDivider color={isDarkMode ? 'dark' : 'light'}>
            <IonIcon slot='start' icon={phonePortraitOutline}></IonIcon>
            <IonLabel>Uređaj:</IonLabel>
          </IonItemDivider>
          <IonItem lines={'none'}>
            <IonLabel className="ion-text-wrap">
              <h3>Uuid</h3>
              <strong><p>{deviceId}</p></strong>
            </IonLabel>
          </IonItem>
          <IonItemDivider color={isDarkMode ? 'dark' : 'light'}>
            <IonIcon slot='start' icon={refreshOutline}></IonIcon>
            <IonLabel>Reset </IonLabel>
          </IonItemDivider>
          <IonItem detail={true}>
            <IonLabel>Resetiraj autorizacijske postavke</IonLabel>
          </IonItem>
          <IonItem lines={'none'} detail={true}>
            <IonLabel>Resetiraj sve postavke</IonLabel>
          </IonItem>
          
          <IonItemDivider color={isDarkMode ? 'dark' : 'light'}>
            <IonIcon slot='start' icon={colorFilterOutline}></IonIcon>
            <IonLabel>Izgled <span style={{ color: isDarkMode ? '#888' : '#aaa' }}></span></IonLabel>
          </IonItemDivider>
          <IonItem lines={'none'}>
            <IonIcon slot="start" icon={moon} className="component-icon component-icon-dark" />
            <IonLabel>Dark mode</IonLabel>
            <IonToggle slot="end" checked={isDarkMode} onIonChange={handleDarkModeChange}></IonToggle>
          </IonItem>
          <IonItemDivider color={isDarkMode ? 'dark' : 'light'}>
            <IonIcon slot='start' icon={lockClosedOutline}></IonIcon>
            <IonLabel>Sigurnost <span style={{ color: isDarkMode ? '#888' : '#aaa' }}><i>(u izradi)</i></span>:</IonLabel>
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
