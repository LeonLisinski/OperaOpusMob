import { IonButtons, IonContent, IonHeader, IonInputPasswordToggle, IonModal, IonPage, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import React, { useRef, useState } from 'react';
import { IonGrid, IonRow, IonCol } from '@ionic/react';
import { personCircle } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { IonItem, IonLabel, IonInput, IonButton, IonIcon, IonAlert } from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import { setApi, setUser } from './store';

import './Login.css';
import { login } from '../../utils/dataHelper';
import { Preferences } from '@capacitor/preferences';
import { useFetchData } from '../../hooks/useFetchData';

import { OverlayEventDetail } from '@ionic/core/components';


// function validateEmail(email: string) {
//     const re = /^((?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))$/;
//     return re.test(String(email).toLowerCase());
// }
const Login: React.FC = () => {

	const modal = useRef<HTMLIonModalElement>(null);
	const inputAuthApi = useRef<HTMLIonInputElement>(null);
	const inputAuthDb = useRef<HTMLIonInputElement>(null);


	const history = useHistory();
	const dispatch = useDispatch();
	const { fetchData } = useFetchData();
	const router = useIonRouter();

	const state = useSelector((state): any => state);

	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [iserror, setIserror] = useState<boolean>(false);
	const [message, setMessage] = useState<string>("");
	const handleLogin = async () => {
		if (!username) {
			setMessage("Unesite ispravno korisničko ime");
			setIserror(true);
			return;
		}

		if (!password) {
			setMessage("Unesite lozinku");
			setIserror(true);
			return;
		}



		const jsonData = { uid: username, pwd: password };
		try {
			const json = await fetchData(jsonData, 'login');

			await setStorageUser(json);
			await dispatch(setUser(json));
			setPassword('');
			router.push('/cc/aplikacije');
		} catch (error) {
			setMessage(error);
			setIserror(true);
			return;
		}
	};

	const setStorageUser = async (json) => {
		await Preferences.set({
			key: 'user',
			value: JSON.stringify(json.user[0])
		});
		await Preferences.set({
			key: 'connection',
			value: JSON.stringify(json.connection)
		});
	}

	const onWillDismiss = (ev: CustomEvent<OverlayEventDetail>) => {
		if (ev.detail.role === 'confirm') {
		}
	}

	const confirm = async () => {
		const api = inputAuthApi.current?.value;
		const db = inputAuthDb.current?.value;
		modal.current?.dismiss();

		const json = {
			...state.auth,
			serverpath: api,
			db: db,
			connection: null,
			user: null
		}

		await setStorageAuth(json);
		await dispatch(setApi(json));
	}

	const setStorageAuth = async (json) => {
		await Preferences.set({
			key: 'auth',
			value: JSON.stringify(json)
		});
	}

	return (
		<IonPage id='login'>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Login</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent fullscreen className="ion-padding ion-text-center">
				<IonGrid>
					<IonRow>
						<IonCol>
							<IonAlert
								isOpen={iserror}
								onDidDismiss={() => setIserror(false)}
								cssClass="my-custom-class"
								header={"Pogreška!"}
								message={message}
								buttons={["Dismiss"]}
							/>
						</IonCol>
					</IonRow>
					<IonRow>
						<IonCol>
							<IonIcon
								style={{ fontSize: "100px", color: "#39655d" }}
								icon={personCircle}
							/>
						</IonCol>
					</IonRow>
					<IonRow>
						<IonCol>
							<IonButton expand="block" color={'light'} id="open-modal" mode='ios'>{state.auth.db}</IonButton>
							<br></br>
						</IonCol>
					</IonRow>
					<IonRow>
						<IonCol>
							<IonItem>
								<IonInput
									type="text"
									value={username}
									onIonInput={(e) => setUsername(e.detail.value!)}
									label='Korisničko ime'
									labelPlacement="stacked"
								>
								</IonInput>
							</IonItem>
						</IonCol>
					</IonRow>

					<IonRow>
						<IonCol>
							<IonItem>
								<IonInput
									type="password"
									value={password}
									onIonInput={(e) => setPassword(e.detail.value!)}
									label='Lozinka'
									labelPlacement="stacked"
								>
									<IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
								</IonInput>
							</IonItem>
						</IonCol>
					</IonRow>
					<IonRow>
						<IonCol>

							<br></br>
							<br></br>
							<IonButton expand="block" color={'dark'} onClick={handleLogin}>Prijava</IonButton>
						</IonCol>
					</IonRow>
				</IonGrid>

				<IonModal ref={modal} trigger="open-modal" onWillDismiss={(ev) => onWillDismiss(ev)}>
					<IonHeader>
						<IonToolbar>
							<IonButtons slot="start">
								<IonButton onClick={() => modal.current?.dismiss()}>Odustani</IonButton>
							</IonButtons>
							<IonTitle></IonTitle>
							<IonButtons slot="end">
								<IonButton strong={true} onClick={() => confirm()}>
									Potvrdi
								</IonButton>
							</IonButtons>
						</IonToolbar>
					</IonHeader>
					<IonContent className="ion-padding">
						<IonItem>
							<IonLabel position="floating"> API putanja</IonLabel>
							<IonInput
								ref={inputAuthApi}
								type="text"
								placeholder="API"
								value={state.auth.api}
							/>
						</IonItem>
						<IonItem>
							<IonLabel position="floating"> Baza</IonLabel>
							<IonInput
								ref={inputAuthDb}
								type="text"
								placeholder="Baza"
								value={state.auth.db}
							/>
						</IonItem>
					</IonContent>
				</IonModal>


			</IonContent>
		</IonPage>
	);
};

export default Login;
