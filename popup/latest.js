(function ( window, $ ) {

    Fancy.require ( {
        jQuery: false,
        Fancy : "1.1.0"
    } );
    var NAME       = 'FancyPopup',
        VERSION    = "2.0.1",
        visibility = false,
        html       = {
            wrapper: $ ( '<div/>', {
                id: NAME
            } ),
            inner  : $ ( '<div/>', {
                id: NAME + '-inner'
            } ),
            close  : $ ( '<div/>', {
                id  : NAME + '-close',
                html: 'x'
            } ),
            title  : $ ( '<div/>', {
                id: NAME + '-title'
            } ),
            text   : $ ( '<div/>', {
                id: NAME + '-content'
            } ),
            buttons: $ ( '<div/>', {
                id: NAME + '-buttons'
            } )
        },
        logged     = false;

    function display () {
        html.wrapper.append ( html.inner.append ( html.close ).append ( html.title ).append ( html.text ).append ( html.buttons ) );
        $ ( 'body' ).append ( html.wrapper );
        $ ( document ).on ( 'keydown.FancyPopup', function ( e ) {
            var keyCode = e.keyCode || e.which;
            if ( keyCode == 27 ) {
                close ();
            }
        } );

        html.close.click ( function () {
            close ();
        } );
    }

    function close () {
        html.inner.addClass ( 'hide' ).removeClass ( 'show' );
        html.wrapper.fadeOut ( 300 );
        setTimeout ( function () {
            visibility = false;
        }, 300 );
    }

    function resize ( animate ) {
        var top   = ( $ ( window ).height () - html.inner.height () ) / 2,
            left  = ( $ ( window ).width () - html.inner.outerWidth () - 2 ) / 2,
            style = animate ? 'animate' : 'css';

        html.inner[ style ] ( {
            left: left,
            top : top
        } );
    }

    function FancyPopup ( settings ) {
        var SELF = this;

        SELF.name     = NAME;
        SELF.version  = VERSION;
        SELF.settings = $.extend ( {}, FancyPopup.settings, settings );

        SELF.close = close;

        SELF.resize = resize;

        if ( !logged ) {
            logged = true;
            Fancy.version ( SELF );
            display ();
        }

        if ( !visibility ) {
            SELF.update ();
            SELF.show ();
        } else {
            SELF.update ();
        }
        return SELF;
    }


    FancyPopup.api = FancyPopup.prototype = {};
    FancyPopup.api.version = VERSION;
    FancyPopup.api.name    = NAME;
    FancyPopup.api.update  = function ( settings ) {
        var SELF = this;
        if ( settings )
            SELF.settings = $.extend ( {}, FancyPopup.settings, settings );
        html.text.html ( SELF.settings.text || '' );
        html.title.html ( SELF.settings.title || '' );
        html.buttons.html ( '' );
        for ( var i in SELF.settings.buttons ) {
            var b      = SELF.settings.buttons [ i ],
                button = $ ( '<div/>', {
                    id   : SELF.name + '-button-' + i,
                    class: SELF.name + '-button button',
                    html : b.title
                } );

            button.on ( 'click', function () {
                if ( b.click )
                    b.click.call ( SELF, button );
                else
                    close ();
            } ).attr ( 'unselectable', 'on' ).css ( 'user-select', 'none' ).on ( 'selectstart', false );
            if ( i == 'ok' ) {
                var focused = $ ( ':focus' ).blur ();
                $ ( document ).on ( 'keydown.FancyPopup', function ( e ) {
                    var keyCode = e.keyCode || e.which;
                    if ( keyCode == 13 ) {
                        if ( b.click )
                            b.click.call ( SELF, button );
                        else
                            close ();
                        //focused.focus();
                    }
                } );
            }
            html.buttons.append ( button );
        }
        html.wrapper.removeAttr ( 'class' ).addClass ( NAME + '-theme-' + this.settings.theme );

        if ( !this.settings.closeable )
            html.close.hide ();
        else
            html.close.show ();
        SELF.resize ( visibility );
    };
    FancyPopup.api.show    = function () {
        var SELF = this;
        html.wrapper.hide ().fadeIn ( 200 );
        html.inner.hide ();

        setTimeout ( function () {
            html.inner.show ().addClass ( 'show' ).removeClass ( 'hide' );
            visibility = true;
        }, 200 );

        html.inner.css ( SELF.settings );
        resize ();

    };

    FancyPopup.close = close;

    FancyPopup.resize = resize;

    FancyPopup.settings = {
        theme    : 'blunt',
        title    : false,
        text     : false,
        width    : 250,
        closeable: true
    };

    Fancy.popup = Fancy.api.popup = function ( settings ) {
        return new FancyPopup ( settings );
    };

}) ( window, jQuery );
