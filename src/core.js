/**
 * @type Object
 */
Fancy.dev = {};

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
    return Fancy.makeArray( elements, api );
}

Core.prototype = Fancy.api;

/**
 * this ist außerdem der derzeitige Eintrag
 * @callback Fancy~eachCallback
 * @param {Number|String} index Iterator
 * @param {*} object Derzeitiger Eintrag
 */
/**
 * @function
 * @author Markus Ahrweiler
 * @description Führt für jede property in object callback aus.
 * @since 2.0.0
 * @param {Object|Array} object
 * @param {Fancy~eachCallback} callback
 * @returns {*}
 */
Fancy.each = function ( object, callback ) {
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
/**
 * @function
 * @param {Object} returnObject
 * @returns {*}
 */
Fancy.extend = function ( returnObject ) {
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

var n = navigator.userAgent.toLowerCase();
/**
 *
 * @type {boolean}
 */
Fancy.isOpera = !!window.opera || navigator.userAgent.indexOf( " OPR/" ) >= 0;
/**
 *
 * @type {boolean}
 */
Fancy.isFirefox = typeof InstallTrigger !== undefined;
/**
 *
 * @type {boolean}
 */
Fancy.isSafari = Object.prototype.toString.call( window.HTMLElement ).indexOf( "Constructor" ) > 0;
/**
 *
 * @type {boolean}
 */
Fancy.isIE = !!document.documentMode;
/**
 *
 * @type {boolean}
 */
Fancy.isChrome = !!window.chrome && !Fancy.isOpera && n.indexOf( "edge/" ) === -1 && !Fancy.isIE;
/**
 *
 * @type {boolean}
 */
Fancy.apple = n.indexOf( "iphone" ) >= 0 || n.indexOf( "ipad" ) >= 0 || n.indexOf( "ipod" ) > 0;
/**
 *
 * @type {boolean}
 */
Fancy.mobile = n.indexOf( "mobile" ) >= 0 || n.indexOf( "android" ) >= 0 || Fancy.apple;
/**
 *
 * @type {boolean}
 */
Fancy.versionControl = true;
/**
 *
 * @type {boolean}
 */
Fancy.debugEnabled = false;
/**
 *
 * @type {{Fancy: {extend: {maxDepth: number}}}}
 */
Fancy.settings = {
    Fancy: {
        extend: {
            maxDepth: 10
        }
    }
};
Fancy.root = root;

/**
 * @function
 * @param obj
 * @returns {*}
 */
Fancy.type = function ( obj ) {
    if ( obj === null ) {
        return obj + "";
    }
    return typeof obj === "object" || typeof obj === "function" ? class2type[ toString.call( obj ) ] || "object" : typeof obj;
};
Fancy.each( "Boolean Number String Function Array Date RegExp Object Error".split( " " ), function () {
    class2type[ "[object " + this + "]" ] = this.toLowerCase();
} );
/**
 * @function
 * @param obj
 * @param prop
 * @param handler
 */
Fancy.watch = function ( obj, prop, handler ) {
    var oldval = obj[ prop ], newval = oldval,
        getter                       = function () {
            return newval;
        },
        setter                       = function ( val ) {
            oldval = newval;
            return newval = val === oldval ? val : handler.call( obj, prop, oldval, val );
        };
    if ( Object.defineProperty ) {
        Object.defineProperty( obj, prop, {
            get: getter,
            set: setter
        } );
    } else if ( Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__ ) {
        Object.prototype.__defineGetter__.call( obj, prop, getter );
        Object.prototype.__defineSetter__.call( obj, prop, setter );
    }
    if ( Fancy.isArray( obj[ prop ] ) ) {
        for ( var i = 0; i < obj[ prop ].length; i++ ) {
            Fancy.watch( obj[ prop ], i, handler );
        }
    } else if ( Fancy.isObject( obj[ prop ] ) ) {
        for ( var p in obj[ prop ] ) {
            if ( obj[ prop ].hasOwnProperty( p ) ) {
                Fancy.watch( obj[ prop ], p, handler );
            }
        }
    }
};
/**
 * check if string is valid JSON
 * @function
 * @param {String} text
 * @returns {boolean}
 */
Fancy.JSONValid = function ( text ) {
    return text && /^[\],:{}\s]*$/.test( text.replace( /\\["\\\/bfnrtu]/g, '@' ).replace( /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']' ).replace( /(?:^|:|,)(?:\s*\[)+/g, '' ) )
};
/**
 * @function
 * @param first
 * @param second
 * @returns {*}
 */
Fancy.merge = function ( first, second ) {
    var len = +second.length,
        j   = 0,
        i   = first.length;

    while ( j < len ) {
        first[ i++ ] = second[ j++ ];
    }

    first.length = i;

    return first;
};
/**
 * @function
 * @param arr
 * @param results
 * @returns {*|Array}
 */
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

Fancy.dev.extend          = function ( api, name, version ) {
    api.api = api.prototype = {
        constructor: api,
        each       : Fancy.api.each
    };

    api.valueOf = function () {
        return "function Fancy." + name + "(settings) { [Fancy.plugin] }";
    };
    api.api     = api.prototype = {
        constructor: api,
        each       : Fancy.api.each
    };
    Fancy.extend( api.api, prototype );
    api.api.name                = "Fancy." + name;
    versions[ "Fancy." + name ] = version;
    return this.dev;
};
Fancy.dev.defaultSettings = function ( name, settings ) {
    if ( settings ) {
        Fancy.settings[ "Fancy." + name ] = settings;
    }
    return this.dev;
};

var logged = {};
/**
 * @param plugin
 * @returns {Fancy}
 */
Fancy.version = function ( plugin ) {
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
/**
 * @function
 * @param needed
 * @param is
 * @returns {boolean}
 */
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


Fancy.extend( Fancy.api, prototype );