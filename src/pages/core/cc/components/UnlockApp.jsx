import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { IonAlert, IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonFooter, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonSearchbar, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import { createRef, memo, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFetchData } from '../../../../hooks/useFetchData';
import getData, { getUnlock } from '../../../../utils/dataHelper';
import { unlockApp } from '../store';
import './UnlockApp.scss';



const UnlockApp = (props) => {

	const dispatch = useDispatch()

	const auth = useSelector((state) => state.auth);

	const { fetchData } = useFetchData();

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [iserror, setIserror] = useState(false);

	const modal = useRef(null);
	const codeRef = createRef();


	const [okButtonDisabled, setOkButtonDisabled] = useState(true);

	useEffect(() => {

	}, []);


	function onWillDismiss(e) {
		props.onHideModal(e);
	}


	const onClickOk = async (e) => {
		// const d = await getStorageUnlocked();
		// console.log(d);
		// const data = JSON.parse(d);
		// console.log(data);
		// return

		const pin = codeRef.current.value;
		const id = await Device.getId();


		const queries = [
			{
				"query": "spPinAppAzur",
				"params": {
					"action": "unlock",
					"db": auth.db,
					"pin": pin,
					"appCode": props.item.code,
					"deviceUuid": id.identifier
				}
			}
		]

		try {
		 	const data = await getUnlock({ queries }).catch(e => {
		 		setMessage(e);
		 		setIserror(true);
		 		setLoading(false);
		});


			if (data) {
				console.log('data', data);

				await dispatch(unlockApp(data));
				await setStorageUnlocked(data);
				props.onHideModal(e);
				// await setStorageAuth(json);
				
				setLoading(false);
				// router.push('/login', 'none');
			}

		} catch (error) {
			setLoading(false);
			setMessage(error);
			setIserror(true);
		}
	}


	const setStorageUnlocked = async (json) => {
		// const currentValue = await Preferences.get({ key: 'unlocked' });
		// let newValue= null;
		
		// // if (currentValue.value) {
		// // 	newValue = [...JSON.parse(currentValue.value), json]
		// // }
		// // else {
		// 	newValue = json
		// //} 

		await Preferences.set({
			key: 'unlocked',
			value: JSON.stringify(json)
		});
	}


	const onIonInput = (e) => {
		if (e.detail.value.length == 8) {
			setOkButtonDisabled(false);
		} else {
			setOkButtonDisabled(true);
		}
	}

	return (
		<>
			<IonModal isOpen={props.showModal} ref={modal} onWillDismiss={(ev) => onWillDismiss(ev)}>
				<IonHeader className='svam-filter-header'>
					<IonToolbar className='svam-title-toolbar svam-background'>
						<IonButtons slot="end">
							<IonButton onClick={() => modal.current?.dismiss()}>Odustani</IonButton>
						</IonButtons>
						<IonTitle>
							Otključavanje aplikacije
						</IonTitle>
					</IonToolbar>
				</IonHeader>

				<IonContent className="ion-padding unlock-app-container ion-content">
					<div style={{ paddingTop: 15 }}>
						<IonLabel>Šifra:</IonLabel>
						<IonInput onIonInput={onIonInput} maxlength={8} style={{ textAlign: 'center', background: 'white', fontSize: 20, border: '1px solid #ccc', marginTop: 6 }} ref={codeRef} ></IonInput>
					</div>
				</IonContent>
				<IonFooter>
					<IonToolbar className='ion-text-center'>
						<div style={{ padding: 12 }}>
							<IonButton onClick={onClickOk} disabled={okButtonDisabled} expand='block' color={'dark'} fill={'solid'}>Otključaj</IonButton>
						</div>
					</IonToolbar>
				</IonFooter>

				<IonAlert
					isOpen={iserror}
					onDidDismiss={() => setIserror(false)}
					cssClass="my-custom-class"
					header={"Pogreška!"}
					message={message}
					buttons={["Dismiss"]}
				/>
			</IonModal>
		</>
	);
};

export default memo(UnlockApp);
