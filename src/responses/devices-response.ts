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
        key: string;
        device: {
            manufacturerName: string;
            model: string;
        }
    };
}