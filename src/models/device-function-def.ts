import { DeviceFunction } from './device-functions';

export interface RangeDef{
    min: number;
    max: number;
    step: number;
}

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

    /** Range */
    range?: RangeDef;
}