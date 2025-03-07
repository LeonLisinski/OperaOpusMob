import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonRouter,
} from "@ionic/react";
import { add, arrowBack, attach, camera } from "ionicons/icons";
import moment from "moment";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import DetailAzur from "../components/DetailAzur";
import TabsTitle from "./TabsTitle";

import "./TabPrivitci.css";
import { changeStatus, deleteDst, getPrivitci, getPrivitak } from "../store";
import { base64FromPath, usePhotoGallery } from "../../../../hooks/usePhotoGallery";
import { Camera } from "@capacitor/camera";
//import { FileOpener, FileOpenerOptions } from '@capacitor-community/file-opener';
import { Filesystem, Directory } from '@capacitor/filesystem';

import { FileOpener } from '@capawesome-team/capacitor-file-opener';
import { FilePicker } from '@capawesome/capacitor-file-picker';


import { saveAttachments } from '../../../../utils/dataHelper';



const TabPrivitci = () => {
  const router = useIonRouter();

  const dispatch = useDispatch();
  const auth = useSelector((state: any) => state.auth);
  const [presentAlert] = useIonAlert();

  const sifdv = useSelector((state: any) => state.servis.radniNalozi?.sifdv);
  const privitak = useSelector((state: any) => state.servis.radniNalozi?.privitak);
  const { deletePhoto, photos, takePhoto, pickPhoto } = usePhotoGallery();
  const [photoToDelete, setPhotoToDelete] = useState();

  useEffect(() => {
    populateList();
  }, []);

  const populateList = async () => {
    await dispatch(getPrivitci());
  };


  const data = useSelector((state: any) => state.servis.radniNalozi?.data);
  const list = useSelector((state: any) => state.servis.radniNalozi?.privitci);

  const onItemClick = async (e, item: any) => {
    console.log('item', item);
    const responseDispachData = await dispatch(getPrivitak(item.id));
    const responseData = responseDispachData.payload;
    console.log('responseData', responseData);
    await Filesystem.writeFile({
      directory: Directory.Documents,
      path: `opera/${responseData.FileName}`,
      data: responseData.Base64String,
      //encoding: Encoding.UTF8,
      recursive: true
    });

    Filesystem.getUri({
      directory: Directory.Documents,
      path: `opera/${responseData.FileName}`
    }).then((getUriResult) => {
      const path = getUriResult.uri;
      FileOpener.openFile({
        path: path
      })
    });


    //lokacija fs.mida.local\\group$\\Opera\\Prilozi\\Dokumenti\\9200\\2025\\SRN\\0281-02-25\\281.pdf
    //za pregled na webu tribaju prava
    //window.open(item.putanja, "_blank", "noreferrer");

  };

  const renderList = () => {
    return (
      <IonList>
        {list &&
          list.map((item: any, i: any) => {
            return (
              <IonItem
                className="ion-no-padding"
                button
                onClick={(e) => onItemClick(e, item)}
                detail={true}
                key={i}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: 4,
                    background: item.indcolor,
                  }}
                ></div>
                <IonLabel style={{ paddingLeft: 15 }}>{item.naziv}</IonLabel>
              </IonItem>
            );
          })}
      </IonList>
    );
  };


  // const takePicture = async () => {
	// const image = await Camera.getPhoto({
	//   quality: 90,
	//   allowEditing: true,
	//   resultType: CameraResultType.Uri
	// });

	// // image.webPath will contain a path that can be set as an image src.
	// // You can access the original file using image.path, which can be
	// // passed to the Filesystem API to read the raw data of the image,
	// // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
	// var imageUrl = image.webPath;

	// alert("ok");
  // };

  const handleRefresh = async (e: any) => {
    await populateList();
    e.detail.complete();
  };

  const goBack = () => {
    router.push(`/servis/radninalozi/${sifdv}`, "none");
  };

  // const openFile = async (photo) => {
  //   console.log('photo3', photo);


  //   await FileOpener.openFile({
  //     path: photo.filepath,
  //   });


  //   // const fileOpenerOptions: FileOpenerOptions = {
  //   //   filePath: photo.filepath,
  //   //   contentType: 'image/jpeg',
  //   // }

  //   // try {


  //   //   await FileOpener.open(fileOpenerOptions);
  //   // } catch (e) {
  //   //   console.log('Error opening file', e);
  //   // }

  //   // await FileOpener.openFile({
  //   //   path: photo.filepath,
  //   // });
  // };

  // const openFile2 = async (photo) => {
  //   console.log('photo3', photo);


  //   await FileOpener.openFile({
  //     path: 'content://data/user/0/com.opera.mobile/files/Pictures/JPEG_20240502_144734_2128035145779355120.jpg'
  //   });
  // };

  // const openFile3 = async (photo) => {
  //   console.log('photo3', photo);

  //   const uriResult = await Filesystem.getUri({
  //     path: 'file:///data/user/0/com.opera.mobile/files/Pictures/JPEG_20240502_144734_2128035145779355120.jpg'
  //   });

  //   console.log('uriResult',uriResult);

  //   await FileOpener.openFile({
  //     path: uriResult.uri
  //   });
  // };
  
  // const openFile4 = async (photo) => {

  //   await FileOpener.openFile({
  //     path: 'file:///data/user/0/com.opera.mobile/files/rekap.pdf'
  //   });
  // };

  // const openFile5 = async (photo) => {
  //   await FileOpener.openFile({
  //     path: 'file:///data/user/0/com.opera.mobile/files/tlocrt1.pdf'
  //   });
  // };

  // const openFile6 =   async (photo) => {
  //   await FileOpener.openFile({
  //     path: 'file:///storage/emulated/0/Download/ormar.png'
  //   });
  // };

  // const openFile7 =   async (photo) => {
  //   await FileOpener.openFile({
  //     path: 'file:///data/user/0/com.opera.mobile/files/ormar.png'
  //   });
  // };


  // const openFile8 =   async (photo) => {
  //   await FileOpener.openFile({
  //     path: 'file:///storage/emulated/0/Download/js.jpg'
  //   });
  // };

  // const openFile9 =   async (photo) => {
  //   await FileOpener.openFile({
  //     path: 'file:///data/user/0/com.opera.mobile/files/js.jpg'
  //   });
  // };

  // const openFile10 =   async (photo) => {
  //   await FileOpener.openFile({
  //     path: 'file:///data/user/0/com.opera.mobile/cache/js.jpg'
  //   });
  // };





  // const pickFiles = async () => {
  //   const result = await FilePicker.pickFiles({
  //     types: ['image/png'],
  //     multiple: true,
  //   });
  // };
  
  // const pickImages = async () => {
  //   const result = await FilePicker.pickImages({
  //     multiple: true,
  //   });
  // };
  
  // const pickMedia = async () => {
  //   const result = await FilePicker.pickMedia({
  //     multiple: true,
  //   });

  //   console.log('result', result);

  //   console.log(base64FromPath(result.files[0].path))
  // };
  
  // const pickVideos = async () => {
  //   const result = await FilePicker.pickVideos({
  //     multiple: true,
  //   });
  // };
  
  const appendFileToFormData = async () => {
    const result = await FilePicker.pickFiles({
      readData: true
    });

    console.log('appendFileToFormData', result);
  
    // const formData = new FormData();

    const parameters = {
      dglid: data.dglid,
      files: result.files
    }

    console.log('appendFileToFormData', parameters);
    
    // console.log(1);


    await saveAttachments({parameters: parameters}, auth);
    populateList();


    // console.log('appendFileToFormData', file);

    // if (file.blob) {
    //   console.log('file.blob', file.blob);
    //   const rawFile = new File(file.blob, file.name, {
    //     type: file.mimeType,
    //   });
    //   formData.append('file', rawFile, file.name);
    // }
  };  



  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => goBack()}>
              <IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
            </IonButton>
          </IonButtons>
          <IonTitle>
            <TabsTitle />
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">
              <TabsTitle />
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
{/* 
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
        </IonGrid> */}

        {list && list.length > 0 && renderList()}

{/* 
        <IonButton onClick={(e) => takePhoto()}>test 1</IonButton>
        <IonButton onClick={(e) => takePicture()}>test 2</IonButton>
        <IonButton onClick={(e) => pickPhoto()}>Pick</IonButton>

        <IonButton onClick={(e) => openFile2()}>OpenFile 2</IonButton>

        <IonButton onClick={(e) => openFile3()}>OpenFile 3</IonButton>

        <IonButton onClick={(e) => openFile4()}>PDF 1 </IonButton>
        <IonButton onClick={(e) => openFile5()}>PDF 2 </IonButton>

        <IonButton onClick={(e) => openFile6()}>6 </IonButton>
        <IonButton onClick={(e) => openFile7()}>7 </IonButton>
        <IonButton onClick={(e) => openFile8()}>8 </IonButton>
        <IonButton onClick={(e) => openFile9()}>9</IonButton>
        <IonButton onClick={(e) => openFile10()}>10 </IonButton>


        <IonButton onClick={(e) => pickFiles()}>pickFiles </IonButton>
        <IonButton onClick={(e) => pickImages()}>pickFiles </IonButton>
        <IonButton onClick={(e) => pickMedia()}>pickMedia </IonButton>
        <IonButton onClick={(e) => pickPhoto()}>pickPhoto </IonButton>
        <IonButton onClick={(e) => pickVideos()}>pickVideos </IonButton> */}
        {/* <IonButton onClick={(e) => appendFileToFormData()}>appendFileToFormData </IonButton> */}

        <IonFab horizontal="end" vertical="bottom" slot="fixed">
          <IonFabButton onClick={(e) => appendFileToFormData()}>
            <IonIcon icon={attach} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default memo(TabPrivitci);
