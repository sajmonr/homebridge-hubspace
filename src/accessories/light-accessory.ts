import { CharacteristicValue, PlatformAccessory } from 'homebridge';
import { HubspacePlatform } from '../platform';
import { HubspaceAccessory } from './hubspace-accessory';
import { isNullOrUndefined, normalizeValue, hexToRgb, rgbToHsv, hsvToRgb, rgbToHex } from '../utils';
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
        if(!this.configureColor()) {
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

        this.log.debug(`${this.device.name}: Received ${value} from Hubspace Power`);

        // Otherwise return the value
        return value!;
    }

    private async setOn(value: CharacteristicValue): Promise<void>{
        this.log.debug(`${this.device.name}: Received ${value} from Homekit Power`);
        await this.deviceService.setValue(this.device.deviceId, DeviceFunction.LightPower, value);
    }

    private async getBrightness(): Promise<CharacteristicValue>{
        // Try to get the value
        const value = await this.deviceService.getValueAsInteger(this.device.deviceId, DeviceFunction.Brightness);

        // TODO: understand what undefined would look like for this??
        // If the value is not defined then show 'Not Responding'
        if(isNullOrUndefined(value) || value === -1){
            this.log.error(`${this.device.name}: Received Comm Failure for get Brightness`);
            throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        }

        this.log.debug(`${this.device.name}: Received ${value} from Hubspace Brightness`);

        // Otherwise return the value
        return value!;
    }

    private async setBrightness(value: CharacteristicValue): Promise<void>{
        // TODO: handle the 0 brightness value as off
        this.log.debug(`${this.device.name}: Received ${value} from Homekit Brightness`);
        this.deviceService.setValue(this.device.deviceId, DeviceFunction.Brightness, value);
    }

    private async getTemperature(): Promise<CharacteristicValue>{
        // Try to get the value
        const kelvin = await this.deviceService.getValueAsInteger(this.device.deviceId, DeviceFunction.LightTemperature);

        // TODO: understand what undefined would look like for this??
        // If the value is not defined then show 'Not Responding'
        if(isNullOrUndefined(kelvin) || kelvin === -1){
            this.log.error(`${this.device.name}: Received Comm Failure for get Temperature`);
            throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        }

        const value = normalizeValue(kelvin as number, 6500, 2200, 140, 500, 1);
        this.log.debug(`${this.device.name}: Received ${kelvin} from Hubspace Color Temperature, sending ${value} to Homebridge`);

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

    /**
     * Hue and Saturation work odd in Homekit. As Hubspace works in RGB color space with one item, Hue and Saturation
     * can come over in any order from Homekit. So we need to keep track of who is sent first and update once the other
     * comes over.
     */
    private hue : CharacteristicValue = -1;
    private saturation : CharacteristicValue = -1;

    private async getHue(): Promise<CharacteristicValue>{
        this.setColorMode();

        // Try to get the value
        const rgb = await this.deviceService.getValue(this.device.deviceId, DeviceFunction.LightColor);

        // TODO: understand what undefined would look like for this??
        // If the value is not defined then show 'Not Responding'
        // if(isNullOrUndefined(rgb) || rgb === -1){
        //     this.log.error(`${this.device.name}: Received Comm Failure for get Hue`);
        //     throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        // }

        const [r, g, b] = hexToRgb(rgb as string);
        const [h, s, v] = rgbToHsv(r, g, b);
        this.log.debug(
            `${this.device.name}: Received ${rgb} from Hubspace Color RGB, sending ${h} to Homebridge for Hue`);

        // Otherwise return the value
        return (h as CharacteristicValue)!;
    }

    private async setHue(value: CharacteristicValue): Promise<void>{
        this.setColorMode();

        // Both values are unknown, so set Hue and expect Saturation to send it over once that is received
        if (this.hue === -1 && this.saturation === -1) {
            this.hue = value;

            this.log.debug(
                `${this.device.name}: Received ${value} from Homekit Hue, waiting for Saturation`);

            return;
        }
        // Saturation has already been sent over, it's now Hue job to send over the RGB value with the saturation value
        else if (this.hue === -1 && this.saturation !== -1) {
            const [r, g, b] = hsvToRgb(value as number, this.saturation as number, 100);

            // Set Saturation back to unknown
            this.saturation = -1;

            const hexRgb = rgbToHex(r, g, b);

            this.log.debug(
                `${this.device.name}: Received ${value} from Homekit Hue, sending ${hexRgb} from to Hubspace Color RGB`);

            this.deviceService.setValue(this.device.deviceId, DeviceFunction.LightColor, hexRgb);
        } else {
            this.log.error(`${this.device.name}: Received ${value} from Homekit Hue, but cannot send without a Saturation value`);
        }

    }

    private async getSaturation(): Promise<CharacteristicValue>{
        this.setColorMode();
        // Try to get the value
        const rgb = await this.deviceService.getValue(this.device.deviceId, DeviceFunction.LightColor);
        // If the value is not defined then show 'Not Responding'
        if(isNullOrUndefined(rgb) || rgb === -1){
            this.log.error(`${this.device.name}: Received Comm Failure for get Saturation`);
            throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        }

        const [r, g, b] = hexToRgb(rgb as string);
        const [h, s, v] = rgbToHsv(r, g, b);
        this.log.debug(
            `${this.device.name}: Received ${rgb} from Hubspace Color RGB, sending ${s} to Homebridge for Saturation`);

        // Otherwise return the value
        return (s as CharacteristicValue)!;
    }

    private async setSaturation(value: CharacteristicValue): Promise<void>{
        this.setColorMode();

        // Both values are unknown, so set Saturation and expect Hue to send it over once that is received
        if (this.hue === -1 && this.saturation === -1) {
            this.saturation = value;

            this.log.debug(
                `${this.device.name}: Received ${value} from Homekit Saturation, waiting for Hue`);

            return;
        }
        // Saturation has already been sent over, it's now Hue job to send over the RGB value with the saturation value
        else if (this.hue !== -1 && this.saturation === -1) {
            const [r, g, b] = hsvToRgb(this.hue as number, value as number, 100);

            // Set hue back to unknown
            this.hue = -1;

            const hexRgb = rgbToHex(r, g, b);

            this.log.debug(
                `${this.device.name}: Received ${value} from Homekit Saturation, sending ${hexRgb} from to Hubspace Color RGB`);

            this.deviceService.setValue(this.device.deviceId, DeviceFunction.LightColor, hexRgb);
        } else {
            this.log.error(`${this.device.name}: Received ${value} from Homekit Saturation, but cannot send without a Hue value`);
        }
    }

    private setColorMode(): void{
        // Color Mode is a boolean value used to switch between temperature and color modes, 1 is for Color RGB Mode and 0 is for
        // Color Temperature Mode. It is possible for a user to change it back in to Color Temperature Mode using the Hubspace app
        // but homekit should only be working in color RGB mode if the lightbulb supports color.
        this.deviceService.setValue(this.device.deviceId, DeviceFunction.ColorMode, 1);
    }
}