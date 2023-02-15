import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, Service, Characteristic, PlatformConfig } from 'homebridge';
import { TokenService } from './services/token.service';
import { AccountService } from './services/account.service';
import { DiscoveryService } from './services/discovery.service';
import { DeviceService } from './services/device.service';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class HubspacePlatform implements DynamicPlatformPlugin {
    public readonly Service: typeof Service = this.api.hap.Service;
    public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
    public readonly accountService: AccountService;
    public readonly deviceService: DeviceService;

    private readonly _discoveryService: DiscoveryService;

    constructor(
        public readonly log: Logger,
        public readonly config: PlatformConfig,
        public readonly api: API,
    ) {
        // Init token service as singleton
        TokenService.init(this.config.username, this.config.password);
        // Configure private services
        this._discoveryService = new DiscoveryService(this);
        // Configure global services
        this.accountService = new AccountService(log);
        this.deviceService = new DeviceService(this);

        // Configure callbacks
        this.accountService.onAccountLoaded(this._discoveryService.discoverDevices.bind(this._discoveryService));
        this.api.on('didFinishLaunching', async () => this.accountService.loadAccount());

        this.log.debug('Finished initializing platform:', this.config.name);
    }

    /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
    configureAccessory(accessory: PlatformAccessory) {
        this._discoveryService.configureCachedAccessory(accessory);
    }
}
