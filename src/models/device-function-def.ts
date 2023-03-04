import { DeviceFunction } from './device-functions';

/**
 * Device function definition
 */
export interface DeviceFunctionDef{
    /** Type of device this applies to */
    type: DeviceFunction;

    /** API attribute ID */
    attributeId: number;

    /** API function instance name string */
    functionInstanceName?: string;

    /** Device function class */
    functionClass: string;
}