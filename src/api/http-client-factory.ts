import { AxiosInstance, CreateAxiosDefaults } from 'axios';
import axios from 'axios';
import { addBearerToken } from './interceptors';

/**
 * Creates an HTTP client with Bearer interceptor
 * @param config HTTP client configuration
 * @returns HTTP client with Bearer interceptor
 */
export function createHttpClientWithBearerInterceptor(config?: CreateAxiosDefaults<any> | undefined): AxiosInstance{
    const client = axios.create(config);

    client.interceptors.request.use(addBearerToken);

    return client;
}