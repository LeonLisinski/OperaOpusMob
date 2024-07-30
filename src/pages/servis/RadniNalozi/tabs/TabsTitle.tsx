import { IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonSearchbar, IonTitle, IonToolbar } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';

const TabsTitle: React.FC = (props) => {
	const listItem = useSelector((state: any) => state.servis.radniNalozi?.data );
	const sifdv = useSelector((state: any) => state.servis.radniNalozi?.sifdv );


	const [title, setTitle] = useState<string>(null);

	useEffect(() => {
		let title=`Radni nalozi - ${sifdv}`;
		if (listItem) {
			title=listItem.brojdokumenta;
		}
        setTitle(title);
	}, []);


	return (
        <>
		    {title}
        </>
	);
};

export default TabsTitle;
