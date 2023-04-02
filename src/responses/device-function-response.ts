/**
 * Response for device function
 */
export interface DeviceFunctionResponse{
    /** Class of the function */
    functionClass: string;
    /** Instance name of the function */
    functionInstance: string;
    values: {
        deviceValues: {
            key: string;
        }[];
    }[];
}