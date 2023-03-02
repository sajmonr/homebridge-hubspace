import { isNullOrUndefined } from '../utils';

export interface AferoErrorResponse{
    /** UNIX timestamp of the request */
    timestamp: number;
    /** Request response code */
    status: number;
    /** Description of the error */
    error_description: string;
    /** URL of the request */
    path: string;
}

/**
 * Checks whether error is caused by Afero response
 * @param error Error object to check
 * @returns True if error is from Afero
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isAferoError(error: any): error is AferoErrorResponse{
    if(error === null || typeof error !== 'object') return false;

    return isNullOrUndefined(error.timestamp, error.status, error.status_description, error.path);
}