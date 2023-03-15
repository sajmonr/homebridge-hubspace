import { DeviceFunction } from './device-functions';

/**
 * Device function definition
 */
export interface DeviceFunctionDef{
    /** API function instance name string */
    functionInstanceName?: string;

    /** Device function class */
    functionClass: string;
}