import { Logger, PlatformAccessory, Service, WithUUID } from 'homebridge';
import { Device } from '../models/device';
import { DeviceFunction } from '../models/device-functions';
import { HubspacePlatform } from '../platform';
import { DeviceService } from '../services/device.service';

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
    }

    /**
     * Checks whether function is supported by device
     * @param deviceFunction Function to check
     * @returns True if function is supported by the device otherwise false
     */
    protected supportsFunction(deviceFunction: DeviceFunction): boolean{
        return this.device.functions.some(fc => fc === deviceFunction);
    }

}