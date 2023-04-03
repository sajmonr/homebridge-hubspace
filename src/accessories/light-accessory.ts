import { CharacteristicValue, PlatformAccessory } from 'homebridge';
import { HubspacePlatform } from '../platform';
import { HubspaceAccessory } from './hubspace-accessory';
import { isNullOrUndefined } from '../utils';
import { FunctionCharacteristic } from '../models/function-characteristic';
import convert from 'color-convert';

/**
 * Light accessory for Hubspace platform
 */
export class LightAccessory extends HubspaceAccessory{
    /**
     * Color information for lights that support RGB
     */
    private readonly _lightColor: {
        hue?: number;
        saturation?: number;
    } = {};

    /**
     * Crates a new instance of the accessory
     * @param platform Hubspace platform
     * @param accessory Platform accessory
     */
    constructor(platform: HubspacePlatform, accessory: PlatformAccessory) {
        super(platform, accessory, platform.Service.Lightbulb);

        this.configurePower();
        this.configureBrightness();
        this.configureColorRgb();
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

    private configureColorRgb(): void{
        if(!this.supportsCharacteristic(FunctionCharacteristic.ColorRgb)) return;

        this.service.getCharacteristic(this.platform.Characteristic.Hue)
            .onGet(this.getHue.bind(this))
            .onSet(this.setHue.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.Saturation)
            .onGet(this.getSaturation.bind(this))
            .onSet(this.setSaturation.bind(this));
    }

    private async getHue(): Promise<CharacteristicValue>{
        const deviceFc = this.getFunctionForCharacteristics(FunctionCharacteristic.ColorRgb);
        // Try to get the value
        const value = await this.deviceService.getValueAsString(this.device.deviceId, deviceFc);

        // If the value is not defined then show 'Not Responding'
        if(!value){
            this.setNotResponding();
        }

        const color = convert.hex.hsl(value);

        return color[0];
    }

    private async setHue(value: CharacteristicValue): Promise<void>{
        this._lightColor.hue = value as number;

        if(this.isColorDefined()){
            await this.setRgbColor(this._lightColor.hue!, this._lightColor.saturation!);
            this.resetColor();
        }
    }

    private async getSaturation(): Promise<CharacteristicValue>{
        const deviceFc = this.getFunctionForCharacteristics(FunctionCharacteristic.ColorRgb);
        // Try to get the value
        const value = await this.deviceService.getValueAsString(this.device.deviceId, deviceFc);

        // If the value is not defined then show 'Not Responding'
        if(!value){
            this.setNotResponding();
        }

        const color = convert.hex.hsl(value);

        return color[1];
    }

    private async setSaturation(value: CharacteristicValue): Promise<void>{
        this._lightColor.saturation = value as number;

        if(this.isColorDefined()){
            await this.setRgbColor(this._lightColor.hue!, this._lightColor.saturation!);
            this.resetColor();
        }
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

    private setRgbColor(hue: number, saturation: number): Promise<void>{
        const deviceFc = this.getFunctionForCharacteristics(FunctionCharacteristic.ColorRgb);
        const hexValue = convert.hsv.hex([hue, saturation, 100]) as string;

        return this.deviceService.setValue(this.device.deviceId, deviceFc, hexValue);
    }

    private resetColor(): void{
        this._lightColor.hue = undefined;
        this._lightColor.saturation = undefined;
    }

    private isColorDefined(): boolean{
        return !isNullOrUndefined(this._lightColor.hue) && !isNullOrUndefined(this._lightColor.saturation);
    }

}