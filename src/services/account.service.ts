import axios from 'axios';
import { Endpoints } from '../endpoints';
import { AccountResponse } from '../responses/account-response';

export class AccountService{
    private static _instance: AccountService;

    private readonly _client = axios.create();

    private _accountId = '';

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
            const response = await this._client.get<AccountResponse>(Endpoints.accountInfo());
            console.log(response);
            this._accountId = response.data.accountAccess[0].account.accountId;

            return true;
        }catch(ex){
            console.log(ex);
            return false;
        }
    }

}