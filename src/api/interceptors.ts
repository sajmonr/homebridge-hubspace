import { InternalAxiosRequestConfig } from 'axios';
import { TokenService } from '../services/token.service';

export async function addBearerToken(config: InternalAxiosRequestConfig<any>): Promise<InternalAxiosRequestConfig<any>>{
    const token = await TokenService.instance.getToken();

    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}