import { DeviceType } from './device-type';
import { FunctionCharacteristic } from './function-characteristic';

/**
 * Implemented device function definition
 */
export interface DeviceFunctionDef{
    functionClass: string;
    characteristic: FunctionCharacteristic;
}

/**
 * Implemented device definition
 */
export interface DeviceDef{
    deviceClass: string;
    deviceType: DeviceType;
    functions: DeviceFunctionDef[];
}