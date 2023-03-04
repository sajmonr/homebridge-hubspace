/**
 * This is the name of the platform that users will use to register the plugin in the Homebridge config.json
 */
export const PLATFORM_NAME = 'Hubspace';

/**
 * This must match the name of your plugin as defined the package.json
 */
export const PLUGIN_NAME = 'homebridge-hubspace';

/**
 * Current NPM package version
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
export const PACKAGE_VERSION: string = require('../package.json').version;