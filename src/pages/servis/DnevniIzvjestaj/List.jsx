import {
	IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem,
	IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonRefresher, IonRefresherContent, IonSearchbar, IonTitle, IonToolbar,
	useIonRouter
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

//import './Page.css';

import { useDispatch, useSelector } from 'react-redux';

import { getFilterDefaults, changeValue, getList, getListItem, selectList, setItemData, setSearchText, selectDnevniIzvjestaj } from './store';
import { add, search, options, closeCircle } from 'ionicons/icons';

import moment from 'moment';
import DnevniIzvjestajFilter from './components/DnevniIzvjestajFilter';


const DnevniIzvjestajList = (props) => {
	const { id } = useParams();

	//const [listData, setListData] = useState([]);

	const router = useIonRouter();


	const [showSearchbar, setShowSearchbar] = useState(false);
	const [showFilterModal, setShowFilterModal] = useState(false);


	const dispatch = useDispatch()
	const list = useSelector(selectList);
	const { loading, filter } = useSelector(selectDnevniIzvjestaj)

	const [filterText1, setFilterText1] = useState('');
	const [filterText2, setFilterText2] = useState('');


	

	//const [nameBuff, setNameBuff] = useState(id)






	useEffect(() => {
		initLoad();
	}, []);

	useEffect(() => {
		if (!filter)
			return;

		getFilterText();
		populateData();
	}, [filter]);



	const initLoad = async () => {
		await dispatch(getFilterDefaults());
	}



	const getFilterText = () => {
		if (!filter)
			return;

		const datumOd = filter.datumod;
		const datumDo = filter.datumdo;

		//const statusesText = filter.statuses.filter(x => x.checked == true).map(x => x.name).join(', ');


		const text1 = `Datum od: ${moment(datumOd).format("DD.MM.YYYY.")} Datum do: ${moment(datumDo).format("DD.MM.YYYY.")}`
		//const text2 = `Statusi: ${statusesText?.toLowerCase()}`

		setFilterText1(text1);
		setFilterText2('');
	}



	const onDismissModal = () => {

		setShowFilterModal(false);
		populateData();
	}



	const populateData = () => {
		dispatch(getList());

	}




	const onItemClick = async (e, item) => {
		e.preventDefault();
		await dispatch(getListItem(item.dglid));

		router.push('/servis/dnevniizvjestaj/tabs');
	}

	const onNewClick = async (e) => {
		e.preventDefault();
		//dispatch(setDglId(null));
		await dispatch(setItemData(null));

		router.push('/servis/dnevniizvjestaj/tabs');
		//history.push('/servis/dnevniizvjestaj/tabs');
		// alert("1");
		// return <Redirect to='/servis/dnevniizvjestaj/tabs'  />

	}

	const renderList = () => {

		return (
			<IonList>
				{list && list.map((item, i) => {
					return <IonItem button onClick={(e) => onItemClick(e, item)} detail={true} key={i} >
						{/* <div style={{ fontSize: 10, position: 'absolute', top: 0, left: 0 }}></div> */}
						<IonLabel>
							<h3><strong>{item.brojdokumenta}</strong>&nbsp;&nbsp;&nbsp;<span style={{ color: '#969696', fontStyle: 'italic' }}>{moment(item.fiskvrijemeizdavanja).format('DD.MM.YYYY HH:mm')}</span></h3>
							<p>{item.nazpartnera} - {item.nazpred}</p>
							<p><strong>{item.komentar && item.komentar?.replaceAll('\n', ' .. ')}</strong></p>
						</IonLabel>
					</IonItem>
				})}
			</IonList>

			//   return <IonItem key={i}>
			//   <IonLabel>{x.korime}</IonLabel>
			// </IonItem>


		);
	}


	const handleRefresh = (e) => {
		setTimeout(() => {
			// Any calls to load data go here
			e.detail.complete();
		}, 2000);
	}

	const goBack = () => {
		router.push('/modules', 'back');
	}


	return (
		<IonPage className='svam-header'>
			<IonHeader>
				<IonToolbar className='module two-right-buttons'>
					{!showSearchbar &&
						<IonButtons slot="start">
							<IonButton onClick={() => goBack()}>
								<IonIcon slot="icon-only" icon={closeCircle}></IonIcon>
							</IonButton>
							{/* <IonBackButton icon={closeCircle}></IonBackButton> */}
						</IonButtons>
					}

					{showSearchbar &&
						<IonSearchbar showCancelButton="always" placeholder="Pretraga..." onIonInput={(e) => dispatch(setSearchText(e.detail.value))} onIonCancel={() => setShowSearchbar(false)}></IonSearchbar>
					}
					{!showSearchbar &&
						<IonButtons slot="end">
							<IonButton onClick={() => setShowSearchbar(true)}>
								<IonIcon slot="icon-only" icon={search}></IonIcon>
							</IonButton>
							<IonButton onClick={() => setShowFilterModal(true)}>
								<IonIcon slot="icon-only" icon={options}></IonIcon>
							</IonButton>
						</IonButtons>
					}
					{!showSearchbar &&
						<IonTitle>Dnevni izvještaj</IonTitle>
					}
				</IonToolbar>
				<IonToolbar className='filterToolbar'>
					<div style={{ textAlign: 'center', paddingBottom: 4 }}>
						{filterText1}
					</div>
					{list &&
						<div style={{ textAlign: 'right', borderTop: '1px dotted #d5d5d5', paddingTop: 4, paddingRight: 4 }}><i>Ukupno stavaka: <strong>{list.length}</strong></i></div>
					}
				</IonToolbar>
			</IonHeader>

			<IonContent fullscreen >

				<IonRefresher slot="fixed" onIonRefresh={handleRefresh} >
					<IonRefresherContent >
					</IonRefresherContent>
				</IonRefresher>
				{/* {name2}
				<IonItem>
					<IonInput type="text" placeholder='Add name' value={nameBuff} onIonChange={(e: any = {}) => setNameBuff(e.detail.value)} />
					<IonButton onClick={() => dispatch(changeValue(nameBuff))}>Change Name</IonButton>
				</IonItem> */}
				{list && list.length > 0 && renderList()}
				{/* <ExploreContainer name={name} /> */}

				<IonFab horizontal='end' vertical='bottom' slot="fixed">
					<IonFabButton onClick={(e) => onNewClick(e)} >
						<IonIcon icon={add} />
					</IonFabButton>
				</IonFab>


			</IonContent>

			<IonModal
				isOpen={showFilterModal}
				onDidDismiss={() => setShowFilterModal(false)}
			>
				<DnevniIzvjestajFilter onDismissModal={() => onDismissModal()}></DnevniIzvjestajFilter>
			</IonModal>

		</IonPage>
	);
};

export default DnevniIzvjestajList;
