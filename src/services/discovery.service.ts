import axios from "axios";
import { PlatformAccessory } from "homebridge";
import { addBearerToken } from "../api/interceptors";
import { HubspacePlatform } from "../platform";
import { ExamplePlatformAccessory } from "../platformAccessory";
import { DeviceResponse } from "../responses/devices-response";
import { PLATFORM_NAME, PLUGIN_NAME } from "../settings";

export class DiscoveryService{

    private _cachedAccessories: PlatformAccessory[] = [];

    constructor(private readonly _platform: HubspacePlatform) { }

    /**
     * Receives accessory that has been cached by Homebridge
     * @param accessory Cached accessory
     */
    configureCachedAccessory(accessory: PlatformAccessory): void{
        this._platform.log.info('Loading accessory from cache:', accessory.displayName);

        // add the restored accessory to the accessories cache so we can track if it has already been registered
        this._cachedAccessories.push(accessory);
    }

    /**
   * This is an example method showing how to register discovered accessories.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */
    async discoverDevices() {
        const x = axios.create({
            headers: {
                host: 'semantics2.afero.net'
            }
        });

        x.interceptors.request.use(addBearerToken);

        const y = await x.get<DeviceResponse[]>('https://api2.afero.net/v1/accounts/d6948a17-ca76-430a-9fee-f1b6d541361b/metadevices');
        console.log(y.data.filter(d => d.children.length === 0 && d.typeId === 'metadevice.device'));
        // EXAMPLE ONLY
        // A real plugin you would discover accessories from the local network, cloud services
        // or a user-defined array in the platform config.
        const exampleDevices = [
            {
                exampleUniqueId: 'ABCD',
                exampleDisplayName: 'Bedroom',
            },
            {
                exampleUniqueId: 'EFGH',
                exampleDisplayName: 'Kitchen',
            },
        ];

        // loop over the discovered devices and register each one if it has not already been registered
        for (const device of exampleDevices) {

            // generate a unique id for the accessory this should be generated from
            // something globally unique, but constant, for example, the device serial
            // number or MAC address
            const uuid = this._platform.api.hap.uuid.generate(device.exampleUniqueId);

            // see if an accessory with the same uuid has already been registered and restored from
            // the cached devices we stored in the `configureAccessory` method above
            const existingAccessory = this._cachedAccessories.find(accessory => accessory.UUID === uuid);

            if (existingAccessory) {
                // the accessory already exists
                this._platform.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

                // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
                // existingAccessory.context.device = device;
                // this.api.updatePlatformAccessories([existingAccessory]);

                // create the accessory handler for the restored accessory
                // this is imported from `platformAccessory.ts`
                new ExamplePlatformAccessory(this._platform, existingAccessory);

                // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
                // remove platform accessories when no longer present
                // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
                // this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
            } else {
                // the accessory does not yet exist, so we need to create it
                this._platform.log.info('Adding new accessory:', device.exampleDisplayName);

                // create a new accessory
                const accessory = new this._platform.api.platformAccessory(device.exampleDisplayName, uuid);

                // store a copy of the device object in the `accessory.context`
                // the `context` property can be used to store any data about the accessory you may need
                accessory.context.device = device;

                // create the accessory handler for the newly create accessory
                // this is imported from `platformAccessory.ts`
                new ExamplePlatformAccessory(this._platform, accessory);

                // link the accessory to your platform
                this._platform.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
            }
        }
    }

}