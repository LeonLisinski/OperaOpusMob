import { IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonFooter, IonHeader, IonIcon, IonInput, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonSearchbar, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import { memo, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';



import _ from 'lodash';

import './Tab1.css';

import Search from '../../../components/search/simple/search';
import { useDispatch, useSelector } from 'react-redux';
import { changeStatusDgl } from '../store';
import TabsTitle from './TabsTitle';
import moment from 'moment';
import MasterAzur from '../components/MasterAzur';
import { create } from 'ionicons/icons';

const Tab1 = (props) => {
	const dispatch = useDispatch();
	const router = useIonRouter();
	const root = useSelector((state) => state.docs);
	const listItem = useSelector((state) => state.docs.data);

	const layouts = useSelector((state) => state.docs.layouts);

	const [showMasterModal, setShowMasterModal] = useState(false);
	const [masterModalItem, setMasterModalItem] = useState(null);

	var isHTML = RegExp.prototype.test.bind(/(<([^>]+)>)/i);


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

	const goBack = () => {
		router.push(`/docs/dgl/${root.sifdv}`, 'none');
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



	const renderLayout = () => {
		return layouts.dglViewItems.map((group, index) => {
			return renderGroups(group)
		})
	}

	const renderGroups = (item) => {
		if (item.visiblefield && listItem[item.visiblefield] == false) {
			return null;
		}

		return <IonItemGroup>
			<IonItemDivider color={'light'}>
				<IonLabel>{item.caption}</IonLabel>
			</IonItemDivider>
			{renderGroupItems(item)}
		</IonItemGroup>
	}


	const renderGroupItems = (group) => {
		return group.items.map((item, index) => {
			return renderGroupItem(item, index);
		})
	}
	const renderGroupItem = (item, index) => { 

		if (item.visiblefield && listItem[item.visiblefield] == false) {
			return null;
		}

		return <IonItem lines={item.lines == false && 'none'} key={index}>
				<IonLabel className="ion-text-wrap">
					{item.caption && <h3>{item.caption}</h3>}
					{renderGroupItemValue(item)}
					{/* <p className={item.class}>{listItem[item.field]}</p> */}
				</IonLabel>
			</IonItem>
	}

	const renderGroupItemValue = (item) => {
		var value = listItem[item.field];

		
		if (item.visiblefield && listItem[item.visiblefield] == false) {
			return null;
		}
		
		if (!value) {
			value = getInfoText(value);
			
		} else {
			if (item.type == 'date' && item.format) {
				value = moment(value).format(item.format);
			}
			else if (item.type == 'multiline') {
			 	value = <div className={item.class} dangerouslySetInnerHTML={{ __html: value?.replace('\n', "<br>") }}></div>
			}
			else if (item.type == 'url') {
				value=<a target="_blank" href={value}>{item.urlcaption}</a>
			}
		}


		if (isHTML(value)) {
			return <p className={item.class} dangerouslySetInnerHTML={{ __html: value }}></p>;
		} else {
			return <p className={item.class}>{value}</p>
		}

		
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

			<IonContent fullscreen >
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonTitle size="small">
							<TabsTitle />
						</IonTitle>
					</IonToolbar>
				</IonHeader>

				{renderLayout()}
				
				
					<>
						{listItem?.finishable &&
							<div style={{ padding: 10 }}>
								<IonButton expand='full' color='dark' onClick={(e) => onCloseClick(e)}>ZAVRŠI</IonButton>
							</div>
						}
						
						{listItem?.editable &&
							<IonFab horizontal='end' vertical='bottom' slot="fixed">
								<IonFabButton onClick={(e) => onEditClick(e)} >
									<IonIcon icon={create} />
								</IonFabButton>
							</IonFab>
						}
						
						<MasterAzur showModal={showMasterModal} item={masterModalItem} onHideModal={onHideMasterModal}></MasterAzur>
					</>
				
			</IonContent>
		</IonPage>
	);
};

export default memo(Tab1);
