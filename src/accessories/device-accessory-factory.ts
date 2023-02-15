import { PlatformAccessory } from 'homebridge';
import { Device } from '../models/device';
import { DeviceType } from '../models/device-type';
import { HubspacePlatform } from '../platform';
import { HubspaceAccessory } from './hubspace-accessory';
import { LightAccessory } from './light-accessory';

/**
 * Creates {@link HubspaceAccessory} for a specific {@link DeviceType}
 * @param device Device information
 * @param platform Hubspace platform
 * @param accessory Platform accessory
 * @returns {@link HubspaceAccessory}
 * @throws If device type is not supported
 */
export function createAccessoryForDevice(device: Device, platform: HubspacePlatform, accessory: PlatformAccessory): HubspaceAccessory{
    switch(device.type){
        case DeviceType.Light:
            return new LightAccessory(platform, accessory);
        default:
            throw new Error(`Accessory of type '${device.type}' is not supported.`);
    }
}