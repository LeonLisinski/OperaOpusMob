import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import Menu from './components/Menu';

import KontrolniCentarTabs from './pages/core/cc/KontrolniCentarTabs';
import Modules from './pages/core/modules/Modules';


import Login from './pages/auth/Login';

import DnevniIzvjestajMainTabs from './pages/servis/DnevniIzvjestaj/tabs/MainTabs';
import DnevniIzvjestajList from './pages/servis/DnevniIzvjestaj/List';

import RadniNaloziList from './pages/servis/RadniNalozi/List';
import RadniNaloziMainTabs from './pages/servis/RadniNalozi/tabs/MainTabs';

// import RadniNaloziListMediva from './pages/ServisMediva/RadniNalozi/List';
// import RadniNaloziMainTabsMediva from './pages/ServisMediva/RadniNalozi/tabs/MainTabs';

import DglList from './pages/dgl/List';
import DglMainTabs from './pages/dgl/tabs/MainTabs';

import GenList from './pages/gen/List';
import GenMainTabs from './pages/gen/tabs/MainTabs';

import { PrivateRoute } from './components/PrivateRoute';
import { Device } from '@capacitor/device';
import { Component, useCallback, useEffect, useMemo, useState } from 'react';

import { Preferences } from '@capacitor/preferences';
import UnlockCore from './pages/auth/UnlockCore';
import { useDispatch } from 'react-redux';
import { setApi, setUser } from './pages/auth/store';

import { App } from '@capacitor/app';
import SplashScreen from './components/SplashScreen';
import { setUnlockedApp } from './pages/core/cc/store';
import PushNotificationsContainer from './pages/utils/PushNotificationsContainer';



const AppMain: React.FC = () => {
  const dispatch = useDispatch();
  const [login, setLogin] = useState(false);

  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    //setObject();
    
  }, []);

  App.addListener('appUrlOpen', data => {
    console.log('App opened with URL:', data);
  });

  async function checkRememberMe() {

      //ako ne postoje login podaci u storage-u

      const authStorage = await getAuthStorage();
      
      if (!authStorage?.serverpath) {
        return <Redirect to="/unlock" />;  
      }
      
      await dispatch(setApi(authStorage));

      const unlockedStorage = await getUnlockedStorage();
      await dispatch(setUnlockedApp(unlockedStorage));

      const userStorage = await getUserStorage();
      const connectionStorage = await getConnectionStorage();



      if (!userStorage) {
          return <Redirect to="/login" />;  
      }
        
      await dispatch(setUser({user: [userStorage], connection: connectionStorage}));


      return <Redirect to="/cc/aplikacije" />;

  }

  function withAsyncComponent(WrappedComponent: any) {
    return function AsyncComponent(props: any) {

      const [component, setComponent] = useState(null);
  

      const memoizedWrappedComponent = useCallback(() => WrappedComponent(props), [props]);

      useEffect(() => {
        async function fetchComponent() {
          const component = await WrappedComponent(props);
          setTimeout(() => {
            setComponent(component);
          }, 1000);
          
        }
        fetchComponent();
      }, [memoizedWrappedComponent]);
  
      return component ? component : <SplashScreen></SplashScreen>;
      
    };
  }
  
  const AsyncCheckRememberMe = withAsyncComponent(checkRememberMe);





  const getUserStorage = async () => {
    const ret = await Preferences.get({ key: 'user' });
    const data = JSON.parse(ret.value);
    return data;
  }

  const getUnlockedStorage = async () => {
    const ret = await Preferences.get({ key: 'unlocked' });
    const data = ret.value && JSON.parse(ret.value);
    return data;
  }

  const getConnectionStorage = async () => {
    const ret = await Preferences.get({ key: 'connection' });
    const data = ret.value && JSON.parse(ret.value);
    return data;
  }

  const getAuthStorage = async () => {
    const ret = await Preferences.get({ key: 'auth' });
    const data = ret.value && JSON.parse(ret.value);
    return data;
  }



  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <Menu />
          <IonRouterOutlet id="main">
            <Route path="/unlock"  component ={UnlockCore} exact={true} />
            <Route path="/login"  component ={Login} exact={true} />
            <Route path="/" component={AsyncCheckRememberMe} exact={true} />
            {/* <Route path="/cc" render={() => <KontrolniCentarTabs /> } /> */}
            {/* <Route path="/" exact={true}>
                    <Redirect to="/login" />
                  </Route> */}

            {/* <Route path="/" exact={true}>
                  {login==true &&
                    <Redirect to="/cc/aplikacije" />
                  }
                  {login==false &&
                    <Redirect to="/login" />
                  }
            </Route> */}



            {/* <Route path="/page" exact={true}>
                <Home />
              </Route>
              <Route path="/page/:id" exact={true}>
                <Details />
              </Route> */}

            <PrivateRoute path="/cc" component={KontrolniCentarTabs} />
            <PrivateRoute path="/modules/:app" component={Modules} exact={true} />
            <PrivateRoute path="/modules" component={Modules} exact={true} />
            <PrivateRoute path="/servis/dnevniizvjestaj/tabs" component={DnevniIzvjestajMainTabs} />
            <PrivateRoute path="/servis/dnevniizvjestaj" component={DnevniIzvjestajList} exact={true} />
            <PrivateRoute path="/servis/radninalozitabs" component={RadniNaloziMainTabs} />
            <PrivateRoute path="/servis/radninalozi/:sifdv" component={RadniNaloziList} />

            <PrivateRoute path="/docs/dgl/:sifdv" component={DglList} />
            <PrivateRoute path="/docs/dgltabs" component={DglMainTabs} />

            <PrivateRoute path="/gen/list/:app/:module" component={GenList} />         
            <PrivateRoute path="/gen/tabs" component={GenMainTabs}/>       

            <PrivateRoute path="/pushup" component={PushNotificationsContainer} exact={true} />

            
            
            


            {/* <PrivateRoute path="/servismediva/radninalozi" component={RadniNaloziListMediva} exact={true} />
            <PrivateRoute path="/servismediva/radninalozi/tabs" component={RadniNaloziMainTabsMediva} /> */}

          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
      
    </IonApp>
  );
};

export default AppMain;
