import { IonAlert, IonButton, IonCol, IonContent, IonFab, IonFabButton, IonFooter, IonGrid, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonRefresher, IonRefresherContent, IonRow, IonSpinner, IonToast, IonToolbar, RefresherEventDetail, useIonRouter } from '@ionic/react';
import { cube, briefcase, person, build, bulb, play, lockClosedOutline, exit, power, lockClosed, ellipsisVerticalCircleOutline } from 'ionicons/icons';

import './UnlockCore.scss';
import { useState } from 'react';
import Header from '../../components/Header';
import { Preferences } from '@capacitor/preferences';
import { useDispatch } from 'react-redux';
import { getUnlock } from '../../utils/dataHelper';
import { setApi } from './store';
import { Device, DeviceId } from '@capacitor/device';
import { useFetchData } from '../../hooks/useFetchData';
import { APP_VERSION } from '../../constants';



const UnlockCore: React.FC = () => {
	const router = useIonRouter();
	const dispatch = useDispatch();

	

	const { fetchData } = useFetchData();



	const [loading, setLoading] = useState(false);
	const [showToast, setShowToast] = useState(false);
	const [password, setPassword] = useState<string>("");
	const [message, setMessage] = useState<string>("");
	const [iserror, setIserror] = useState<boolean>(false);

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
	
				setLoading(false);
			});


			if (json) {
				await setStorageAuth(json);
				await dispatch(setApi(json));
				setLoading(false);
				router.push('/login', 'none');
			}

		} catch (error) {
			setLoading(false);
			setMessage(error);
			setIserror(true);
		}

		// try {
		// 	setLoading(true);
		// 	const json = await getUnlock({ queries }).catch((e) => {
		// 		setMessage(e);
		// 		setIserror(true);
		// 		setLoading(false);
		// 		return;
		// 	});
		// 	if (json) {
		// 		await setStorageAuth(json);
		// 		await dispatch(setApi(json));
		// 		setLoading(false);
		// 		router.push('/login', 'none');
		// 	}

			
		// 	//router.push('/cc/aplikacije');
		// } catch (error) {
		// 	setLoading(false);
		// 	setMessage(error);
		// 	setIserror(true);
		// }



	};

	
	const setStorageAuth = async (json) => {
		await Preferences.set({
			key: 'auth',
			value: JSON.stringify(json)
		});
	}



	return (
		<IonPage className='svam-header unlock-container page-core-applications'>
			{/* <Header title='Kontrolni centar - aplikacije'></Header> */}
			<IonContent fullscreen className='ion-content'>
				<IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
					<IonRefresherContent></IonRefresherContent>
				</IonRefresher>


				<div className="main-content">
					<div style={{ textAlign: 'center', paddingTop: 40, paddingBottom: 0, minHeight: 150 }}>
						<img src={'assets/operaopus.svg'} width={220} style={{ width: 220, opacity: 1 }}></img>

						<div className='header-version'>
							verzija: {APP_VERSION}
						</div>
					</div>

					<div className="container app-container">
						<br></br><br></br>
						<IonGrid>

							<IonRow>
								<IonCol style={{ textAlign: 'center' }}>
									<IonIcon
										style={{ fontSize: "80px", color: "#39655d" }}
										icon={lockClosedOutline}
									/>
								</IonCol>
							</IonRow>
							<IonRow>
								<IonCol>
									<IonItem style={{ marginTop: 15 }}>
										<IonLabel position="floating" style={{ color: '#969696' }}> Šifra za otključavanje aplikacije:</IonLabel>
										<IonInput
											style={{ fontSize: 30, textAlign: 'center' }}
											type="password"
											value={password}
											onIonInput={(e) => setPassword(e.detail.value!)}
										>
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
							{loading && <><IonSpinner></IonSpinner>&nbsp;&nbsp;</>}
							Otključaj
						</IonButton>
					</div>

				</IonToolbar>
			</IonFooter>
		</IonPage>
	);
};

export default UnlockCore;
