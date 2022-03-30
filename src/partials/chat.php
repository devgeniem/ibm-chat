<?php
/**
 * Chat
 */

use \Geniem\IBM\ChatPlugin;

$strings     = ChatPlugin::strings();
$chat_topics = ChatPlugin::get_chat_topics();
$chat_img    = ChatPlugin::get_plugin_uri() . '/assets/images/chat-people.png';
?>

<div class="nuhe-chat">
    <div class="nuhe-chat-lobby" aria-hidden="true">
        <div class="nuhe-chat-lobby__header">
            <span class="chat-status-indicator">
                <span aria-hidden="true" class="hds-icon hds-icon--speechbubble-text hds-icon--size-m"></span>
            </span>
            <span class="nuhe-chat-lobby-title">
                <?php echo wp_kses_post( $strings['title'] ); ?>
            </span>
            <span tabindex="0" id="js-close-lobby-btn" role="button"
                  aria-label="<?php esc_html_e( 'Sulje chatin aula' ); ?>"
                class="hds-icon hds-icon--angle-down hds-icon--size-m"></span>
        </div>
        <div class="nuhe-chat-lobby__body">
            <div class="nuhe-chat-topics">
                <p class="nuhe-chat-topic-title nuhe-chat-topic-title--open">
                    <?php echo esc_html( $strings['chat_open_text'] ); ?>
                </p>
                <p class="nuhe-chat-topic-title nuhe-chat-topic-title--open">
                    <?php echo esc_html( $strings['topic_one_title'] ); ?>
                </p>
                <p class="nuhe-chat-topic-title nuhe-chat-topic-title--closed">
                    <?php echo esc_html( $strings['chat_open_text'] ); ?>
                </p>
                <p class="nuhe-chat-topic-title nuhe-chat-topic-title--closed">
                    <?php echo esc_html( $strings['chat_closed_text'] ); ?>
                </p>
                <ul class="nuhe-chat-topics-list" aria-label="<?php echo esc_html( $strings['topic_one_title'] ); ?>">
                    <?php foreach ( $chat_topics['group_one'] as $topic ) : ?>
                        <li>
                            <button type="button" data-chat-mode="1" data-topic=<?php echo esc_attr( $topic['topic_id'] ) ;?> class="hds-button hds-button--primary hds-button--fog chat-topic-btn">
                                <span class="hds-button__label">
                                    <?php echo esc_html( $topic['title'] ); ?>
                                </span>
                            </button>
                        </li>
                    <?php endforeach; ?>
                </ul>
                <p class="nuhe-chat-topic-title nuhe-chat-topic-title--mt nuhe-chat-topic-title--open">
                    <?php echo esc_html( $strings['topic_two_title'] ); ?>
                </p>
                <ul class="nuhe-chat-topics-list" aria-label="<?php echo esc_html( $strings['topic_two_title'] ); ?>">
                    <?php foreach ( $chat_topics['group_two'] as $topic ) : ?>
                        <li>
                            <button type="button" data-chat-mode="2" data-topic=<?php echo esc_attr( $topic['topic_id'] ) ;?> class="hds-button hds-button--primary hds-button--suomenlinna chat-topic-btn">
                                <span class="hds-button__label">
                                    <?php echo esc_html( $topic['title'] ); ?>
                                </span>
                            </button>
                        </li>
                    <?php endforeach; ?>
                </ul>
                <ul class="nuhe-chat-topics-list nuhe-chat-topics-list--mt">
                    <?php foreach ( $chat_topics['group_three'] as $topic ) : ?>
                        <li>
                            <button type="button" data-chat-mode="1" data-topic=<?php echo esc_attr( $topic['topic_id'] ) ;?> class="hds-button hds-button--primary hds-button--engel chat-topic-btn">
                                <span class="hds-button__label">
                                    <?php echo esc_html( $topic['title'] ); ?>
                                </span>
                            </button>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
            <div class="nuhe-chat-footer">
                <p>
                    <?php echo esc_html( $strings['footer_text'] ); ?>
                </p>
                <img src="<?php echo $chat_img; ?>" alt="chat-people">
            </div>  
        </div>
    </div>
    <div class="nuhe-chat-open-wrapper">
        <button type="button" tabindex="0" id="js-nuhe-open-chat" class="nuhe-chat-open-btn hds-button hds-button--primary"
                aria-expanded="false" aria-label="<?php echo esc_html( $strings['title_label'] ) . ',' . esc_html( 'Avaa chatin aula' ); ?>">
            <span class="chat-status-indicator">
                <span aria-hidden="true" class="hds-icon hds-icon--speechbubble-text hds-icon--size-m"></span>
            </span>
            <span class="hds-button__label nuhe-chat-open-btn__label">
                <?php echo wp_kses_post( $strings['chat_open_btn_title'] ); ?>
            </span>
            <span aria-hidden="true" class="hds-icon hds-icon--angle-up hds-icon--size-m"></span>
        </button>
    </div>
</div>