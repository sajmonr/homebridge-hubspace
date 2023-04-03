import { DeviceType } from './device-type';
import { FunctionCharacteristic } from './function-characteristic';

/**
 * Implemented device function definition
 */
export interface DeviceFunctionDef{
    /**
     * Function class of Hubspace API
     */
    functionClass: string;
    /**
     * Mapping to Homebridge characteristic
     */
    characteristic: FunctionCharacteristic;
}

/**
 * Implemented device definition
 */
export interface DeviceDef{
    /**
     * Device class of Hubspace API
     */
    deviceClass: string;
    /**
     * Type of device
     */
    deviceType: DeviceType;
    /**
     * Supported device functions
     */
    functions: DeviceFunctionDef[];
}