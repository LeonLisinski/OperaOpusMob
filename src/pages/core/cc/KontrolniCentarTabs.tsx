import React  from 'react';
import { IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/react';
import { Route, Redirect, Switch } from 'react-router';
import { calendar, location, cube, people, settings, library, star, person, documents } from 'ionicons/icons';
import TabAplikacije from './TabAplikacije';
import TabFavoriti from './TabFavoriti';
import TabProfil from './TabProfil';
import TabPostavke from './TabPostavke';




interface KontrolniCentarTabs { }

const KontrolniCentarTabs: React.FC<KontrolniCentarTabs> = () => {

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Redirect path="/cc" to="/cc/aplikacije" />
        {/*
          Using the render method prop cuts down the number of renders your components will have due to route changes.
          Use the component prop when your component depends on the RouterComponentProps passed in automatically.
        */}
        <Route path="/cc/aplikacije" component={TabAplikacije} exact={true} />
        <Route path="/cc/favoriti" component={TabFavoriti} exact={true} />
        <Route path="/cc/profil" component={TabProfil} exact={true} />
        <Route path="/cc/postavke" component={TabPostavke} exact={true} />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="aplikacije" href="/cc/aplikacije">
          <IonIcon icon={documents} />
          <IonLabel>Aplikacije</IonLabel>
        </IonTabButton>
        <IonTabButton tab="favoriti" href="/cc/favoriti">
          <IonBadge color={'medium'}>0</IonBadge>
          <IonIcon icon={star} />
          <IonLabel>Favoriti</IonLabel>
        </IonTabButton>
        <IonTabButton tab="profil" href="/cc/profil">
          <IonIcon icon={person} />
          <IonLabel>Profil</IonLabel>
        </IonTabButton>
        <IonTabButton tab="postavke" href="/cc/postavke">
          <IonIcon icon={settings} />
          <IonLabel>Postavke</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default KontrolniCentarTabs;