import { IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonFooter, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonSearchbar, IonTextarea, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import moment from 'moment';
import { createRef, memo, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from '../../../../components/datetime/datepicker';
import Search from '../../../../components/search/simple/search';

import { getData } from '../../../../utils/dataHelper';
import { saveDGL, saveDoc, selectRadniNalozi } from '../store';



const MasterAzur = (props) => {
  const dispatch = useDispatch()
  const router = useIonRouter();

  const commentRef = createRef();

  const modal = useRef(null);

  const sifOsobe = useSelector((state) => state.auth?.user?.sifosobe);
  const sifOsobeName = useSelector((state) => state.auth?.user?.name);
  const storeRadniNalozi = useSelector(selectRadniNalozi);

  const [showModal, setShowModal] = useState(false);
  const [modalEntity, setModalEntity] = useState('');
  const [modalParentId, setModalParentId] = useState('');
  const [modelType, setModalType] = useState('');
  const [modalDebaunce, setModalDebaunce] = useState(200);

  const [showDateModal, setShowDateModal] = useState(false);
  const [modalDateValue, setModalDateValue] = useState(null);

  const [title, setTitle] = useState('Unos novog radnog naloga');


  const [partnerBeforeModal, setPartnerBeforeModal] = useState({ id: null, name: '...' });
  const [partner, setPartner] = useState({ id: null, name: '...' });
  const [podruznica, setPodruznica] = useState({ id: null, name: '...' });
  const [ugovor, setUgovor] = useState({ id: null, name: '...' });
  const [serviser, setServiser] = useState({ id: null, name: '...' });
  const [vrstePosla, setVrstePosla] = useState({ id: null, name: '...' });
  const [mjestaTroska, setMjestaTroska] = useState({ id: null, name: '...' });
  

  const [datumIzvrsenja, setDatumIzvrsenja] = useState({ value: null });

  useEffect(() => {
    if (!props.showModal)
      return;


    if (props.item?.dglid) {
      setTitle(`Editiranje RN - ${props.item?.brojdokumenta}`);
    }
  

    setPartnerBeforeModal({ id: null, name: '...' });
    setPartner({ id: null, name: '...' });
    setPodruznica({ id: null, name: '...' });
    setUgovor({ id: null, name: '...' });
    setVrstePosla({ id: null, name: '...' });
    setMjestaTroska({ id: null, name: '...' });


    if (props.item?.dglid) {
      setServiser({ id: props.item?.serviserid, name: props.item?.serviser ? props.item?.serviser : '...' });
      setDatumIzvrsenja({ value: moment(props.item?.datumizvrsenja).format('YYYY-MM-DD') });
    } else {
      setServiser({ id: sifOsobe, name: sifOsobeName });
      setDatumIzvrsenja({ value: moment().format('YYYY-MM-DD') });
    }


  }, [props.showModal]);


  function onWillDismiss(e) {
    props.onHideModal(e);
  }

  const onDateModalConfirm = (e) => {
    setDatumIzvrsenja({ value: e });
    setShowDateModal(false);
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

  const handleShowDateModal = (value, key) => {
    setModalDateValue(value);
    setShowDateModal(!showDateModal);
  }


  const onHideModal = (e) => {
    setShowModal(false);
  }


  const onClickSpremi = async (e) => {
    // if (listItem?.dglid) {
    // 	//ažuriranje
    // } else {
    // 	//spremanje

    // }






    let formData = {
      datumdokumenta: moment(datumIzvrsenja.value).format('YYYYMMDD'),
      poduzecesifosobe: serviser.id,
    }

    if (!props.item?.dglid) {

      if (!partner.id) {
        alert("Obavezan unos partnera.");
        return;
      }
      if (!ugovor.id) {
        alert("Obavezan unos ugovora.");
        return;
      }
      if (!vrstePosla.id) {
        alert("Obavezan unos vrste poosla.");
        return;
      }
      if (!mjestaTroska.id) {
        alert("Obavezan unos mjesta troška.");
        return;
      }



      let formComment = commentRef.current.value;
      if (formComment) {
        formComment = formComment.replace("\n", "\r\n");
      }

      formData = {
        ...formData,
        sifdv: storeRadniNalozi.sifdv,
        datumopcije: moment().format('YYYYMMDD'),
        sifpartnera: partner.id,
        dodadresaid: podruznica.id,
        sifpred: ugovor.id,
        napomena7: formComment,
        sifmjtr: mjestaTroska.id,
        sifvrsteposla: vrstePosla.id
      }
    }

    const data = await dispatch(saveDGL({ dglid: props.item?.dglid, formData: formData }))

    props.onHideModal(e);

    if (!props.item?.dglid) {
      router.push('/servis/radninalozitabs');
    }
  }



  const onClick = (e) => {
    if (modalEntity == 'partner') {
      setPartner(e);
      if (e.id != partnerBeforeModal.id) {
        setPodruznica({ id: null, name: null });
      }
    }
    else if (modalEntity == 'serviser') {
      setServiser(e);
    }
    else if (modalEntity == 'podruznica') {
      setPodruznica(e);
    }
    else if (modalEntity == 'pred') {
      setUgovor({ id: e.id, name: e.name });
      setPartner({ id: e.sifpartnera, name: e.nazpartnera });
      if (e.sifpartnera != partnerBeforeModal.id) {
        setPodruznica({ id: null, name: null });
      }
    }
    else if (modalEntity == 'vrsteposla') {
      setVrstePosla({ id: e.id, name: e.name });
    }
    else if (modalEntity == 'mjestatroska') {
      setMjestaTroska({ id: e.id, name: e.name });
    }
    setShowModal(false);
  }


  return (
    <>
      <IonModal isOpen={props.showModal} ref={modal} onWillDismiss={(ev) => onWillDismiss(ev)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle size="small">{title}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => modal.current?.dismiss()}>Odustani</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          <IonLabel>Serviser:</IonLabel>
          <IonButton className='ion-text-wrap' style={{ height: 44 }} onClick={() => handleShowModal('serviser', 'simple', 200, null)} expand="block" fill={serviser.id ? 'solid' : 'outline'}>
            {serviser.name}
          </IonButton>
          <div style={{ paddingTop: 8 }}>
            <IonLabel>Datum izvršenja:</IonLabel>
            <IonButton mode="ios" className='ion-text-wrap' onClick={() => handleShowDateModal(datumIzvrsenja.value, 'datumod')} expand="block">
              {moment(datumIzvrsenja.value).format("DD.MM.YYYY")}
            </IonButton>
          </div>
          {!props.item?.dglid &&
            <>
              <div style={{ paddingTop: 8 }}>
                <IonLabel>Ugovor:</IonLabel>
                <IonButton className='ion-text-wrap' style={{ height: 44 }} onClick={() => handleShowModal('pred', 'simple', 200, null)} expand="block" fill={ugovor.id ? 'solid' : 'outline'}>
                  {ugovor.name}
                </IonButton>
              </div>
              <div style={{ paddingTop: 8 }}>
                <IonLabel>Partner:</IonLabel>
                <IonButton className='ion-text-wrap' style={{ height: 44 }} onClick={() => handleShowModal('partner', 'advanced', 500, null)} expand="block" fill={partner.id ? 'solid' : 'outline'}>
                  {partner.name}
                </IonButton>
              </div>
            </>
          }
          {!props.item?.dglid &&
            <>
              <div style={{ paddingTop: 8 }}>
                <IonLabel>Podružnica:</IonLabel>
                <IonButton className='ion-text-wrap' style={{ height: 44 }} onClick={() => handleShowModal('podruznica', 'simple', 200, partner.id)} expand="block" fill={podruznica.id ? 'solid' : 'outline'}>
                  {podruznica.name}
                </IonButton>
              </div>
              <div style={{ paddingTop: 8 }}>
                <IonLabel>Vrsta posla:</IonLabel>
                <IonButton className='ion-text-wrap' style={{ height: 44 }} onClick={() => handleShowModal('vrsteposla', 'simple', 200, null)} expand="block" fill={podruznica.id ? 'solid' : 'outline'}>
                  {vrstePosla.name}
                </IonButton>
              </div>
              <div style={{ paddingTop: 8 }}>
                <IonLabel>Mjesto troška:</IonLabel>
                <IonButton className='ion-text-wrap' style={{ height: 44 }} onClick={() => handleShowModal('mjestatroska', 'simple', 200, null)} expand="block" fill={podruznica.id ? 'solid' : 'outline'}>
                  {mjestaTroska.name}
                </IonButton>
              </div>
              <div style={{ paddingTop: 15 }}>
                <IonLabel>Opis kvara:</IonLabel>
                <IonTextarea placeholder="..." autoGrow={true} style={{ border: '1px solid #ccc', minHeight: 150, whiteSpace: 'pre-wrap' }} ref={commentRef}></IonTextarea>
              </div>
            </>
          }

          <Search entity={modalEntity} showModal={showModal} type={modelType} onClick={onClick} onHideModal={onHideModal} debaunce={modalDebaunce} parentId={modalParentId}></Search>
        </IonContent>

        <IonFooter>
          <IonToolbar className='ion-text-center'>
            <div style={{ padding: 12 }}>
              <IonButton onClick={onClickSpremi} expand='block' color={'dark'} fill={'solid'}>Spremi</IonButton>
            </div>
          </IonToolbar>
        </IonFooter>
      </IonModal>

      <DatePicker showModal={showDateModal} onModalConfirm={onDateModalConfirm} value={modalDateValue}></DatePicker>

    </>
  );
};

export default memo(MasterAzur);
