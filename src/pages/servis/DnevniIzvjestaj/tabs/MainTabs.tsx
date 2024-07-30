import React  from 'react';
import { IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { Route, Redirect } from 'react-router';
import { calendar, location, pencil, addCircle, archive, informationCircle, people } from 'ionicons/icons';
import Tab1 from './Tab1';
import Tab2 from './Tab2';
import Tab3 from './Tab3';
import { useSelector } from 'react-redux';


interface DnevniIzvjestajMainTabsProps { }

const DnevniIzvjestajMainTabs: React.FC<DnevniIzvjestajMainTabsProps> = () => {

  const dglid = useSelector((state: any) => state.servis.dnevniIzvjestaj?.data?.dglid );
  
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Redirect exact path="/servis/dnevniizvjestaj/tabs" to="/servis/dnevniizvjestaj/tabs/tab1" />
        {/*
          Using the render method prop cuts down the number of renders your components will have due to route changes.
          Use the component prop when your component depends on the RouterComponentProps passed in automatically.
        */}
        <Route path="/servis/dnevniizvjestaj/tabs/tab1" component={Tab1} exact={true} />
        <Route path="/servis/dnevniizvjestaj/tabs/tab2" component={Tab2} exact={true} />
        <Route path="/servis/dnevniizvjestaj/tabs/tab3" component={Tab3} exact={true} />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="unos" href="/servis/dnevniizvjestaj/tabs/tab1">
          <IonIcon icon={addCircle} />
          <IonLabel>Unos</IonLabel>
        </IonTabButton>
        <IonTabButton tab="kementar" href="/servis/dnevniizvjestaj/tabs/tab2" disabled={dglid == null}  >
          <IonIcon icon={pencil} />
          <IonLabel>Komentar</IonLabel>
        </IonTabButton>
        <IonTabButton tab="arhiva" href="/servis/dnevniizvjestaj/tabs/tab3" disabled={true}>
          <IonIcon icon={archive} />
          <IonLabel>Arhiva</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default DnevniIzvjestajMainTabs;