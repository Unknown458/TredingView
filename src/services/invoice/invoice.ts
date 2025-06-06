import axios, {AxiosResponse} from 'axios';
  
import Api from '../../app/api';
import AuthMiddleware from '../../middlewares/auth/auth';
import { getTokens } from '../../utils/authToken';

// -----------------------------------------------------------------------------------------------------

export const getNextInvoiceNoAsync = async (
): Promise< {data:AxiosResponse} | boolean> => {
   const authResponse: boolean = await AuthMiddleware();
   const tokens = getTokens();
   
   if (authResponse && tokens && tokens.accessToken) {
   try{
       const response = await axios.get(`${import.meta.env.VITE_BASE_URL}${Api.GetNextInvoiceNoAsync}`,
           {
               headers: {
                   Authorization: `Bearer ${tokens.accessToken}`,
               }
           }
        );
       return {
           data: response,
   }
   }
   catch(error: any){
       return {
           data: error.response
       }
   }
   }
   else{
       return false
   }
};

// -------------------------------------------------------------------------------------------------


export const createInvoiceAsync  = async (
    data: any
): Promise<{data: AxiosResponse} | boolean> => {
    const authResponse: boolean = await AuthMiddleware();
	const tokens = getTokens();
	
	if (authResponse && tokens && tokens.accessToken) {
    try {
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${import.meta.env.VITE_BASE_URL}${Api.CreateInvoiceAsync}`,
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

// --------------------------------------------------------------------------------------------

export const updateInvoiceAsync = async (
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
					Api.UpdateInvoiceAsync
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


// --------------------------------------------------------------------------------------------------

export const deleteInvoiceAsync = async (
	invoiceNo: number
): Promise<{ data: AxiosResponse } | boolean> => {
	
	const authResponse: boolean = await AuthMiddleware();
	const tokens = getTokens();
	
	if (authResponse && tokens && tokens.accessToken ) {
		try {
			const response = await axios.delete(
				`${import.meta.env.VITE_BASE_URL}${
					Api.DeleteInvoiceAsync
				}/${invoiceNo}`,
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

// ------------------------------------------------------------------------------------------------

export const getInvoiceByInvoiceNo = async (
   invoiceNo: number
): Promise< {data:AxiosResponse} | boolean> => {
   const authResponse: boolean = await AuthMiddleware();
   const tokens = getTokens();
   
   if (authResponse && tokens && tokens.accessToken) {
   try{
       const response = await axios.get(`${import.meta.env.VITE_BASE_URL}${Api.GetInvoiceByInvoiceNo}/${invoiceNo}`,
           {
               headers: {
                   Authorization: `Bearer ${tokens.accessToken}`,
               }
           }
        );
       return {
           data: response,
   }
   }
   catch(error: any){
       return {
           data: error.response
       }
   }
   }
   else{
       return false
   }
};