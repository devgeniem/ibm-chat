<?php
/**
 * This file initializes all plugin functionalities.
 */

namespace Geniem\IBM;

/**
 * Class ChatPlugin
 *
 * @package Geniem\EventsNameSpace
 */
class ChatPlugin {

    /**
     * Rest route namespace.
     *
     * @var string
     */
    const REST_ROUTE_NAMESPACE = 'nuhe-chat';

    /**
     * Rest route base.
     *
     * @var string
     */
    const REST_ROUTE_BASE = 'status';

    /**
     * Holds the singleton.
     *
     * @var ChatPlugin
     */
    protected static $instance;

    /**
     * Current plugin version.
     *
     * @var string
     */
    protected $version = '';

    /**
     * Get the instance.
     *
     * @return ChatPlugin
     */
    public static function get_instance() : ChatPlugin {
        return self::$instance;
    }

    /**
     * The plugin directory path.
     *
     * @var string
     */
    protected $plugin_path = '';

    /**
     * The plugin root uri without trailing slash.
     *
     * @var string
     */
    protected $plugin_uri = '';

    /**
     * Get the version.
     *
     * @return string
     */
    public function get_version() : string {
        return $this->version;
    }

    /**
     * Get the plugin directory path.
     *
     * @return string
     */
    public function get_plugin_path() : string {
        return $this->plugin_path;
    }

    /**
     * Get the plugin directory uri.
     *
     * @return string
     */
    public function get_plugin_uri() : string {
        return $this->plugin_uri;
    }

    /**
     * Initialize the plugin by creating the singleton.
     *
     * @param string $version     The current plugin version.
     * @param string $plugin_path The plugin path.
     */
    public static function init( $version, $plugin_path ) {
        if ( empty( static::$instance ) ) {
            static::$instance = new self( $version, $plugin_path );
        }
    }

    /**
     * Get the plugin instance.
     *
     * @return ChatPlugin
     */
    public static function plugin() {
        return static::$instance;
    }

    /**
     * Initialize the plugin functionalities.
     *
     * @param string $version     The current plugin version.
     * @param string $plugin_path The plugin path.
     */
    protected function __construct( $version, $plugin_path ) {
        $this->version     = $version;
        $this->plugin_path = $plugin_path;
        $this->plugin_uri  = plugin_dir_url( $plugin_path ) . basename( $this->plugin_path );

        $this->hooks();
    }

    /**
     * Append chat html
     *
     * @return void
     */
    protected function render() {
        $template = self::get_current_language() === 'fi'
                    ? $this->plugin_path . '/src/partials/chat.php'
                    : $this->plugin_path . '/src/partials/chat-sv.php';
        ob_start();
        include $template;
        echo ob_get_clean();
    }

    /**
     * Add plugin hooks and filters.
     */
    protected function hooks() {
        \add_action( 'wp_enqueue_scripts', \Closure::fromCallable( [ $this, 'enqueue_public_scripts' ] ) );
        \add_action( 'wp_footer', \Closure::fromCallable( [ $this, 'render' ] ) );
        \add_action( 'after_setup_theme', \Closure::fromCallable( [ $this, 'init_textdomain' ] ) );
    }

    /**
     * Enqueue public side scripts if they exist.
     */
    public function enqueue_public_scripts() {

        $vendor_css_path = $this->plugin_path . '/assets/dist/vendor.css';

        if ( file_exists( $vendor_css_path ) ) {
            wp_enqueue_style(
                'nuhe_chat-vendor-css',
                $this->plugin_uri . '/assets/dist/vendor.css',
                [],
                filemtime( $vendor_css_path ),
                'all'
            );
        }

        $css_path = $this->plugin_path . '/assets/dist/main.css';

        if ( file_exists( $css_path ) ) {
            wp_enqueue_style(
                'nuhe_chat-public-css',
                $this->plugin_uri . '/assets/dist/main.css',
                [ 'nuhe_chat-vendor-css' ],
                filemtime( $css_path ),
                'all'
            );
        }


        if ( self::get_current_language() !== 'fi' ) {
            return;
        }

        $vendor_js_path = $this->plugin_path . '/assets/dist/vendor.js';

        if ( file_exists( $vendor_js_path ) ) {
            wp_enqueue_script(
                'nuhe_chat-vendor-js',
                $this->plugin_uri . '/assets/dist/vendor.js',
                [ 'jquery' ],
                filemtime( $vendor_js_path ),
                true
            );
        }

        $js_path = $this->plugin_path . '/assets/dist/main.js';

        if ( file_exists( $js_path ) ) {
            wp_register_script(
                'nuhe_chat-public-js',
                $this->plugin_uri . '/assets/dist/main.js',
                [ 'jquery' ],
                filemtime( $js_path ),
                true
            );

            $localized_data = [
                'chat_status_url'  => get_rest_url() . self::REST_ROUTE_NAMESPACE . '/' . self::REST_ROUTE_BASE,
                'home_url'         => home_url(),
                'close_chat_text'  => 'Sulje chat',
                'send_message'     => 'Lähetä viesti',
                'is_production'    => WP_ENV === 'production',
            ];
    
            \wp_localize_script( 'nuhe_chat-public-js', 'chatData', $localized_data );

            \wp_enqueue_script( 'nuhe_chat-public-js' );
        }
    }

    /**
     * Loads the plugin text domain.
     *
     * @return void
     */
    protected function init_textdomain() : void {
        \load_plugin_textdomain( 'ibm-chat-plugin', false, 'ibm-chat/languages/' );
    }

    /**
     * Strings
     *
     * @return array Array of strings.
     */
    public static function strings() : array {
        $title = apply_filters( 'nuhe_chat_title_text', 'Nuorten chat', 'ibm-chat' );

        return [
            'title'               => $title,
            'chat_open_text'      => apply_filters( 'nuhe_chat_open_text', 'Nuorten chat 16-29-vuotiaille helsinkiläisille.', 'ibm-chat' ),
            'topic_one_title'     => apply_filters( 'nuhe_chat_topics_title_one_text', 'Haluaisin jutella sosiaalialan ammattilaisen kanssa seuraavasta aiheesta:', 'ibm-chat' ),
            'topic_two_title'     => apply_filters( 'nuhe_chat_topics_title_two_text', 'Haluaisin jutella terveydenhoitajan kanssa seuraavasta aiheesta:', 'ibm-chat' ),
            'footer_text'         => apply_filters( 'nuhe_chat_footer_text', 'Laatikoita painamalla pääset keskustelemaan joko sosiaalialan ammattilaiselle (siniset laatikot) tai terveydenhoitajalle (vaaleanpunaiset laatikot). En osaa sanoa, haluan vain puhua jollekin -valinta ohjaa sinut suoraan sosiaalialan ammattilaiselle.', 'ibm-chat' ),
            'chat_open_btn_title' => $title,
            'chat_closed_text'    => apply_filters( 'nuhe_chat_closed_text', 'Chat on tällä hetkellä kiinni. Olemme auki arkisin klo 12-15.', 'ibm-chat' ),
            'title_label'         => $title,
        ];
    }

    /**
     * Get chat topics
     *
     * @return array Array of topics.
     */
    public static function get_chat_topics() : array {
        return [
            'group_one' => [
                [
                    'title'     => __( 'Oma koti & raha', 'ibm-chat' ),
                    'topic_id'  => 387,
                ],
                [
                    'title'     => __( 'Harrastukset & vapaa-aika', 'ibm-chat' ),
                    'topic_id'  => 658,
                ],
                [
                    'title'     => __( 'Yksinäisyys', 'ibm-chat' ),
                    'topic_id'  => 299,
                ],
                [
                    'title'     => __( 'Ihmissuhteet', 'ibm-chat' ),
                    'topic_id'  => 147,
                ],
                [
                    'title'     => __( 'Väkivalta', 'ibm-chat' ),
                    'topic_id'  => 617,
                ],
                [
                    'title'     => __( 'Opiskelu & työ', 'ibm-chat' ),
                    'topic_id'  => 925,
                ],
            ],
            'group_two' => [
                [
                    'title'     => __( 'Terveydenhoitaja', 'ibm-chat' ),
                    'topic_id'  => 887,
                ],
                [
                    'title'     => __( 'Kiusaaminen', 'ibm-chat' ),
                    'topic_id'  => 443,
                ],
                [
                    'title'     => __( 'Päihteet', 'ibm-chat' ),
                    'topic_id'  => 668,
                ],
                [
                    'title'     => __( 'Seksi, seksuaalisuus & ehkäisy', 'ibm-chat' ),
                    'topic_id'  => 559,
                ],
                [
                    'title'     => __( 'Mielenterveys', 'ibm-chat' ),
                    'topic_id'  => 240,
                ],
            ],
            'group_three' => [
                [
                    'title'     => __( 'En osaa sanoa, haluan vain puhua jollekin.', 'ibm-chat' ),
                    'topic_id'  => 121,
                ],
            ]
        ];
    }

    /**
     * Get current language
     */
    public static function get_current_language() {

        if ( function_exists( 'pll_languages_list' ) && function_exists( 'pll_current_language' ) ) {
            return \pll_current_language() ?? get_locale();
        }

        return get_locale();
    }

    /**
     * Get chat status
     */
    private static function get_chat_status() {
        if ( WP_ENV !== 'production' ) {
            return 'open';
        }

        $chatApiBaseUrl = 'https://asiointi.hel.fi/chat/kanslia/AvailabilityInfo/Query/terke/NUORTEN_CHAT_';
        $chatStatusUrls = [
            "{$chatApiBaseUrl}TERVEYSASIAT",
            "{$chatApiBaseUrl}SOSIAALIASIAT",
        ];

        $data = [];

        foreach ( $chatStatusUrls as $url ) {
            $response = wp_remote_get( $url );

            if ( 200 === wp_remote_retrieve_response_code( $response ) ) {
                $data[] = json_decode( wp_remote_retrieve_body( $response ) );
            }
        }

        if ( empty( $data ) ) {
            return false;
        }

        foreach ( $data as $source ) {
            $chat_open = ! empty( $source->PalveluAuki ) && $source->PalveluAuki === 'Kyllä';

            if ( $chat_open ) {
                return 'open';
            }
        }

        return 'closed';
    }

    /**
     * Register rest route
     */
    public static function register_custom_rest_route() {
        register_rest_route( self::REST_ROUTE_NAMESPACE, '/' . self::REST_ROUTE_BASE, [
            'methods' => 'GET',
            'callback' => \Closure::fromCallable( [ self::class, 'get_chat_status' ] ),
            'permission_callback' => '__return_true',
         ] );
    }
}
