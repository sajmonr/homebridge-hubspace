import axios from 'axios';
import { TokenResponse } from '../responses/token-response';
import { Endpoints } from '../api/endpoints';

/**
 * Service for managing JWT tokens
 */
export class TokenService{
    private static _instance: TokenService;

    private readonly _httpClient = axios.create({
        baseURL: Endpoints.ACCOUNT_BASE_URL
    });

    private _accessToken?: string;
    private _accessTokenExpiration?: Date;
    private _refreshToken?: string;
    private _refreshTokenExpiration?: Date;

    /**
     * Creates a new instance of token service
     * @param _username Account username
     * @param _password Account password
     */
    private constructor(
        private readonly _username: string,
        private readonly _password: string) { }


    /**
     * {@link TokenService} instance
     */
    public static get instance(): TokenService{
        return TokenService._instance;
    }

    /**
     * Initializes {@link TokenService}
     * @param _username Account username
     * @param _password Account password
     */
    public static init(username: string, password: string): void{
        TokenService._instance = new TokenService(username, password);
    }

    public async getToken(): Promise<string | undefined>{
        if(!this.hasValidToken()){
            await this.authenticate();
        }

        return this._accessToken;
    }

    public hasValidToken(): boolean{
        return this._accessToken !== undefined && !this.isAccessTokenExpired();
    }

    private async authenticate(): Promise<boolean>{
        // If nothing is expired then no need to run authentication again
        if(!this.isAccessTokenExpired() && !this.isRefreshTokenExpired()) return true;

        const tokenResponse = await this.getTokenFromRefreshToken() || await this.getTokenFromCredentials();

        this.setTokens(tokenResponse);

        if(!tokenResponse) return false;

        return true;
    }

    private async getTokenFromRefreshToken(): Promise<TokenResponse | undefined>{
        // If refresh token is expired then don't even try...
        if(this.isRefreshTokenExpired()) return undefined;

        const params = new URLSearchParams();

        params.append('grant_type', 'refresh_token');
        params.append('client_id', 'hubspace_android');
        params.append('refresh_token', this._refreshToken!);

        try{
            const response = await this._httpClient.post('/protocol/openid-connect/token', params);

            return response.status === 200 ? response.data : undefined;
        }catch(exception){
            return undefined;
        }
    }

    private async getTokenFromCredentials(): Promise<TokenResponse | undefined>{
        const params = new URLSearchParams();

        params.append('grant_type', 'password');
        params.append('client_id', 'hubspace_android');
        params.append('username', this._username);
        params.append('password', this._password);

        try{
            const response = await this._httpClient.post('/protocol/openid-connect/token', params);

            return response.status === 200 ? response.data : undefined;
        }catch(exception){
            return undefined;
        }
    }


    /**
     * Sets tokens to new values
     * @param response Response with tokens
     */
    private setTokens(response?: TokenResponse): void{
        if(!response){
            this.clearTokens();
            return;
        }

        this._accessToken = response.access_token;
        this._refreshToken = response.refresh_token;

        const currentDate = new Date();

        this._accessTokenExpiration = new Date(currentDate.getTime() + response.expires_in * 1000);
        this._refreshTokenExpiration = new Date(currentDate.getTime() + response.refresh_expires_in * 1000);
    }

    /**
     * Clears stored tokens
     */
    private clearTokens(): void{
        this._accessToken = undefined;
        this._refreshToken = undefined;
        this._accessTokenExpiration = undefined;
        this._refreshTokenExpiration = undefined;
    }

    /**
     * Checks whether the access token is expired
     * @returns True if access token is expired otherwise false
     */
    private isAccessTokenExpired(): boolean{
        return !this._accessTokenExpiration || this._accessTokenExpiration < new Date();
    }

    /**
     * Checks whether the refresh token is expired
     * @returns True if refresh token is expired otherwise false
     */
    private isRefreshTokenExpired(): boolean{
        return !this._refreshTokenExpiration || this._refreshTokenExpiration < new Date();
    }

}