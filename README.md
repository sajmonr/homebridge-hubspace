
![npm](https://img.shields.io/npm/v/homebridge-hubspace)

<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" height="150">

</p>


# Homebridge Hubspace plugin
Hubspace is a platform for range of devices sold at HomeDepot. This plugin tries to integrate as many of these devices so that you can control them from HomeKit.

# Disclaimer
I do not own any rights to Hubspace. Any work published here is solely for my own convenience. I am not making any guarantees about the code or products referenced here.

# Tested products
Below you can find a table of products that have been tested with this plugin. Some products share similarities among one another (e.g. lights), however, that does not guarantee that they will all work.

Not all features for all products are implemented. Please see the functions below of what is implemented. If you need a feature that is not implemented create an issue for it.

| Product | Functions supported |
| --- | --- |
| [Universal Smart Wi-Fi 4-Speed Ceiling Fan](https://www.homedepot.com/p/Hampton-Bay-Universal-Smart-Wi-Fi-4-Speed-Ceiling-Fan-White-Remote-Control-For-Use-Only-With-AC-Motor-Fans-Powered-by-Hubspace-76278/315169181?) | <ul><li>Light on/off</li><li>Fan on/off</li><li>Light brightness</li><li>Fan speed</li></ul> |

# Development
There is no official documentation for Hubspace products. Under the hood they use Afero cloud as the mechanism that controls the products. Any functionality here is gained by experimenting with various functions of the devices. Afero provides simple explanation of [their APIs](https://developer.afero.io/API-DeviceEndpoints), however, this is in no way comprehensive.

If you find that a product does not work as intended, or you want to request a new product, please create a ticket for it in the issues section. You are always more than welcome to create a PR with any fixes or additions to the plugin.

## Development authentication
Hubspace platform uses [Keycloak](https://www.keycloak.org) for authentication. To develop new features you will need to request JWT from Keycloak to authenticate your requests against the platform.

To get the token send HTTP request with `x-www-form-urlencoded` body to the URL below.
```
POST https://accounts.hubspaceconnect.com/auth/realms/thd/protocol/openid-connect/token
```

Your payload should include the following fields.

| Key | Value |
| --- | --- |
| grant_type | password |
| client_id | hubspace_android |
| username | YOUR_USERNAME |
| password | YOUR_PASSWORD |

Once you receive the token you can make request to Afero with it to investigate the devices and commands.