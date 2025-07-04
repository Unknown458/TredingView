

import {
	createContext,
	memo,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react';


import { AuthContextInterface, AuthProviderInterface } from './Auth.types';

// -------------------------------------------------------------------------------------------

const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

// -------------------------------------------------------------------------------------------

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

// -------------------------------------------------------------------------------------------

export const AuthProvider = memo(({ children }: AuthProviderInterface) => {
	// const initialLoginStatus = useMemo(() => {
	// 	const tokens = getTokens();
	// 	return (
	// 		!!tokens?.accessToken &&
	// 		!!tokens?.accessTokenExpiry 
			
	// 	);
	// }, []);

	const [loginStatus, setLoginStatus] = useState<boolean>(true);

	const handleLogin = useCallback(() => {
		setLoginStatus(true);
	}, []);

	const handleLogout = useCallback(() => {
		setLoginStatus(false);
		localStorage.clear();
	}, []);

	const contextValue = useMemo(
		() => ({
			loginStatus,
			handleLogin,
			handleLogout,
		}),
		[loginStatus, handleLogin, handleLogout]
	);

	return (
		<AuthContext.Provider value={contextValue}>
			{children}
		</AuthContext.Provider>
	);
});


