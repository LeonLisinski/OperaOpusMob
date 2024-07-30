import { IonBackButton, IonButton, IonButtons, IonHeader, IonIcon, IonMenuButton, IonTitle, IonToolbar } from "@ionic/react";
import { closeCircle } from "ionicons/icons";

import { useIonRouter } from '@ionic/react';

const HeaderModule = (props) => {
    const ionRouter = useIonRouter();

    const goBack = () => {
        ionRouter.goBack();
    }

    return (
        <IonHeader>
            <IonToolbar className="module">
                <IonButtons slot="start">
                    <IonButton onClick={() => goBack()}>
                        <IonIcon slot="icon-only" icon={closeCircle}></IonIcon>
                    </IonButton>
                </IonButtons>
                {props.children}
                <IonTitle>{props.title}</IonTitle>

            </IonToolbar>
        </IonHeader>
    )
}


export default HeaderModule;