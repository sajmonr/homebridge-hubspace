import { CharacteristicValue, PlatformAccessory } from 'homebridge';
import { DeviceAttribute } from '../models/device-attributes';
import { HubspacePlatform } from '../platform';
import { HubspaceAccessory } from './hubspace-accessory';
import { isNullOrUndefined } from '../utils';

/**
 * Fan accessory for Hubspace platform
 */
export class FanAccessory extends HubspaceAccessory{

    /**
     * Crates a new instance of the accessory
     * @param platform Hubspace platform
     * @param accessory Platform accessory
     */
    constructor(platform: HubspacePlatform, accessory: PlatformAccessory) {
        super(platform, accessory, platform.Service.Fanv2);

        this.service.getCharacteristic(this.platform.Characteristic.Active)
            .onGet(this.getActive.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.RotationSpeed)
            .onGet(this.getRotationSpeed.bind(this))
            .onSet(this.setRotationSpeed.bind(this))
            .setProps({
                minValue: 0,
                maxValue: 100,
                minStep: 25
            });
    }

    private async getActive(): Promise<CharacteristicValue>{
        // Try to get the value
        const value = await this.deviceService.getValue(this.device.deviceId, DeviceAttribute.FanPower);

        // If the value is not defined then show 'Not Responding'
        if(isNullOrUndefined(value)){
            throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        }

        // Otherwise return the value
        return value!;
    }

    private async getRotationSpeed(): Promise<CharacteristicValue>{
        // Try to get the value
        const value = await this.deviceService.getValue(this.device.deviceId, DeviceAttribute.FanSpeed);

        // If the value is not defined then show 'Not Responding'
        if(isNullOrUndefined(value)){
            throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        }

        // Otherwise return the value
        return value!;
    }

    private async setRotationSpeed(value: CharacteristicValue): Promise<void>{
        await this.deviceService.setValue(this.device.deviceId, DeviceAttribute.FanSpeed, value);
    }

}