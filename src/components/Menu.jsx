import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
  useIonRouter,
} from '@ionic/react';

import { useLocation } from 'react-router-dom';
import { calendar, calendarOutline, reader, readerOutline, home, homeOutline, build, briefcase, person, bulb, cube, play, appsSharp } from 'ionicons/icons';
import './Menu.css';
import { useDispatch, useSelector } from 'react-redux';
import { logOut } from '../pages/auth/store';
import { addIcons } from 'ionicons';
import { selectApp } from '../pages/core/cc/store';

import buildInfo from "../build-info.json";



const appPages = [
  {
    title: 'Dnevni izvještaj',
    url: '/servis/dnevniizvjestaj',
    iosIcon: calendarOutline,
    mdIcon: calendar
  },
  {
    title: 'Radni nalozi',
    url: '/servis/radninalozi',
    iosIcon: readerOutline,
    mdIcon: reader
  }
];

// const apps = [
//   {
//     title: 'Servis',
//     url: '/modules',
//     iosIcon: build,
//     mdIcon: build,
//     color: '#21618C',
//     unlocked: true
//   },
//   {
//     title: 'CRM',
//     url: '/modules',
//     iosIcon: briefcase,
//     mdIcon: briefcase,
//     color: '#7E5109',
//     unlocked: false
//   },
//   {
//     title: 'HRM',
//     url: '/modules',
//     iosIcon: person,
//     mdIcon: person,
//     color: '#660066',
//     unlocked: false
//   },
//   {
//     title: 'BI',
//     url: '/modules',
//     iosIcon: bulb,
//     mdIcon: bulb,
//     color: '#DC143C',
//     unlocked: false
//   },
//   {
//     title: 'WMS',
//     url: '/modules',
//     iosIcon: cube,
//     mdIcon: cube,
//     color: '#B8860B',
//     unlocked: false
//   },
//   {
//     title: 'DEMO',
//     url: '/modules',
//     iosIcon: play,
//     mdIcon: play,
//     color: '#666',
//     unlocked: false
//   }
// ];

const Menu = () => {
  const location = useLocation();
  const router = useIonRouter();
  const dispatch = useDispatch()

  const apps = useSelector((state) => state.core?.cc?.apps);
  const user = useSelector((state) => {
    return state.auth?.user;
  });

  addIcons({
    'play': play,
    'cube': cube, 
    'briefcase': briefcase, 
    'person': person, 
    'build': build, 
    'bulb': bulb
  });


  const onClickLogOut = async () => {
    await dispatch(logOut());
    router.push('/login', 'none')
  }

  const onAppClick = async (app) => {
    dispatch(selectApp(app));
    router.push('/modules', 'forward', 'push' );
  }


  return (
    <>
        <IonMenu contentId="main" type="overlay" disabled={!user}>
          <div style={{ background: '#cce1da', borderBottom: '2px solid #39655d', textAlign: 'center', paddingTop: 20, paddingBottom: 15 }}>
            <img src={'assets/svamplus.svg'} style={{width:'70%', maxWidth:250}}></img>
            <div style={{position: 'absolute', top:4, right:4, fontSize:12, color: '#39655d'}}><i>{buildInfo?.version}</i></div>
          </div>
          
          <IonContent>

            <IonList id="inbox-list">
              <IonListHeader>Home</IonListHeader>
              <IonMenuToggle autoHide={false}>
                <IonItem routerLink={'/cc/aplikacije'} routerDirection="forward" lines="none" detail={true}>
                  <IonIcon slot="start" ios={homeOutline} md={home} />
                  <IonLabel>{'Kontrolni centar'}</IonLabel>
                </IonItem>
              </IonMenuToggle>
              <IonListHeader>Aplikacije</IonListHeader>
              {/* <IonNote>hi@ionicframework.com</IonNote> */}
              {apps.map((appPage, index) => {
                return (
                  <IonMenuToggle key={index} autoHide={false}>
                    <IonItem lines={index + 1 == apps.length ? 'none' : 'full' } onClick={(e) => onAppClick(appPage)}  detail={true} disabled={!appPage.unlocked} >
                      {/* <img className="icon" src={`assets/appicons/${appPage.icon}`} /> */}
                      <IonIcon slot="start" icon={appPage.mdIcon} />
                      <IonLabel>{appPage.title}</IonLabel>
                    </IonItem>
                  </IonMenuToggle>
                );
              })}
            </IonList>
            <br></br>
            <div style={{ padding: 10 }}>
              <IonButton onClick={onClickLogOut} expand='block' color={'dark'} fill={'solid'}>Odjava</IonButton>
            </div>


            {/* <IonList id="labels-list">
          <IonListHeader>Labels</IonListHeader>
          {labels.map((label, index) => (
            <IonItem lines="none" key={index}>
              <IonIcon slot="start" icon={bookmarkOutline} />
              <IonLabel>{label}</IonLabel>
            </IonItem>
          ))}
        </IonList> */}
          </IonContent>
        </IonMenu>
    </>
  );
};

export default Menu;
