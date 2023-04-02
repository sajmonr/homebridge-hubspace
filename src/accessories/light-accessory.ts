import { CharacteristicValue, PlatformAccessory } from 'homebridge';
import { HubspacePlatform } from '../platform';
import { HubspaceAccessory } from './hubspace-accessory';
import { isNullOrUndefined } from '../utils';
import { FunctionCharacteristic } from '../models/function-characteristic';

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

        this.configurePower();
        this.configureBrightness();
    }

    private configurePower(): void{
        this.service.getCharacteristic(this.platform.Characteristic.On)
            .onGet(this.getOn.bind(this))
            .onSet(this.setOn.bind(this));
    }

    private configureBrightness(): void{
        if(!this.supportsCharacteristic(FunctionCharacteristic.Brightness)) return;

        this.service.getCharacteristic(this.platform.Characteristic.Brightness)
            .onGet(this.getBrightness.bind(this))
            .onSet(this.setBrightness.bind(this));
    }

    private async getOn(): Promise<CharacteristicValue>{
        const deviceFc = this.getFunctionForCharacteristics(FunctionCharacteristic.Power);
        // Try to get the value
        const value = await this.deviceService.getValueAsBoolean(this.device.deviceId, deviceFc);

        // If the value is not defined then show 'Not Responding'
        if(isNullOrUndefined(value)){
            throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        }

        // Otherwise return the value
        return value!;
    }

    private async setOn(value: CharacteristicValue): Promise<void>{
        const deviceFc = this.getFunctionForCharacteristics(FunctionCharacteristic.Power);

        await this.deviceService.setValue(this.device.deviceId, deviceFc, value);
    }

    private async getBrightness(): Promise<CharacteristicValue>{
        const deviceFc = this.getFunctionForCharacteristics(FunctionCharacteristic.Brightness);
        // Try to get the value
        const value = await this.deviceService.getValueAsInteger(this.device.deviceId, deviceFc);

        // If the value is not defined then show 'Not Responding'
        if(isNullOrUndefined(value) || value === -1){
            throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        }

        // Otherwise return the value
        return value!;
    }

    private async setBrightness(value: CharacteristicValue): Promise<void>{
        const deviceFc = this.getFunctionForCharacteristics(FunctionCharacteristic.Brightness);

        this.deviceService.setValue(this.device.deviceId, deviceFc, value);
    }

}