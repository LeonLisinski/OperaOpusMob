import { IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonSearchbar, IonTitle, IonToolbar } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';

const TabsTitle: React.FC = (props) => {
	const storeRoot = useSelector((state: any) => state.gen);
	const listItem = useSelector((state: any) => state.gen.data );
	const id = useSelector((state: any) => state.gen.data.id );


	const [title, setTitle] = useState<string>(null);

	useEffect(() => {
		let title=`${storeRoot.module} - ${id}`;
		if (listItem) {
			title=listItem["id"];
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
