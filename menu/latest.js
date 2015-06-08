(function ( w, $ ) {

    Fancy.require ( {
        jQuery: false,
        Fancy : "1.1.0"
    } );
    var NAME    = "FancyMenu",
        VERSION = "2.2.0",
        i       = 0,
        logged  = false;

    function FancyMenu ( element, settings ) {
        var SELF      = this;
        SELF.id       = i;
        SELF.element  = element;
        SELF.version  = VERSION;
        SELF.name     = NAME;
        SELF.settings = $.extend ( {}, Fancy.settings [ NAME ], settings );
        if ( !logged ) {
            logged = true;
            Fancy.version ( SELF );
        }
        this.init ();
        i++;
    }


    FancyMenu.api = FancyMenu.prototype = {};
    FancyMenu.api.version    = VERSION;
    FancyMenu.api.name       = NAME;
    FancyMenu.api.init       = function () {
        var SELF = this;
        SELF.createMenu ();
        SELF.element.addClass ( this.name + '-trigger' );
        SELF.element.data ( NAME, SELF );
        SELF.element.on ( "contextmenu." + NAME + "-" + SELF.id, function ( e ) {
            SELF.onOpen ( e );
            e.preventDefault ();
            e.stopPropagation ();
        } );

        var timer,
            touchduration = 1000;

        SELF.element.on ( "touchstart." + NAME + "-" + SELF.id, function ( e ) {
            timer = setTimeout ( function () {
                SELF.onOpen ( e );
            }, touchduration );
            e.preventDefault ();
        } );
        SELF.element.on ( "touchend." + NAME + "-" + SELF.id, function () {
            if ( timer )
                clearTimeout ( timer );
        } );

    };
    FancyMenu.api.createMenu = function () {
        var SELF    = this,
            wrapper = $ ( '<div/>', {
                id: NAME + '-wrapper'
            } ).attr ( 'unselectable', 'on' ).css ( 'user-select', 'none' ).on ( 'selectstart', false ),
            inner   = $ ( '<div/>', {
                id: NAME + '-inner'
            } ),
            menu    = $ ( '<ul/>', {
                id: NAME + '-menu'
            } );
        wrapper.append ( inner.append ( menu ) );

        for ( var name = 0; name < SELF.settings.menu.length; name++ ) {
            var n = SELF.settings.menu [ name ],
                m = $ ( '<li/>', {
                    id     : NAME + '-menu-' + name,
                    "class": NAME + '-menu-element'
                } ).data ( 'name', name );
            m.append ( $ ( '<span/>', {
                id     : NAME + '-menu-' + name + '-icon',
                "class": NAME + '-menu-icon ' + n.icon
            } ) );
            m.append ( $ ( '<span/>', {
                id     : NAME + '-menu-' + name + '-text',
                "class": NAME + '-menu-text',
                html   : n.title || n.name || name
            } ) );
            menu.append ( m );

        }

        this.menu = wrapper;
    };
    FancyMenu.api.onOpen     = function ( e ) {
        var SELF  = this;
        this.close ();
        this.createMenu ();

        $ ( 'body' ).append ( this.menu );
        $ ( '.' + NAME + '-menu-element' ).on ( 'click', function ( e ) {
            var name = $ ( this ).data ( 'name' );
            SELF.settings.menu [ name ].click && SELF.settings.menu [ name ].click.call ( SELF, e, name, $ ( this ) );
        } );
        $ ( document ).on ( 'mousedown.' + NAME + "-" + SELF.id + ' touchstart.' + NAME + "-" + SELF.id, function ( e ) {
            if ( $ ( e.target ).is ( SELF.menu ) || $ ( e.target ).closest ( SELF.menu ).length )
                return;
            SELF.close ();
        } );
        var pageX = e.pageX || e.originalEvent.touches [ 0 ].pageX;
        var pageY = e.pageY || e.originalEvent.touches [ 0 ].pageY;
        this.menu.css ( {
            left: pageX + 10,
            top : pageY + 10
        } );
    };
    FancyMenu.api.close      = function () {
        this.menu.remove ();
        $ ( document ).unbind ( '.' + NAME + "-" + this.id );
        this.settings.onClose.call ( this );
    };
    Fancy.settings [ NAME ]  = {
        menu   : [],
        onClose: function () {
        }

    };
    Fancy.menu               = VERSION;
    Fancy.api.menu           = function ( settings ) {
        return this.set ( FancyMenu, settings );
    };

}) ( window, jQuery );
