const $ = jQuery; // eslint-disable-line no-unused-vars
import Cookies from 'js-cookie';
import { isEmpty, isUndefined } from 'lodash';

const isProduction = chatData.is_production; // eslint-disable-line
const helFiChatSrc = 'https://asiointi.hel.fi/chat/sote/cobrowse/js/gcb.min.js';
const helFiChatCbUrl = 'https://asiointi.hel.fi/chat/sote/cobrowse';
const helFiChatServerUrl = 'https://asiointi.hel.fi/chat/sote/cobrowse';
const helFiChatLanguage = 'FI';
const helFiChatTitle = 'Nuorten chat';
const helfiChatPlaceholder = 'Kirjoita viesti...';
const helfiChatMessage = 'Uusi viesti';

const url = decodeURIComponent( window.location.search );

// check if returning from suomi.fi tunnistautuminen
if ( url.indexOf( 'dir=in' ) !== -1 && url.indexOf( 'attachedData=update successfull' ) !== -1 ) {
    Cookies.set( 'gcLoginButtonState', 1 );
    window.location.href = chatData.home_url; // eslint-disable-line
}

// nuhe variables
let $nuheOpenChatBtn = '';
let $nuheOpenChatBtnWrapper = '';
let $startChatBtn = '';
let $gwcEmbeddedChat = '';
let $gwcChat = '';
let $gwcChatFocusables = '';
let chatStatus = '';
let $nuheChatLobby = '';
let $nuheChatLobbyFocusables = '';
let $closeChatLobbyBtn = '';
let $selectTopicBtn = '';

let chatMode = isUndefined( Cookies.get( 'nuheChatMode' ) ) ? 0 : parseInt( Cookies.get( 'nuheChatMode' ) );
let helfiChatChatTopic = isUndefined( Cookies.get( 'nuheChatTopicSelection' ) ) ? '0' : Cookies.get( 'nuheChatTopicSelection' );
let helFiChatService = 'TESTISIVU_TESTI';
let helFiChatLocalization = 'https://asiointi.hel.fi/chat/sote/custom/chat-testisivu-fi.json';

if ( isProduction ) {
    helFiChatService = chatMode === 1 ? 'NUORTEN_SOS' : 'NUORTEN_TER';
    helFiChatLocalization = 'https://asiointi.hel.fi/chat/sote/custom/chat-nuortenchat-fi.json';
}

const $chatCtrlButtons = `<div class="chat-controls">
                            <button type="button" class="gwc-chat-control-close chat-controls__btn--hidden" id="gwc-close-chat-btn"></button>
                            <button type="button" class="chat-controls__btn" id="js-close-chat-box" aria-label="${ chatData.close_chat_text }">`+ // eslint-disable-line
                                `<span aria-hidden="true" class="hds-icon hds-icon--cross-circle hds-icon--size-s"></span>
                            </button>
                         </div>`;
const $sendMessageBtn = `<button disabled type="button" class="gwc-send-message hds-button hds-button--primary" aria-label="${ chatData.send_message }">`+ // eslint-disable-line
                            `<span aria-hidden="true" class="hds-icon hds-icon--arrow-right hds-icon--size-m"></span>
                        </button>`;

const $gwcChatHeader = `<span class="chat-status-indicator">
                            <span aria-hidden="true" class="hds-icon hds-icon--speechbubble-text hds-icon--size-m">
                            </span>
                        </span>
                        <span id="chat-title" class="gwc-chat-title">
                            ${ helFiChatTitle }
                        </span>`;

function setGcReturnSessionId() {
    const gcReturnSessionId = Cookies.get( 'gcCurrentSession' );
    if ( isEmpty( gcReturnSessionId ) ) {
        alert( 'Virhe, ei voida tunnistaa käyttäjää, koska chat-keskustelu ei ole auki.' ); // eslint-disable-line
        return false;
    }

    // Found GS-chat session, setting it to helper cookie:
    Cookies.set( 'gcReturnSessionId', gcReturnSessionId );

    Cookies.set( 'gcReturnUrl', window.location.href );

    // save alternative return url for cookie:
    Cookies.set( 'gcAlternativeReturnUrl', window.location.href );
    return true;
}

function readInteractionIDFromSessionCookie( gcOriginalSessionID ) {
    const string = gcOriginalSessionID;
    const position = string.indexOf( '_' );
    const stringBegin = string.substring( 0, position );
    const stringLength = stringBegin.length - 16;
    const interactionIdString = stringBegin.substring( stringLength, stringBegin.Length );

    return interactionIdString;
}

function callShibboleth() {
    const gcOriginalSessionID = Cookies.get( 'gcCurrentSession' );

    if ( isEmpty( gcOriginalSessionID ) ) {
        return;
    }

    const interactionId = readInteractionIDFromSessionCookie( gcOriginalSessionID );
    const currentUrl = window.location.href;
    let shibbolethString = 'https://asiointi.hel.fi/chat/tunnistus/Shibboleth.sso/KAPALogin?';
    shibbolethString += 'target=';
    shibbolethString += 'https://asiointi.hel.fi/chat/tunnistus/MagicPage3/ReturnProcessor';
    shibbolethString += `%3ForigPage%3D${ currentUrl }?dir%3Din%26gcLoginButtonState%3D1%26errcode%3d0`;
    shibbolethString += `%26interactionId%3D${ interactionId }%26method%3D1%26version%3D2`;
    window.location = shibbolethString;
}

function addGenesysScript() {
    const id = 'genesys-js';

    if ( $( `#${ id }` ).length ) {
        return;
    }

    const fs = $( 'script' )[ 0 ];
    const script = `<script id="${ id }" src="${ helFiChatSrc }" data-gcb-url="${ helFiChatCbUrl }"></script>`;

    $( script ).insertBefore( fs );
}

function buildGenesysObject() {
    window._genesys = { // eslint-disable-line
        onReady: [],
        chat: {
            registration: false,
            localization: helFiChatLocalization,
            onReady: [],
            ui: {
                onBeforeChat: () => {
                    setTimeout( () => {
                        modifyChatElements();
                    }, 0 );

                    window._genesys.chat.onReady.push( function( chatWidgetApi ) { // eslint-disable-line
                        chatWidgetApi.restoreChat({
                            serverUrl: helFiChatServerUrl,
                            registration: ( done ) => {
                                done({
                                    service: helFiChatService,
                                    Language: helFiChatLanguage,
                                    chattopic: helfiChatChatTopic
                                });
                            }
                        }).done( function( session ) {
                            session.setUserData({
                                service: helFiChatService,
                                Language: helFiChatLanguage,
                                chattopic: helfiChatChatTopic
                            });
                            $( '.gwc-chat-message-input' ).on( 'keyup', function() {
                                const messageLength = $( this ).val().length;
                                if ( messageLength ) {
                                    $( '.gwc-send-message' ).prop( 'disabled', false );
                                } else {
                                    $( '.gwc-send-message' ).prop( 'disabled', true );
                                }
                            });
                            $( document ).on( 'click', '.gwc-send-message', function() {
                                const message = $( '.gwc-chat-message-input' ).val();
                                session.sendMessage( message );
                                $( '.gwc-chat-message-input' ).val( '' ).focus();
                            });
                            session.onMessageReceived( function( event ) {
                                $( '.gwc-chat-message-time' ).last().html( function() {
                                    const time = $( this ).html().slice( 1, -4 );
                                    $( this ).html( time );
                                });

                                let authorLabel = '';
                                let author = '';
                                let say = 'sanoo';

                                if ( event.party.id === 1 ) {
                                    authorLabel = 'Sinä';
                                    author = 'user';
                                    say = 'sanot';
                                } else if ( event.party.id === 2 ) {
                                    authorLabel = 'Järjestelmä';
                                    author = 'system';
                                } else {
                                    authorLabel = 'Sosiaali- ja terveysalan ammattilainen';
                                    author = 'agent';
                                }

                                $( '.gwc-chat-message-text' )
                                    .last()
                                    .addClass( `${ author }-message` )
                                    .attr( 'tabindex', 0 );

                                $( '.gwc-chat-message-author' )
                                    .last()
                                    .remove();

                                $( `.${ author }-message` )
                                    .last()
                                    .prepend( `<span class="sr-only">${ authorLabel } ${ say } : </span>` )
                                    .closest( '.gwc-chat-message' )
                                    .addClass( `gwc-chat-message--${ author }` );

                                $( '.gwc-chat-message-time' )
                                    .last().appendTo( $( `.${ author }-message` )
                                        .last() );

                                $( '.gwc-chat-message-time' ).attr({
                                    'aria-atomic': true
                                });
                            });
                            session.onSessionEnded( function() {
                                $( '.gwc-chat-message-input' ).attr( 'disabled', 'true' );
                                $( '.gwc-chat-btn' ).remove();
                            });
                        }).fail( function( par ) {
                            alert( par.description ); // eslint-disable-line no-alert
                        });
                    });
                }
            }
        },
        cobrowse: false
    };
}

function modifyChatElements() {
    $( '.gwc-chat-head' )
        .find( '.gwc-chat-title' )
        .replaceWith( $gwcChatHeader );
    $( '.gwc-chat-window-controls' ).remove();
    $( '.gwc-chat-head' ).append( $chatCtrlButtons );
    $( '.gwc-chat-branding' ).remove();
    $( '.gwc-chat-body' )
        .prepend( '<a class="chat-auth-btn" href="#" aria-label="Tunnistaudu tästä, siirryt tunnistautumispalveluun">Tunnistaudu tästä</a>' );
    $( '.gwc-chat-message-form' ).append( $sendMessageBtn );
    $( '.gwc-chat-message-input' )
        .attr({
            placeholder: helfiChatPlaceholder,
            tabIndex: '0',
            ariaLabel: helfiChatMessage,
            onInput: 'this.parentNode.dataset.replicatedValue = this.value'
        })
        .wrap( '<div class="grow-wrap"></div>' );
    $( '.gwc-chat-systemMessage' ).removeClass( 'gwc-chat-systemMessage' ).addClass( 'gwc-chat-message--system' ).find( '.gwc-chat-message-text' ).attr( 'tabindex', 0 ).prepend( '<span class="sr-only">Järjestelmä sanoo : </span>' );

    const $chatWindow = $( '.gwc-chat-embedded-window' );
    $chatWindow.attr({
        'aria-label': helFiChatTitle,
        'role': 'region'
    });
    $( '.gwc-persistent-chat-messages' ).attr( 'aria-live', 'polite' );

    const chatGcLoginButtonState = Cookies.get( 'gcLoginButtonState' );
    const $chatAuthElem = $( '.chat-auth-btn' );
    const $messageContainer = $( '.gwc-chat-message-container' );

    if ( chatGcLoginButtonState === '1' ) {// eslint-disable-line
        $chatAuthElem.hide();
        $messageContainer.css( 'top', '110px' );
    } else {
        $chatAuthElem.show();
        $messageContainer.css( 'top', '165px' );
    }
}

function initChat() {
    $gwcEmbeddedChat = $( '.gwc-chat-embedded-window' );
    $nuheOpenChatBtn = $( '#js-nuhe-open-chat' );
    $nuheOpenChatBtnWrapper = $nuheOpenChatBtn.parent();

    if ( ! $gwcEmbeddedChat.length ) {
        $nuheOpenChatBtnWrapper.show();
    }

    $startChatBtn = $( '.gcb-startChat' );
    $startChatBtn.attr( 'tabindex', '0' );
    $startChatBtn.attr( 'onkeypress', 'onEnter(event, this)' );
    $startChatBtn.attr( 'role', 'button' );
}

function getChatStatus( init = false ) {
    $.ajax({
        url: chatData.chat_status_url, // eslint-disable-line
        success: ( data ) => {
            if ( init ) {
                initChat();
                addClickFunctions();
            }

            if ( data === false || data === chatStatus ) {
                return;
            }

            chatStatus = data;

            const body = $( 'body' );

            if ( ! body.hasClass( 'chat-open' ) && ! body.hasClass( 'chat-closed' ) ) {
                body.addClass( chatStatus === 'open' ? 'chat-open' : 'chat-closed' );
                return;
            }

            if ( body.hasClass( 'chat-open' ) ) {
                body.addClass( 'chat-closed' ).removeClass( 'chat-open' );
            } else {
                body.addClass( 'chat-open' ).removeClass( 'chat-closed' );
            }
        }
    });
}

function onEnter( e, el ) {
    if ( e.keyCode === 13 ) {
        el.click();
    }
}

function handleTabKeyDown( e ) {
    if ( e.keyCode !== 9 ) {
        return;
    }

    const chatLobbyVisible = ! isEmpty( $nuheChatLobby ) && $nuheChatLobby.is( ':visible' ) ? true : false;

    if ( isEmpty( $gwcChat ) ) {
        $gwcChat = $( '.gwc-chat' );
    }

    $gwcChatFocusables = filterFocusables( $gwcChat.find( 'div[role="button"], button, a, textarea' ) );

    const gwcChatVisible = $gwcChat.length && $gwcChat.is( ':visible' ) ? true : false;

    if ( ! chatLobbyVisible && ! gwcChatVisible ) {
        return;
    }

    const $targetParentLobby = $( e.target ).closest( '.nuhe-chat-lobby' )[ 0 ];
    const $targetParentGwc = $( e.target ).closest( '.gwc-chat' )[ 0 ];
    const focusables = $nuheChatLobby.is( ':visible' ) ?
        $nuheChatLobbyFocusables :
        $gwcChatFocusables;
    const firstFocusableElement = focusables[ 0 ];
    const focusablesLength = focusables.length;
    const lastFocusableElement = focusables[ focusablesLength - 1 ];

    if ( isUndefined( $targetParentLobby ) && isUndefined( $targetParentGwc ) ) {
        e.preventDefault();
        focusables[ 0 ].focus();
    }

    if ( e.shiftKey && document.activeElement === firstFocusableElement ) {
        e.preventDefault();
        lastFocusableElement.focus();
    } else if ( ! e.shiftKey && document.activeElement === lastFocusableElement ) {
        e.preventDefault();
        firstFocusableElement.focus();
    }
}

function filterFocusables( elems ) {
    return elems.filter( ( idx, elem ) => {
        return $( elem ).css( 'display' ) !== 'none' && ! $( elem ).is( ':disabled' );
    });
}

function addClickFunctions() {

    // show chat window or chat lobby
    $nuheOpenChatBtn.click( function() {
        $nuheOpenChatBtn.attr( 'aria-expanded', true );
        $nuheOpenChatBtnWrapper.hide();
        if ( $gwcEmbeddedChat.length ) {
            $gwcEmbeddedChat.show();
        } else {
            $nuheChatLobby.show().focus().attr( 'aria-hidden', false );
            $nuheChatLobby.focus();
        }
    });

    // close chat lobby
    $closeChatLobbyBtn.on( 'keyup click', function( e ) {
        if ( e.type === 'keyup' && e.keyCode !== 13 && e.keyCode !== 32 ) {
            return;
        }

        $nuheChatLobby.hide().attr( 'aria-hidden', true );
        $nuheOpenChatBtnWrapper.show();
        $nuheOpenChatBtn.attr( 'aria-expanded', false );
    });

    // start chat session by clicking a topic button
    $selectTopicBtn.click( function() {
        $nuheChatLobby.hide();
        chatMode = $( this ).data( 'chatMode' );
        if ( isProduction ) {
            helFiChatService = chatMode === 1 ? 'NUORTEN_SOS' : 'NUORTEN_TER';
        }
        helfiChatChatTopic = $( this ).data( 'topic' );
        Cookies.set( 'nuheChatTopicSelection', helfiChatChatTopic );
        Cookies.set( 'nuheChatMode', chatMode );
        $startChatBtn.click();
    });

    $( document ).on( 'click', '#js-close-chat-box', function() {
        if ( ! confirm( 'Oletko varma, että haluat lopettaa chat-keskustelun?' ) ) { // eslint-disable-line
            return;
        }

        $( '#gwc-close-chat-btn' ).click();

        const cookiesToBeDeleted = [
            'gcCurrentSession',
            'nuheChatMode',
            'nuheChatTopicSelection',
            'gcLoginButtonState',
            'gcReturnSessionId'
        ];
        cookiesToBeDeleted.forEach( ( elem ) => {
            Cookies.remove( elem );
        });

        window.location = window.location.href;
    });

    $( document ).on( 'click', '.chat-auth-btn', function( e ) {
        e.preventDefault();
        const testReturnSessionId = setGcReturnSessionId();
        if ( testReturnSessionId ) {
            callShibboleth();
        }
    });
}

$( 'body' ).on( 'DOMSubtreeModified', function() {

    // init chat after chat dom elements appended
    if ( $( '.gcb-startBtnsContainer' ).length ) {
        $( this ).off( 'DOMSubtreeModified' );
        getChatStatus( true );
    }
});

$( document ).ready( () => {
    $nuheChatLobby = $( '.nuhe-chat-lobby' );
    $nuheChatLobbyFocusables = filterFocusables( $nuheChatLobby.find( 'span[role="button"], button, a, textarea' ) );
    $closeChatLobbyBtn = $( '#js-close-lobby-btn' );
    $selectTopicBtn = $( '.chat-topic-btn' );

    setInterval( () => {
        getChatStatus();
    }, 30000 );

    addGenesysScript();

    buildGenesysObject();
});

$( document ).on( 'keydown', ( e ) => handleTabKeyDown( e ) );
