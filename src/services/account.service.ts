import { AxiosError } from 'axios';
import { Endpoints } from '../api/endpoints';
import { AccountResponse } from '../responses/account-response';
import { Logger } from 'homebridge';
import { createHttpClientWithBearerInterceptor } from '../api/http-client-factory';

/**
 * Service for managing account details
 */
export class AccountService{
    private readonly _client = createHttpClientWithBearerInterceptor({
        baseURL: Endpoints.API_BASE_URL,
    });

    private _onAccountLoaded?: () => void | Promise<void>;
    private _accountId = '';

    constructor(private readonly _log: Logger) { }

    /**
     * Gets the account ID
     */
    public get accountId(): string{
        return this._accountId;
    }

    public onAccountLoaded(callback: () => Promise<void>){
        this._onAccountLoaded = callback;
    }

    /**
     * Loads current user account
     * @returns True if load succeeded otherwise false
     */
    public async loadAccount(): Promise<void>{
        try{
            const response = await this._client.get<AccountResponse>('/users/me');

            this._accountId = response.data.accountAccess[0].account.accountId;

            if(this._onAccountLoaded){
                this._onAccountLoaded();
            }
        }catch(ex){
            this._log.error('Failed to load account information.', (<AxiosError>ex).message);
        }
    }

}