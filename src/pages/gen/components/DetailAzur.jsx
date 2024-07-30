import { IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonFooter, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonSearchbar, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import { createRef, memo, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Search from '../../../components/search/simple/search';

import { saveGla } from '../store';



const DetailAzur = (props) => {

  const dispatch = useDispatch()

  const modal = useRef(null);
  const commentRef = createRef();
  const kolicinaRef = createRef();

  const [showModal, setShowModal] = useState(false);
  const [modalParentId, setModalParentId] = useState('');

  const [artikl, setArtikl] = useState({ id: null, name: '...' });
  const [opis, setOpis] = useState(null);
  const [kolicina, setKolicina] = useState(null);

  

  useEffect(() => {
    setArtikl({ id: props.item?.sifart, name: props.item ? props.item.artikl : '...' });
    setOpis(props.item?.opisartikla);
    setKolicina(props.item?.kol);
  }, [props.showModal]);


  function onWillDismiss(e) {
    props.onHideModal(e);
  }

  const handleShowModal = (parentId) => {
    setModalParentId(parentId);
    setShowModal(true);
  }

  const onClick = (e) => {
    setArtikl(e);
    setShowModal(false);
  }

  const onHideModal = (e) => {
    setShowModal(false);
  }


  const onClickSpremi = async (e) => {
    const formComment = commentRef.current.value;
    const formKolicina = kolicinaRef.current.value;
    const formData = {
      dstid: props.item?.dstid,
      opis: formComment,
      sifart: artikl.id,
      kolicina: formKolicina
    }

    console.log('formData', formData);
    //return;

    await dispatch(saveGla({ formData: formData }));
    modal.current?.dismiss();
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
        </IonHeader>

        <IonContent className="ion-padding">
          <IonLabel>Naziv:</IonLabel>
          <IonButton className='ion-text-wrap' style={{ minHeight: 70 }} onClick={() => handleShowModal('USL')} expand="block" fill={artikl.id ? 'solid' : 'outline'}>
            {artikl.name}
          </IonButton>
          <div style={{ paddingTop: 15 }}>
            <IonLabel>Količina:</IonLabel>
            <IonInput type="number" style={{border: '1px solid #ccc', marginTop:6}}  ref={kolicinaRef} value={kolicina}></IonInput>
          </div>
          <div style={{ paddingTop: 15 }}>
            <IonLabel>Opis:</IonLabel>
            <IonTextarea placeholder="..." autoGrow={true} style={{ border: '1px solid #ccc', minHeight: 150 }} ref={commentRef} value={opis}></IonTextarea>
          </div>
        </IonContent>
        <IonFooter>
          <IonToolbar className='ion-text-center'>
            <div style={{ padding: 12 }}>
              <IonButton onClick={onClickSpremi} expand='block' color={'dark'} fill={'solid'}>Spremi</IonButton>
            </div>
          </IonToolbar>
        </IonFooter>
      </IonModal>

      <Search entity={'artikl'} type='advanced' showModal={showModal} onClick={onClick} onHideModal={onHideModal} debaunce={500} parentId={modalParentId} ></Search>
    </>
  );
};

export default DetailAzur;
