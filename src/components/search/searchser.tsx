import { IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonSearchbar, IonSpinner, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import { createRef, useEffect, useRef, useState } from 'react';



import { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { useSelector } from 'react-redux';
import getData from '../../utils/dataHelper';
import NoData from '../NoData';
import { selectDocs } from '../../pages/dgl/store';



interface ContainerProps {
	onClick: any;
	onHideModal: any,
	showModal: boolean;
	debaunce: number;
	sifsklad?: string;
	sifart?: string;
	type?: string;
	data?: any;
	uuid?: string;
}

const SearchSer: React.FC<ContainerProps> = (props) => {
	const auth = useSelector((state: any) => {
		return state.auth;
	});

	const storeDocs = useSelector(selectDocs);	
	

	const [originalData, setOriginalData] = useState<any[]>([]);
	const [searchData, setSearchData] = useState<any[]>([]);

	const [placeholder, setPlaceholder] = useState<string>('Tražilica (minimalno 2 znaka)');

	const modal = useRef<HTMLIonModalElement>(null);
	const searchRef = useRef<HTMLIonModalElement>(null);

	const refSkladiste = useRef<HTMLIonToggleElement>(null);
	const refArtikl = useRef<HTMLIonToggleElement>(null);

	const searchbarRef = createRef<HTMLIonSearchbarElement>();

	const [loading, setLoading] = useState(false);

	const [checkedArtikl, setCheckedArtikl] = useState(true);
	const [checkedSkladiste, setCheckedSkladiste] = useState(true);




	console.log('props.jsonFormValues', props);


	useEffect(() => {
		setSearchData([]);

		if (!storeDocs.dstDataEdit?.sifsklad) {
			setCheckedSkladiste(false);
		} else {
			setCheckedSkladiste(true);
		}

		if (!storeDocs.dstDataEdit?.sifart) {
			setCheckedArtikl(false);
		} else {
			setCheckedArtikl(true);
			getSearchData(null);
		}
		
	}, [props.uuid]);


	useEffect(() => {
		setTimeout(() => {
			if (searchbarRef.current) {
				searchbarRef.current.setFocus();
			}
		}, 300);

	}, [searchbarRef]);




	const getSearchData = async (search: String) => {
		setLoading(true);
		try {

			const json = await getData(getDataDefinition(search), auth);
			if (json) {
				//sifDv = json[0].sifdv
				setOriginalData(json);
				setSearchData(json);
			}
			setLoading(false);
		} catch (error) {
			setLoading(false);
		}

	}

	const getDataDefinition = (search: String) => {
		
		let sifArtChecked = refArtikl?.current?.checked;
		let sifSklChecked = refSkladiste?.current?.checked

		if (sifArtChecked == undefined) {
			sifArtChecked = checkedArtikl;
		}
		if (sifSklChecked == undefined) {
			sifSklChecked = checkedSkladiste;
		}

		console.log('getDataDefinition', sifArtChecked, sifSklChecked, storeDocs.dstDataEdit);


		return {
			queries: [{
				query: 'spMob_DST_Ser',
				params: {
					action: 'get',
					sifsklad: (sifSklChecked ? storeDocs.dstDataEdit?.sifsklad : null),
					sifart: (sifArtChecked ? storeDocs.dstDataEdit?.sifart : null),
					search: search
				},
				commandType: 'sp'
			}]
		}
	}

	const onCheckedSkladiste = () => {
		setSearchData([]);
		const search = searchbarRef?.current?.value;

		setCheckedSkladiste(!checkedSkladiste);

		if (checkedArtikl) {
			setTimeout(() => {
				getSearchData(null);
			}, 500);
		} else if (search && search.length > 1) {
			setTimeout(() => {
				getSearchData(search);
			}, 500);
		}
	}
	const onCheckedArtikl = () => {
		setSearchData([]);
		const chkArtikl= !checkedArtikl;
		setCheckedArtikl(chkArtikl);

		const search = searchbarRef?.current?.value;
		

		if (chkArtikl) {
			setTimeout(() => {
				getSearchData(null);
			}, 500);
		} 
		else if (search && search.length > 1) {
			setTimeout(() => {
				getSearchData(search);
			}, 500);
		}
	}


	function onWillDismiss(ev: CustomEvent<OverlayEventDetail>) {
		props.onHideModal(ev);
	}

	const handleChange = (ev: Event) => {
		let query = "";
		const target = ev.target as HTMLIonSearchbarElement;
		if (target) query = target.value!.toLowerCase();

		if (props.type == 'advanced') {
			if (query.length > 1) {
				getSearchData(query);
			} else {
				setOriginalData([]);
				setSearchData([]);
			}
		}
		else if (props.type != 'advanced') {
			setSearchData(originalData.filter(d => d.name.toLowerCase().indexOf(query) > -1))
		}

		setSearchData(originalData.filter(d => d.name.toLowerCase().indexOf(query) > -1))
	}

	const onClick = (e: any) => {
		props.onClick(e);
	}

	const renderList = () => {

		return (
			<IonList>
				{searchData.map((x, i) => {
					return <IonItem button key={i} onClick={() => onClick(x)}>
						<IonLabel>
							<p><span style={{ color: '#cccccc' }}>Uređaj:</span> {x.serija}</p>
							<p>{x.artikl}</p>
							<p><span style={{ color: '#cccccc' }}>Skladište:</span> {x.skladiste}</p>
							<p><span style={{ color: '#cccccc' }}>Kol. rezervirano / raspoloživo:</span> {x.rezervirano} / {x.raspolozivo}</p>
						</IonLabel>
					</IonItem>
				})}
			</IonList>
		);
	}


	return (
		<IonModal isOpen={props.showModal} ref={modal} onWillDismiss={(ev) => onWillDismiss(ev)}>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="end">
						<IonButton onClick={() => modal.current?.dismiss()}>Odustani</IonButton>
					</IonButtons>
				</IonToolbar>
				<IonToolbar >
					{(storeDocs.dstDataEdit?.sifsklad || storeDocs.dstDataEdit?.sifart) &&
						<IonList style={{paddingRight:10}}>
							{storeDocs.dstDataEdit?.sifsklad &&
								<IonItem>
									<IonToggle ref={refSkladiste} checked={checkedSkladiste} onIonChange={() => onCheckedSkladiste()}>{storeDocs.dstDataEdit?.skladiste}</IonToggle>
								</IonItem>
							}
							{storeDocs.dstDataEdit?.sifart &&
								<IonItem>
									<IonToggle ref={refArtikl} checked={checkedArtikl} onIonChange={onCheckedArtikl}>{storeDocs.dstDataEdit?.artikl}</IonToggle>
								</IonItem>
							}
						</IonList>
					}
					{(!checkedArtikl) &&
						<IonSearchbar debounce={props.debaunce} onIonChange={(ev) => handleChange(ev)} placeholder={placeholder} ref={searchbarRef}  ></IonSearchbar>
					}
				</IonToolbar>
			</IonHeader>

			<IonContent>
				{loading &&
					<IonSpinner name='lines' class="spinner-large" ></IonSpinner>
				}

				{originalData.length > 0 && renderList()}

				{originalData.length == 0 && <NoData></NoData>}
			</IonContent>
		</IonModal>
	);
};

export default SearchSer;
