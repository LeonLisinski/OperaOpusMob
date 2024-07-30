import {
	IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem,
	IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonRefresher, IonRefresherContent, IonSearchbar, IonSpinner, IonTitle, IonToolbar,
	useIonRouter
} from '@ionic/react';
import { memo, useEffect, useRef, useState } from 'react';

//import './Page.css';

import { useDispatch, useSelector } from 'react-redux';

import { getFilterDefaults, getList, getListItem, getStatuses, selectRadniNalozi, setSearchText, setSifDv } from './store';
import { add, search, options, documentTextOutline, closeCircle } from 'ionicons/icons';
import moment from 'moment';
import RadniNaloziFilter from './components/RadniNaloziFilter';
import MasterAzur from './components/MasterAzur';

const RadniNaloziList = (props) => {
	const ionRouter = useIonRouter();
	const dispatch = useDispatch()

	const [showMasterModal, setShowMasterModal] = useState(false);
	const [masterModalItem, setMasterModalItem] = useState(null);

	const sifdv = useSelector((state) => state.servis.radniNalozi?.sifdv);


	//const list = useSelector(selectList);

	const pageRef = useRef(null);

	const [showSearchbar, setShowSearchbar] = useState(false);
	const [showFilterModal, setShowFilterModal] = useState(false);

	const [filterText1, setFilterText1] = useState('');
	const [filterText2, setFilterText2] = useState('');

	const { list, loading, filter } = useSelector(selectRadniNalozi)



	useEffect(() => {
		initLoad();
	}, []);

	useEffect(() => {
		if (!filter.statuses)
			return;
		getFilterText();
		populateData();

	}, [filter]);


	const initLoad = async () => {
		await dispatch(setSifDv(props.match.params.sifdv));
		
		//await dispatch(setSifDv('RNele'));
		await dispatch(getFilterDefaults());
		await dispatch(getStatuses());
	}

	const populateData = async () => {
		await dispatch(getList());
	}

	const getFilterText = () => {
		if (!filter.statuses)
			return;

		const datumOd = filter.datumod;
		const datumDo = filter.datumdo;

		const statusesText = filter?.statuses?.filter(x => x.checked == true).map(x => x.name).join(', ');


		const text1 = `Datum od: ${moment(datumOd).format("DD.MM.YYYY.")} Datum do: ${moment(datumDo).format("DD.MM.YYYY.")}`
		const text2 = `Statusi: ${statusesText?.toLowerCase()}`

		setFilterText1(text1);
		setFilterText2(text2);
	}




	const onItemClick = async (e, item) => {
		e.preventDefault();
		await dispatch(getListItem(item));
		ionRouter.push('/servis/radninalozitabs');
	}

	const onNewClick = async (e) => {
		e.preventDefault();
		handleShowMasterModal(null);
	}

	const handleShowMasterModal = (item) => {
		setMasterModalItem(item)
		setShowMasterModal(true);
	  }

	const renderList = () => {

		return (
			<IonList>
				{list && list.map((item, i) => {
					return <IonItem className='ion-no-padding' button onClick={(e) => onItemClick(e, item)} detail={true} key={i} >
						<div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: item.indcolor }}></div>
						<IonLabel style={{ paddingLeft: 15 }}>
							<h3><span style={{ color: '#969696', fontStyle: 'italic' }}>{item.brojdokumenta}</span>&nbsp;&nbsp;&nbsp;<strong>{item.datumotvaranja && moment(item.datumotvaranja).format('DD.MM.YYYY')}</strong></h3>
							{item.nazpred && <p><span style={{ fontSize: 12, color: '#969696' }}>Ugovor:</span> {item.nazpred}</p>}
							<p><span style={{ fontSize: 12, color: '#969696' }}>Partner:</span> <strong>{item.nazpartnera}</strong></p>
							{item.naz2partnera &&
							<p><span style={{ fontSize: 12, color: '#969696' }}>Podružnica:</span> <strong>{item.naz2partnera}</strong></p>
							}
							{item.napomena7 &&
								<p><span style={{ fontSize: 12, color: '#969696', minWidth: 100 }}>Kvar:</span> {item.napomena7}</p>
							}
							{item.komentar &&
								<IonIcon style={{position:'absolute', top:12, right:40}} icon={documentTextOutline}></IonIcon>
							}
							<div style={{position:'absolute', top:0, left:5, color:'#333', fontSize:10}}>{i+1}.</div>
						</IonLabel>
					</IonItem>
				})}
			</IonList>
		);
	}


	const handleRefresh = async (e) => {
		// setTimeout(() => {
		// 	e.detail.complete();
		// }, 2000);

		await populateData();
		e.detail.complete();

	}

	const goBack = () => {
		//ionRouter.goBack();
		ionRouter.push('/modules', 'back');
	}

	const onDismissModal = () => {

		setShowFilterModal(false);
		populateData();
	}


	const onHideMasterModal = () => {
		setShowMasterModal(false);
	}


	return (
		<IonPage className='svam-header' ref={pageRef}>
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
						<IonTitle>Radni nalozi - {sifdv}</IonTitle>
					}
				</IonToolbar>
				<IonToolbar className='filterToolbar'>
					<div style={{ textAlign: 'center', paddingBottom: 4 }}>
						{filterText1}<br></br>{filterText2}
					</div>
					{list &&
						<div style={{ textAlign: 'right', borderTop: '1px dotted #d5d5d5', paddingTop: 4, paddingRight: 4 }}><i>Ukupno stavaka: <strong>{list.length}</strong></i></div>
					}
				</IonToolbar>
			</IonHeader>

			<IonContent fullscreen >
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonTitle size="large">Radni nalozi - {sifdv}</IonTitle>
					</IonToolbar>
				</IonHeader>
				<IonRefresher slot="fixed" onIonRefresh={handleRefresh} >
					<IonRefresherContent >
					</IonRefresherContent>
				</IonRefresher>
				{loading &&
					<IonSpinner name='lines' class="spinner-large" ></IonSpinner>
				}
				{!loading &&
					list && list.length > 0 && renderList()
				}
				<IonFab horizontal='end' vertical='bottom' slot="fixed">
					<IonFabButton onClick={(e) => onNewClick(e)} >
						<IonIcon icon={add} />
					</IonFabButton>
				</IonFab>

				<MasterAzur showModal={showMasterModal} item={masterModalItem} onHideModal={onHideMasterModal}></MasterAzur>
			</IonContent>

			<IonModal
				isOpen={showFilterModal}
				onDidDismiss={() => setShowFilterModal(false)}
			>
				<RadniNaloziFilter onDismissModal={() => onDismissModal()}></RadniNaloziFilter>
			</IonModal>


		</IonPage>
	);
};

export default memo(RadniNaloziList);
