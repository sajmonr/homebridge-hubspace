import { Logger, PlatformAccessory, Service, WithUUID } from 'homebridge';
import { Device } from '../models/device';
import { HubspacePlatform } from '../platform';
import { DeviceService } from '../services/device.service';
import { FunctionCharacteristic } from '../models/function-characteristic';
import { DeviceFunction, NoDeviceFunction } from '../models/device-function';

/**
 * Base class for Hubspace accessories
 */
export abstract class HubspaceAccessory{

    /**
     * Accessory service
     */
    protected readonly service: Service;

    /**
     * Application logger
     */
    protected readonly log: Logger;

    /**
     * Device interaction service
     */
    protected readonly deviceService: DeviceService;

    /**
     * Device information
     */
    protected readonly device: Device;

    /**
     * Crates new instance of {@link HubspaceAccessory}
     * @param platform Hubspace platform
     * @param accessory Platform accessory
     * @param service Service type for accessory
     */
    constructor(
        protected readonly platform: HubspacePlatform,
        protected readonly accessory: PlatformAccessory,
        service: WithUUID<typeof Service> | Service
    ) {
        this.service = accessory.getService(service as WithUUID<typeof Service>) || this.accessory.addService(service as Service);

        this.log = platform.log;
        this.deviceService = platform.deviceService;
        this.device = accessory.context.device;

        this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Manufacturer, this.device.manufacturer ?? 'N/A')
            .setCharacteristic(this.platform.Characteristic.Model, this.device.model.length > 0 ? this.device.model[0] : 'N/A')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.device.deviceId ?? 'N/A');

    }

    /**
     * Tries to get a device function for characteristic
     * @param characteristic Characteristic for function
     * @returns Found device function or {@link NoDeviceFunction}
     */
    protected getFunctionForCharacteristics(characteristic: FunctionCharacteristic): DeviceFunction{
        const fc = this.device.functions.find(f => f.characteristic === characteristic);

        if(!fc){
            this.platform.log.error(`Failed get function for ${characteristic} it was not defined for device ${this.device.deviceId}.`);
            return NoDeviceFunction;
        }

        return fc;
    }

    /**
     * Checks whether function is supported by device
     * @param characteristic Function to check
     * @returns True if function is supported by the device otherwise false
     */
    protected supportsCharacteristic(characteristic: FunctionCharacteristic): boolean{
        return this.device.functions.some(fc => fc.characteristic === characteristic);
    }

    /**
     * throws {@link SERVICE_COMMUNICATION_FAILURE} exception
     */
    protected setNotResponding(): never{
        throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }

}