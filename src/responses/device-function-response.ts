/**
 * Response for device function
 */

export interface DeviceValues{
    /** Device values */
    type: string;
    /** key id */
    key: string;
}

export interface ValuesRange{
    /** miniumum value */
    min: number;
    /** maximum value */
    max: number;
    /** step value */
    step: number;
}

export interface DeviceFunctionValues{
    /** Name of the value */
    name: string;
    /** Possible values */
    deviceValues: DeviceValues[];
    /** Range of Values */
    range: ValuesRange;
}

export interface DeviceFunctionResponse{
    /** Class of the function */
    functionClass: string;
    /** Instance name of the function */
    functionInstance: string;
    /** Function values */
    values: DeviceFunctionValues[];
}
