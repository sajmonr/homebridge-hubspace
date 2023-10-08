/**
 * Type of a device
 */
export enum DeviceType{
    None = 'none',
    Light = 'light',
    Fan = 'fan',
    Outlet = 'power-outlet',
    Switch = 'switch'
}

/**
 * Gets {@link DeviceType} for a specific key
 * @param key Device key
 * @returns {@link DeviceType} if key is found otherwise undefined
 */
export function getDeviceTypeForKey(key: string): DeviceType{
    switch(key){
        case 'light':
            return DeviceType.Light;
        case 'fan':
            return DeviceType.Fan;
        case 'power-outlet':
            return DeviceType.Outlet;
        case 'switch':
            return DeviceType.Switch;
        default:
            return DeviceType.None;
    }
}
