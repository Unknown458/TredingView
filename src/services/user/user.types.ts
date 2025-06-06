export interface VerifyUserInterface {
	username: string;
	password: string;
}

export interface AuthTokensInterface {
	accessToken: string;
	accessTokenExpiry: string;
}

export interface UserMasterIneterface {
	userId?: number;
	userName: String;
	password: String;
	confirmPassword: String;
    userTypeId: number;
    userType?: string;
	}
