import { CharacteristicValue, PlatformAccessory } from 'homebridge';
import { HubspacePlatform } from '../platform';
import { HubspaceAccessory } from './hubspace-accessory';
import { isNullOrUndefined } from '../utils';
import { FunctionCharacteristic } from '../models/function-characteristic';

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

        this.configureActive();
        this.configureRotationSpeed();
    }

    private configureActive(): void{
        this.service.getCharacteristic(this.platform.Characteristic.Active)
            .onGet(this.getActive.bind(this))
            .onSet(this.setActive.bind(this));
    }

    private configureRotationSpeed(): void{
        this.service.getCharacteristic(this.platform.Characteristic.RotationSpeed)
            .onGet(this.getRotationSpeed.bind(this))
            .onSet(this.setRotationSpeed.bind(this))
            .setProps({
                minValue: 0,
                maxValue: 100,
                minStep: 25
            });
    }

    private async setActive(value: CharacteristicValue): Promise<void>{
        const deviceFc = this.getFunctionForCharacteristics(FunctionCharacteristic.Power);

        this.deviceService.setValue(this.device.deviceId, deviceFc, value);
    }

    private async getActive(): Promise<CharacteristicValue>{
        const deviceFc = this.getFunctionForCharacteristics(FunctionCharacteristic.Power);

        // Try to get the value
        const value = await this.deviceService.getValue(this.device.deviceId, deviceFc);

        // If the value is not defined then show 'Not Responding'
        if(isNullOrUndefined(value)){
            this.setNotResponding();
        }

        // Otherwise return the value
        return value!;
    }

    private async getRotationSpeed(): Promise<CharacteristicValue>{
        const deviceFc = this.getFunctionForCharacteristics(FunctionCharacteristic.FanSpeed);

        // Try to get the value
        const value = await this.deviceService.getValue(this.device.deviceId, deviceFc);

        // If the value is not defined then show 'Not Responding'
        if(isNullOrUndefined(value)){
            throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        }

        // Otherwise return the value
        return value!;
    }

    private async setRotationSpeed(value: CharacteristicValue): Promise<void>{
        const deviceFc = this.getFunctionForCharacteristics(FunctionCharacteristic.FanSpeed);

        await this.deviceService.setValue(this.device.deviceId, deviceFc, value);
    }

}