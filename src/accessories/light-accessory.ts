import { CharacteristicValue, PlatformAccessory } from 'homebridge';
import { HubspacePlatform } from '../platform';
import { HubspaceAccessory } from './hubspace-accessory';
import { isNullOrUndefined } from '../utils';
import { DeviceFunction } from '../models/device-functions';

/**
 * Light accessory for Hubspace platform
 */
export class LightAccessory extends HubspaceAccessory{

    /**
     * Crates a new instance of the accessory
     * @param platform Hubspace platform
     * @param accessory Platform accessory
     */
    constructor(platform: HubspacePlatform, accessory: PlatformAccessory) {
        super(platform, accessory, platform.Service.Lightbulb);

        // Configure power on/off handlers
        this.service.getCharacteristic(this.platform.Characteristic.On)
            .onGet(this.getOn.bind(this))
            .onSet(this.setOn.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.Brightness)
            .onGet(this.getBrightness.bind(this))
            .onSet(this.setBrightness.bind(this));
    }

    private async getOn(): Promise<CharacteristicValue>{
        // Try to get the value
        const value = await this.deviceService.getValueAsBoolean(this.device.deviceId, DeviceFunction.LightPower);

        // If the value is not defined then show 'Not Responding'
        if(isNullOrUndefined(value)){
            throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        }

        // Otherwise return the value
        return value!;
    }

    private async setOn(value: CharacteristicValue): Promise<void>{
        await this.deviceService.setValue(this.device.deviceId, DeviceFunction.LightPower, value);
    }

    private async getBrightness(): Promise<CharacteristicValue>{
        // Try to get the value
        const value = await this.deviceService.getValueAsInteger(this.device.deviceId, DeviceFunction.Brightness);

        // If the value is not defined then show 'Not Responding'
        if(isNullOrUndefined(value) || value === -1){
            throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        }

        // Otherwise return the value
        return value!;
    }

    private async setBrightness(value: CharacteristicValue): Promise<void>{
        this.deviceService.setValue(this.device.deviceId, DeviceFunction.Brightness, value);
    }

}