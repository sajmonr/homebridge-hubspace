import { PlatformConfig } from 'homebridge';

/**
 * Checks whether all configuration values are valid
 * @param config Config object
 * @returns True if plugin configuration is valid otherwise false
 */
export function isConfigValid(config: PlatformConfig): boolean{
    return !(
        !config.username ||
        !config.password ||
        !config.name
    );
}