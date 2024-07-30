import { getReport } from '../utils/dataHelper';


const showRepx = async(reportName, parameters) => {
        const response = await getReport({ reportName: reportName, parameters: parameters }, null);
        return response;
        //var blob = base64toBlob(response.Base64String);
        //window.open(URL.createObjectURL(blob));
}

export default showRepx;