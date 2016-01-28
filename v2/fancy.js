(function ( window, undefined ) {
    var root = (function () {
        var e = document.getElementsByTagName( "script" ), n = e[ e.length - 1 ], r = n.src.replace( location.origin, "" ).split( "/" ), t = location.pathname.split( "/" ), i = !1, o = 0;
        for ( var a in r )i || (r[ a ] == t[ a ] ? o++ : i = !0);
        return location.origin + t.slice( 0, o ).join( "/" );
    })();
    if ( typeof window.Fancy === "function" ) {
        console.error( "Error: tried to load Fancy more than once" );
        return;
    }
    if ( typeof jQuery != "function" ) {
        console.error( "Fancy requires jQuery" );
    }
    var push       = Array.prototype.push,
        class2type = {},
        toString   = class2type.toString,
        versions   = {};

    function isArrayLike( obj ) {

        var length = !!obj && "length" in obj && obj.length,
            type   = Fancy.type( obj );

        if ( type === "function" || obj === window ) {
            return false;
        }

        return type === "array" || length === 0 ||
            typeof length === "number" && length > 0 && (length - 1) in obj;
    }


    function Fancy( selector, settings ) {
        return new Core( selector, null, settings );
    }

    versions[ "Fancy" ] = "2.0.0";
    Fancy.api           = Fancy.prototype = {
        name: "Fancy"
    };
    Fancy.dev           = {};
    
    function Core( selector, api, settings ) {
        api = api || this;
        Fancy.version( api );
        var elements = [];
        jQuery( selector ).each( function () {
            elements.push( this );
        } );
        
        if ( Fancy.settings[ api.name ] ) {
            api.settings = Fancy.extend( {}, Fancy.settings[ api.name ], settings );
        }
        
        api.selector = selector;
        api.length   = 0;
        return Fancy.makeArray( elements, api );
    }
    Core.prototype = Fancy.api;
    
    Fancy.each     = function ( object, callback ) {
        var length, i = 0;
        if ( isArrayLike( object ) ) {
            length = object.length;
            for ( ; i < length; i++ ) {
                if ( callback.call( object[ i ], i, object[ i ] ) === false ) {
                    break;
                }
            }
        } else {
            for ( i in object ) {
                if ( object.hasOwnProperty( i ) ) {
                    if ( callback.call( object[ i ], i, object[ i ] ) === false ) {
                        break;
                    }
                }
            }
        }

        return object;
    };
    Fancy.extend   = function ( returnObject ) {
        if ( Fancy.type( returnObject ) !== "object" ) {
            return returnObject;
        }
        var toExtend = Array.prototype.slice.call( arguments ),
            depth    = 0;
        if ( Fancy.type( toExtend[ toExtend.length - 1 ] ) === "number" ) {
            depth = toExtend.pop();
        }

        toExtend.shift();
        toExtend.forEach( function ( extendObject ) {
            if ( Fancy.type( extendObject ) === "object" ) {
                Fancy.each( Object.getOwnPropertyNames( extendObject ), function ( index, key ) {
                    var value = extendObject[ key ];
                    switch ( Fancy.type( value ) ) {
                        case "object":
                            if ( depth < Fancy.settings[ "Fancy" ].extend.maxDepth ) {
                                if ( !returnObject[ key ] ) {
                                    returnObject[ key ] = {};
                                }
                                Fancy.extend( returnObject[ key ], value, depth++ );
                            }
                            break;
                        default:
                            Object.defineProperty( returnObject, key, Object.getOwnPropertyDescriptor( extendObject, key ) );
                            break;
                    }
                } );
            }
        } );
        return returnObject;
    };

    var n                = navigator.userAgent.toLowerCase();
    Fancy.isOpera        = !!window.opera || navigator.userAgent.indexOf( " OPR/" ) >= 0;
    Fancy.isFirefox      = typeof InstallTrigger !== undefined;
    Fancy.isSafari       = Object.prototype.toString.call( window.HTMLElement ).indexOf( "Constructor" ) > 0;
    Fancy.isIE           = !!document.documentMode;
    Fancy.isChrome       = !!window.chrome && !Fancy.isOpera && n.indexOf( "edge/" ) === -1 && !Fancy.isIE;
    Fancy.apple          = n.indexOf( "iphone" ) >= 0 || n.indexOf( "ipad" ) >= 0 || n.indexOf( "ipod" ) > 0;
    Fancy.mobile         = n.indexOf( "mobile" ) >= 0 || n.indexOf( "android" ) >= 0 || Fancy.apple;
    Fancy.versionControl = true;
    Fancy.debugEnabled   = false;
    Fancy.settings       = {
        Fancy: {
            extend: {
                maxDepth: 10
            }
        }
    };
    Fancy.root           = root;

    Fancy.type = function ( obj ) {
        if ( obj === null ) {
            return obj + "";
        }
        return typeof obj === "object" || typeof obj === "function" ? class2type[ toString.call( obj ) ] || "object" : typeof obj;
    };
    Fancy.each( "Boolean Number String Function Array Date RegExp Object Error".split( " " ), function () {
        class2type[ "[object " + this + "]" ] = this.toLowerCase();
    } );


    Fancy.merge     = function ( first, second ) {
        var len = +second.length,
            j   = 0,
            i   = first.length;

        while ( j < len ) {
            first[ i++ ] = second[ j++ ];
        }

        first.length = i;

        return first;
    };
    Fancy.makeArray = function ( arr, results ) {
        var ret = results || [];

        if ( arr != null ) {
            if ( isArrayLike( Object( arr ) ) ) {
                Fancy.merge( ret, typeof arr === "string" ? [ arr ] : arr );
            } else {
                push.call( ret, arr );
            }
        }

        return ret;
    };
    Fancy.api.each  = function ( callback ) {
        return Fancy.each( this, callback );
    };
    Fancy.api.push = function() {
        return Fancy.merge( this, arguments );
    };

    Fancy.dev.initPlugin = function ( name, version,defaultSettings ) {
        if( defaultSettings ) {
            Fancy.settings[name] = defaultSettings;
        }
        function API( settings ) {
            return new Plugin( this.selector, settings );
        }

        API.valueOf = function () {
            return "function " + name + "(settings) { [Fancy.plugin] }";
        };

        API.api = API.prototype = {};
        function Plugin( selector, settings ) {
            return new Core( selector, this, settings );
        }

        API.api.name     = name;
        versions[ name ] = version;
        Plugin.prototype = API.api;
        return API;
    };

    var logged           = {};
    Fancy.version        = function ( plugin ) {
        var name    = plugin.name;
        var version = versions[ name ];
        if ( !version || logged[ name ] ) {
            return this;
        }

        if ( Fancy.versionControl ) {
            logged[ name ] = true;
            if ( Fancy.isChrome ) {
                console.log( "%cThis page is using %c" + name + "%c\r\nCopyright \u00a9 %cMarkus Ahrweiler\r\n%cVersion: %c" + version, 'color: #000', 'color: #8E0000', 'color: #000', 'color: #49A54F', 'color: #000', 'color: blue' );
            } else {
                console.log( "This page is using " + name + "\r\nCopyright\u00a9 Markus Ahrweiler\r\nVersion: " + version );
            }

            jQuery.ajax( {
                url    : "http://version.mephiztopheles.wtf/",
                data   : {
                    plugin: name
                },
                type   : "POST",
                global : false,
                success: function ( v ) {
                    if ( v ) {
                        if ( Fancy.compareVersion( v, version ) ) {
                            if ( Fancy.isChrome ) {
                                console.warn( "%cYou are using an older version of %c" + name + ". %cThe newest version is: " + v, "color: #000", "color: #8E0000", "color: #000" );
                            } else {
                                console.warn( "You are using an older version of " + name + ". The newest version is: " + v );
                            }
                        }
                    } else {
                        if ( Fancy.isChrome ) {
                            console.warn( "Couldn't retrieve version control information for %c" + name + "%c!", "color: #8E0000", "color. #000" );
                        } else {
                            console.warn( "Couldn't retrieve version control information for " + name + "!" );
                        }
                    }

                }

            } );
        }
        return this;
    };
    Fancy.compareVersion = function ( needed, is ) {
        if ( typeof needed == "string" && typeof is === "string" ) {
            // returns true, if needed is greater than is;
            var c = [ parseInt( needed.split( "." ) [ 0 ] ), parseInt( needed.split( "." ) [ 1 ] ), parseInt( needed.split( "." ) [ 2 ] ) ],
                d = [ parseInt( is.split( "." ) [ 0 ] ), parseInt( is.split( "." ) [ 1 ] ), parseInt( is.split( "." ) [ 2 ] ) ];

            return c [ 0 ] > d [ 0 ] || ( c [ 0 ] == d [ 0 ] && c [ 1 ] > d [ 1 ] ) || ( c [ 1 ] == d [ 1 ] && c [ 2 ] > d [ 2 ] );
        } else if ( needed === false ) {
            return true;
        }
    };


    window.Fancy = Fancy;

})( window, typeof undefined );


(function ( Fancy ) {
    var FancyTest = Fancy.dev.initPlugin( "Fancy.test", "0.0.1");

    FancyTest.api.log = function ( text ) {
        Fancy.each( this, function () {
            console.log( this );
        } );
        return this;
    };


    Fancy.api.test = FancyTest;

})( Fancy );


(function ( Fancy ) {


    Fancy.domain = function () {

    };

})( Fancy );
