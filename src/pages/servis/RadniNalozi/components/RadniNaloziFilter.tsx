import React, { useCallback, useEffect, useState } from 'react';

import { getMode } from '@ionic/core';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonContent, IonList, IonListHeader, IonItem, IonLabel, IonCheckbox, IonFooter, IonIcon, IonSegment, IonSegmentButton, IonDatetime, IonModal } from '@ionic/react';
import { logoAngular, call, document, logoIonic, hammer, restaurant, cog, colorPalette, construct, compass } from 'ionicons/icons';

import './RadniNaloziFilter.css'
import { useDispatch, useSelector } from 'react-redux';
import { selectRadniNalozi, setApplyFilters, setFilter, setFilterStatuses, setFilterTemp, setFilterTempStatuses, setFilterTempValues } from '../store';
import DatePicker from '../../../../components/datetime/datepicker';
import moment from 'moment';



const RadniNaloziFilter = (props) => {

  const dispatch = useDispatch();

  const [segmentValue, setSegmentValue] = useState('statusi');

  const { filtertemp } = useSelector(selectRadniNalozi)

  const [showDateModal, setShowDateModal] = useState(false);


  const [modalDateControl, setModalDateControl] = useState(null);
  const [modalDateValue, setModalDateValue] = useState(null);

  const [filterKey, setFilterKey] = useState(null);

  useEffect(() => {
		dispatch(setFilterTemp(null))
	}, []);


  // const handleToggleModal = () => {
  //   setShowDateModal(!showDateModal);
  // };

  const onClickOk = async (e) => {
    await dispatch(setApplyFilters(null));
    props.onDismissModal();
  }


  const handleShowDateModal = (value, key) => {
    setModalDateValue(value);
    setFilterKey(key);
    setShowDateModal(!showDateModal);
  }

  const onModalConfirm = (e) => {
    dispatch(setFilterTempValues({[filterKey]: e}));
    setShowDateModal(false);
  }

  const onHideDateModal = (e) => {
    //setShowDateModal(false);
  }

  const toggleStatus = (e, item) => {
    const statusItem = {...item, ...{checked: e.detail.checked} }
    console.log("statusItem",statusItem);
    dispatch(setFilterTempStatuses(statusItem));
  }


  return (
    <>
      <IonHeader translucent={true} className="svam-filter-header session-list-filter">
        <IonToolbar className="svam-title-toolbar">
          <IonButtons slot="start">
            {/* <IonButton onClick={handleDeselectAll}>Reset</IonButton> */}
          </IonButtons>

          <IonTitle>
            Filter
          </IonTitle>

          <IonButtons slot="end">
            <IonButton onClick={props.onDismissModal} strong>Odustani</IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={segmentValue} onIonChange={(e) => {
            setSegmentValue(e.detail.value);
          }}>
            <IonSegmentButton value="statusi">
              Statusi
            </IonSegmentButton>
            <IonSegmentButton value="ostalo">
              Ostalo
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent className="session-list-filter">
        {segmentValue == 'statusi' &&
          <IonList lines={'full'}>

            {filtertemp && filtertemp.statuses && filtertemp.statuses.map((item, index) => (
              <IonItem key={item.id} className='ion-no-padding'>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: item.indcolor }}></div>
                <IonLabel style={{ paddingLeft: 15 }}>{item.name}</IonLabel>
                <IonCheckbox
                  onIonChange={(e) => toggleStatus(e, item)}
                  checked={item.checked}
                  color="primary"
                  value={item.checked}
                ></IonCheckbox>
              </IonItem>
            ))}
          </IonList>
        }

        {segmentValue != 'statusi' &&
          <>
            <div style={{ padding: 10 }}>
              <div>
                <IonButton mode="ios" className='ion-text-wrap' onClick={() => handleShowDateModal(filtertemp.datumod, 'datumod')} expand="block">
                  Datum od: {moment(filtertemp.datumod).format("DD.MM.YYYY")}
                </IonButton>
              </div>
              <div style={{ paddingTop: 10 }}>
                <IonButton mode="ios" className='ion-text-wrap' onClick={() => handleShowDateModal(filtertemp.datumdo, 'datumdo')} expand="block">
                  Datum do: {moment(filtertemp.datumdo).format("DD.MM.YYYY")}
                </IonButton>
              </div>
            </div>
          </>
        }
        <DatePicker showModal={showDateModal} onHideModal={onHideDateModal} onModalConfirm={onModalConfirm} control={modalDateControl} value={modalDateValue}></DatePicker>
      </IonContent>
      <IonFooter>
        <IonToolbar className='ion-text-center'>
          <div style={{ padding: 12 }}>
            <IonButton onClick={onClickOk} expand='block' color={'dark'} fill={'solid'}>Potvrdi</IonButton>
          </div>
        </IonToolbar>
      </IonFooter>
    </>
  );
};

export default RadniNaloziFilter
