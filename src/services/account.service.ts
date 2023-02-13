import axios from 'axios';
import { addBearerToken } from '../api/interceptors';
import { Endpoints } from '../api/endpoints';
import { AccountResponse } from '../responses/account-response';

/**
 * Service for managing account details
 */
export class AccountService{

    private readonly _client = axios.create({
        baseURL: Endpoints.API_BASE_URL,
    });

    private _accountId = '';

    constructor() {
        this._client.interceptors.request.use(addBearerToken);
    }

    /**
     * Gets the account ID
     */
    public get accountId(): string{
        return this._accountId;
    }

    /**
     * Loads current user account
     * @returns True if load succeeded otherwise false
     */
    public async loadAccount(): Promise<boolean>{
        try{
            const response = await this._client.get<AccountResponse>('/v1/users/me');

            this._accountId = response.data.accountAccess[0].account.accountId;

            return true;
        }catch(ex){
            return false;
        }
    }

}