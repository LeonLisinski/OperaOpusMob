import {
	SERVICE_CORE_ENDPOINT,
	SERVICE_ENDPOINT,
	SERVICE_PRINT_ENDPOINT,
	SERVICE_FILE_ENDPOINT,
	SERVICE_DECRIPTOR_ENDPOINT,
	SERVICE_MAIL_ZAMJENA_ENDPOINT,
	SERVICE_MAIL_SEND_ENDPOINT,
	SERVICE_LOGIN_ENDPOINT,
	SERVICE_PATH_EXISTS,
	SERVICE_REPX_ENDPOINT,
	SERVICE_LAYOUT_ENDPOINT,
	SERVICE_DOCSLAYOUT_ENDPOINT,
	SERVICE_DIRECTPDF_ENDPOINT,
	SERVICE_REPORT_ENDPOINT,
	
} from './data/constants';
import  moment  from 'moment'
import { cloneDeep } from 'lodash';

import { DATABASE } from '../constants';
import { useSelector } from 'react-redux';


export const getData = async (props, auth) => {
	//let database = store.getState().global.connection.database;
	props = await cloneDeep(props);

	const database = auth.connection.database;

	const findParamsObject = (props) => {

		if (props && props.params) {
			return props.params;
		}

		if (props && typeof props === 'object') {
			for (const [key, value] of Object.entries(props)) {
				if (value && typeof value === 'object') {
					const params = findParamsObject(value);

					if (params) {
						return params;
					}
				}
			}
		}


		return null;

	}

	const replaceDatesInObject = (props) => {

		for(const [key,value] of Object.entries(props)) {

			if(value instanceof Date) {
				props[key] = moment(value).format('yyyy/MM/DD HH:mm');
				continue;
			}

			if(typeof value === 'object' && value) {
				replaceDatesInObject(value);
			}
		}
		
	}

	const replaceObjectParams = (props) => {
		const paramsObject = findParamsObject(props);

		if (!paramsObject) {
			return;
		}

		for (const [paramName, paramValue] of Object.entries(paramsObject)) {

			if (paramValue === undefined) {
				paramsObject[paramName] = null;
			}
			
			if(paramValue instanceof Date) {
				
				paramsObject[paramName] = moment(paramValue).format('yyyy/MM/DD')
				continue;
			}

			if (typeof paramValue === 'object' && paramValue !== null) {

				paramsObject[paramName] = JSON.stringify(paramValue);

			}
		}
	}

	// replaceDatesInObject(props);
	// replaceObjectParams(props);
	const { type, query, queries, tableName, loadOptions, printing, commandType, params, mails } = props;

	const queryPrepared = [
		{
			query: query,
			params: params,
			commandtype: commandType == null ? 'text' : commandType,
			tablename: tableName,
			loadoptions: loadOptions
		}
	];



	try {
		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic dGVzdDoxMjM=' },
			body: JSON.stringify({
				db: database && database != '' ? database : DATABASE,
				queries: queries == null ? queryPrepared : queries,
				printing: printing,
				mails: mails
			})
		};

		//let serviceEndpoint = SERVICE_ENDPOINT;
		let serviceEndpoint = auth?.api + '/data';
		if (type == 'printing') {
			//SERVICE_PRINT_ENDPOINT
			serviceEndpoint = auth?.api + '/gridToPdf';
		}

		const response = await fetch(serviceEndpoint, requestOptions);

		const data = await response.json();
		if (response.status != 200) {
			throw (data);
		}
		return data;
	} catch (error) {
		console.error(error);

		throw error;
	}

};

export default getData;

export const getFile = async (props) => {
	const { path } = props;

	try {
		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic dGVzdDoxMjM=' },
			body: JSON.stringify(
				{
					path: path
				}
			)
		};


		const serviceEndpoint = SERVICE_FILE_ENDPOINT;


		const response = await fetch(serviceEndpoint, requestOptions);

		const data = await response.json();
		if (response.status != 200) {
			throw data;
		}
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}

};

export const getPathExists = async (props) => {
	const { path } = props;

	try {
		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic dGVzdDoxMjM=' },
			body: JSON.stringify(
				{
					path: path
				}
			)
		};

		const serviceEndpoint = SERVICE_PATH_EXISTS;


		const response = await fetch(serviceEndpoint, requestOptions);

		const data = await response.json();
		if (response.status != 200) {
			throw (data);
		}
		return data;
	} catch (error) {
		console.error(error);
	}

};

export const getDecriptedData = async (props) => {
	try {
		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic dGVzdDoxMjM=' },
			body: JSON.stringify(
				props
			)
		};

		const serviceEndpoint = SERVICE_DECRIPTOR_ENDPOINT;
		const response = await fetch(serviceEndpoint, requestOptions);

		const data = await response.json();
		if (response.status != 200) {
			throw (props.query + ';\n ' + data);
		}
		return data;
	} catch (error) {
		console.error(error);
	}
};

export const sendMail = async (props) => {
	//let database = store.getState().global.connection.database;
	const database = DATABASE;
	try {
		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic dGVzdDoxMjM=' },
			body: JSON.stringify(
				{ db: database && database != '' ? database : DATABASE, ...props }
			)
		};

		const serviceEndpoint = SERVICE_MAIL_SEND_ENDPOINT;
		const response = await fetch(serviceEndpoint, requestOptions);

		const data = await response.json();
		if (response.status != 200) {
			throw (props.query + ';\n ' + data);
		}
		return data;
	} catch (error) {
		console.error(error);
	}
};

export const login = async (props, auth) => {
	try {
		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic dGVzdDoxMjM=' },
			body: JSON.stringify(
				{ db: auth?.db, ...props }
			)
		};

		//const serviceEndpoint = SERVICE_LOGIN_ENDPOINT;
		const serviceEndpoint = auth?.api + '/login';
		const response = await fetch(serviceEndpoint, requestOptions);
		const data = await response.json();
		if (response.status != 200) {
			throw (data);
		}
		return data;
	} catch (error) {
		console.error(error);
	}
};

export const report = async (props) => {
	try {
		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic dGVzdDoxMjM=' },
			body: JSON.stringify(
				{ db: DATABASE, ...props }
			)
		};


		const serviceEndpoint = SERVICE_REPORT_ENDPOINT;
		const response = await fetch(serviceEndpoint, requestOptions);
		const data = await response.json();
		if (response.status != 200) {
			throw (data);
		}
		return data;
	} catch (error) {
		console.error(error);
	}
};


export const getReport = async (props, auth, type) => {
    const { reportName, id, parameters, mailTo, mailSubject, mailBody  } = props;

    try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic dGVzdDoxMjM=' },
            body: JSON.stringify({
				db: auth?.db,
                id: id,
                reportname: reportName,
				parameters: parameters,
				mailTo: mailTo,
				mailSubject: mailSubject,
				mailBody: mailBody,
				type: type
            })
        };

		const serviceEndpoint = `${auth?.api}/repxreport`;
        //let serviceEndpoint = SERVICE_REPX_ENDPOINT;
    
        const response = await fetch(serviceEndpoint, requestOptions)

        const data = await response.json();
        if (response.status != 200) {
            throw(`${data}`);
        }
        return data;    
    } catch (error) {
        throw error;
    }
   
}

export const saveAttachemnts = async (props, auth, type) => {
	console.log('saveAttachemnts', props, auth);

    const { parameters } = props;
    try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic dGVzdDoxMjM=' },
            body: JSON.stringify({
				db: auth?.db,
				parameters: parameters
            })
        };

		const serviceEndpoint = `${auth?.api}/saveatt`;
        //let serviceEndpoint = SERVICE_REPX_ENDPOINT;
    
        const response = await fetch(serviceEndpoint, requestOptions)

        const data = await response.json();
        if (response.status != 200) {
            throw(`${data}`);
        }
        return data;    
    } catch (error) {
        throw error;
    }
   
}

export const getAttachemnt = async (props, auth) => {
    const { id } = props;

    try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic dGVzdDoxMjM=' },
            body: JSON.stringify({
				db: auth?.db,
				id: id
            })
        };

		const serviceEndpoint = `${auth?.api}/getatt`;
        //let serviceEndpoint = SERVICE_REPX_ENDPOINT;
    
        const response = await fetch(serviceEndpoint, requestOptions)

        const data = await response.json();
        if (response.status != 200) {
            throw(`${data}`);
        }
        return data;    
    } catch (error) {
        throw error;
    }
   
}


export const getMailZamjenaData = async (props) => {
	try {
		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic dGVzdDoxMjM=' },
			body: JSON.stringify(
				props
			)
		};

		const serviceEndpoint = SERVICE_MAIL_ZAMJENA_ENDPOINT;
		const response = await fetch(serviceEndpoint, requestOptions);

		const data = await response.json();
		if (response.status != 200) {
			throw (props.query + ';\n ' + data);
		}
		return data;
	} catch (error) {
		console.error(error);
	}
};

export const getDefinitions = async (props) => {


	
	try {
		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic dGVzdDoxMjM=' },
		};

		const response = await fetch(SERVICE_LAYOUT_ENDPOINT, requestOptions);


		
		const data = await response.json();

		if (response.status != 200) {
			throw (data);
		}
		return data;
	} catch (error) {
		console.error('getDefinitionsError', error);
		throw error;
	}

}

export const getDocsDefinitions = async (props, auth) => {
	try {

		let prefix;
		if (auth?.layoutprefix) {
			prefix = auth?.layoutprefix + '/' 
		}
		

		let requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic dGVzdDoxMjM=' },
			body: JSON.stringify({
				folder: prefix + props?.folder
            })
		};
		let serviceEndpoint = auth?.api + '/doclayouts';
		let response = await fetch(serviceEndpoint, requestOptions);


		
		let data = await response.json();

		if (!data || Object.keys(data).length == 0) {
			requestOptions = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic dGVzdDoxMjM=' },
				body: JSON.stringify({
					folder: props?.folder
				})
			};
			serviceEndpoint = auth?.api + '/doclayouts';
			response = await fetch(serviceEndpoint, requestOptions);

			data = await response.json();
		}


		if (response.status != 200) {
			throw (`${props.query};
                ${data}`);
		}
		return data;
	} catch (error) {
		console.error('getDocsDefinitions', error);
		throw error;
	}

}

export const getDirectPdf = async (props) => {

	try {
		
		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic dGVzdDoxMjM=' },
			body: JSON.stringify(
				props
			)
		};

		const response = await fetch(SERVICE_DIRECTPDF_ENDPOINT, requestOptions);
		const data = await response.json();

		if (response.status != 200) {
			throw (`${props.query};
					${data}`);
		}
		return data;
	} catch (error) {
		console.error('getDirectPdf', error);
		throw error;
	}
}


export const getUnlock = async (props) => {
	const { query, queries, tableName, loadOptions, printing, commandType, params } = props;

	const queryPrepared = [
		{
			query: query,
			params: params,
			commandtype: commandType == null ? 'text' : commandType,
			tablename: tableName,
			loadoptions: loadOptions
		}
	];

	try {
		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic dGVzdDoxMjM=' },
			body: JSON.stringify({
				db: 'OperaMobile',
				queries: queries == null ? queryPrepared : queries,
				printing: printing
			})
		};

		let serviceEndpoint = SERVICE_CORE_ENDPOINT;
		

		const response = await fetch(serviceEndpoint, requestOptions);

		const data = await response.json();
		if (response.status != 200) {
			throw(data);
		}
		return data;
	} catch (e) {
		console.error(e);
		throw e;
		// console.error(error);
		// throw error;
	}

};