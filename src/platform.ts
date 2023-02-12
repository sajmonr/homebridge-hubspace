import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, Service, Characteristic, PlatformConfig } from 'homebridge';
import { TokenService } from './services/token.service';
import { AccountService } from './services/account.service';
import { DiscoveryService } from './services/discovery.service';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class HubspacePlatform implements DynamicPlatformPlugin {
    public readonly Service: typeof Service = this.api.hap.Service;
    public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

    private readonly _discoveryService: DiscoveryService;

    // this is used to track restored cached accessories
    public readonly accessories: PlatformAccessory[] = [];

    constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
    ) {
        TokenService.init(this.config.username, this.config.password);
        this._discoveryService = new DiscoveryService(this);

        this.log.debug('Finished initializing platform:', this.config.name);

        // When this event is fired it means Homebridge has restored all cached accessories from disk.
        // Dynamic Platform plugins should only register new accessories after this event was fired,
        // in order to ensure they weren't added to homebridge already. This event can also be used
        // to start discovery of new accessories.
        this.api.on('didFinishLaunching', this.onFinishLaunching.bind(this));
    }

    /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
    configureAccessory(accessory: PlatformAccessory) {
        this._discoveryService.configureCachedAccessory(accessory);
    }

    async onFinishLaunching(): Promise<void>{
        this.log.debug('Executed didFinishLaunching callback');
        await AccountService.instance.loadAccount();
        // run the method to discover / register your devices as accessories
        this._discoveryService.discoverDevices();
    }
}
