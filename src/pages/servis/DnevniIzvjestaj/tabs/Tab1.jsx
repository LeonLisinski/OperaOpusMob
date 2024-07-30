import { IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonFooter, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonSearchbar, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';

import _ from 'lodash';

import './Tab1.css';

import Search from '../../../../components/search/simple/search';
import { useDispatch, useSelector } from 'react-redux';
import { saveDoc, selectListItem } from '../store';
import TabsTitle from './TabsTitle';
import moment from 'moment';
import { getData } from '../../../../utils/dataHelper';

const Tab1 = (props) => {

	//const { name } = useParams(name);
	const dispatch = useDispatch()
	const router = useIonRouter();

	//const listItem = useSelector(selectListItem);
	const listItem = useSelector((state) => state.servis.dnevniIzvjestaj?.data);
	const auth = useSelector((state) => state.auth);



	

	const [showModal, setShowModal] = useState(false);
	const [modalEntity, setModalEntity] = useState('');
	const [modalParentId, setModalParentId] = useState('');
	const [modelType, setModalType] = useState('');
	const [modalDebaunce, setModalDebaunce] = useState(200);

	const [podruzniceExists, setPodruzniceExists] = useState(false);

	const [originalData, setOriginalData] = useState(null);


	const [partnerBeforeModal, setPartnerBeforeModal] = useState({ id: null, name: '...' });
	const [partner, setPartner] = useState({ id: null, name: '...' });
	const [podruznica, setPodruznica] = useState({ id: null, name: '...' });
	const [ugovor, setUgovor] = useState({ id: null, name: '...' });

	useEffect(() => {
		if (listItem) {
			setPartner({ id: listItem.sifpartnera, name: listItem.nazpartnera });
			setPodruznica({ id: listItem.dodadresaid, name: listItem.naz2partnera });
			setUgovor({ id: listItem.sifpred, name: listItem.nazpred });
		}
	}, []);

	const getPodruznice = async () => {
		const sifpartnera = listItem?.sifpartnera;
		const queries = [{
			query: 'spMob_DGL_Sifarnici',
			params: {
				action: 'podruznica',
				parentId: partner.id
			},
			commandType: 'sp'
		}]
	
		const data = await getData({ queries }, auth);
		//const data = await getData({ query: `select top 30 * from DGL` });
		setPodruzniceExists(data && data.length > 0);
	};
	
	useEffect(() => {
		setOriginalData(listItem);
	}, [listItem]);

	const onClick = (e) => {
		if (modalEntity == 'partner') {
			setPartner(e);
			if (e.id != partnerBeforeModal.id) {
				setPodruznica({id: null, name: null});
			}
		}
		else if (modalEntity == 'podruznica') {
			setPodruznica(e);
		}
		else if (modalEntity == 'pred') {
			setUgovor({id: e.id, name: e.name});
			setPartner({id: e.sifpartnera, name: e.nazpartnera});
			if (e.sifpartnera != partnerBeforeModal.id) {
				setPodruznica({id: null, name: null});
			}
		}

		setShowModal(false);
	}

	const onClickSpremi = async (e) => {
		if (listItem?.dglid) {
			//ažuriranje
		} else {
			//spremanje

		}

		const formData = {
			sifdv: 'DNIZ',
			datumdokumenta: moment().format('YYYYMMDD'),
			sifpartnera: partner.id,
			dodadresaid: podruznica.id,
			sifpred: ugovor.id
		}

		const data = await dispatch(saveDoc({dglid:listItem?.dglid, formData:formData }))


		setTimeout(() => {
			router.push('/servis/dnevniizvjestaj/tabs/tab2', 'none');
		}, 300);
		
	}


	const onHideModal = (e) => {
		setShowModal(false);

		// if (modalEntity == 'partner') {
		// 	if (partner.id != partnerBeforeModal.id) {
		// 		setPodruznica({id: null, name: null});
		// 	}
		// 	// if (data && data.length > 0) {}
		// 	// else {
		// 	// 	set
		// 	// }
		// }
		// else if (modalEntity == 'ugovor') {
		// 	if (partner.id != partnerBeforeModal.id) {
		// 		setPodruznica({id: null, name: null});
		// 	}
		// 	// if (data && data.length > 0) {}
		// 	// else {
		// 	// 	set
		// 	// }
		// }

	}

	const handleShowModal = (entity, type, debaunce, parentId) => {
		setPartnerBeforeModal(partner);
		// if (modalEntity == 'partner') {
		// 	setPartnerBeforeModal(partner);
		// }
		setModalEntity(entity);
		setModalType(type);
		setModalDebaunce(debaunce);
		setModalParentId(parentId)
		setShowModal(true);
	}


	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonBackButton />
					</IonButtons>
					<IonTitle>
						<TabsTitle />
					</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent fullscreen className="ion-padding" >
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonTitle size="small"><TabsTitle /></IonTitle>
					</IonToolbar>
				</IonHeader>
				<IonLabel>Ugovor:</IonLabel>
				<IonButton className='ion-text-wrap' style={{ height: 44 }} onClick={() => handleShowModal('pred', 'simple', 200, null)} expand="block" fill={ugovor.id ? 'solid' : 'outline'}>
					{ugovor.name}
				</IonButton>
				<div style={{ paddingTop: 8 }}>
					<IonLabel>Partner:</IonLabel>
					<IonButton className='ion-text-wrap' style={{ height: 44 }} onClick={() => handleShowModal('partner', 'advanced', 500, null)} expand="block" fill={partner.id ? 'solid' : 'outline'}>
						{partner.name}
					</IonButton>

				</div>
				<div style={{ paddingTop: 8 }}>
					<IonLabel>Podružnica:</IonLabel>
					<IonButton className='ion-text-wrap' style={{ height: 44 }} onClick={() => handleShowModal('podruznica', 'simple', 200, partner.id)} expand="block" fill={podruznica.id ? 'solid' : 'outline'}>
						{podruznica.name}
					</IonButton>
				</div>
				{/* {showModal == true ? 'true' : 'false'} */}
				<Search entity={modalEntity} showModal={showModal} type={modelType} onClick={onClick} onHideModal={onHideModal} debaunce={modalDebaunce} parentId={modalParentId}></Search>
			</IonContent>
			<IonFooter>
				<IonToolbar className='ion-text-center'>
					<div style={{ padding: 12 }}>
						<IonButton onClick={onClickSpremi} expand='block' color={'dark'} fill={'solid'}>Spremi</IonButton>
					</div>
				</IonToolbar>
			</IonFooter>
		</IonPage>
	);
};

export default Tab1;
