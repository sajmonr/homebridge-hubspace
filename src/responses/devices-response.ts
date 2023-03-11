import { DeviceFunctionResponse } from './device-function-response';

/**
 * HTTP response for device discovery
 */
export interface DeviceResponse{
    id: string;
    deviceId: string;
    children: DeviceResponse[];
    typeId: string;
    friendlyName: string;
    description: {
        device: {
            manufacturerName: string;
            model: string;
            deviceClass: string;
        };
        functions: DeviceFunctionResponse[];
    };
}