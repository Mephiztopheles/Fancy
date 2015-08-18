(function( $ ) {

    if( typeof window.Fancy === "function" ) {
        console.error( "Error: tried to load Fancy more than once" );
        return;
    }

    if( typeof jQuery != "function" ) {
        console.error( 'jQuery * > 1.7 required' );
        return;
    }


    var getType = (function () {
    var class2type = {},
        toString   = class2type.toString;
    "Boolean Number String Function Array Date RegExp Object Error".split( " " ).forEach( function ( name ) {
        class2type[ "[object " + name + "]" ] = name.toLowerCase();
    } );
    return function ( obj ) {
        if ( obj === null ) {
            return obj + "";
        }
        // Support: Android<4.0, iOS<6 (functionish RegExp)
        return typeof obj === "object" || typeof obj === "function" ? class2type[ toString.call( obj ) ] || "object" : typeof obj;
    };
})();

    var n = navigator.userAgent.toLowerCase();

    function Fancy( element ) {
        if( this == window )
            return new Fancy( element );
        this.element = $( element );
        this.name    = "Fancy";
    }

    Fancy.findByAnd = function( array, obj, returnIndex ) {
        function findByAnd() {
            var resolved = true,
                i        = 0;
            while( i < this.length ) {
                resolved = true;
                for( var a in obj ) {
                    if( obj.hasOwnProperty( a ) ) {
                        if( (a.toLowerCase().indexOf( "date" ) >= 0 ? new Date( Fancy.getKey( this[ i ], a ) ).getTime() : Fancy.getKey( this[ i ], a )) != (a.toLowerCase().indexOf( "date" ) >= 0 ? new Date( obj[ a ] ).getTime() : obj[ a ]) ) {
                            resolved = false;
                            break;
                        }
                    }
                }
                if( resolved == true ) {
                    resolved = i;
                    break;
                }
                i++;
            }
            resolved   = (resolved === true || resolved === false) ? null : resolved;
            var result = resolved === null ? null : this[ resolved ];
            return returnIndex ? { index: resolved, result: result } : result;
        }

        return findByAnd.apply( array );
    };

    Fancy.findAllBy = function( arr, obj ) {
        function findAllBy() {
            var list     = [],
                resolved = true;
            this.forEach( function( it ) {
                resolved = true;
                for( var a in obj ) {
                    if( obj.hasOwnProperty( a ) ) {
                        if( (a.toLowerCase().indexOf( "date" ) >= 0 ? new Date( Fancy.getKey( this, a ) ).getTime() : Fancy.getKey( this, a )) != (a.toLowerCase().indexOf( "date" ) >= 0 ? new Date( obj[ a ] ).getTime() : obj[ a ]) ) {
                            resolved = false;
                        }
                    }
                }
                if( resolved == true ) {
                    list.push( it );
                }
            } );
            return list;
        }

        return findAllBy.apply( arr );
    };

    Fancy.JSONvalid    = function JSONvalid( text ) {
        return text && /^[\],:{}\s]*$/.test( text.replace( /\\["\\\/bfnrtu]/g, '@' ).replace( /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']' ).replace( /(?:^|:|,)(?:\s*\[)+/g, '' ) )
    };
    Fancy.isObject     = function isObject( obj ) {
        return {}.toString.apply( obj ) === '[object Object]';
    };
    Fancy.isArray      = function isArray( obj ) {
        return Object.prototype.toString.call( obj ) === '[object Array]';
    };
    Fancy.is = function is( a, b ) {
    if ( getType( a ) === "array" && getType( b ) === "array" ) {
        if ( a.length != b.length )
            return false;
        for ( var i = 0; i < a.length; i++ ) {
            if ( a.hasOwnProperty( i ) ) {
                if ( getType( a[ i ] ) === "object" ) {
                    if ( a[ i ].id && a[ i ].class ) {
                        if ( !b.findBy( { "class": a[ i ].class, id: a[ i ].id } ) ) {
                            return false;
                        }
                    } else if ( a[ i ].id ) {

                        if ( !b.findBy( { id: a[ i ].id } ) ) {
                            return false;
                        }
                    } else if ( a[ i ].name ) {

                        if ( !b.findBy( { name: a[ i ].name } ) ) {
                            return false;
                        }
                    }
                } else {
                    if ( b.indexOf( a[ i ] ) < 0 )
                        return false;
                }
            }
        }
    } else if ( getType( a ) === "object" && getType( b ) === "object" ) {

    } else if ( getType( a ) !== getType( b ) ) {
        return false
    } else return a === b;
};
    Fancy.capitalize   = function capitalize( str ) {
        return str [ 0 ].toUpperCase() + str.slice( 1 );
    };
    Fancy.decapitalize = function decapitalize( str ) {
        return str [ 0 ].toLowerCase() + str.slice( 1 );
    };


    Fancy.api = Fancy.prototype = {
        version: "1.0.6",
        name   : "Fancy"
    };

    Fancy.isOpera        = !!window.opera || navigator.userAgent.indexOf( ' OPR/' ) >= 0;
    Fancy.isFirefox      = typeof InstallTrigger !== 'undefined';
    Fancy.isSafari       = Object.prototype.toString.call( window.HTMLElement ).indexOf( 'Constructor' ) > 0;
    Fancy.isChrome       = !!window.chrome && !this.isOpera;
    Fancy.isIE           = !!document.documentMode;
    Fancy.apple          = n.indexOf( "iphone" ) >= 0 || n.indexOf( "ipad" ) >= 0 || n.indexOf( "ipod" ) > 0;
    Fancy.mobile         = n.indexOf( "mobile" ) >= 0 || n.indexOf( "android" ) >= 0 || Fancy.apple;
    Fancy.versionControl = true;

    Fancy.version        = function( plugin ) {
        if( Fancy.versionControl ) {
            if( Fancy.isChrome ) {
                console.log( "%cThis page is using %c" + plugin.name + "%c\r\n Copyright \u00a9 %cMarkus Ahrweiler\r\n %cVersion: %c" + plugin.version, 'color: #000', 'color: #8E0000', 'color: #000', 'color: #49A54F', 'color: #000', 'color: blue' );
            } else {
                console.log( "This page is using " + plugin.name + "\r\n Copyright\u00a9 Markus Ahrweiler\r\n Version: " + plugin.version );
            }

            $.ajax( {
                url    : 'http://version.mephiztopheles.wtf/',
                data   : {
                    plugin: plugin.name
                },
                type   : 'POST',
                global : false,
                success: function( v ) {
                    if( v ) {
                        if( Fancy.compareversion( v, plugin.version ) ) {
                            if( Fancy.isChrome ) {
                                console.warn( '%cYou are using an older version of %c' + plugin.name + '. %cThe newest version is: ' + v, 'color: #000', 'color: #8E0000', 'color: #000' );
                            } else {
                                console.warn( 'You are using an older version of ' + plugin.name + '. The newest version is: ' + v );
                            }
                        }
                    } else {
                        if( Fancy.isChrome ) {
                            console.warn( "Couldn't retrieve version control information for %c" + plugin.name + "%c!", 'color: #8E0000', 'color. #000' );
                        } else {
                            console.warn( "Couldn't retrieve version control information for " + plugin.name + "!" );
                        }
                    }

                }

            } );
        }
    };
    Fancy.require        = function( plugins ) {
        $( function() {
            for( var i in plugins ) {
                if( plugins.hasOwnProperty( i ) ) {
                    var vers;
                    if( i.indexOf( "Fancy." ) == 0 ) {
                        vers = Fancy.getKey( window, i );
                    } else {
                        vers = window [ i ].prototype.version || ( i == "jQuery" ? jQuery.prototype.jquery : false );
                    }
                    if( typeof window [ i ] == "undefined" || ( vers && plugins [ i ] && Fancy.compareversion( plugins [ i ], vers ) ) ) {
                        throw "Error: " + i + " " + ( plugins [ i ] ? plugins [ i ] + " " : "" ) + "is required" + ( vers ? ", got " + vers : "" );
                    }
                }
            }
        } );
    };
    Fancy.compareversion = function( needed, is ) {
        // returns true, if needed is greater than is;
        var c = [ parseInt( needed.split( "." ) [ 0 ] ), parseInt( needed.split( "." ) [ 1 ] ), parseInt( needed.split( "." ) [ 2 ] ) ],
            d = [ parseInt( is.split( "." ) [ 0 ] ), parseInt( is.split( "." ) [ 1 ] ), parseInt( is.split( "." ) [ 2 ] ) ];

        return c [ 0 ] > d [ 0 ] || ( c [ 0 ] == d [ 0 ] && c [ 1 ] > d [ 1 ] ) || ( c [ 1 ] == d [ 1 ] && c [ 2 ] > d [ 2 ] );
    };
    Fancy.check          = function( s, p ) {
        for( var i in p ) {
            if( p.hasOwnProperty( i ) ) {
                var r, t, a, type;
                if( p [ i ].type ) {
                    r = true;
                    t = p [ i ].type.split( "|" );
                    for( a = 0; a < t.length; a++ ) {
                        if( r ) {
                            type = s [ i ] instanceof window [ t [ a ] ] || typeof s [ i ] === t [ a ].toLowerCase();
                            if( type ) {
                                r = false;
                            }
                        }
                    }
                    if( r ) {
                        throw "Error: Expected type " + t.join( " or " ) + " but got " + capitalize( typeof s [ i ] ) + " for " + i;
                    }
                }

                if( p [ i ].required ) {
                    r = false;
                    switch( typeof s[ i ] ) {
                        case "string":
                            if( !s [ i ] )
                                r = true;
                            break;
                        case "object":
                            if( s [ i ] === null )
                                r = true;
                            else if( !Object.keys( s [ i ] ).length )
                                r = true;
                            break;
                        case "undefined":
                            r = true;
                            break;
                    }
                    if( r ) {
                        throw "Error: " + i + " is required";
                    }
                }

                if( p [ i ].types && s [ i ] && s [ i ].length ) {
                    for( var b = 0; b < s [ i ].length; b++ ) {
                        t = p [ i ].types.split( "|" );
                        r = false;
                        for( a = 0; a < t.length; a++ ) {
                            if( !r ) {
                                type = s [ i ] [ b ] instanceof window [ t [ a ] ] || typeof s [ i ] [ b ] === t [ a ].toLowerCase();

                                if( s [ i ] [ b ] === null && t [ a ] != "Null" ) {
                                    type = false;
                                }
                                if( type ) {
                                    r = true;
                                }
                            }
                        }
                        if( !r ) {
                            throw "Error: Expected type " + t.join( " or " ) + " but got " + capitalize( s [ i ] [ b ] === null ? "null" : typeof s [ i ] [ b ] ) + " for " + i + "'s items";
                        }
                    }

                }
            }

        }

    };
    Fancy.watch          = function( obj, prop, handler ) {
        var oldval = obj[ prop ], newval = oldval,
            getter = function() {
                return newval;
            },
            setter = function( val ) {
                oldval = newval;
                return newval = val === oldval ? val : handler.call( obj, prop, oldval, val );
            };
        if( Object.defineProperty )
            Object.defineProperty( obj, prop, {
                get: getter,
                set: setter
            } );
        else if( Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__ ) {
            Object.prototype.__defineGetter__.call( obj, prop, getter );
            Object.prototype.__defineSetter__.call( obj, prop, setter );
        }
        if( Fancy.isArray( obj[ prop ] ) ) {
            for( var i = 0; i < obj[ prop ].length; i++ ) {
                Fancy.watch( obj[ prop ], i, handler );
            }
        } else if( Fancy.isObject( obj[ prop ] ) ) {
            for( var p in obj[ prop ] ) {
                if( obj[ prop ].hasOwnProperty( p ) ) {
                    Fancy.watch( obj[ prop ], p, handler );
                }
            }
        }
    };
    Fancy.unwatch        = function( obj, prop ) {
        var val     = obj[ prop ];
        delete obj[ prop ];
        obj[ prop ] = val;
    };
    Fancy.scrollParent   = function( el ) {
        var position            = el.css( "position" ),
            excludeStaticParent = position === "absolute",
            scrollParent        = el.prop( 'nodeName' ) == "TEXTAREA" && el [ 0 ].scrollHeight - el.outerHeight() > 0 ? el : false;

        scrollParent = el.parents().filter( function() {
            var parent = $( this );
            if( excludeStaticParent && parent.css( "position" ) === "static" ) {
                return false;
            }
            return ( /(auto|scroll)/ ).test( parent.css( "overflow" ) + parent.css( "overflow-y" ) + parent.css( "overflow-x" ) ) && parent [ 0 ].scrollHeight - parent.outerHeight() > 0;
        } ).eq( 0 );
        return position === "fixed" || !scrollParent.length ? $( el [ 0 ].ownerDocument || document ) : scrollParent;
    };
    Fancy.settings       = {};
    Fancy.api.set        = function( name, fn, check ) {
        var instance;

        if( this.element.length ) {
            var data = this.get( name );
            if( check === false ? false : data && data.length ) {
                for( var i = 0; i < data.length; i++ ) {
                    if( typeof data [ i ] == "undefined" ) {
                        instance   = fn( $( this.element [ i ] ) );
                        data [ i ] = instance;
                        $( this.element [ i ] ).data( name, instance );
                    }
                }
            }
            if( check === false ? true : !data ) {
                instance = fn( this.element );
                this.element.data( name, instance );
                return instance;
            } else
                return data;
        }
    };
    Fancy.api.get        = function( name ) {
        if( name.indexOf( 'Fancy' ) != 0 ) {
            if( typeof this [ name ] == "function" ) {
                name = "Fancy" + name [ 0 ].toUpperCase() + name.slice( 1, name.length );
            } else {
                if( this.isChrome )
                    console.error( "\"%c" + name + "%c\" is not a function of Fancy!", "color: blue", "color: #000" );
                else
                    console.error( "\"" + name + "\" is not a function of Fancy!" );
                return false;
            }
        }
        if( this.element.length > 1 ) {
            var ret = [];
            this.element.each( function() {
                ret.push( $( this ).data( name ) );
            } );
            return ret;
        }
        return this.element.data( name );
    };
    Fancy.api.fullHeight = function( mrgn ) {
        var padding = true, border = true;
        if( typeof mrgn === "object" ) {
            padding = mrgn.padding != false;
            border  = mrgn.border != false;
        }
        return this.element.height()
               + (padding ? parseInt( this.element.css( "paddingTop" ) ) : 0)
               + (padding ? parseInt( this.element.css( "paddingBottom" ) ) : 0)
               + (border ? parseInt( this.element.css( "borderBottomWidth" ) ) : 0)
               + (border ? parseInt( this.element.css( "borderTopWidth" ) ) : 0)
               + (mrgn ? parseInt( this.element.css( "marginTop" ) ) + parseInt( this.element.css( "marginBottom" ) ) : 0);
    };
    Fancy.api.fullWidth  = function( mrgn ) {
        var padding = true, border = true;
        if( typeof mrgn === "object" ) {
            padding = mrgn.padding != false;
            border  = mrgn.border != false;
        }
        return this.element.width()
               + (padding ? parseInt( this.element.css( "paddingLeft" ) ) : 0)
               + (padding ? parseInt( this.element.css( "paddingRight" ) ) : 0)
               + (border ? parseInt( this.element.css( "borderLeftWidth" ) ) : 0)
               + (border ? parseInt( this.element.css( "borderRightWidth" ) ) : 0)
               + (mrgn ? parseInt( this.element.css( "marginLeft" ) ) + parseInt( this.element.css( "marginRight" ) ) : 0);
    };
    Fancy.getKey         = function( o, s ) {
        s = s.replace( /\[(\w+)\]/g, '.$1' ); // convert indexes to properties
        s = s.replace( /^\./, '' ); // strip a leading dot
        var a = s.split( '.' );
        for( var i = 0; i < a.length; i++ ) {
            var k = a[ i ];

            if( o.hasOwnProperty( k ) ) {
                o = o[ k ];
            } else {
                return;
            }
        }
        return o;
    };

    window.Fancy = Fancy;
    $( function() {
        Fancy.version( Fancy.api );
    } );
})( jQuery );
