import { IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonFooter, IonHeader, IonIcon, IonInput, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonSearchbar, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import { memo, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';

import _ from 'lodash';

import './Tab1.css';

import Search from '../../../../components/search/simple/search';
import { useDispatch, useSelector } from 'react-redux';
import { changeStatusDgl } from '../store';
import TabsTitle from './TabsTitle';
import moment from 'moment';
import MasterAzur from '../components/MasterAzur';
import { arrowBack, create } from 'ionicons/icons';

const Tab1 = (props) => {
	const dispatch = useDispatch();
	const router = useIonRouter();
	const listItem = useSelector((state) => state.servis.radniNalozi?.data);
	const sifdv = useSelector((state) => state.servis.radniNalozi?.sifdv);


	const [showMasterModal, setShowMasterModal] = useState(false);
	const [masterModalItem, setMasterModalItem] = useState(null);
	
	// useEffect(() => {
	// 	setOriginalData(listItem);
	// }, [listItem]);


	const getInfoText = (text) => {
		if (text) {
			return text;
		}
		return '---';
	}

	const onCloseClick = (e) => {
		dispatch(changeStatusDgl(listItem.dglid));
	    goBack();
	}



	const onEditClick = (e) => {
		e.preventDefault();
		handleShowMasterModal(listItem);
	}

	const handleShowMasterModal = (item) => {
		setMasterModalItem(item)
		setShowMasterModal(true);
	}

	const onHideMasterModal = () => {
		setShowMasterModal(false);
	}

	const goBack = () => {
    
		router.push(`/servis/radninalozi/${sifdv}`, 'none');
	  }


	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						{/* <IonBackButton /> */}
						<IonButton onClick={() => goBack()}>
							<IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
						</IonButton>
					</IonButtons>
					<IonTitle>
						<TabsTitle />
					</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent fullscreen >
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonTitle size="small">
							<TabsTitle />
						</IonTitle>
					</IonToolbar>
				</IonHeader>
				<IonItemGroup>
					<IonItemDivider color={'light'} >
						<IonLabel slot={'start'} style={{color: listItem?.indcolor}}><strong>{listItem?.status}</strong></IonLabel>
						<IonLabel slot={'end'} style={{color: '#ccc', paddingRight:8}}>
							{listItem.dglid}
						</IonLabel>
					</IonItemDivider>
				</IonItemGroup>
				<IonItemGroup>
					<IonItemDivider color={'light'}>
						<IonLabel>Partner:</IonLabel>
					</IonItemDivider>
					<IonItem>
						<IonLabel className="ion-text-wrap">
							<strong><p>{listItem?.nazpartnera}</p></strong>
						</IonLabel>
					</IonItem>
					{listItem?.naz2partnera &&
					<IonItem>
						<IonLabel className="ion-text-wrap">
							<h3>Podružnica:</h3>
							<p>{listItem?.naz2partnera}</p>
						</IonLabel>
					</IonItem>
					}
					<IonItem lines={'none'}>
						<IonLabel className="ion-text-wrap">
							<h3>Ugovor:</h3>
							<p>{getInfoText(listItem?.nazpred)}</p>
						</IonLabel>
					</IonItem>
				</IonItemGroup>
				<IonItemGroup>
					<IonItemDivider color={'light'}>
						<IonLabel>Osobe:</IonLabel>
					</IonItemDivider>
					<IonItem>
						<IonLabel className="ion-text-wrap">
							<h3>Izradio:</h3>
							<p>{listItem?.izradio}</p>
						</IonLabel>
					</IonItem>
					<IonItem>
						<IonLabel className="ion-text-wrap">
							<h3>Nalogodavac:</h3>
							<p>{getInfoText(listItem?.nalogodavac)}</p>
						</IonLabel>
					</IonItem>
					<IonItem lines={'none'}>
						<IonLabel className="ion-text-wrap">
							<h3>Serviser:</h3>
							<p>{getInfoText(listItem?.serviser)}</p>
						</IonLabel>
					</IonItem>
					
				</IonItemGroup>
				<IonItemGroup>
					<IonItemDivider color={'light'}>
						<IonLabel>Opis kvara:</IonLabel>
					</IonItemDivider>
					<IonItem  lines={'none'}>
						{listItem?.napomena7 &&
							<div style={{fontSize: 14, color:'#666666'}} dangerouslySetInnerHTML={{__html: listItem?.napomena7.replace('\n', "<br>")}}></div> 
						}
					</IonItem>
				</IonItemGroup>
				<IonItemGroup>
					<IonItemDivider color={'light'}>
						<IonLabel>Napomena voditelja:</IonLabel>
					</IonItemDivider>
					<IonItem  lines={'none'} >
						{listItem?.napomena5 &&
							<div style={{fontSize: 14, color:'#666666'}} dangerouslySetInnerHTML={{__html: listItem?.napomena5.replace('\n', "<br>")}}></div>
						}
					</IonItem>
				</IonItemGroup>
				<IonItemGroup>
					<IonItemDivider color={'light'}>
						<IonLabel>Datumi:</IonLabel>
					</IonItemDivider>
					<IonItem>
						<IonLabel className="ion-text-wrap">
							<h3>Datum otvaranja:</h3>
							<p>{moment(listItem?.datumotvaranja).format('DD.MM.YYYY.')}</p>
						</IonLabel>
					</IonItem>
					<IonItem>
						<IonLabel className="ion-text-wrap">
							<h3>Datum izvršenja:</h3>
							<p>{moment(listItem?.datumizvrsenja).format('DD.MM.YYYY.')}</p>
						</IonLabel>
					</IonItem>
				</IonItemGroup>
				{listItem?.editable && 
					<>
					<div style={{padding:10}}>
						<IonButton expand='full' color='dark' onClick={(e) => onCloseClick(e)}>ZAVRŠI</IonButton>
					</div>

				
					
					<IonFab horizontal='end' vertical='bottom' slot="fixed">
						<IonFabButton onClick={(e) => onEditClick(e)} >
							<IonIcon icon={create} />
						</IonFabButton>
					</IonFab>
					

					<MasterAzur showModal={showMasterModal} item={masterModalItem} onHideModal={onHideMasterModal}></MasterAzur>
					</>
				}
			</IonContent>
		</IonPage>
	);
};

export default memo(Tab1);
