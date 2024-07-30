import React from 'react';
import { IonDatetime, IonDatetimeButton, IonModal } from '@ionic/react';
const DateTimeButton = () => {
    return (
        <>

            <IonDatetime

                slot="content"
                displayFormat="MMMM YY"
                size="cover"
                presentation="date"
            >

            </IonDatetime>
            <IonDatetimeButton datetime="datetime"></IonDatetimeButton>

            <IonModal keepContentsMounted={true}>
                <IonDatetime id="datetime"></IonDatetime>
            </IonModal>
        </>
    );
}
export default DateTimeButton;