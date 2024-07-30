import { IonButton, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonIcon, IonPage, IonRefresher, IonRefresherContent, IonRow, IonToast, useIonAlert, useIonRouter } from '@ionic/react';
import { cube, briefcase, person, build, bulb, play, lockClosedOutline, power } from 'ionicons/icons';
import { addIcons } from 'ionicons';

import './TabAplikacije.scss';
import { useEffect, useState } from 'react';
import Header from '../../../components/Header';
import UnlockApp from './components/UnlockApp';
import { useDispatch, useSelector } from 'react-redux';
import { logOut } from '../../auth/store';
import { getMenu, selectApp } from './store';
import { APP_VERSION } from '../../../constants';

const TabAplikacije = () => {
  const router = useIonRouter();
  const dispatch = useDispatch();

  const apps = useSelector((state) => state.core.cc.apps);


  const [presentAlert] = useIonAlert();
  const [handlerMessage, setHandlerMessage] = useState('');
  const [roleMessage, setRoleMessage] = useState('');




  addIcons({
    'play': play,
    'cube': cube, 
    'briefcase': briefcase, 
    'person': person, 
    'build': build, 
    'bulb': bulb
  });

  const [showToast, setShowToast] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalItem, setModalItem] = useState(null);


	useEffect(() => {
		initLoad();
	}, []);

	const initLoad = async () => {
		await dispatch(getMenu());
	}




  const handleRefresh = (event) => {
    setTimeout(() => {
      // Any calls to load data go here
      event.detail.complete();
    }, 2000);
  }

  const onAppClick = async (app) => {

    if (!app.unlocked) {
      handleShowModal(app);
    } else {
      dispatch(selectApp(app));
      router.push(app.url, 'forward', 'push', { as: 'name' });
    }
  }

  const onClickExit = (e) => {

  }


  const onHideModal = (e) => {
    setShowModal(false);
  }

  const handleShowModal = (item) => {
    setModalItem(item)
    setShowModal(true);
  }

  const onClickLogOut = async () => {
    presentAlert({
      header: 'Želite li se odjaviti?',
      buttons: [
        {
          text: 'Odustani',
          role: 'cancel',
          handler: () => {
            
          },
        },
        {
          text: 'Potvrdi',
          role: 'confirm',
          handler:  () => {
              logOutConfirmed();
          },
        },
      ],
    })
  }

  const logOutConfirmed = async () => {
    await dispatch(logOut());
    router.push('/login', 'none')
  }

  const setUpNotifications = () => {
    router.push('/pushup', 'forward')
  }

  return (
    <IonPage className='svam-header app-container page-core-applications'>
      <Header title='Kontrolni centar - aplikacije'></Header>
      <IonContent fullscreen className='ion-content'>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        {/* <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Control Center - Aplikacije</IonTitle>
          </IonToolbar>
        </IonHeader> */}
        {/* <div className='app-container app-info-container'>
          <IonGrid>
            <IonRow>
              <IonCol size='4' className='border'>
                <IonButton expand='block' fill='clear' onClick={() => setShowToast(true)}>
                  <div>
                    <IonIcon icon={cube}></IonIcon>
                    <div><label>ARTIKLI</label></div>
                  </div>

                </IonButton>
              </IonCol>
              <IonCol size='4' className='border'>
                <IonButton expand='block' fill='clear' onClick={() => setShowToast(true)}>
                  <div>
                    <IonIcon className='icon' icon={briefcase}></IonIcon>
                    <div><label>PARTNERI</label></div>
                  </div>

                </IonButton>
              </IonCol>
              <IonCol size='4'>
                <IonButton expand='block' fill='clear' onClick={() => setShowToast(true)}>
                  <div>
                    <IonIcon icon={person}></IonIcon>
                    <div><label>OSOBE</label></div>
                  </div>

                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
        <IonList style={{ paddingTop: 0 }}>
          <IonListHeader style={{ background: '#f3f3f3' }}>
            Servis
          </IonListHeader>
          <IonItem detail={true} button routerLink={'/servis/dnevniizvjestaj'}>
            <IonIcon slot='start' icon={calendarOutline}></IonIcon>
            Dnevni izvještaj
          </IonItem>
          <IonItem detail={true} button routerLink={'/servis/radninalozi'}>
            <IonIcon slot='start' icon={readerOutline}></IonIcon>
            Rani nalozi
          </IonItem>
        </IonList> */}

        <div className="main-content">
          <div style={{ textAlign: 'center', paddingTop: 40, paddingBottom: 0, minHeight: 137 }}>
            <img src={'assets/operaopus.svg'} width={220} style={{ width: 220, opacity: 1 }}></img>

            <div className='header-version'>
              v. {APP_VERSION}
            </div>
          </div>

          <div className="container app-container white">
            <div className="title-app">APLIKACIJE:
              {/* <div style={{position: 'absolute', top:4, right:4}}>
                    <ion-spinner name="bubbles"></ion-spinner>
                </div> */}
            </div>
            <IonGrid className='ion-grid'>
              <IonRow className='ion-row'>

                {apps.map((app, index) => {
                  return <IonCol key={`col${index}`} className='ion-col border' size="4" sizeSm='4' sizeMd='3'>
                    <IonButton key={`btn${index}`} style={{borderBottom: `5px solid ${app.color} `}} className={`border-gray gradiant ${!app.unlocked && 'opacity'}`} expand='block' fill='clear' onClick={() => onAppClick(app)}>
                      <div className="button-container" style={{border: app.color }}>
                        {/* <img className="icon" src="data:image/png;base64,{{item.icon}}" /> */}
                        {/* <img className="icon" src={`assets/appicons/${app.icon}`} /> */}
                        {/* <IonIcon name={app.mdIcon} className='icon' style={{ color: app.color }}></IonIcon> */}
                        <IonIcon name={app.icon} className='icon' style={{ color: '#444'}}></IonIcon>
                        <div className="label-container"><label>{app.title}</label></div>
                      </div>
                    </IonButton>
                    {!app.unlocked && <IonIcon className='icon-locked' icon={lockClosedOutline} ></IonIcon>}
                  </IonCol>
                })}
              </IonRow>
            </IonGrid>
          </div>
        </div>
        <UnlockApp showModal={showModal} item={modalItem} onHideModal={onHideModal}></UnlockApp>
        {/* <IonButton onClick={setUpNotifications}>PushUp</IonButton> */}
        <IonFab horizontal='end' vertical='bottom' slot="fixed">
          <IonFabButton onClick={onClickLogOut} size={'small'} color={'danger'} >
            <IonIcon icon={power} />
          </IonFabButton>
        </IonFab>
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Nemate pravo pristupa."
          duration={200}
        />

      </IonContent>
    </IonPage>
  );
};

export default TabAplikacije;
