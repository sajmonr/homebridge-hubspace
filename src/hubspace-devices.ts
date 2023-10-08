import { DeviceDef } from './models/device-def';
import { DeviceType } from './models/device-type';
import { FunctionCharacteristic } from './models/function-characteristic';

/**
 * Supported Hubspace devices and implemented functions
 */
export const Devices: DeviceDef[] = [
    {
        deviceClass: 'fan',
        deviceType: DeviceType.Fan,
        functions: [
            {
                functionClass: 'power',
                characteristic: FunctionCharacteristic.Power
            },
            {
                functionClass: 'fan-speed',
                characteristic: FunctionCharacteristic.FanSpeed
            }
        ]
    },
    {
        deviceClass: 'light',
        deviceType: DeviceType.Light,
        functions: [
            {
                functionClass: 'power',
                characteristic: FunctionCharacteristic.Power
            },
            {
                functionClass: 'brightness',
                characteristic: FunctionCharacteristic.Brightness
            },
            {
                functionClass: 'color-rgb',
                characteristic: FunctionCharacteristic.ColorRgb
            }
        ]
    },
    {
        deviceClass: 'power-outlet',
        deviceType: DeviceType.Outlet,
        functions: [
            {
                functionClass: 'power',
                characteristic: FunctionCharacteristic.Power
            },
            {
                functionClass: 'toggle',
                characteristic: FunctionCharacteristic.Power
            }
        ]
    },
    {
        deviceClass: 'switch',
        deviceType: DeviceType.Switch,
        functions: [
            {
                functionClass: 'power',
                characteristic: FunctionCharacteristic.Power
            }
        ]
    }
];
