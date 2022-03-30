<?php
/**
 * Plugin Name: IBM Chat
 * Plugin URI: https://github.com/devgeniem/ibm-chat
 * Description: IBM Chat plugin
 * Version: 0.1.0
 * Requires PHP: 7.0
 * Author: Geniem Oy
 * Author URI: https://geniem.com
 * License: GPL v3 or later
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain: ibm-chat
 * Domain Path: /languages
 */

use Geniem\IBM\ChatPlugin;

// Check if Composer has been initialized in this directory.
// Otherwise we just use global composer autoloading.
if ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
    require_once __DIR__ . '/vendor/autoload.php';
}

\add_action( 'rest_api_init', [ ChatPlugin::class, 'register_custom_rest_route' ] );

// Initialize the plugin.
\add_action( 'plugins_loaded', 'init' );

function init() {
    // Return early if language is en
    if ( ChatPlugin::get_current_language() === 'en' ) {
        return;
    }

    // Get the plugin version.
    $plugin_data    = get_file_data( __FILE__, [ 'Version' => 'Version' ], 'plugin' );
    $plugin_version = $plugin_data['Version'];
    $plugin_path    = __DIR__;

    ChatPlugin::init( $plugin_version, $plugin_path );
}
