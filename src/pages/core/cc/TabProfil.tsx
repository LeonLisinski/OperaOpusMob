import { IonContent, IonIcon, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonPage } from '@ionic/react';
import { personCircle } from 'ionicons/icons';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import Header from '../../../components/Header';

import './TabProfil.scss';

const TabProfil: React.FC = () => {
	const state = useSelector((state: any) => state);
	const auth = state?.auth;
	const [isDarkMode, setIsDarkMode] = useState(false);

	useEffect(() => {
		const checkDarkMode = () => {
			setIsDarkMode(document.documentElement.classList.contains('ion-palette-dark'));
		};
		checkDarkMode();

		const observer = new MutationObserver(checkDarkMode);
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

		return () => observer.disconnect();
	}, []);

	return (
		<IonPage className='svam-header tab-profil' >
			<Header title='Kontrolni centar - profil'></Header>
			<IonContent fullscreen>
				<div style={{ background: isDarkMode ? '#2a4d47' : '#39655d', height: 190, textAlign: 'center' }}>
					<IonIcon
						icon={personCircle}
					/>
				</div>
				<IonItemGroup>
					<IonItemDivider color={isDarkMode ? 'dark' : 'light'}>
						<IonLabel>Operater:</IonLabel>
					</IonItemDivider>
					<IonItem lines={'none'}>
						<IonLabel className="ion-text-wrap">
							<h3><strong>{auth?.user?.korime}</strong></h3>
						</IonLabel>
					</IonItem>
					<IonItemDivider color={isDarkMode ? 'dark' : 'light'}>
						<IonLabel>Osoba:</IonLabel>
					</IonItemDivider>
					<IonItem lines={'none'}>
						<IonLabel className="ion-text-wrap">
							<strong><p>{auth?.user?.name}</p></strong>
						</IonLabel>
					</IonItem>
					<IonItemDivider color={isDarkMode ? 'dark' : 'light'}>
						<IonLabel>Grupa:</IonLabel>
					</IonItemDivider>
					<IonItem lines={'none'}>
						<IonLabel className="ion-text-wrap">
							<strong><p>{auth?.user?.grupa}</p></strong>
						</IonLabel>
					</IonItem>
				</IonItemGroup>
			</IonContent>
		</IonPage>
	);
};

export default TabProfil;
