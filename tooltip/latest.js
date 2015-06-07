(function ( $ ) {

    Fancy.require ( {
        jQuery: false,
        Fancy : "1.1.0"
    } );

    var i       = 1,
        NAME    = "FancyTooltip",
        VERSION = "2.1.0",
        logged  = false,
        mouse   = {
            x: 0,
            y: 0
        };

    $.expr [ ':' ].truncated = function ( obj ) {
        var $this = $ ( obj );
        var $c    = $this.clone ().css ( {
            display   : 'inline',
            width     : 'auto',
            visibility: 'hidden'
        } ).appendTo ( 'body' );

        var c_width = $c.width ();
        $c.remove ();

        if ( c_width > $this.width () )
            return true;
        else
            return false;
    };

    function sp ( el ) {
        var position            = el.css ( "position" ),
            excludeStaticParent = position === "absolute",
            scrollParent        = el.prop ( 'nodeName' ) == "TEXTAREA" && el [ 0 ].scrollHeight - el.outerHeight () > 0 ? el : false;
        if ( !el )
            scrollParent = el.parents ().filter ( function () {
                var parent = $ ( this );
                if ( excludeStaticParent && parent.css ( "position" ) === "static" ) {
                    return false;
                }
                return ( /(auto|scroll)/ ).test ( parent.css ( "overflow" ) + parent.css ( "overflow-y" ) + parent.css ( "overflow-x" ) ) && parent [ 0 ].scrollHeight - parent.outerHeight () > 0;
            } ).eq ( 0 );
        return position === "fixed" || !scrollParent.length ? $ ( el [ 0 ].ownerDocument.body || document.body ) : scrollParent;
    }


    window.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    function FancyTooltip ( element, settings ) {
        var SELF     = this;
        SELF.id      = i;
        SELF.name    = NAME;
        SELF.version = VERSION;
        SELF.element = element;
        SELF.timer   = 0;
        i++;

        SELF.settings = $.extend ( {}, Fancy.settings [ NAME ], settings );
        SELF.html     = {
            tooltip: $ ( '<div/>', {
                id   : NAME,
                class: SELF.settings.animation
            } ),
            inner  : $ ( '<div/>', {
                id: NAME + '-inner'
            } ),
            arrow  : $ ( '<div/>', {
                id: NAME + '-arrow'
            } )
        };
        SELF.html.tooltip.append ( SELF.html.arrow );
        SELF.html.tooltip.append ( SELF.html.inner );

        if ( !logged ) {
            logged = true;
            Fancy.version ( SELF );
            $ ( document ).on ( 'mousemove.' + NAME, function ( e ) {
                mouse.x = e.clientX || e.pageX;
                mouse.y = e.clientY || e.pageY;
            } );
        }

        SELF.hide ();
        if ( SELF.settings.zIndex >= 0 )
            SELF.html.tooltip.css ( 'zIndex', SELF.settings.zIndex );

        SELF.getOffset = function () {
            var left = mouse.x - SELF.settings.left + sp ( SELF.element ) [ 0 ].scrollLeft,
                top  = mouse.y + SELF.settings.top + sp ( SELF.element ) [ 0 ].scrollTop,
                css  = {};

            SELF.html.tooltip.css ( {
                whiteSpace: 'nowrap'
            } );
            SELF.html.tooltip.removeClass ( "left" );
            if ( left + SELF.html.tooltip.width () + 60 >= window.innerWidth ) {
                SELF.html.tooltip.addClass ( "left" );
                left -= SELF.html.tooltip.outerWidth () + SELF.settings.left * 2;
            }
            SELF.html.tooltip.css ( {
                whiteSpace: ''
            } );
            css.top  = top;
            css.left = left;

            return css;
        };

        SELF.element.addClass ( SELF.name + "-element" );
        SELF.element.data ( SELF.name, SELF );
        if ( !SELF.element.data ( 'title' ) )
            SELF.element.data ( 'title', SELF.element.attr ( 'title' ) );
        SELF.element.removeAttr ( 'title' );

        if ( SELF.settings.cursor && SELF.element.css ( 'cursor' ) == 'auto' )
            SELF.element.css ( 'cursor', SELF.settings.cursor );

        var observer = new MutationObserver ( function ( mutation ) {
            var mut = mutation [ 0 ];
            if ( mut.type = "attributes" && mut.attributeName == "title" && SELF.element.attr ( 'title' ) ) {
                SELF.element.data ( 'title', SELF.element.attr ( 'title' ) );
                SELF.element.removeAttr ( 'title' );
            }
        } );
        observer.observe ( SELF.element [ 0 ], {
            attributes: true
        } );

        SELF.element [ 0 ].addEventListener ( "DOMNodeRemovedFromDocument", function () {
            SELF.hide ();
        }, false );

        SELF.element.hover ( function ( e ) {
            if ( SELF.settings.query ( SELF.element, SELF.settings.ever, $ ( "." + NAME + "-element:truncated" ).is ( SELF.element ) ) && !SELF.settings.disabled ) {
                clearTimeout ( SELF.timer );
                setTimeout ( function () {
                    if ( !SELF.settings.disabled )
                        SELF.show ();
                    if ( SELF.settings.move ) {
                        $ ( document ).on ( 'mousemove.' + NAME + "-" + SELF.id, function ( e ) {
                            if ( !SELF.html.tooltip.hasClass ( 'in' ) )
                                SELF.html.tooltip.addClass ( 'in' );
                            SELF.html.tooltip.css ( SELF.getOffset () );
                        } );
                    }
                }, SELF.settings.delay );
            }
        }, function () {
            SELF.timer = setTimeout ( function () {
                SELF.hide ();
                if ( SELF.settings.move ) {
                    $ ( document ).unbind ( "." + NAME + "-" + SELF.id );
                }
                SELF.element.removeClass ( NAME + "-hover" );
            }, 50 );
        } );

        return SELF;
    }


    FancyTooltip.api = FancyTooltip.prototype = {};
    FancyTooltip.api.version = VERSION;
    FancyTooltip.api.name    = NAME;
    FancyTooltip.api.disable = function () {
        this.elements.removeClass ( NAME );
        this.settings.disabled = true;
        this.hide ();
        return this;
    };

    FancyTooltip.api.enable = function () {
        this.settings.disabled = false;
        this.elements.addClass ( NAME );
        return this;
    };

    FancyTooltip.api.show = function () {
        var SELF = this;
        $ ( "body" ).append ( SELF.html.tooltip );
        if ( this.settings.animation ) {
            clearTimeout ( this.timer );
            SELF.html.tooltip.removeClass ( 'in out' ).addClass ( 'in' );
        } else {
            SELF.html.tooltip.css ( 'opacity', 1 );
        }

        SELF.element.addClass ( NAME + "-hover" );
        SELF.html.inner.html ( SELF.element.data ( 'title' ) || SELF.element.html () );
        SELF.html.tooltip.css ( {
            position: 'absolute',
            top     : SELF.getOffset ().top,
            left    : SELF.getOffset ().left,
            maxWidth: window.innerWidth / 3
        } );
        return this;
    };

    FancyTooltip.api.destroy = function () {
        var SELF = this;
        SELF.hide ();
        SELF.element.removeClass ( NAME + '-hover' );
        $ ( document ).unbind ( '.' + NAME + "-" + SELF.id );
    };

    FancyTooltip.api.hide = function () {
        var SELF = this;
        if ( SELF.settings.animation ) {
            SELF.html.tooltip.addClass ( 'out' );
            SELF.timer = setTimeout ( function () {
                SELF.html.tooltip.remove ();
            }, 200 );
        } else {
            SELF.html.tooltip.remove ();
        }
        return this;
    };

    Fancy.settings [ NAME ] = {
        top     : 30,
        left    : 30,
        ever    : true,
        text    : false,
        move    : true,
        delay   : false,
        disabled: false,
        query   : function () {
            return true;
        },
        cursor  : false
    };

    Fancy.tooltip     = true;
    Fancy.api.tooltip = function ( settings ) {
        return this.set ( FancyTooltip, settings );
    };
}) ( jQuery );
