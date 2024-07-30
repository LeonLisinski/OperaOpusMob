import { IonBackButton, IonButton, IonButtons, IonHeader, IonIcon, IonMenuButton, IonTitle, IonToolbar } from "@ionic/react";
import { closeCircle } from "ionicons/icons";
import { useIonRouter } from '@ionic/react';
import { useSelector } from "react-redux";


const Header = (props) => {
    const auth = useSelector((state) => state.auth );
    const ionRouter = useIonRouter();

    const goBack = () => {
        if (props.type == 'modules') {
            ionRouter.push('/cc/aplikacije', 'back');
        } else {
            ionRouter.goBack();
        }
    }

    return (
        <IonHeader>
            <IonToolbar>
                <IonButtons slot="start">
                    {props.allowBack &&
                        <IonButton class='header-button' onClick={() => goBack()}>
                            <IonIcon slot="icon-only" icon={closeCircle}></IonIcon>
                        </IonButton>
                    }
                    {!props.allowBack &&
                        <IonMenuButton />
                    }
                </IonButtons>
                <IonTitle>{props.title}</IonTitle>
            </IonToolbar>
            <IonToolbar className='svam-toolbar'>
                <div>
                    {auth?.user?.korime || '(nepoznato)'}
                </div>
            </IonToolbar>
        </IonHeader>
    )
}


export default Header;