import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import TabsTitle from './TabsTitle';

const Tab3: React.FC = () => {

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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
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
        tab 2

      </IonContent>
    </IonPage>
  );
};

export default Tab3;
