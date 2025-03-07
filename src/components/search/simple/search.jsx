import { IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonSearchbar, IonTitle, IonToolbar } from '@ionic/react';
import { createRef, useEffect, useRef, useState } from 'react';

import { getData } from '../../../utils/dataHelper';

import { useSelector } from 'react-redux';




const Search = (props) => {

	const auth = useSelector((state) => {
		return state.auth;
	});	

	const docs = useSelector((state) => {
		return state.docs;
	});	

	const servis = useSelector((state) => {
		return state.servis;
	});	

	const gen = useSelector((state) => {
		return state.gen;
	});	
	
	const core = useSelector((state) => {
		return state.core;
	});	

	const [originalData, setOriginalData] = useState([]);
	const [searchData, setSearchData] = useState([]);

	const [placeholder, setPlaceholder] = useState('Tražilica');

	const [showModalStanje, setShowModalStanje] = useState(false);

	const [stanjeArtiklaData, setStanjeArtiklaData] = useState(null);

	const modal = useRef(null);
	const modalStanje = useRef(null);

	const searchRef = useRef(null);

	const searchbarRef = createRef();

	


	useEffect(() => {
		setSearchData([]);
		if (props.type != 'advanced') {
			setPlaceholder(`Tražilica`);
			getSearchData(null);
		} else {
			setPlaceholder(`Tražilica (minimalno ${props.minLength ? props.minLength : 2} znaka)`);
		}

		//const target = ev.target as HTMLIonSearchbarElement;

	}, [props.entity]);


	useEffect(() => {
		setTimeout(() => {
			if (searchbarRef.current) {
				searchbarRef.current.setFocus();
			}
		}, 300);

	}, [searchbarRef]);




	const getSearchData = async (search) => {
		const json = await getData(getDataDefinition(search), auth);
		if (json) {
			//sifDv = json[0].sifdv
			setOriginalData(json);
			setSearchData(json);
		}
	}

	const getDataDefinition = (search) => {
		if (props.entity) {
			let sp = 'spMob_DGL_Sifarnici';
			if (props.sp) {
				sp=props.sp;
			}

			let params = {
				action: props.entity,
				korIme: auth.user?.korime,
				parentId: props.parentId,
				search: search
			};

			if (props.app == 'crm') {
				params = {...params, id: gen?.data?.id}
			} else {
				params = {...params, sifdv: core?.cc?.selectedModule?.sifdv || docs?.sifdv || servis?.sifdv}
			}


			return {
				queries: [{
					query: sp,
					params: params,
					commandType: 'sp'
				}]
			}
		}
	}


	function onWillDismiss(ev) {

		props.onHideModal(ev);
	}

	function onWillDismissStanje(ev) {

		setShowModalStanje(false);
	}



	const handleChange = (ev) => {
		let query = "";
		const target = ev.target;
		if (target) query = target.value.toLowerCase();

		if (props.type == 'advanced') {
			if (query.length >= (props.minLength ? props.minLength : 2)) {
				getSearchData(query);
			} else {
				setOriginalData([]);
				setSearchData([]);
			}
		}
		else if (props.type != 'advanced') {
			setSearchData(originalData.filter(d => d.name.toLowerCase().indexOf(query) > -1))
		}


	}

	const onClick = (e) => {
		props.onClick(e);
		//modal.current?.dismiss()
	}


	const getObjectValue = (x, keyName) => {
		
		let objValue;
		Object.entries(x).map(([key, value]) => {
			if (key == keyName) {
				objValue = value;
			} 
		});

		return objValue;

	}

	const createItem = (masterItem, item) => {
		const value=masterItem[item];
		if (value) {
			return (<div className="ion-text-wrap">{value}</div>)
		}
	}


	
    const onClickProvjeriStanje = async(e, item, index) => {
		console.log('item', item);


		const queries = [{
			query: 'spMob_ArtiklStanje_Query',
			params: {
				sifart: item.id,
			},
			commandType: 'sp'
		}]
	
		const data = await getData({ queries }, auth);

		console.log('data', data);

		setStanjeArtiklaData(data);

		setShowModalStanje(true);


        closeSlidingItem(index);
    }

	const closeSlidingItem = (index) => {
		const slidingItem = document.getElementById(`slidingItem${index + 1}`);
		slidingItem?.close();
	}

	

	const renderList = () => {
		return (
			<IonList>
				{searchData.map((x, i) => {
					return <IonItemSliding id={`slidingItem${i + 1}`} key={`slidingItem${i + 1}`}>     
						<IonItem button key={i} onClick={() => onClick(x)} detail={true} >
							<IonLabel>
								<h3 className="ion-text-wrap">{getObjectValue(x, 'name')}</h3>
								{props.items && props.items.map((item) => {
									return createItem(x, item);
								})
								}
							</IonLabel>
						</IonItem>
						
						{(props.entity == 'artikl' || props.entity == 'artikl-jukic') &&
						<IonItemOptions side="end">
                                <IonItemOption style={{ minWidth: 100 }} color="primary" onClick={(e) => onClickProvjeriStanje(e, x, i)}>Stanje zaliha</IonItemOption>
                        </IonItemOptions>
						}
					</IonItemSliding>
				})}
			</IonList>

			//   return <IonItem key={i}>
			//   <IonLabel>{x.korime}</IonLabel>
			// </IonItem>


		);
	}


	return (

		<>
		<IonModal isOpen={props.showModal} ref={modal} onWillDismiss={(ev) => onWillDismiss(ev)}>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="end">
						<IonButton onClick={() => modal.current?.dismiss()}>Odustani</IonButton>
					</IonButtons>
				</IonToolbar>
				<IonToolbar >
					<IonSearchbar debounce={props.debaunce} onIonInput={(ev) => handleChange(ev)} placeholder={placeholder} ref={searchbarRef}  ></IonSearchbar>
				</IonToolbar>
			</IonHeader>

			<IonContent>
				{originalData.length > 0 && renderList()}
			</IonContent>

		</IonModal>


		<IonModal isOpen={showModalStanje} ref={modalStanje} onWillDismiss={(ev) => onWillDismissStanje(ev)}>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="end">
						<IonButton onClick={() => modalStanje.current?.dismiss()}>zatvori</IonButton>
					</IonButtons>
					<IonTitle>Stanje zaliha</IonTitle>
				</IonToolbar>
				
			</IonHeader>

			
			<IonContent>
				{stanjeArtiklaData &&  stanjeArtiklaData.table1 &&
				<>
				<div style={{padding:8, background:'#f1f1f1', borderBottom: '1px solid #ccc'}}>
					<div>{stanjeArtiklaData.table1[0].sifart}</div>
					<div><b>{stanjeArtiklaData.table1[0].nazart}</b></div>
				</div>
				<div>
				<IonList>
                {stanjeArtiklaData.table2 && stanjeArtiklaData.table2.map((item, i) => {            
                        return <IonItem key={i}>
							<table>
								<tr>
									<td>Skladište:</td>
									<td>{item.sifsklad} - {item.nazsklad}</td>
								</tr>
								<tr>
									<td>Serija:</td>
									<td>{item.sifser}</td>
								</tr>
								<tr>
									<td>Pozicija:</td>
									<td>{item.sifpoz}</td>
								</tr>
								<tr>
									<td>Količina:</td>
									<td><b>{item.kol}</b></td>
								</tr>
							</table>
						</IonItem>
				 })}
				</IonList>
				</div>
				</>
				}
			</IonContent>

		</IonModal>

		</>
	);
};

export default Search;
