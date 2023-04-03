import { FunctionCharacteristic } from './function-characteristic';

/**
 * Device function
 */
export interface DeviceFunction{
    /**
     * Homebridge characteristic for the function
     */
    characteristic: FunctionCharacteristic;
    /**
     * Function instance
     * (this could be set by the API if there are multiple instance for single characteristic)
     */
    functionInstance?: string;
    /**
     * API attribute ID
     */
    attributeId: string;
}

/**
 * Function that indicates NULL function
 */
export const NoDeviceFunction: DeviceFunction = {
    characteristic: FunctionCharacteristic.None,
    attributeId: ''
};

/**
 * Checks whether function is {@link NoDeviceFunction}
 * @param deviceFunction Function to check
 * @returns True if function is NULL function
 */
export function isNoFunction(deviceFunction: DeviceFunction): boolean{
    const noFcKeys = Object.keys(NoDeviceFunction);
    const fcToCheckKeys = Object.keys(deviceFunction);

    if (noFcKeys.length !== fcToCheckKeys.length) return false;

    for (const key of noFcKeys) {
        if (noFcKeys[key] !== fcToCheckKeys[key]) return false;
    }

    return true;
}