import { IonAlert, IonBackButton, IonButton, IonButtons, IonCol, IonContent, IonFooter, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonRow, IonSpinner, IonText, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import { arrowBack, mail } from 'ionicons/icons';
import { memo, useEffect, useRef, useState } from 'react';



import SignaturePad from 'react-signature-canvas'
import TabsTitle from './TabsTitle';

import './Tab4.css';
import { useDispatch, useSelector } from 'react-redux';
import { saveSignature } from '../store';

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
//import { pdfTestData } from './testData';
//import { getFile } from '../../../../utils/dataHelper';
import { getReport } from '../../../utils/dataHelper';


const Tab4 = () => {
	const dispatch = useDispatch();
	const auth = useSelector((state) => state.auth);
	const dgl = useSelector((state) => state.docs.data);
	const sifdv = useSelector((state) => state.docs.sifdv);

	const layouts = useSelector((state) => state.docs.layouts);

	const signPad = useRef(null)

	const [signatureName, setSignatureName] = useState('');
	const [signatureEmail, setSignatureEmail] = useState('');

	const [message, setMessage] = useState("");
	const [messageHeader, setMessageHeader] = useState("...");
	const [iserror, setIserror] = useState(false);

	const [loading, setLoading] = useState(false);

	const router = useIonRouter();
	const goBack = () => {
		router.push(`/docs/dgl/${sifdv}`, 'none');
	}

	const [screenSize, getDimension] = useState({
		dynamicWidth: window.innerWidth,
		dynamicHeight: window.innerHeight
	});


	useEffect(() => {
		// initialize signature fields from dgl/layouts when available
		const nameField = layouts?.properties?.signatureTextSelectField;
		const emailField = layouts?.properties?.signatureEmailSelectField;
		const name = signatureName || dgl?.[nameField] || '';
		const email = signatureEmail || dgl?.[emailField] || '';
		setSignatureName(name);
		setSignatureEmail(email);
		//if (email) setEmaiTo(email);
	}, [dgl, layouts]);




	const onClickClear = () => {
		signPad.current.clear();
	}

	const onClickSpremi = async () => {
		if (!signPad.current) {
			return;
		}
		const signature = signPad.current.getTrimmedCanvas().toDataURL("image/png");
		const signatureText = signatureName;
		const signatureEmailValue = signatureEmail;
		await dispatch(saveSignature({ signature, signatureText, signatureEmail: signatureEmailValue }));
		createAndOpenPdf();
	}


	const getBase64StringReport = async () => {
		try {
			const ime = signatureName;
			const parameters = {
				"id": dgl.dglid,
				"dglid": dgl.dglid,
				"ime": ime
			}


			let mailTo = dgl.kontaktemail;

			console.log('mailTo1', mailTo)

			if (layouts.properties?.testEmail) {
				mailTo = layouts.properties?.testEmail;
			}

			const signatureEmailText = signatureEmail;

			//setEmaiTo(signatureEmailText);
			console.log('mailToSignature', signatureEmailText)

			if (signatureEmailText && signatureEmailText.trim() != '' && mailTo != undefined) {
				mailTo += `;${signatureEmailText}`;
			} else if (signatureEmailText && signatureEmailText.trim() != '') {
				mailTo = signatureEmailText;
			}

			let mailSubject = `RADNI NALOG - ${dgl['broj radnog naloga']}`;
			if (dgl['nazivobjekta']) {
				mailSubject += ' - ' + dgl['nazivobjekta'];
			}

			const mailBody = `Poštovani, 
			<br><br>
			u prilogu kopija ovjerenog radnog naloga za izvršene usluge.
			`;


			const data = await getReport({ reportName: layouts.properties?.reportName, mailTo: mailTo, mailSubject: mailSubject, mailBody: mailBody, parameters: parameters }, auth, 'mobile').catch(err => {
				setMessage(err);
				setIserror(true);
				setLoading(false);
			}
			);
			if (data) {
				setLoading(false);
				return data;
			}


			// return await showRepx('rptServisniRadniNalog_MIDA', parameters).then(data => {
			//   return data?.Base64String;
			// })

		} catch (err) {
			setMessage(err);
			setIserror(true);
			setLoading(false);
		}
	}

	const createAndOpenPdf = async () => {
		try {
			setLoading(true);

			const data = await getBase64StringReport();

			if (data && layouts.properties.signatureOpenPdf == true) {

				await Filesystem.writeFile({
					directory: Directory.Documents,
					path: 'opera/test.pdf',
					data: data.Base64String,
					//encoding: Encoding.UTF8,
					recursive: true
				});

				Filesystem.getUri({
					directory: Directory.Documents,
					path: `opera/${data.filename || 'doc.pdf'}`
				}).then((getUriResult) => {
					setLoading(false);
					const path = getUriResult.uri;
					//setPathText(path);
					FileOpener.open({
						filePath: path,
						contentType: 'application/pdf'
					})
				});
				setLoading(false);
			}
			if (data && data.FileName) {
				setMessage(`Dokument '${data.FileName}' je pohranjen.`);
				setIserror(true);
				setLoading(false);
			}
		} catch (error) {
			setLoading(false);
		}
	};

	// const readSecretFile = async () => {
	//   const uriPath = await Filesystem.getUri({
	//     directory: Directory.Documents,
	//     path: 'test.pdf'
	//   });
	//   setPathText(uriPath);

	//   FileOpener.open({
	//     filePath: uriPath,
	//     contentType: 'application/pdf'
	//   })


	//   // const contents = await Filesystem.readFile({
	//   //   path: 'test.pdf',
	//   //   directory: Directory.Documents,
	//   //   encoding: Encoding.UTF8,
	//   // });
	// };


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
						<IonTitle size="large"><TabsTitle /></IonTitle>
					</IonToolbar>
				</IonHeader>
				{screenSize.dynamicWidth &&
					<>
						<div className='signature-wrapper'>
							<SignaturePad ref={signPad} penColor='blue' canvasProps={{ width: screenSize.dynamicWidth, height: 300, className: 'signature' }} ></SignaturePad>
						</div>
						<IonGrid>
							<IonRow>
								<IonCol></IonCol>
								<IonCol><IonButton onClick={onClickClear} expand='block' color={'danger'} fill={'solid'}>Obriši</IonButton></IonCol>
							</IonRow>
						</IonGrid>
						<div style={{ paddingTop: 15 }}>
							<IonItem>
								{/* <IonInput placeholder="Ime i prezime" value={dgl[layouts.properties?.signatureTextSelectField]} ref={refIme}></IonInput> */}
								<IonInput placeholder="Ime i prezime" value={signatureName} onIonInput={(e) => {
									if (e.detail?.value !== undefined) {
										setSignatureName(e.detail.value);
									}
								}}></IonInput>

							</IonItem>
						</div>
						<div style={{ paddingTop: 15 }}>
							<IonItem>
								{/* <IonInput placeholder="Email" value={emailTo || dgl[layouts.properties?.signatureEmailSelectField]} ref={refEmail}></IonInput> */}
								<IonInput placeholder="Email" value={signatureEmail} onIonInput={(e) => {
									if (e.detail?.value !== undefined) {
										setSignatureEmail(e.detail.value);
									}
								}}></IonInput>

							</IonItem>
						</div>
					</>
				}
				{/* <div>
          Path: {pathText}
        </div>
        <div>
          URI: {uriPath}
        </div>
        <div>
          <IonButton onClick={testirajReport} expand='block' color={'dark'} fill={'solid'}>Testiraj Report</IonButton>
        </div> */}
			</IonContent>
			<IonFooter>
				<IonToolbar className='ion-text-center'>
					<div style={{ padding: 12 }}>
						<IonButton onClick={onClickSpremi} expand='block' color={'dark'} fill={'solid'} disabled={loading == true}>
							{loading && <><IonSpinner></IonSpinner>&nbsp;&nbsp;</>}
							Spremi / Pošalji izvještaj
						</IonButton>
					</div>

				</IonToolbar>
			</IonFooter>
			<IonAlert
				isOpen={iserror}
				onDidDismiss={() => setIserror(false)}
				cssClass="my-custom-class"
				header={messageHeader}
				message={message}
				buttons={["Dismiss"]}
			/>

		</IonPage>
	);
};

export default memo(Tab4);
