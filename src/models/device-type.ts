/**
 * Type of a device
 */
export enum DeviceType{
    Light = 'light',
    Fan = 'fan',
    Outlet = 'power-outlet'
}

/**
 * Gets {@link DeviceType} for a specific key
 * @param key Device key
 * @returns {@link DeviceType} if key is found otherwise undefined
 */
export function getDeviceTypeForKey(key: string): DeviceType | undefined{
    switch(key){
        case 'light':
            return DeviceType.Light;
        case 'fan':
            return DeviceType.Fan;
        case 'power-outlet':
            return DeviceType.Outlet;
        default:
            return undefined;
    }
}