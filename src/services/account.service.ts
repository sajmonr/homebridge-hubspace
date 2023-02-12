import axios from 'axios';
import { addBearerToken } from '../api/interceptors';
import { Endpoints } from '../api/endpoints';
import { AccountResponse } from '../responses/account-response';

export class AccountService{
    private static _instance: AccountService;

    private readonly _client = axios.create({
        baseURL: Endpoints.API_BASE_URL,
    });

    private _accountId = '';

    private constructor() {
        this._client.interceptors.request.use(addBearerToken);
    }

    public get accountId(): string{
        return this._accountId;
    }

    public static get instance(): AccountService{
        if(!AccountService._instance){
            AccountService._instance = new AccountService();
        }

        return AccountService._instance;
    }

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