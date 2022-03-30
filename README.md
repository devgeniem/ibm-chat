# IBM Chat WordPress Plugin

Chat plugin works out of the box after activating it. The plugin checks current language ( ChatPlugin::get_current_language() ) on init and returns instantly if language is English. Please note that language check is based Polylang's function pll_current_language(). So if your site is not using that plugin, make sure the language check works.

Chat.js is based heavily on the code provided by IBM.

## Development

In case of modifying needed:

- `composer install`
- `npm ci && npm run watch`
