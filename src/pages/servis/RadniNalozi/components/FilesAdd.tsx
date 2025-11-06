import { IonButton, IonButtons, IonCol, IonContent, IonFooter, IonGrid, IonHeader, IonImg, IonModal, IonRow, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import { memo, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { base64FromPath, usePhotoGallery } from "../../../../hooks/usePhotoGallery";
import { Camera } from "@capacitor/camera";

import { FileOpener } from '@capawesome-team/capacitor-file-opener';
import { FilePicker } from '@capawesome/capacitor-file-picker';

import { Filesystem, Directory } from '@capacitor/filesystem';



const FilesAdd = (props) => {
  const dispatch = useDispatch()
  const router = useIonRouter();

  const { deletePhoto, photos, takePhoto, pickPhoto, pickMedia } = usePhotoGallery();

  const modal = useRef(null);

  const [title, setTitle] = useState('Dodavanje privitaka');

  useEffect(() => {
    
  }, [props.showModal]);


  function onWillDismiss(e) {
    props.onHideModal(e);
  }


  const openFile = async (photo) => {
     // 6. In case the file did already exists -> we retrieve it

     let file = null;
     file = await Filesystem.getUri({
      path: photo.filePath,
      directory: Directory.Cache,
    })
      .then((savedFile) => {
        return savedFile.uri
      })
      .catch((error) => {
        throw new Error('Cannot save/open the file')
      })

      await FileOpener.openFile({
        path: file,
      });


      file = await Filesystem.getUri({
        path: photo.filePath,
        directory: Directory.Data,
      })
        .then((savedFile) => {
          return savedFile.uri
        })
        .catch((error) => {
          throw new Error('Cannot save/open the file')
        })

          await FileOpener.openFile({
            path: file,
          });


        file =  await Filesystem.getUri({
          path: photo.filePath,
          directory: Directory.External,
        })
          .then((savedFile) => {
            return savedFile.uri
          })
          .catch((error) => {
            throw new Error('Cannot save/open the file')
          })
          await FileOpener.openFile({
            path: file,
          });          
          

          file = await Filesystem.getUri({
            path: photo.filePath,
            directory: Directory.ExternalStorage,
          })
            .then((savedFile) => {
              return savedFile.uri
            })
            .catch((error) => {
              throw new Error('Cannot save/open the file')
            })
            await FileOpener.openFile({
              path: file,
            });

            file = await Filesystem.getUri({
              path: photo.filePath,
              directory: Directory.Library,
            })
              .then((savedFile) => {
                return savedFile.uri
              })
              .catch((error) => {
                throw new Error('Cannot save/open the file')
              })
              await FileOpener.openFile({
                path: file,
              });

              file = await Filesystem.getUri({
                path: photo.filePath,
                directory: Directory.Documents,
              })
                .then((savedFile) => {
                  return savedFile.uri
                })
                .catch((error) => {
                  throw new Error('Cannot save/open the file')
                })
                await FileOpener.openFile({
                  path: file,
                });


  };

  // const pickMedia = async () => {
  //   const result = await FilePicker.pickMedia({
  //     multiple: true,
  //     readData: true
  //   });

  // };

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
          <IonGrid>
            <IonRow>
              {photos && photos.map((photo, index) => (
                <IonCol size="6" key={index}>
                  <IonImg
                    //onClick={() => setPhotoToDelete(photo)}
                    onClick={() => openFile(photo)}
                    src={photo.webviewPath}
                  />
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>

        </IonContent>

        <IonFooter>
          <IonToolbar className='ion-text-center'>
            <div style={{ padding: 12 }}>
              <IonButton onClick={(e) => pickMedia()}>Dodaj </IonButton>
              <IonButton onClick={(e) => takePhoto()}>Slikaj </IonButton>
              <IonButton expand='block' color={'dark'} fill={'solid'}>Spremi</IonButton>
            </div>
          </IonToolbar>
        </IonFooter>
      </IonModal>
    </>
  );
};

export default memo(FilesAdd);
