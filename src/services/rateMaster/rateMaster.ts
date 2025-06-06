// ----------------------------------------------------------------------------

import axios, { AxiosResponse } from 'axios';

import Api from '../../app/api';
import AuthMiddleware from '../../middlewares/auth/auth';
import { getTokens } from '../../utils/authToken';

// ----------------------------------------------------------------------------

export const createRateAsync  = async (
    data: any
): Promise<{data: AxiosResponse} | boolean> => {
    const authResponse: boolean = await AuthMiddleware();
	const tokens = getTokens();
	
	if (authResponse && tokens && tokens.accessToken) {
    try {
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${import.meta.env.VITE_BASE_URL}${Api.CreateRateAsync}`,
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

export const updateRateAsync = async (
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
					Api.UpdateRateAsync
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

export const deleteRateAsync = async (
	rateId: number
): Promise<{ data: AxiosResponse } | boolean> => {
	
	const authResponse: boolean = await AuthMiddleware();
	const tokens = getTokens();
	
	if (authResponse && tokens && tokens.accessToken ) {
		try {
			const response = await axios.delete(
				`${import.meta.env.VITE_BASE_URL}${
					Api.DeleteRateAsync
				}/${rateId}`,
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

export const getRateListAsync = async (): Promise<
	{ data: AxiosResponse } | boolean
> => {
	const authResponse: boolean = await AuthMiddleware();
	const tokens = getTokens();
	
	if (authResponse && tokens && tokens.accessToken) {
		try {
			const response = await axios.get(
				`${import.meta.env.VITE_BASE_URL}${
					Api.GetRateListAsync
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