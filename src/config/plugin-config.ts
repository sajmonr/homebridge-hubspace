import { PlatformConfig } from 'homebridge';

/**
 * Plugin configuration
 */
export interface PluginConfig extends PlatformConfig{
    /**
     * Hubspace account username
     */
    username: string;
    /**
     * Hubspace account password
     */
    password: string;
}