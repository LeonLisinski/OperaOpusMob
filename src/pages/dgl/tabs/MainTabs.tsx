import React  from 'react';
import { IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { Route, Redirect } from 'react-router';
import { informationCircleSharp, pencil, documentText, archive, informationCircle, people, attach, time, list } from 'ionicons/icons';
import Tab1 from './Tab1';
import Tab2 from './Tab2';
import Tab3 from './Tab3';
import Tab4 from './Tab4';
import { useSelector } from 'react-redux';
import TabPrivitci from './TabPrivitci';



interface DglMainTabsProps { }

const DglMainTabs: React.FC<DglMainTabsProps> = () => {
  //const dglid = useSelector((state: any) => state.servis.dnevniIzvjestaj?.data?.dglid );
  const listItem = useSelector((state: any) => state.docs.data);
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Redirect exact path="/docs/dgltabs" to="/docs/dgltabs/tab1" />
        {/*
          Using the render method prop cuts down the number of renders your components will have due to route changes.
          Use the component prop when your component depends on the RouterComponentProps passed in automatically.
        */}
        <Route path="/docs/dgltabs/tab1" component = {Tab1} exact={true} />
        <Route path="/docs/dgltabs/tab2" component = {Tab2} exact={true} />
        <Route path="/docs/dgltabs/tab3/:tip" component = {Tab3} exact={true}  />
        <Route path="/docs/dgltabs/tab4" component = {Tab4} exact={true} />
        <Route path="/docs/dgltabs/tabPrivitci" component = {TabPrivitci} exact={true} />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="unos" href="/docs/dgltabs/tab1">
          <IonIcon icon={informationCircleSharp} />
          <IonLabel>Info</IonLabel>
        </IonTabButton>
        {/* <IonTabButton tab="komentar" href="/docs/dgltabs/tab2">
          <IonIcon icon={documentText} />
          <IonLabel>Komentari</IonLabel>
        </IonTabButton> */}
        <IonTabButton tab="arhiva" href="/docs/dgltabs/tab3/stavke">
          <IonIcon icon={list} />
          <IonLabel>Stavke</IonLabel>
        </IonTabButton>
        {listItem!.tabradvisible &&
        <IonTabButton tab="rad" href="/docs/dgltabs/tab3/rad">
          <IonIcon icon={time} />
          <IonLabel>Rad</IonLabel>
        </IonTabButton>        
        }
        <IonTabButton tab="privitci" href="/docs/dgltabs/tabPrivitci">
          <IonIcon icon={attach} />
          <IonLabel>Privitci</IonLabel>
        </IonTabButton>
        {listItem!.tabpotpisvisible &&
        <IonTabButton tab="potpis" href="/docs/dgltabs/tab4">
          <IonIcon icon={pencil} />
          <IonLabel>Potpis</IonLabel>
        </IonTabButton>
        }
        
      </IonTabBar>
    </IonTabs>
  );
};

export default DglMainTabs;