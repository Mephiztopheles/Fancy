(function ( window, $ ) {

    Fancy.require ( {
        jQuery: false,
        Fancy : "1.1.0"
    } );

    function preventSelect ( el ) {
        return el.on ( "selectstart", false ).attr ( 'unselectable', "on" ).css ( "userSelect", "none" );
    }

    var i       = 1,
        NAME    = "FancyNotify",
        VERSION = "2.2.0",
        logged  = false;

    function FancyNotify ( element, settings ) {
        var SELF      = this;
        SELF.settings = $.extend ( {}, Fancy.settings [ NAME ], settings );
        var pattern   = {
            title  : {
                type    : "String|Number",
                required: true
            },
            text   : {
                type    : "String|Number",
                required: true
            },
            buttons: {
                type : "Array",
                types: "Object"
            },
            icon   : {
                type: "Object|String"
            },
            steady : {
                type: "Boolean"
            }
        };
        Fancy.check ( SELF.settings, pattern );
        SELF.id       = i;
        SELF.element  = element;
        SELF.version  = VERSION;
        SELF.name     = NAME;
        if ( !logged ) {
            logged = true;
            Fancy.version ( SELF );
        }
        if ( element.selector && SELF.settings.steady ) {
            localStorage [ NAME + "-" + i ] = JSON.stringify ( {
                element : element.selector,
                settings: settings
            } );
        }

        SELF.html = {
            wrapper: preventSelect ( $ ( "<div/>", {
                id     : NAME + "-wrapper-" + SELF.id,
                "class": NAME + "-wrapper"
            } ) ),
            inner  : $ ( "<div/>", {
                id     : NAME + "-inner-" + SELF.id,
                "class": NAME + "-inner"
            } ),
            content: $ ( "<div/>", {
                id     : NAME + "-content-" + SELF.id,
                "class": NAME + "-content"
            } ),
            title  : $ ( "<div/>", {
                id     : NAME + "-title-" + SELF.id,
                "class": NAME + "-title",
                html   : SELF.settings.title
            } ),
            body   : $ ( "<div/>", {
                id     : NAME + "-body-" + SELF.id,
                "class": NAME + "-body",
                html   : SELF.settings.text
            } ),
            icon   : $ ( "<div/>", {
                id     : NAME + "-icon-" + SELF.id,
                "class": NAME + "-icon"
            } ),
            buttons: $ ( "<div/>", {
                id     : NAME + "-buttons-" + SELF.id,
                "class": NAME + "-buttons"
            } ),
            close  : $ ( "<div/>", {
                id     : NAME + "-close-" + SELF.id,
                "class": NAME + "-close"
            } )
        };

        if ( SELF.settings.buttons.length ) {
            SELF.settings.buttons.forEach ( function ( it ) {
                var btn = $ ( "<div/>", {
                    "class": NAME + "-button",
                    text   : it.title,
                    style  : "width: " + ( 100 / SELF.settings.buttons.length ) + "%"
                } );
                SELF.html.buttons.append ( btn );
                btn.on ( "click", function () {
                    it.click.call ( SELF, it );
                } );
            } );
        }

        SELF.html.wrapper.append ( SELF.html.inner.append ( SELF.html.content.append ( SELF.html.icon ).append ( SELF.html.title ).append ( SELF.html.body ) ).append ( SELF.html.close ) ).append ( SELF.html.buttons );

        if ( typeof SELF.settings.icon === "object" ) {
            SELF.html.icon.append ( SELF.settings.icon );
        } else {
            SELF.html.icon.addClass ( SELF.settings.icon );
        }

        SELF.html.close.on ( "click", function () {
            SELF.close ();
        } );

        SELF.element.append ( SELF.html.wrapper );
        i++;

    }


    FancyNotify.api = FancyNotify.prototype = {};
    FancyNotify.api.version = VERSION;
    FancyNotify.api.name    = NAME;
    FancyNotify.api.close   = function () {
        localStorage.removeItem ( NAME + "-" + this.id );
        this.html.wrapper.remove ();
    };

    Fancy.settings [ NAME ] = {
        title  : "",
        text   : "",
        buttons: [],
        icon   : "",
        steady : false
    };

    Fancy.notify     = VERSION;
    Fancy.api.notify = function ( settings ) {
        if ( this.element.length > 1 ) {
            var data = [];
            this.element.each ( function () {
                data.push ( new FancyNotify ( $ ( this ), settings ) );
            } );
            return data;
        } else {
            return new FancyNotify ( this.element, settings );
        }
    };

    $ ( document ).ready ( function () {
        for ( var item in localStorage ) {
            if ( item.indexOf ( NAME ) === 0 ) {
                new FancyNotify ( $ ( JSON.parse ( localStorage [ item ] ).element ), JSON.parse ( localStorage [ item ] ).settings );
            }
        }
    } );
}) ( window, jQuery );
