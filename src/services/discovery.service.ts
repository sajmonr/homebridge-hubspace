import { PlatformAccessory } from 'homebridge';
import { HubspacePlatform } from '../platform';
import { DeviceResponse } from '../responses/devices-response';
import { PLATFORM_NAME, PLUGIN_NAME } from '../settings';
import { Endpoints } from '../api/endpoints';
import { createHttpClientWithBearerInterceptor } from '../api/http-client-factory';
import { getDeviceTypeForKey } from '../models/device-type';
import { Device } from '../models/device';
import { createAccessoryForDevice } from '../accessories/device-accessory-factory';
import { AxiosError } from 'axios';
import { DeviceFunctionResponse } from '../responses/device-function-response';
import { DeviceDef, DeviceFunctionDef } from '../models/device-def';
import { Devices } from '../hubspace-devices';
import { DeviceFunction } from '../models/device-function';

/**
 * Service for discovering and managing devices
 */
export class DiscoveryService{
    private readonly _httpClient = createHttpClientWithBearerInterceptor({
        baseURL: Endpoints.API_BASE_URL,
        headers: {
            host: 'semantics2.afero.net'
        }
    });

    private _cachedAccessories: PlatformAccessory[] = [];

    constructor(private readonly _platform: HubspacePlatform) { }

    /**
     * Receives accessory that has been cached by Homebridge
     * @param accessory Cached accessory
     */
    configureCachedAccessory(accessory: PlatformAccessory): void{
        // add the restored accessory to the accessories cache so we can track if it has already been registered
        this._cachedAccessories.push(accessory);
    }

    /**
     * Discovers new devices
     */
    async discoverDevices() {
        const devices = await this.getDevicesForAccount();

        // loop over the discovered devices and register each one if it has not already been registered
        for (const device of devices) {
            // see if an accessory with the same uuid has already been registered and restored from
            // the cached devices we stored in the `configureAccessory` method above
            const existingAccessory = this._cachedAccessories.find(accessory => accessory.UUID === device.uuid);

            if (existingAccessory) {
                // the accessory already exists
                this._platform.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
                this.registerCachedAccessory(existingAccessory, device);
            } else {
                // the accessory does not yet exist, so we need to create it
                this._platform.log.info('Adding new accessory:', device.name);
                this.registerNewAccessory(device);
            }
        }

        this.clearStaleAccessories(this._cachedAccessories.filter(a => !devices.some(d => d.uuid === a.UUID)));
    }

    private clearStaleAccessories(staleAccessories: PlatformAccessory[]): void{
        // Unregister them
        this._platform.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, staleAccessories);

        // Clear the cache array to reflect this change
        for(const accessory of staleAccessories){
            const cacheIndex = this._cachedAccessories.findIndex(a => a.UUID === accessory.UUID);

            if(cacheIndex < 0) continue;

            this._cachedAccessories.splice(cacheIndex, 1);
        }
    }

    private registerCachedAccessory(accessory: PlatformAccessory, device: Device): void{
        accessory.context.device = device;
        this._platform.api.updatePlatformAccessories([ accessory ]);

        createAccessoryForDevice(device, this._platform, accessory);
    }

    private registerNewAccessory(device: Device): void{
        const accessory = new this._platform.api.platformAccessory(device.name, device.uuid);

        accessory.context.device = device;

        createAccessoryForDevice(device, this._platform, accessory);

        this._platform.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }

    private async getDevicesForAccount(): Promise<Device[]>{
        try{
            const response = await this._httpClient
                .get<DeviceResponse[]>(`accounts/${this._platform.accountService.accountId}/metadevices`);

            // Get only leaf devices with type of 'device'
            return response.data
                .filter(d => d.children.length === 0 && d.typeId === 'metadevice.device')
                .map(this.mapDeviceResponseToModel.bind(this))
                .filter(d => d.length > 0)
                .flat();
        }catch(ex){
            this._platform.log.error('Failed to get devices for account.', (<AxiosError>ex).message);
            return [];
        }
    }

    private mapDeviceResponseToModel(response: DeviceResponse): Device[]{
        const type = getDeviceTypeForKey(response.description.device.deviceClass);
        const deviceDef = Devices.find(d => d.deviceType === type);

        if(!deviceDef) return [];

        const supportedFunctions = this.findSupportedFunctionsForDevice(deviceDef, response.description.functions);
        const devices: Device[] = [];

        for(const supportedFc of supportedFunctions){
            // Try to find a device that does NOT contain the same characteristic
            const exisingDevice = devices.find(d => !d.functions.some(df => df.characteristic === supportedFc.characteristic));

            // If the device already exists then just add the function to it
            if(exisingDevice){
                exisingDevice.functions.push(supportedFc);
            }else{
                // Otherwise create a new device for it
                const defaultName = response.friendlyName;
                const nameQualifier = supportedFc.functionInstance ?? devices.length;
                const newName = devices.some(d => d.name === defaultName) ? `${defaultName} (${nameQualifier})` : defaultName;

                // Make sure UUID is generated as many times as there are 'virtual' devices for each device
                // because they all have the same device ID
                devices.push({
                    uuid: this.generatedUuid(response.id, devices.length + 1),
                    deviceId: response.deviceId,
                    name: newName,
                    type: type,
                    manufacturer: response.description.device.manufacturerName,
                    model: response.description.device.model.split(',').map(m => m.trim()),
                    functions: [ supportedFc ]
                });

            }

        }

        return devices;
    }

    /**
     * Gets all functions that are supported (have been implemented) by the plugin
     * @param deviceDef Homebridge device definition
     * @param deviceFunctionResponse Hubspace device server response
     * @returns All functions from the response that are supported by the Homebridge device
     */
    private findSupportedFunctionsForDevice(deviceDef: DeviceDef, deviceFunctionResponse: DeviceFunctionResponse[]): DeviceFunction[]{
        const supportedFunctions: DeviceFunction[] = [];

        for(const fc of deviceDef.functions){
            const deviceFunctions = deviceFunctionResponse.filter(df => df.functionClass === fc.functionClass);

            if(deviceFunctions.length === 0) continue;

            for(const deviceFc of deviceFunctions){
                const functionModel = this.mapToFunction(fc, deviceFc);
                supportedFunctions.push(functionModel);
            }
        }

        return supportedFunctions;
    }

    /**
     * Generates UUID from a seed value
     * @param value Value to use for UUID seed
     * @param generations How many times to run the generation algorithm
     * @returns UUID
     */
    private generatedUuid(value: string, generations = 1): string{
        for(let i = 0; i < generations; i++){
            value = this._platform.api.hap.uuid.generate(value);
        }

        return value;
    }

    private mapToFunction(functionDef: DeviceFunctionDef, functionResponse: DeviceFunctionResponse): DeviceFunction{
        return {
            characteristic: functionDef.characteristic,
            functionInstance: functionResponse.functionInstance,
            attributeId: functionResponse.values[0].deviceValues[0].key
        };
    }

}