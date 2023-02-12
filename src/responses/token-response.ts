/**
 * Auth token response from HTTP server
 */
export interface TokenResponse{

    /**
     * Auth access token
     */
    access_token: string;

    /**
     * Access token expiration in seconds
     */
    expires_in: number;

    /**
     * Refresh token expiration in seconds
     */
    refresh_expires_in: number;

    /**
     * Refresh token
     */
    refresh_token: string;

}