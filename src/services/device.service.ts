import { HubspacePlatform } from '../platform';
import { Endpoints } from '../api/endpoints';
import { createHttpClientWithBearerInterceptor } from '../api/http-client-factory';
import { DeviceAttribute } from '../models/device-attributes';
import { AxiosError, AxiosResponse } from 'axios';
import { DeviceStatusResponse } from '../responses/device-status-response';
import { CharacteristicValue } from 'homebridge';
import { convertNumberToHex } from '../utils';

/**
 * Service for interacting with devices
 */
export class DeviceService{

    private readonly _httpClient = createHttpClientWithBearerInterceptor({
        baseURL: Endpoints.API_BASE_URL
    });


    constructor(private readonly _platform: HubspacePlatform){ }

    /**
     * Sets an attribute value for a device
     * @param deviceId ID of a device
     * @param attribute Attribute to set
     * @param value Value to set to attribute
     */
    async setValue(deviceId: string, attribute: DeviceAttribute, value: CharacteristicValue): Promise<void>{
        let response: AxiosResponse;

        try{
            response = await this._httpClient.post(`accounts/${this._platform.accountService.accountId}/devices/${deviceId}/actions`, {
                type: 'attribute_write',
                attrId: attribute,
                data: this.getDataValue(value)
            });
        }catch(ex){
            this._platform.log.error('Remote service is not reachable.', (<AxiosError>ex).message);
            return;
        }

        if(response.status === 200) return;

        this._platform.log.error(`Remote server did not accept new value ${value} for device (ID: ${deviceId}).`);
    }

    /**
     * Gets a value for attribute
     * @param deviceId ID of a device
     * @param attribute Attribute to get value for
     * @returns Data value
     */
    async getValue(deviceId: string, attribute: DeviceAttribute): Promise<CharacteristicValue | undefined>{
        let deviceStatus: DeviceStatusResponse;

        try{
            const response = await this._httpClient.get<DeviceStatusResponse>(`accounts/${this._platform.accountService.accountId}/devices/${deviceId}?expansions=attributes`)
            deviceStatus = response.data;
        }catch(ex){
            this._platform.log.error('Remote service returned an error.', (<AxiosError>ex).message)

            return undefined;
        }

        const attributeResponse = deviceStatus.attributes.find(a => a.id === attribute);

        if(!attributeResponse){
            this._platform.log.error(`Failed to find value for ${attribute} for device (device ID: ${deviceId})`);
            return undefined;
        }

        return attributeResponse.value;
    }

    /**
     * Gets a value for attribute as boolean
     * @param deviceId ID of a device
     * @param attribute Attribute to get value for
     * @returns Boolean value
     */
    async getValueAsBoolean(deviceId: string, attribute: DeviceAttribute): Promise<boolean | undefined>{
        const value = await this.getValue(deviceId, attribute);

        if(!value) return undefined;

        return value === '1';
    }

    /**
     * Gets a value for attribute as integer
     * @param deviceId ID of a device
     * @param attribute Attribute to get value for
     * @returns Boolean value
     */
    async getValueAsInteger(deviceId: string, attribute: DeviceAttribute): Promise<number | undefined>{
        const value = await this.getValue(deviceId, attribute);
    
        if(!value || typeof value !== 'string') return undefined;

        const numberValue = Number.parseInt(value);

        return Number.isNaN(numberValue) ? undefined : numberValue;
    }

    private getDataValue(value: CharacteristicValue): string{

        if(typeof value === 'boolean'){
            return value ? '01' : '00';
        }

        if(typeof value === 'number'){
            return convertNumberToHex(value);
        }

        throw new Error('The value type is not supported.');
    }

}