(function( window, jQuery ) {

    if (typeof Fancy == "undefined") {
        console.error('Fancy is required');
        return;
    }
    var $ = jQuery,
        F = Fancy,
        scripts = document.getElementsByTagName( "script" ),
        src = scripts[scripts.length - 1].src,
        ping = src.replace( src.split( '/' )[src.split( '/' ).length - 1], 'fancypopup.wav' ),
        NAME = 'FancyPopup',
        visibility = false,
        html = {
            wrapper: $( '<div/>', {id: NAME} ),
            inner  : $( '<div/>', {id: NAME + '-inner'} ),
            close  : $( '<div/>', {id: NAME + '-close', html: 'x'} ),
            title  : $( '<div/>', {id: NAME + '-title'} ),
            text   : $( '<div/>', {id: NAME + '-content'} ),
            buttons: $( '<div/>', {id: NAME + '-buttons'} )
        },
        logged = false;
        
    function notify( src ) {
        var aud = '<audio autoplay="autoplay" style="display:none;" controls="controls">' + '<source src="' + src + '" /></audio>';
        
        setTimeout( function() {
            
        }, 2000 );$( '#FancyPopup-notify' ).remove();
        return $( '<div/>', {id: 'FancyPopup-notify', html: aud} ).appendTo( 'body' );
    }
    
    function display() {
        html.wrapper.append( html.inner.append( html.close ).append( html.title ).append( html.text ).append( html.buttons ) );
        $( 'body' ).append( html.wrapper );
        $( document ).on( 'keydown.FancyPopup', function( e ) {
            var keyCode = e.keyCode || e.which;
            if ( keyCode == 27 ) {
                close();
            }
        } );

        html.close.click( function() {
            close();
        } );
    }
    
    
    function close() {
        html.inner.addClass( 'hide' ).removeClass( 'show' );
        html.wrapper.fadeOut( 300 );
        setTimeout( function() {
            visibility = false;
        }, 300 );
    }
    
    function resize(animate) {
        var top = ($( window ).height() - html.inner.height()) / 2,
            left = ( $( window ).width() - html.inner.outerWidth() - 2 ) / 2,
            style = animate ? 'animate' : 'css';
        
        html.inner[style]( {left: left, top: top} );
    }
    
    function FancyPopup(settings) {
        var SELF = this;
        if(SELF.name == "Fancy")
            return new FancyPopup(settings);
        
        SELF.name = NAME;
        SELF.version = "2.0.0";
        SELF.settings = $.extend( {}, FancyPopup.settings, settings );
        
        SELF.close = close;
        
        SELF.resize = resize;
        
        if(!logged) {
            logged = true;
            F.version(SELF);
            display();
        }
        
        if ( !visibility ) {
            SELF.update();
            SELF.show();
        } else {
            SELF.update();
        }
        return SELF;
    }
    
    FancyPopup.api = FancyPopup.prototype = {};
    FancyPopup.api.update = function() {
        var SELF = this;
        html.text.html( SELF.settings.text || '' );
            html.title.html( SELF.settings.title || '' );
            html.buttons.html( '' );
            for( var i in SELF.settings.buttons ) {
                var b = SELF.settings.buttons[i],
                    button = $( '<div/>', {id: SELF.name + '-button-' + i, class: SELF.name + '-button button', html: b.title} );
                    
                button.on( 'click', function() {
                    if ( b.click )
                        b.click(self,button);
                    else
                        close();
                } ).attr( 'unselectable', 'on' ).css( 'user-select', 'none' ).on( 'selectstart', false );
                if ( i == 'ok' ) {
                    var focused = $(':focus').blur();
                    $( document ).on( 'keydown.FancyPopup', function( e ) {
                        var keyCode = e.keyCode || e.which;
                        if ( keyCode == 13 ) {
                            b.click(self,button);
                            //focused.focus();
                        }
                    } );
                }
                html.buttons.append( button );
            }
            html.wrapper.removeAttr( 'class' ).addClass(NAME + '-theme-' + this.settings.theme);
            
            if ( !this.settings.closeable )
                html.close.hide();
            else
                html.close.show();
            SELF.resize(visibility);
    };
    FancyPopup.api.show = function() {
        var SELF = this;
        html.wrapper.hide().fadeIn( 200 );
            html.inner.hide();
            
            setTimeout( function() {
                html.inner.show().addClass( 'show' ).removeClass( 'hide' );
                visibility = true;
            }, 200 );
            
            html.inner.css( SELF.settings );
            resize();
            
            if( SELF.settings.notification )
                notify( typeof SELF.settings.notification == 'string' ? SELF.settings.notification : ping);
    };
    
    FancyPopup.close = close;
    
    FancyPopup.resize = resize;
    
    FancyPopup.settings = {
        theme       : 'blunt',
        title       : false,
        buttons     : {},
        width       : 250,
        closeable   : true,
        notification: true
    };

    F.popup = F.api.popup = FancyPopup;
    
})(window, jQuery);
