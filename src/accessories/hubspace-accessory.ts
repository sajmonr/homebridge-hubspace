import { Logger, PlatformAccessory, Service, WithUUID } from 'homebridge';
import { Device } from '../models/device';
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
        service: WithUUID<typeof Service>
    ) { 
        this.service = accessory.getService(service) || this.accessory.addService(this.platform.Service.Lightbulb);

        this.log = platform.log;
        this.deviceService = platform.deviceService;
        this.device = accessory.context.device;
    }
}