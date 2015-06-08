(function ( $ ) {

    if ( typeof window.Fancy === "function" ) {
        console.error ( "Error: tried to load Fancy more than once" );
        return;
    }

    if ( typeof jQuery != "function" ) {
        console.error ( 'jQuery * > 1.7 required' );
        return;
    }

    function capitalize ( str ) {
        console.log ( str );
        return str [ 0 ].toUpperCase () + str.slice ( 1, str.length );
    }

    var logged = false;

    function Fancy ( element ) {
        if ( this == window )
            return new Fancy ( element );
        this.element = $ ( element );
        this.name    = "Fancy";
        if ( !logged ) {
            logged = true;
            Fancy.version ( this );
        }
    }


    Fancy.api = Fancy.prototype = {
        version: "1.1.1"
    };

    Fancy.isOpera        = !!window.opera || navigator.userAgent.indexOf ( ' OPR/' ) >= 0;
    Fancy.isFirefox      = typeof InstallTrigger !== 'undefined';
    Fancy.isSafari       = Object.prototype.toString.call ( window.HTMLElement ).indexOf ( 'Constructor' ) > 0;
    Fancy.isChrome       = !!window.chrome && !this.isOpera;
    Fancy.isIE           = !!document.documentMode;
    var n                = navigator.userAgent.toLowerCase ();
    Fancy.apple          = n.indexOf ( "iphone" ) > 0 || n.indexOf ( "ipad" ) > 0 || n.indexOf ( "ipod" ) > 0;
    Fancy.mobile         = n.indexOf ( "mobile" ) > 0 || Fancy.apple;
    Fancy.versionControl = true;

    Fancy.version = function ( plugin ) {
        if ( Fancy.versionControl ) {
            if ( Fancy.isChrome ) {
                console.log ( "%cThis page is using %c" + plugin.name + "%c\r\n Copyright \u00a9 %cMarkus Ahrweiler\r\n %cVersion: %c" + plugin.version, 'color: #000', 'color: #8E0000', 'color: #000', 'color: #49A54F', 'color: #000', 'color: blue' );
            } else {
                console.log ( "This page is using " + plugin.name + "\r\n Copyright\u00a9 Markus Ahrweiler\r\n Version: " + plugin.version );
            }

            $.ajax ( {
                url    : 'http://version.mephiztopheles.wtf/',
                data   : {
                    plugin: plugin.name
                },
                type   : 'POST',
                global : false,
                success: function ( v ) {
                    if ( v ) {
                        if ( Fancy.compareversion ( v, plugin.version ) ) {
                            if ( Fancy.isChrome ) {
                                console.warn ( '%cYou are using an older version of %c' + plugin.name + '. %cThe newest version is: ' + v, 'color: #000', 'color: #8E0000', 'color: #000' );
                            } else {
                                console.warn ( 'You are using an older version of ' + plugin.name + '. The newest version is: ' + v );
                            }
                        }
                    } else {
                        if ( Fancy.isChrome ) {
                            console.warn ( "Couldn't retrieve version control information for %c" + plugin.name + "%c!", 'color: #8E0000', 'color. #000' );
                        } else {
                            console.warn ( "Couldn't retrieve version control information for " + plugin.name + "!" );
                        }
                    }

                }

            } );
        }
    };

    Fancy.require = function ( plugins ) {
        for ( var i in plugins ) {
            var vers = window [ i ].prototype.version || ( i == "jQuery" ? jQuery.prototype.jquery : false );
            if ( typeof window [ i ] == "undefined" || ( vers && plugins [ i ] && Fancy.compareversion ( plugins [ i ], vers ) ) ) {
                throw "Error: " + i + " " + ( plugins [ i ] ? plugins [ i ] + " " : "" ) + "is required" + ( vers ? ", got " + vers : "" );
            }
        }
    };

    Fancy.compareversion = function ( needed, is ) {
        // returns true, if needed is greater than is;
        var c = [ parseInt ( needed.split ( "." ) [ 0 ] ), parseInt ( needed.split ( "." ) [ 1 ] ), parseInt ( needed.split ( "." ) [ 2 ] ) ],
            d = [ parseInt ( is.split ( "." ) [ 0 ] ), parseInt ( is.split ( "." ) [ 1 ] ), parseInt ( is.split ( "." ) [ 2 ] ) ];

        return c [ 0 ] > d [ 0 ] || ( c [ 0 ] == d [ 0 ] && c [ 1 ] > d [ 1 ] ) || ( c [ 1 ] == d [ 1 ] && c [ 2 ] > d [ 2 ] );
    };

    Fancy.check = function ( s, p ) {
        for ( var i in p ) {
            if ( p [ i ].type ) {
                var r = true;
                var t = p [ i ].type.split ( "|" );
                for ( var a = 0; a < t.length; a++ ) {
                    if ( r ) {
                        var type = s [ i ] instanceof window [ t [ a ] ] || typeof s [ i ] === t [ a ].toLowerCase ();
                        if ( type ) {
                            r = false;
                        }
                    }
                }
                if ( r ) {
                    throw "Error: Expected type " + t.join ( " or " ) + " but got " + capitalize ( typeof s [ i ] ) + " for " + i;
                }
            }

            if ( p [ i ].required ) {
                var r = false;
                switch ( typeof s[ i ] ) {
                    case "string":
                        if ( !s [ i ] )
                            r = true;
                        break;
                    case "object":
                        if ( s [ i ] === null )
                            r = true;
                        else if ( !Object.keys ( s [ i ] ).length )
                            r = true;
                        break;
                    case "undefined":
                        r = true;
                        break;
                }
                if ( r ) {
                    throw "Error: " + i + " is required";
                }
            }

            if ( p [ i ].types && s [ i ] && s [ i ].length ) {
                for ( var b = 0; b < s [ i ].length; b++ ) {
                    var t = p [ i ].types.split ( "|" ),
                        r = false;
                    for ( var a = 0; a < t.length; a++ ) {
                        if ( !r ) {
                            var type = s [ i ] [ b ] instanceof window [ t [ a ] ] || typeof s [ i ] [ b ] === t [ a ].toLowerCase ();

                            if ( s [ i ] [ b ] === null && t [ a ] != "Null" ) {
                                type = false;
                            }
                            if ( type ) {
                                r = true;
                            }
                        }
                    }
                    if ( !r ) {
                        throw "Error: Expected type " + t.join ( " or " ) + " but got " + capitalize ( s [ i ] [ b ] === null ? "null" : typeof s [ i ] [ b ] ) + " for " + i + "'s items";
                    }
                }

            }

        }

    };

    Fancy.watch = function ( obj, prop, handler ) {
        var oldval = obj[ prop ], newval = oldval,
            getter = function () {
                return newval;
            },
            setter = function ( val ) {
                oldval = newval;
                return newval = handler.call ( obj, prop, oldval, val );
            };
        if ( delete obj[ prop ] ) {
            if ( Object.defineProperty )
                Object.defineProperty ( obj, prop, {
                    get: getter,
                    set: setter
                } );
            else if ( Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__ ) {
                Object.prototype.__defineGetter__.call ( obj, prop, getter );
                Object.prototype.__defineSetter__.call ( obj, prop, setter );
            }
        }
        obj[ prop ] = oldval;
    };

    Fancy.unwatch = function ( obj, prop ) {
        var val     = obj[ prop ];
        delete obj[ prop ];
        obj[ prop ] = val;
    };

    Fancy.scrollParent = function ( el ) {
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
        return position === "fixed" || !scrollParent.length ? $ ( el [ 0 ].ownerDocument || document ) : scrollParent;
    };

    Fancy.settings = {};

    function construct ( constructor, args ) {
        function API () {
            return constructor.apply ( this, args );
        }

        API.prototype = constructor.prototype;
        return new API ();
    }

    Fancy.api.set = function ( api ) {
        var args = [],
            instance;
        for ( var a = 1; a < arguments.length; a++ ) {
            args.push ( arguments[ a ] );
        }
        if ( this.element.length ) {
            var data = this.get ( api.prototype.name );
            if ( data && data.length ) {
                for ( var i = 0; i < data.length; i++ ) {
                    if ( typeof data [ i ] == "undefined" ) {
                        instance   = construct ( $ ( this.element [ i ] ), args );
                        data [ i ] = instance;
                        $ ( this.element [ i ] ).data ( instance.name, instance );
                    }
                }
            }
            if ( !data ) {
                instance = construct ( this.element, args );
                this.element.data ( instance.name, instance );
                return instance;
            } else
                return data;
        }
    };

    Fancy.api.get = function ( name ) {
        if ( name.indexOf ( 'Fancy' ) != 0 ) {
            if ( typeof this [ name ] == "function" ) {
                name = "Fancy" + name [ 0 ].toUpperCase () + name.slice ( 1, name.length );
            } else {
                if ( this.isChrome )
                    console.error ( "\"%c" + name + "%c\" is not a function of Fancy!", "color: blue", "color: #000" );
                else
                    console.error ( "\"" + name + "\" is not a function of Fancy!" );
                return false;
            }
        }
        if ( this.element.length > 1 ) {
            var ret = [];
            this.element.each ( function () {
                ret.push ( $ ( this ).data ( name ) );
            } );
            return ret;
        }
        return this.element.data ( name );
    };

    window.Fancy = Fancy;
}) ( jQuery );