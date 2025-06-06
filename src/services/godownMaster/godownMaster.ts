// ----------------------------------------------------------------------------

import axios, { AxiosResponse } from 'axios';

import Api from '../../app/api';
import AuthMiddleware from '../../middlewares/auth/auth';
import { getTokens } from '../../utils/authToken';

// ----------------------------------------------------------------------------

export const createGodownAsync  = async (
    data: any
): Promise<{data: AxiosResponse} | boolean> => {
    const authResponse: boolean = await AuthMiddleware();
	const tokens = getTokens();
	
	if (authResponse && tokens && tokens.accessToken) {
    try {
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${import.meta.env.VITE_BASE_URL}${Api.CreateGodownAsync}`,
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`,

            },
            data: data,
        };

        const response = await axios.request(config);

        return{
            data: response,
        };
    }
    catch (error: any) {
        return { 
            data: error.response,
        };
    }
}
else{
	return false;
}
};

// --------------------------------------------------------------

export const updateGodownAsync = async (
	data: any
): Promise<{ data: AxiosResponse } | boolean> => {
	const authResponse: boolean = await AuthMiddleware();
	const tokens = getTokens();
	
	if (authResponse && tokens && tokens.accessToken) {
		try {
			const config = {
				method: 'post',
				maxBodyLength: Infinity,
				url: `${import.meta.env.VITE_BASE_URL}${
					Api.UpdateGodownAsync
				}`,
				headers: {
					Authorization: `Bearer ${tokens.accessToken}`,
				},
				data,
			};

			const response = await axios.request(config);

			return {
				data: response,
			};
		} catch (error: any) {
			return {
				data: error.response,
			};
		}
	}
	else{
		return false;
	}
	
};

// ------------------------------------------------------------

export const deleteGodownAsync = async (
	godownId: number
): Promise<{ data: AxiosResponse } | boolean> => {
	
	const authResponse: boolean = await AuthMiddleware();
	const tokens = getTokens();
	
	if (authResponse && tokens && tokens.accessToken ) {
		try {
			const response = await axios.delete(
				`${import.meta.env.VITE_BASE_URL}${
					Api.DeleteGodownAsync
				}/${godownId}`,
				{
					headers: {
						Authorization: `Bearer ${tokens.accessToken}`,
					},
				}
			);
			return {
				data: response,
			};
		} catch (error: any) {
			return {
				data: error.response,
			};
		}
	}
	else{
		return false;
	}
	
};

// -----------------------------------------------------------------

export const getGodownListAsync = async (): Promise<
	{ data: AxiosResponse } | boolean
> => {
	const authResponse: boolean = await AuthMiddleware();
	const tokens = getTokens();
	
	if (authResponse && tokens && tokens.accessToken) {
		try {
			const response = await axios.get(
				`${import.meta.env.VITE_BASE_URL}${
					Api.GetGodownListAsync
				}`,
				{
					headers: {
						Authorization: `Bearer ${tokens.accessToken}`,
					},
				}
			);
			return {
				data: response,
			};
		} catch (error: any) {
			return {
				data: error.response,
			};
		}
	}
	else{
		return false
	}
	
};