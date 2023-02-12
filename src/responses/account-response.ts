/**
 * API response with account detail
 */
export interface AccountResponse{

    accountAccess: AccountAccess[];

}

export interface AccountAccess{
    account: Account;
}

/**
 * Account detail
 */
export interface Account{
    /**
     * ID of an account
     */
    accountId: string;
}