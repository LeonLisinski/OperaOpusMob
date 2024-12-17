import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonRouter,
} from "@ionic/react";
import { add, arrowBack, camera } from "ionicons/icons";
import { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TabsTitle from "./TabsTitle";

import "./TabPrivitci.css";
import { getPrivitci } from "../store";

import FilesAdd from "../components/FilesAdd";

const TabPrivitci = () => {
  const router = useIonRouter();

  const dispatch = useDispatch();

  const sifdv = useSelector((state:any) => state.servis.radniNalozi?.sifdv);
  
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {}, []);

  const populateList = async () => {
    await dispatch(getPrivitci());
  };

  const list = useSelector((state:any) => state.servis.radniNalozi?.privitci);

  const onItemClick = async (e, item) => {
    window.open(item.putanja, "_blank", "noreferrer");
  };

  
	const onHideModal = (e) => {
		setShowModal(false);
	}

  const renderList = () => {
    return (
      <IonList>
        {list &&
          list.map((item, i) => {
            return (
              <IonItem
                className="ion-no-padding"
                button
                onClick={(e) => onItemClick(e, item)}
                detail={true}
                key={i}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: 4,
                    background: item.indcolor,
                  }}
                ></div>
                <IonLabel style={{ paddingLeft: 15 }}>{item.naziv}</IonLabel>
              </IonItem>
            );
          })}
      </IonList>
    );
  };

  const handleRefresh = async (e) => {
    //await populateData();
    e.detail.complete();
  };

  const goBack = () => {
    router.push(`/servis/radninalozi/${sifdv}`, "none");
  };

  const onNewClick = () => {
    setShowModal(true);
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => goBack()}>
              <IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
            </IonButton>
          </IonButtons>
          <IonTitle>
            <TabsTitle />
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">
              <TabsTitle />
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {list && list.length > 0 && renderList()}

        <IonFab horizontal="end" vertical="bottom" slot="fixed">
          <IonFabButton onClick={(e) => onNewClick(e)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <FilesAdd showModal={showModal} onHideModal={onHideModal}></FilesAdd>
      </IonContent>
    </IonPage>
  );
};

export default memo(TabPrivitci);
