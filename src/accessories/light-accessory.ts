import { CharacteristicValue, PlatformAccessory } from 'homebridge';
import { HubspacePlatform } from '../platform';
import { HubspaceAccessory } from './hubspace-accessory';
import { isNullOrUndefined, normalizeValue } from '../utils';
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

        this.configurePower();
        this.configureBrightness();

        // * If [Color Temperature] characteristic is included in the `Light Bulb`, `Hue` and `Saturation` must not be included as optional
        // * characteristics in `Light Bulb`. This characteristic must not be used for lamps which support color.
        //if(this.configureColor())
        {
            this.configureTemperature();
        }
    }

    private configurePower(): void{
        this.service.getCharacteristic(this.platform.Characteristic.On)
            .onGet(this.getOn.bind(this))
            .onSet(this.setOn.bind(this));
    }

    private configureBrightness(): void{
        if(!this.supportsFunction(DeviceFunction.Brightness)) return;

        this.service.getCharacteristic(this.platform.Characteristic.Brightness)
            .onGet(this.getBrightness.bind(this))
            .onSet(this.setBrightness.bind(this));
    }

    private configureTemperature(): void{
        if(!this.supportsFunction(DeviceFunction.LightTemperature)) return;

        this.service.getCharacteristic(this.platform.Characteristic.ColorTemperature)
            .onGet(this.getTemperature.bind(this))
            .onSet(this.setTemperature.bind(this));
    }

    private configureColor(): boolean{
        if(!this.supportsFunction(DeviceFunction.LightColor)) return false;

        this.service.getCharacteristic(this.platform.Characteristic.Hue)
            .onGet(this.getHue.bind(this))
            .onSet(this.setHue.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.Saturation)
            .onGet(this.getSaturation.bind(this))
            .onSet(this.setSaturation.bind(this));

        return true;
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
        this.log.debug(`${this.device.name}: Received ${value} from Hubspace Brightness`);

        // If the value is not defined then show 'Not Responding'
        if(isNullOrUndefined(value) || value === -1){
            throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        }

        // Otherwise return the value
        return value!;
    }

    private async setBrightness(value: CharacteristicValue): Promise<void>{
        this.log.debug(`${this.device.name}: Received ${value} from Homekit Brightness`);
        this.deviceService.setValue(this.device.deviceId, DeviceFunction.Brightness, value);
    }

    private async getTemperature(): Promise<CharacteristicValue>{
        // Try to get the value
        const kelvin = await this.deviceService.getValueAsInteger(this.device.deviceId, DeviceFunction.LightTemperature);
        const value = normalizeValue(kelvin as number, 6500, 2200, 140, 500, 1);
        this.log.debug(`${this.device.name}: Received ${kelvin} from Hubspace Color Temperature, sending ${value} to Homebridge`);

        // If the value is not defined then show 'Not Responding'
        if(isNullOrUndefined(value) || value === -1){
            throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        }

        // Otherwise return the value
        return value!;
    }

    private async setTemperature(value: CharacteristicValue): Promise<void>{
        // HomeKit Sends values with a min of 140 and a max of 500 with a step of 1
        // and Hubbridge expects values of a different scale such as 2200K to 6500K
        // with a step of 100
        const kelvin = normalizeValue(value as number, 140, 500, 6500, 2200, 100);
        this.log.debug(`${this.device.name}: Received ${value} from Homekit Color Temperature, sending ${kelvin}K to Hubridge`);
        this.deviceService.setValue(this.device.deviceId, DeviceFunction.LightTemperature, kelvin);
    }

    private async getHue(): Promise<CharacteristicValue>{
        // Try to get the value
        const value = await this.deviceService.getValueAsInteger(this.device.deviceId, DeviceFunction.LightColor);

        // If the value is not defined then show 'Not Responding'
        if(isNullOrUndefined(value) || value === -1){
            throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        }

        // Otherwise return the value
        return value!;
    }

    private async setHue(value: CharacteristicValue): Promise<void>{


        // this.deviceService.setValue(this.device.deviceId, DeviceFunction.LightColor, value);
    }

    private async getSaturation(): Promise<CharacteristicValue>{
        // // Try to get the value
        // const value = await this.deviceService.getValueAsInteger(this.device.deviceId, DeviceFunction.LightColor);

        // // If the value is not defined then show 'Not Responding'
        // if(isNullOrUndefined(value) || value === -1){
        //     throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        // }

        const value = 0;
        // Otherwise return the value
        return value!;
    }

    private async setSaturation(value: CharacteristicValue): Promise<void>{
        this.deviceService.setValue(this.device.deviceId, DeviceFunction.LightColor, value);
    }
}