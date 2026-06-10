import { IonContent, IonSpinner } from '@ionic/react';
import './SplashScreen.css';
import SvamLoad from './Spinner/SvamLoad';


const SplashScreen: React.FC = () => {
  return (

    // <CSSTransition
    //   in={true}
    //   timeout={2000}
    //   classNames="fade"
    //   unmountOnExit
    // >
      <IonContent>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 130, textAlign: 'center', paddingTop: 40 }}>
          <img src={'assets/operaopus.svg'} width={240} style={{ width: 240, opacity: 1}}></img>
        </div>

        <div style={{ backgroundColor: '#39655d', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IonSpinner className='spinner-splash' name='lines' color="light" style={{ fontSize: 40 }} />
          {/* <SvamLoad startLoading={true} /> */}
        </div>
      </IonContent>
    // </CSSTransition>


  );
};

export default SplashScreen;
