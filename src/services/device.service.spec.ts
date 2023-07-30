import { HomebridgeAPI } from 'homebridge/lib/api';
import { HubspacePlatform } from '../platform';
import { DiscoveryService } from './discovery.service';
import { FunctionCharacteristic } from '../models/function-characteristic';
import { DeviceFunction } from '../models/device-function';

describe('Device', () => {
    describe('Landscape Transformer', () => {
        xdescribe('real API', () => {
            it('should find devices and be able to toggle power', async () => {
                const api = new HomebridgeAPI();
                const platform = new HubspacePlatform(
                    console,
                  {name: 'Hubspace', username: process.env.HUBSPACE_USERNAME, password: process.env.HUBSPACE_PASSWORD} as any,
                  api
                );

                await platform.accountService.loadAccount();
                await platform.discoveryService.discoverDevices();

                const devices = await platform.discoveryService.getDevicesForAccount();
                expect(devices.length).toBeGreaterThanOrEqual(4);
                const zone1 = devices[1];
                expect(zone1.functions.map(f => f.characteristic)).toEqual([FunctionCharacteristic.Power]);
                const powerFunction = zone1.functions.find(f => f.characteristic === FunctionCharacteristic.Power);
                expect(powerFunction).toBeDefined();
                await platform.deviceService.setValue(zone1.deviceId, powerFunction as DeviceFunction, 0);
                const newValue = await platform.deviceService.getValue(zone1.deviceId, powerFunction as DeviceFunction);
                expect(newValue).toEqual('0');
            });
        });

        describe('mock API', () => {
            it('should find devices and be able to toggle power', async () => {
                const api = new HomebridgeAPI();
                const platform = new HubspacePlatform(
                    console,
                  {name: 'Hubspace', username: 'fake.user@email.com', password: 'fakepassword'} as any,
                  api
                );
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const mockTransformerData = require('../accessories/__mockdata__/landscape-transformer.json');
                platform.discoveryService['_httpClient'].get = jest.fn().mockImplementation((url: string) => {
                    if (url.includes('metadevices')) {
                        return Promise.resolve({data: mockTransformerData});
                    }
                    return Promise.reject('mock not implemented');
                });
                platform.deviceService['_httpClient'].get = jest.fn().mockResolvedValue({
                    data: {
                        deviceId: '1234',
                        attributes: [{
                            id: 2,
                            data: '1',
                            value: '0',
                            updatedTimestamp: 0
                        }]
                    }
                });
                platform.deviceService['_httpClient'].post = jest.fn().mockResolvedValue({status: 200});

                await platform.discoveryService.discoverDevices();

                const devices = await platform.discoveryService.getDevicesForAccount();
                expect(devices.length).toBeGreaterThanOrEqual(4);
                const zone1 = devices[1];
                expect(zone1.functions.map(f => f.characteristic)).toEqual([FunctionCharacteristic.Power]);
                const powerFunction = zone1.functions.find(f => f.characteristic === FunctionCharacteristic.Power);
                expect(powerFunction).toBeDefined();
                await platform.deviceService.setValue(zone1.deviceId, powerFunction as DeviceFunction, 0);
                const newValue = await platform.deviceService.getValue(zone1.deviceId, powerFunction as DeviceFunction);
                expect(newValue).toEqual('0');
            });
        });
    });
});