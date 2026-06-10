import { IonContent, IonIcon, IonPage } from '@ionic/react';
import Header from '../../../components/Header';
import NoData from '../../../components/NoData';

import './TabFavoriti.scss';

const TabFavoriti: React.FC = () => {
  return (
    <IonPage className='svam-header'>
      <Header title='Kontrolni centar - favoriti'></Header>
      <IonContent fullscreen>
        <NoData></NoData>
      </IonContent>
    </IonPage>
  );
};

export default TabFavoriti;
