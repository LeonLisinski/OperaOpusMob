import {
  IonContent,
  IonIcon,
  IonItem,
  IonList,
  IonListHeader,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonToast,
  RefresherEventDetail,
  useIonRouter,
} from "@ionic/react";
import { calendarOutline, readerOutline } from "ionicons/icons";

import "./Modules.scss";
import { useState } from "react";
import Header from "../../../components/Header";
import { useSelector } from "react-redux";
import { addIcons } from "ionicons";
import NoData from "../../../components/NoData";

const Modules: React.FC = (props) => {
  const ionRouter = useIonRouter();

  const [showToast, setShowToast] = useState(false);

  const app = useSelector((state: any) => state.core.cc.selectedApp);
  const database = useSelector((state: any) => state.auth.db);

  addIcons({
    calendar: calendarOutline,
    reader: readerOutline,
  });

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    setTimeout(() => {
      // Any calls to load data go here
      event.detail.complete();
    }, 2000);
  };

  const onModuleClick = (item) => {
    ionRouter.push(item.url);
  };

  const renderModules = (group) => {
    return (
      group.items &&
      group.items.map((module, i) => {
        // return module.db.map((db, i) => {
        return (
          <IonItem
            key={i}
            detail={true}
            button
            onClick={() => onModuleClick(module)}
          >
            <IonIcon slot="start" name={module.icon} />
            {module.title}
          </IonItem>
        );
        //});
      })
    );
  };

  return (
    <IonPage className="svam-header">
      <Header
        title={`Moduli - ${app.title}`}
        allowBack={true}
        type="modules"
      ></Header>
      <IonContent fullscreen className="ion-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        {app.items && (
          <IonList style={{ paddingTop: 0 }}>
            {app.items.map((group, i) => {
              return (
                <div key={i}>
                  <IonListHeader style={{ background: "#f3f3f3" }}>
                    {group.title}
                  </IonListHeader>
                  {renderModules(group)}
                </div>
              );
            })}
          </IonList>
        )}
        {!app.items && <NoData></NoData>}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Nemate pravo pristupa."
          duration={200}
        />
      </IonContent>
    </IonPage>
  );
};

export default Modules;
