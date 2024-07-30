import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getData, getUnlock, login } from "../utils/dataHelper";



export const useFetchData = () => {
	
	const auth = useSelector((state) => {
		return state.auth;
	});

	console.log('api', auth);

	const [data, setData] = useState(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);

	const fetchData = async (params, type) => {
		try {
			if (type === 'unlock') {
				const response = await getUnlock(params);
				return response;
			}
			else if (type === 'login') {
				const response = await login(params, auth);
				return response;
			} else {
				const response = await getData(params, auth);
				return response;
			}
		} catch (error) {
			setError(error);
			setLoading(false);
		} finally {
			setLoading(false);
		}
		return data;

	};
	return { data, error, loading, fetchData };
};