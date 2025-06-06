import axios ,{AxiosResponse} from 'axios';

import Api from '../../app/api';
import AuthMiddleware from '../../middlewares/auth/auth';
import { getTokens } from '../../utils/authToken';
import { VerifyUserInterface } from './user.types';
import { setTokens } from '../../utils/authToken';

// -------------------------------------------------------------------------------------------


export const verifyUser = async (loginData: VerifyUserInterface) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}${Api.VerifyUser}`,loginData);
        if (response.status === 200) {
			setTokens({
				accessToken: response.data.accessToken,
				accessTokenExpiry: response.data.accessTokenExpiry,
				
			});
		}
		
        return response;
		
    }
    catch (error: any) {
		return error.response;
	}
}
// -------------------------------------------------------------------------------------------

export const getCurrentTime = async (): Promise<{ data: AxiosResponse }> => {
	try {
		const response = await axios.get(
			`${import.meta.env.VITE_BASE_URL}${Api.GetCurrentTime}`
		);

		return {
			data: response,
		};
	} catch (error: any) {
		return {
			data: error.response,
		};
	}
};

// -------------------------------------------------------------------------------------------


// ----------------------------------------------------------------------------

export const createUserAsync  = async (
    data: any
): Promise<{data: AxiosResponse} | boolean> => {
    const authResponse: boolean = await AuthMiddleware();
	const tokens = getTokens();
	
	if (authResponse && tokens && tokens.accessToken) {
    try {
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${import.meta.env.VITE_BASE_URL}${Api.CreateUserAsync}`,
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

export const updateUserAsync = async (
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
					Api.UpdateUserAsync
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

export const deleteUserAsync = async (
	userId: number
): Promise<{ data: AxiosResponse } | boolean> => {
	
	const authResponse: boolean = await AuthMiddleware();
	const tokens = getTokens();
	
	if (authResponse && tokens && tokens.accessToken ) {
		try {
			const response = await axios.delete(
				`${import.meta.env.VITE_BASE_URL}${
					Api.DeleteUserAsync
				}/${userId}`,
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

export const getUserListAsync = async (): Promise<
	{ data: AxiosResponse } | boolean
> => {
	const authResponse: boolean = await AuthMiddleware();
	const tokens = getTokens();
	
	if (authResponse && tokens && tokens.accessToken) {
		try {
			const response = await axios.get(
				`${import.meta.env.VITE_BASE_URL}${
					Api.GetUserListAsync
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
// -------------------------------------------------------------------------------------------

export const getUserTypeListAsync = async (): Promise<
	{ data: AxiosResponse } | boolean
> => {
	const authResponse: boolean = await AuthMiddleware();
	const tokens = getTokens();
	
	if (authResponse && tokens && tokens.accessToken) {
		try {
			const response = await axios.get(
				`${import.meta.env.VITE_BASE_URL}${
					Api.GetUserTypeListAsync
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

