import { IonAlert, IonButton, IonCol, IonContent, IonFab, IonFabButton, IonFooter, IonGrid, IonIcon, IonInput, IonInputPasswordToggle, IonItem, IonLabel, IonPage, IonRefresher, IonRefresherContent, IonRow, IonSpinner, IonToast, IonToolbar, RefresherEventDetail, useIonRouter } from '@ionic/react';
import { lockClosedOutline } from 'ionicons/icons';

import './UnlockCore.scss';
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { Preferences } from '@capacitor/preferences';
import { useDispatch } from 'react-redux';
import { getUnlock } from '../../utils/dataHelper';
import { setApi } from './store';
import { Device, DeviceId } from '@capacitor/device';
import { useFetchData } from '../../hooks/useFetchData';
import buildInfo from "./../../build-info.json";
import SvamLoad from '../../components/Spinner/SvamLoad';


const UnlockCore: React.FC = () => {
	const router = useIonRouter();
	const dispatch = useDispatch();

	const [loading, setLoading] = useState(false);
	const [showToast, setShowToast] = useState(false);
	const [password, setPassword] = useState<string>("");
	const [message, setMessage] = useState<string>("");
	const [iserror, setIserror] = useState<boolean>(false);
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

	const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
		setTimeout(() => {
			// Any calls to load data go here
			event.detail.complete();
		}, 2000);
	}


	const onClickOk = async () => {
		if (!password) {
			setMessage("Unesite lozinku");
			setIserror(true);
			return;
		}

		const info = await Device.getInfo();
		const id = await Device.getId();

		const queries = [
			{
				"query": "spPinCoreAzur",
				"params": {
					"action": "unlock",
					"pushRegistrationId": null,
					"pin": password,
					"refreshToken": null,
					"DeviceCordova": null,
					"DeviceIsVirtual": info?.isVirtual,
					"DeviceManufacturer": info?.manufacturer,
					"DeviceModel": info?.model,
					"DeviceSerial": id?.identifier,
					"DeviceUuid": id?.identifier,
					"DeviceVersion": info?.osVersion
				},
				"singlerow": true
			}
		]


		setLoading(true);

		try {
			const json = await getUnlock({ queries }).catch(e => {
				setMessage(e);
				setIserror(true);

				setTimeout(() => {
					setLoading(false);
				}, 4000);
			});


			if (json) {
				await setStorageAuth(json);
				await dispatch(setApi(json));
				setTimeout(() => {
					setLoading(false);
				}, 4000);
				router.push('/login', 'none');
			}

		} catch (error) {
			setTimeout(() => {
				setLoading(false);
			}, 4000);
			setMessage(error);
			setIserror(true);
		}


	};


	const setStorageAuth = async (json) => {
		await Preferences.set({
			key: 'auth',
			value: JSON.stringify(json)
		});
	}



	return (
		<IonPage className='svam-header unlock-container page-core-applications'>
			{loading && <SvamLoad startLoading={loading} />}
			{/* <Header title='Kontrolni centar - aplikacije'></Header> */}
			<IonContent fullscreen className='ion-content'>
				<IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
					<IonRefresherContent></IonRefresherContent>
				</IonRefresher>


				<div className="main-content">
					<div style={{ textAlign: 'center', paddingTop: 40, paddingBottom: 0, minHeight: 150 }}>
						<img src={'assets/operaopus.svg'} width={220} style={{ width: 220, opacity: 1 }}></img>

						<div className='header-version'>
							verzija: {buildInfo.version}
						</div>
					</div>

					<div className="container app-container">
						<br></br><br></br>
						<IonGrid>

							<IonRow>
								<IonCol style={{ textAlign: 'center' }}>
									<IonIcon
										style={{ fontSize: "80px", color: isDarkMode ? "#2a9d84" : "#39655d" }}
										icon={lockClosedOutline}
									/>
								</IonCol>
							</IonRow>
							<IonRow>
								<IonCol>
									<IonItem style={{ marginTop: 15 }}>
										<IonLabel position="floating" style={{ color: '#969696' }}> Šifra za otključavanje aplikacije:</IonLabel>
										<br></br>
										<IonInput
											style={{ fontSize: 30, height: 50 }}
											type="password"
											value={password}
											onIonInput={(e) => setPassword(e.detail.value!)}
										>
											<IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
										</IonInput>
									</IonItem>
								</IonCol>
							</IonRow>

						</IonGrid>

					</div>
				</div>

				<IonToast
					isOpen={showToast}
					onDidDismiss={() => setShowToast(false)}
					message="Nemate pravo pristupa."
					duration={200}
				/>

				<IonAlert
					isOpen={iserror}
					onDidDismiss={() => setIserror(false)}
					cssClass="my-custom-class"
					header={"Pogreška!"}
					message={message}
					buttons={["Dismiss"]}
				/>

			</IonContent>
			<IonFooter>
				<IonToolbar className='ion-text-center'>
					<div style={{ padding: 12 }}>
						<IonButton onClick={onClickOk} expand='block' color={'dark'} fill={'solid'} disabled={loading == true}>
							{/* dodat svam spinner */}
							{/* {loading && <><IonSpinner></IonSpinner>&nbsp;&nbsp;</>} */}
							Otključaj
						</IonButton>
					</div>

				</IonToolbar>
			</IonFooter>
		</IonPage>
	);
};

export default UnlockCore;
