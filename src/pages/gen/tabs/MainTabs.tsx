import React  from 'react';
import { IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { Route, Redirect } from 'react-router';
import { informationCircleSharp, pencil, documentText, archive, informationCircle, people, attach, time, list, accessibilityOutline, layers } from 'ionicons/icons';
import TabInfo from './TabInfo';
import TabStavke from './TabStavke';
import TabPotpis from './TabPotpis';
import { useSelector } from 'react-redux';
import TabPrivitci from './TabPrivitci';
import TabAkcije from './TabAkcije';



interface GenMainTabsProps { }

const GenMainTabs: React.FC<GenMainTabsProps> = () => {
  //const dglid = useSelector((state: any) => state.servis.dnevniIzvjestaj?.data?.dglid );
  const listItem = useSelector((state: any) => state.gen.data);
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Redirect exact path="/gen/tabs" to="/gen/tabs/tabinfo" />
        {/*
          Using the render method prop cuts down the number of renders your components will have due to route changes.
          Use the component prop when your component depends on the RouterComponentProps passed in automatically.
        */}
        <Route path="/gen/tabs/tabinfo" component = {TabInfo} exact={true} />
        <Route path="/gen/tabs/tabakcije" component = {TabAkcije} exact={true} />
        {/* <Route path="/gen/tabs/tabstavke/:tip" component = {TabStavke} exact={true}  />
        <Route path="/gen/tabs/tabpotpis" component = {TabPotpis} exact={true} />
        <Route path="/gen/tabs/tabPrivitci" component = {TabPrivitci} exact={true} /> */}
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="unos" href="/gen/tabs/tabinfo">
          <IonIcon icon={informationCircleSharp} />
          <IonLabel>Info</IonLabel>
        </IonTabButton>
        <IonTabButton tab="komentar" href="/gen/tabs/tabakcije">
          <IonIcon icon={layers} />
          <IonLabel>Akcije</IonLabel>
        </IonTabButton>
        {/* <IonTabButton tab="arhiva" href="/gen/tabs/tab3/stavke">
          <IonIcon icon={list} />
          <IonLabel>Stavke</IonLabel>
        </IonTabButton>
        <IonTabButton tab="rad" href="/gen/tabs/tab3/rad">
          <IonIcon icon={time} />
          <IonLabel>Rad</IonLabel>
        </IonTabButton>        
        <IonTabButton tab="privitci" href="/gen/tabs/tabPrivitci">
          <IonIcon icon={attach} />
          <IonLabel>Privitci</IonLabel>
        </IonTabButton> */}
        
      </IonTabBar>
    </IonTabs>
  );
};

export default GenMainTabs;