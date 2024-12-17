import {
	IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem,
	IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonRefresher, IonRefresherContent, IonSearchbar, IonSpinner, IonTitle, IonToolbar,
	useIonRouter
} from '@ionic/react';
import { createRef, memo, useEffect, useRef, useState } from 'react';

//import './Page.css';

import { useDispatch, useSelector } from 'react-redux';

import { getDocsLayout, getFilterDefaults, getList, getListItem, getSettings, getStatuses, selectDocs, setSearchText, setSifDv } from './store';
import { add, search, options, documentTextOutline, closeCircle } from 'ionicons/icons';
import moment from 'moment';
import DglFilter from './components/DglFilter';
import MasterAzur from './components/MasterAzur';

const DglList = (props) => {
	const ionRouter = useIonRouter();
	const dispatch = useDispatch()

	const searchbarRef = createRef();


	const [showMasterModal, setShowMasterModal] = useState(false);
	const [masterModalItem, setMasterModalItem] = useState(null);

	const sifdv = useSelector((state) => state.docs.sifdv);

	const layouts = useSelector((state) => state.docs.layouts);

	//const list = useSelector(selectList);

	const pageRef = useRef(null);

	const [showSearchbar, setShowSearchbar] = useState(false);
	const [showFilterModal, setShowFilterModal] = useState(false);

	const [filterText1, setFilterText1] = useState('');
	const [filterText2, setFilterText2] = useState('');

	const { list, loading, filter } = useSelector(selectDocs)



	useEffect(() => {
		initLoad();
	}, []);

	useEffect(() => {
		if (!filter.statuses)
			return;
		getFilterText();
		populateData();

	}, [filter]);

	useEffect(() => {
        setTimeout(() => {
            if (searchbarRef.current) {
                searchbarRef.current.setFocus();
            }
        }, 300);

    }, [searchbarRef]);


	const initLoad = async () => {
		await dispatch(setSifDv(props.match.params.sifdv));
		await dispatch(getDocsLayout());

		await dispatch(getSettings());

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
		const text2 = `Statusi: ${statusesText?.toLowerCase()}${filter.samomoje ? '; Samo moje stavke' : ''}`

		setFilterText1(text1);
		setFilterText2(text2);
	}


	// const itemLayout = [
	// 	{
	// 		fields: [{ field: 'brojdokumenta' }, { field: 'datumotvaranja', type: 'date', format: 'DD.MM.YYYY', class: 'item-bold' }],
	// 	},
	// 	{
	// 		label: 'Ugovor',
	// 		fields: [{ field: 'nazpred' }],
	// 	},
	// 	{
	// 		label: 'Partner',
	// 		fields: [{ field: 'nazpartnera' }],
	// 		class: 'item-bold'
	// 	},
	// 	{
	// 		label: 'Podružnica',
	// 		fields: [{ field: 'naz2partnera' }],
	// 		class: 'item-bold'
	// 	},
	// 	{
	// 		label: 'Kvar',
	// 		fields: [{ field: 'napomena7' }]
	// 	}
	// ]





	const onItemClick = async (e, item) => {
		e.preventDefault();
		await dispatch(getListItem(item));
		ionRouter.push('/docs/dgltabs');
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
						<IonLabel style={{ paddingLeft: 15 }} className='ion-text-wrap' >{item.classmain}
							{
								layouts.dglListItem.map((layoutItem, i) => {
									return renderListItem(layoutItem, item);
								})
							}
							<div style={{ position: 'absolute', top: 0, left: 5, color: '#333', fontSize: 10 }}>{i + 1}.</div>
							
						</IonLabel>
					</IonItem>
				})}
			</IonList>
		);
	}

	const renderListItem = (layoutItem, item) => {

		const mainLabel = layoutItem["label"] && <span className='item-lbl'>{layoutItem["label"]}: </span>;
		const response = layoutItem.fields.map((field, index) => {
			const value = getItemValue(field, item, index);
			return value && <><span className={`${layoutItem['class']}`}>{value}</span></>
		})
		return response.length>0 && response[0]!='' && <p className={`${layoutItem['classmain'] || 'one-line'}`}>{mainLabel}{response}</p>;
	}

	const getItemValue = (layoutItem, item, index) => {
		let value = item[layoutItem["field"]];
		if (!value)
			return '';

		if (layoutItem.format) {
			if (layoutItem.type == 'date') {
				value = moment(value).format('DD.MM.YYYY')
			}
		}
		return <>{index > 0 ? <span>&nbsp;&nbsp;&nbsp;</span> : ''}<span className={layoutItem.class}>{value}</span></>;
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
						<IonSearchbar ref={searchbarRef} showCancelButton="always" placeholder="Pretraga..." onIoninput={(e) => dispatch(setSearchText(e.detail.value))} onIonCancel={() => setShowSearchbar(false)}></IonSearchbar>
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
					layouts && list && list.length > 0 && renderList()
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
				<DglFilter onDismissModal={() => onDismissModal()}></DglFilter>
			</IonModal>


		</IonPage>
	);
};

export default memo(DglList);
