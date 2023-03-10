import { CharacteristicValue, PlatformAccessory } from 'homebridge';
import { DeviceFunction } from '../models/device-functions';
import { HubspacePlatform } from '../platform';
import { isNullOrUndefined } from '../utils';
import { HubspaceAccessory } from './hubspace-accessory';

export class OutletAccessory extends HubspaceAccessory{

    /**
     * Crates a new instance of the accessory
     * @param platform Hubspace platform
     * @param accessory Platform accessory
     */
    constructor(platform: HubspacePlatform, accessory: PlatformAccessory) {
        super(platform, accessory, platform.Service.Outlet);

        this.configurePower();
    }

    private configurePower(): void{
        if(this.supportsFunction(DeviceFunction.OutletPower)){
            this.service.getCharacteristic(this.platform.Characteristic.On)
                .onGet(this.getOn.bind(this))
                .onSet(this.setOn.bind(this));
        }
    }

    private async getOn(): Promise<CharacteristicValue>{
        // Try to get the value
        const value = await this.deviceService.getValueAsBoolean(this.device.deviceId, DeviceFunction.OutletPower);

        // If the value is not defined then show 'Not Responding'
        if(isNullOrUndefined(value)){
            throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        }

        // Otherwise return the value
        return value!;
    }

    private async setOn(value: CharacteristicValue): Promise<void>{
        await this.deviceService.setValue(this.device.deviceId, DeviceFunction.OutletPower, value);
    }

}