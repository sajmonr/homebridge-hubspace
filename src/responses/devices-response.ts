export interface DeviceResponse{
    children: DeviceResponse[];
    typeId: string;
    friendlyName: string;
    description: DeviceDescriptionResponse;
}

export interface DeviceDescriptionResponse{
    key: string;
    deviceId: string;
}