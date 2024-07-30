import React  from 'react';
import { IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { Route, Redirect } from 'react-router';
import { informationCircleSharp, pencil, documentText, archive, informationCircle, people, attach } from 'ionicons/icons';
import Tab1 from './Tab1';
import Tab2 from './Tab2';
import Tab3 from './Tab3';
import Tab4 from './Tab4';
import TabPrivitci from './TabPrivitci';
import { useSelector } from 'react-redux';



interface DnevniIzvjestajMainTabsProps { }

const RadniNalozijMainTabs: React.FC<DnevniIzvjestajMainTabsProps> = () => {
  //const dglid = useSelector((state: any) => state.servis.dnevniIzvjestaj?.data?.dglid );
  const listItem = useSelector((state: any) => state.servis.radniNalozi?.data);
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Redirect exact path="/servis/radninalozitabs" to="/servis/radninalozitabs/tab1" />
        {/*
          Using the render method prop cuts down the number of renders your components will have due to route changes.
          Use the component prop when your component depends on the RouterComponentProps passed in automatically.
        */}
        <Route path="/servis/radninalozitabs/tab1" component = {Tab1} exact={true} />
        <Route path="/servis/radninalozitabs/tab2" component = {Tab2} exact={true} />
        <Route path="/servis/radninalozitabs/tab3" component = {Tab3} exact={true} />
        <Route path="/servis/radninalozitabs/tab4" component = {Tab4} exact={true} />
        <Route path="/servis/radninalozitabs/privitci" component = {TabPrivitci} exact={true} />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="unos" href="/servis/radninalozitabs/tab1">
          <IonIcon icon={informationCircleSharp} />
          <IonLabel>Info</IonLabel>
        </IonTabButton>
        <IonTabButton tab="komentar" href="/servis/radninalozitabs/tab2">
          <IonIcon icon={documentText} />
          <IonLabel>Komentari</IonLabel>
        </IonTabButton>
        <IonTabButton tab="arhiva" href="/servis/radninalozitabs/tab3">
          <IonIcon icon={archive} />
          <IonLabel>Rad</IonLabel>
        </IonTabButton>
        <IonTabButton tab="privitci" href="/servis/radninalozitabs/privitci">
          <IonIcon icon={attach} />
          <IonLabel>Privitci</IonLabel>
        </IonTabButton>        
        {listItem?.editable &&
        <IonTabButton tab="potpis" href="/servis/radninalozitabs/tab4">
          <IonIcon icon={pencil} />
          <IonLabel>Potpis</IonLabel>
        </IonTabButton>
        }
        
      </IonTabBar>
    </IonTabs>
  );
};

export default RadniNalozijMainTabs;