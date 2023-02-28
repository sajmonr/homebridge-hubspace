import { InternalAxiosRequestConfig } from 'axios';
import { TokenService } from '../services/token.service';

/**
 * Adds a Bearer token to the request
 * @param config Axios request configuration
 * @returns Config with Bearer token
 */
export async function addBearerToken(config: InternalAxiosRequestConfig<unknown>): Promise<InternalAxiosRequestConfig<unknown>>{
    const token = await TokenService.instance.getToken();

    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}