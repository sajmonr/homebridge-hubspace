/**
 * HTTP response with account detail
 */
export interface AccountResponse{
    accountAccess: {
        account: {
            accountId: string;
        }
    }[];
}