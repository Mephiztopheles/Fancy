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
        console.error( "Fancy requires jQuery: https://jquery.com" );
    }
    var array      = [],
        push       = array.push,
        splice     = array.splice,
        sort       = array.sort,
        class2type = {},
        toString   = class2type.toString,
        versions   = {},
        prototype  = {
            length: 0,
            sort  : sort,
            splice: splice,
            push  : push
        };

    /**
     *
     * @param obj
     * @returns {boolean}
     */
    function isArrayLike( obj ) {

        var length = !!obj && "length" in obj && obj.length,
            type   = Fancy.type( obj );

        if ( type === "function" || obj === window ) {
            return false;
        }

        return type === "array" || length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj;
    }


    function Fancy( selector, settings ) {
        return new Core( selector, null, settings );
    }

    versions[ "Fancy" ] = "2.0.0";
    Fancy.api           = Fancy.prototype = {
        name       : "Fancy",
        constructor: Fancy,
        each       : function ( callback ) {
            return Fancy.each( this, callback );
        }
    };
    Fancy.dev = {};

    /**
     *
     * @param selector
     * @param api
     * @param settings
     * @constructor
     */
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

    Fancy.each   = function ( object, callback ) {
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
     * @param {String} text
     * @returns {*|boolean}
     * @constructor
     */
    Fancy.JSONvalid = function JSONvalid( text ) {
        return text && /^[\],:{}\s]*$/.test( text.replace( /\\["\\\/bfnrtu]/g, '@' ).replace( /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']' ).replace( /(?:^|:|,)(?:\s*\[)+/g, '' ) )
    };
    /**
     * shorthand to Fancy.getType( obj ) === "object"
     * @param obj
     * @returns {boolean}
     */
    Fancy.isObject = function isObject( obj ) {
        return {}.toString.apply( obj ) === '[object Object]';
    };
    /**
     * shorthand to Fancy.getType( obj ) === "array"
     * @param obj
     * @returns {boolean}
     */
    Fancy.isArray = function isArray( obj ) {
        return Object.prototype.toString.call( obj ) === '[object Array]';
    };


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

    /**
     *
     * @param {String} name
     * @param {String} version
     * @param {Object} [defaultSettings]
     * @param {Function} [init]
     * @returns {api}
     */
    Fancy.dev.initPlugin = function ( name, version, defaultSettings, init ) {
        if ( defaultSettings ) {
            Fancy.settings[ name ] = defaultSettings;
        }
        /**
         *
         * @param settings
         * @returns {Plugin}
         */
        function api( settings ) {
            return new Plugin( this.selector, settings );
        }

        api.valueOf = function () {
            return "function " + name + "(settings) { [Fancy.plugin] }";
        };
        api.api     = api.prototype = {
            constructor: api,
            each       : Fancy.api.each
        };
        Fancy.extend( api.api, prototype );
        /**
         *
         * @param selector
         * @param settings
         * @returns {Core}
         * @constructor
         */
        function Plugin( selector, settings ) {
            var me = this;
            setTimeout( function () {
                init.call( me, me );
            }, 0 );
            return new Core( selector, this, settings );
        }

        api.api.name     = name;
        versions[ name ] = version;
        Plugin.prototype = api.api;
        return api;
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


    Fancy.extend( Fancy.api, prototype );
    window.Fancy = Fancy;

})( window, typeof undefined );

(function ( window, $, Fancy ) {
    /*Fancy.require( {
     jQuery: false,
     Fancy : "1.0.8"
     } );*/
    var NAME    = "FancyDate",
        VERSION = "1.2.2",
        logged  = false;


    function escapeRegExp( str ) {
        return str.replace( /[\-\[\]\/\{}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&" );
    }

    function dateToRegex( format ) {
        var regex = "";
        if ( format.match( /dd|DD/ ) === null ) {
            format = format.replace( /d|D/, "dd" );
        }
        if ( format.match( /mm|MM/ ) === null ) {
            format = format.replace( /m|M/, "mm" );
        }
        if ( format.match( /yyyy|YYYY/ ) === null ) {
            format = format.replace( /yyy|YYYY/, "yyyy" ).replace( /yy|YY/, "yyyy" ).replace( /y|Y/, "yyyy" );
        }
        for ( var i = format.length; i > 0; i-- ) {
            var str = format.substring( 0, i );
            str     = escapeRegExp( str );
            str     = str.replace( /(dd)|(DD)/g, "(?:0[1-9]|1[0-9]|2[0-9]|3[0-1])" ).replace( /(mm)|(MM)/g, "(?:0[1-9]|1[0-2])" ).replace( /d|D/, "[0-3]" ).replace( /m|M/, "[0-1]" ).replace( /(y)|(Y)/g, "[0-9]" );
            regex += "(^" + str + "$)";
            if ( i !== 1 ) {
                regex += "|"
            }
        }
        return new RegExp( regex );
    }

    function findByKey( obj, index ) {
        var r,
            i = 0;
        for ( var k in obj ) {
            if ( i == index ) {
                r = k;
            }
            i++;
        }
        return r;
    }

    function clearTime( date ) {
        var d = new Date( date );

        d.setHours( 0 );
        d.setMinutes( 0 );
        d.setSeconds( 0 );
        d.setMilliseconds( 0 );
        return d;
    }

    /**
     *
     * @param element
     * @param settings
     * @returns {FancyDate}
     * @constructor
     */
    function FancyDate( element, settings ) {
        var SELF = this;
        if ( element[ 0 ].nodeName != 'INPUT' ) {
            console.error( NAME + ' needs an input to be bound to!' );
            return this;
        }

        SELF.settings  = settings;
        SELF.visible   = false;
        SELF.calculate = {
            day   : 24 * 60 * 60 * 1000,
            hour  : 60 * 60 * 1000,
            minute: 60 * 1000,
            second: 1000
        };

        SELF.element = element;
        SELF.version = VERSION;
        SELF.name    = NAME;

        SELF.today    = clearTime( new Date() );
        SELF.current  = SELF.element.val() ? SELF.decode( SELF.element.val() ) : SELF.settings.current || new Date();
        SELF.selected = SELF.decode( SELF.element.val() );
        Fancy.watch( SELF, "selected", function ( prop, old, val ) {
            if ( val && val != old ) {
                setTimeout( function () {
                    SELF.element.val( SELF.encode( SELF.selected ) );
                }, 0 );
                return new Date( val );
            } else {
                return val;
            }
        } );

        SELF.init();
        return SELF;
    }

    var plugin           = Fancy.dev.initPlugin( "Fancy.date", VERSION, {
        format               : "dd.mm.yyyy",
        animated             : true,
        onSelect             : function () {},
        onOpen               : function () {},
        onClose              : function () {},
        query                : function () {
            return true;
        },
        current              : false,
        free                 : true,
        showWeekHeader       : true,
        min                  : false,
        max                  : false,
        yearTop              : 20,
        yearBottom           : 50,
        yearStatic           : false,
        checkMinAndMax       : true,
        preventMobileKeyboard: true
    }, function ( me ) {
        me.each( function () {
            var $el      = $( this );
            var instance = $el.data( NAME ) || new FancyDate( $el, me.settings );
            console.log( instance );
            $el.data( NAME, instance );
        } );
    } );
    plugin.api.translate = function ( key, value ) {
        var l = FancyDate.translation[ navigator.language ] ? navigator.language : 'en',
            t = FancyDate.translation[ l ][ key ];
        if ( typeof t[ 0 ] == "undefined" && typeof value == "number" ) {
            value = findByKey( t, value );
        }
        if ( t ) {
            t = FancyDate.translation[ l ][ key ][ value ];
        }
        return t;
    };
    plugin.api.select    = function ( date ) {
        var me = this;
        return this.each( function () {
            var $el      = $( this );
            var instance = $el.data( NAME ) || new FancyDate( $el, me.settings );
            instance.select( date );
        } );
    };
    plugin.api.open      = function ( index ) {
        if ( this.length ) {
            var instance = $( this[ index || 0 ] ).data( NAME ) || new FancyDate( $( this[ index || 0 ] ), this.settings );
            instance.open();
        }
    };

    Fancy.api.date = plugin;


    FancyDate.api = FancyDate.prototype = {};
    FancyDate.api.version          = VERSION;
    FancyDate.api.name             = NAME;
    FancyDate.api.init             = function init() {
        var SELF = this;
        if ( !logged ) {
            logged = true;
            Fancy.version( SELF );
        }
        SELF.element.addClass( SELF.name + '-element' );

        this.html = {
            wrapper      : $( '<div/>', {
                id: SELF.name + '-wrapper'
            } ),
            dialog       : $( '<div/>', {
                id: SELF.name + '-dialog'
            } ).attr( 'onselectstart', function () {
                return false;
            } ),
            inner        : $( '<div/>', {
                id: SELF.name + '-inner'
            } ),
            previous     : $( '<div/>', {
                id     : SELF.name + '-previous',
                "class": SELF.name + '-button'
            } ),
            previousArrow: $( "<div/>", {
                "class": SELF.name + '-arrow'
            } ),
            next         : $( '<div/>', {
                id     : SELF.name + '-next',
                "class": SELF.name + '-button'
            } ),
            nextArrow    : $( "<div/>", {
                "class": SELF.name + '-arrow'
            } ),
            title        : $( '<div/>', {
                id: SELF.name + '-title'
            } ),
            year         : $( '<span/>', {
                id: SELF.name + '-year'
            } ),
            yearChanger  : $( "<div/>", {
                id: SELF.name + '-year-changer'
            } ),
            month        : $( '<span/>', {
                id: SELF.name + '-month'
            } ),
            header       : $( '<div/>', {
                id: SELF.name + '-header'
            } ),
            body         : $( '<div/>', {
                id: SELF.name + '-body'
            } ),
            footer       : $( '<div/>', {
                id: SELF.name + '-footer'
            } ),
            close        : $( '<div/>', {
                id     : SELF.name + '-close',
                "class": SELF.name + '-button',
                html   : SELF.translate( 'button', 'close' )
            } ),
            today        : $( '<div/>', {
                id     : SELF.name + '-today',
                "class": SELF.name + '-button',
                html   : SELF.translate( 'button', 'today' )
            } ),
            clear        : $( '<div/>', {
                id     : SELF.name + '-clear',
                "class": SELF.name + '-button',
                html   : SELF.translate( 'button', 'clear' )
            } ),
            calendar     : $( '<div/>', {
                id: SELF.name + '-calendar'
            } ),
            days         : [],
            rows         : []
        };

        var oldValue = SELF.element.val();
        SELF.element.off( "." + NAME ).on( "keydown." + NAME, function ( e ) {
            setTimeout( function () {
                if ( (e.which | e.keyCode) === 9 ) {
                    SELF.close();
                }
            }, 2 );
        } ).on( "focus." + NAME + " touchstart." + NAME, function ( e ) {
            if ( Fancy.mobile && SELF.settings.preventMobileKeyboard ) {
                e.preventDefault();
                e.stopPropagation();
                $( "body" ).on( "click." + NAME, function ( e ) {
                    if ( !$( e.target ).closest( "#FancyDate-dialog" ).length ) {
                        $( "body" ).off( "click." + NAME );
                        SELF.close();
                    }
                } );
            }
            if ( !SELF.visible && SELF.settings.query( SELF.element ) ) {
                SELF.open();
            }
        } ).on( "blur." + NAME, function () {
            SELF.close();
        } ).on( "keypress." + NAME + " paste." + NAME, function ( e ) {
            var me = this;
            setTimeout( function () {
                var regex = dateToRegex( SELF.settings.format ),
                    exec  = regex.exec( me.value );
                if ( exec === null ) {
                    if ( me.value ) {
                        me.value = oldValue;
                        e.preventDefault();
                        e.stopPropagation();
                    } else {
                        SELF.clear();
                    }
                } else if ( exec[ 1 ] ) {
                    SELF.select( SELF.decode( me.value ) );
                }
                oldValue = me.value;
            }, 1 );
        } );
    };
    FancyDate.api.open             = function open() {
        var SELF = this;
        if ( !SELF.element[ 0 ].readOnly && !SELF.element[ 0 ].disabled ) {
            if ( this.settings.free ) {
                $( "body" ).append( SELF.html.wrapper ).addClass( SELF.name );
                SELF.html.wrapper.append( SELF.html.dialog );
            } else {
                $( "body" ).append( SELF.html.dialog ).addClass( SELF.name );
            }
            SELF.html.dialog.append( SELF.html.inner );
            SELF.html.inner.append( SELF.html.header ).append( SELF.html.body ).append( SELF.html.footer );
            SELF.html.header.append( SELF.html.previous.append( SELF.html.previousArrow ) ).append( SELF.html.title ).append( SELF.html.next.append( SELF.html.nextArrow ) );
            SELF.html.body.html( SELF.html.calendar );
            SELF.html.footer.html( SELF.html.close ).append( SELF.html.today ).append( SELF.html.clear );

            SELF.html.dialog.hide();
            SELF.html.today.removeClass( "disabled" );
            if ( SELF.settings.max ) {
                if ( SELF.current > SELF.settings.max ) {
                    SELF.current = new Date( SELF.settings.max.getFullYear(), SELF.settings.max.getMonth(), SELF.settings.max.getDate() );
                }
                if ( SELF.today > SELF.settings.max ) {
                    SELF.html.today.addClass( "disabled" );
                }
            }
            if ( SELF.settings.min ) {
                if ( SELF.current < SELF.settings.min ) {
                    SELF.current = new Date( SELF.settings.min.getFullYear(), SELF.settings.min.getMonth(), SELF.settings.min.getDate() );
                }
                if ( SELF.today < SELF.settings.min ) {
                    SELF.html.today.addClass( "disabled" );
                }
            }


            function show() {
                SELF.html.dialog.show();
                SELF.visible = true;
                SELF.create();
                SELF.settings.onOpen.call( SELF );
            }

            if ( SELF.settings.animated ) {
                setTimeout( function () {
                    show();
                    SELF.html.dialog.addClass( 'show' ).removeClass( 'hide' );
                }, 0 );
            } else {
                show();
            }
        }

        return SELF;
    };
    FancyDate.api.close            = function close() {
        var SELF = this;
        if ( !SELF.html.dialog.hasClass( 'hide' ) ) {
            SELF.element.unbind( '.' + SELF.name + ':prevent' );
            SELF.html.title.removeClass( NAME + "-year-open" );
            function hide() {
                SELF.html.wrapper.remove();
                SELF.html.dialog.remove();
                SELF.html.calendar.children().remove();
                SELF.html.header.children().remove();
                SELF.html.title.children().remove();
                SELF.element.unbind( "." + NAME + ":prevent" );
                SELF.element[ 0 ].blur();
                SELF.visible = false;
                SELF.settings.onClose.call( SELF );
                $( 'body' ).removeClass( SELF.name );
            }

            if ( SELF.settings.animated ) {
                setTimeout( hide, 300 );
                SELF.html.dialog.addClass( 'hide' ).removeClass( 'show' );
            } else {
                hide();
            }
        }

        return SELF;
    };
    FancyDate.api.update           = function update() {
        var SELF = this;
        SELF.html.calendar.html( '' );
        SELF.html.title.html( SELF.html.month.html( SELF.translate( 'month', SELF.current.getMonth() ) ) ).append( SELF.html.year.html( SELF.current.getFullYear() ) );
        SELF.create();
    };
    FancyDate.api.create           = function create() {
        var SELF = this,
            current,
            i    = 0,
            n    = 0;
        if ( this.settings.checkMinAndMax ) {
            if ( this.settings.max ) {
                if ( this.settings.max < this.current ) {
                    this.current = new Date( this.settings.max.getFullYear(), this.settings.max.getMonth(), this.settings.max.getDate() );
                }
            }
            if ( this.settings.min ) {
                if ( this.settings.min > this.current ) {
                    this.current = new Date( this.settings.min.getFullYear(), this.settings.min.getMonth(), this.settings.min.getDate() );
                }
            }
        }
        this.html.title.append( this.html.month.html( this.translate( "month", this.current.getMonth() ) ) ).append( this.html.year.html( this.current.getFullYear() ) );
        this.html.title.append( this.html.yearChanger );
        this.html.yearChanger.children().remove();
        var c;
        current = new Date( this.current.getFullYear(), this.current.getMonth(), 1 );
        if ( current.getDay() != 1 && current.getDay() != 0 ) {
            c       = new Date( this.current.getFullYear(), this.current.getMonth(), 0 );
            current = new Date( this.current.getFullYear(), this.current.getMonth() - 1, (c.getDate() - current.getDay() + 2) );
        } else if ( current.getDay() == 0 ) {
            c       = new Date( this.current.getFullYear(), this.current.getMonth(), 0 );
            current = new Date( this.current.getFullYear(), this.current.getMonth() - 1, (c.getDate() - 5) );
        } else {
            c       = new Date( this.current.getFullYear(), this.current.getMonth(), 0 );
            current = new Date( this.current.getFullYear(), this.current.getMonth() - 1, (c.getDate() - 6) );
        }

        var ul = $( "<ul/>" );

        function change( li, y ) {
            li.on( "click", function () {
                SELF.setYear( y );
            } );
        }

        this.html.yearChanger.append( ul );
        var yearFrom = this.current.getFullYear() - this.settings.yearBottom,
            yearTo   = this.current.getFullYear() + this.settings.yearTop;
        if ( this.settings.max ) {
            yearTo   = Math.min( yearTo, this.settings.max.getFullYear() );
            yearFrom = yearTo - this.settings.yearBottom - this.settings.yearTop;
            if ( this.settings.min ) {
                yearFrom = Math.max( yearFrom, this.settings.min.getFullYear() );
            }
        }
        else if ( this.settings.min ) {
            yearFrom = Math.max( yearFrom, this.settings.min.getFullYear() );
            yearTo   = yearFrom + this.settings.yearBottom + this.settings.yearTop;
            if ( this.settings.max ) {
                yearTo = Math.min( yearTo, this.settings.max.getFullYear() );
            }
        }
        for ( yearTo; yearTo >= yearFrom; yearTo-- ) {
            var li = $( "<li/>", { html: this.translate( "month", this.current.getMonth() ) + " " + yearTo } );
            ul.append( li );
            change( li, yearTo )
        }

        this.html.days = [];
        this.html.rows = [];

        this.html.calendar.children().remove();
        if ( this.settings.showWeekHeader ) {
            var rowh = $( "<div/>", {
                id: this.name + "-rowh"
            } );
            this.html.calendar.append( rowh );

            function createHeader( day ) {
                var u = $( "<div/>", {
                    id     : SELF.name + "-rowh-" + day,
                    "class": SELF.name + "-rowh",
                    html   : SELF.translate( "day", day )
                } );
                rowh.append( u );
            }

            createHeader( "mo" );
            createHeader( "tu" );
            createHeader( "we" );
            createHeader( "th" );
            createHeader( "fr" );
            createHeader( "sa" );
            createHeader( "su" );

        }
        while ( i < 6 ) {
            i++;
            this.html.rows[ i ] = $( '<div/>', {
                id     : this.name + '.row-' + i,
                "class": this.name + '-row'
            } );
            this.html.calendar.append( this.html.rows[ i ] );
            var day = 0;
            while ( day < 7 ) {
                day++;
                n++;
                var d = $( '<div/>', {
                    id     : this.name + '-day-' + n,
                    "class": this.name + '-day' + ' ' + this.name + '-button',
                    html   : current.getDate()
                } ).data( 'date', current.getTime() );

                if ( this.settings.min && current.getTime() < new Date( this.settings.min ).getTime() ) {
                    d.addClass( "disabled" );
                }
                if ( this.settings.max && current.getTime() > new Date( this.settings.max ).getTime() ) {
                    d.addClass( "disabled" );
                }
                if ( current.getMonth() != this.current.getMonth() ) {
                    d.addClass( this.name + '-day-extern' );
                }
                if ( clearTime( current ).getTime() === clearTime( SELF.today ).getTime() ) {
                    d.addClass( this.name + '-day-today' );
                }
                if ( this.selected && clearTime( current ).getTime() === clearTime( this.selected ).getTime() ) {
                    d.addClass( this.name + '-active' );
                }

                current = new Date( current.setDate( current.getDate() + 1 ) );
                this.html.days.push( d );
                this.html.rows[ i ].append( d );

            }
        }

        var width = this.html.body.outerWidth() / 7;
        $( this.html.days ).each( function () {
            $( this ).css( {
                width: parseInt( width + 1 - parseInt( $( this ).css( "paddingLeft" ) ) - parseInt( $( this ).css( "paddingRight" ) ) )
            } );
        } );
        $( "." + this.name + "-rowh" ).each( function () {
            $( this ).css( {
                width: parseInt( width + 1 - parseInt( $( this ).css( "paddingLeft" ) ) - parseInt( $( this ).css( "paddingRight" ) ) )
            } );
        } );

        if ( this.settings.free ) {
            this.html.dialog.css( {
                marginTop : (window.innerHeight - this.html.dialog.outerHeight()) / 2,
                marginLeft: (window.innerWidth - this.html.dialog.outerWidth()) / 2
            } );
        } else {
            var css = {
                position: "absolute",
                left    : this.element.offset().left,
                top     : this.element.offset().top + this.element.outerHeight()
            };
            if ( css.top + this.html.dialog.outerHeight() > window.innerHeight ) {
                css.top = this.element.offset().top - this.html.dialog.outerHeight();
            }
            this.html.dialog.css( css );
        }

        this.addEventListener();
        return this;
    };
    FancyDate.api.addEventListener = function addEventListener() {
        var SELF = this;

        for ( var i = 0; i < this.html.days.length; i++ ) {
            $( this.html.days[ i ] ).on( 'click', function ( e ) {
                if ( !$( this ).hasClass( "disabled" ) ) {
                    SELF.select( new Date( $( this ).data( 'date' ) ) );
                }
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            } );
        }

        this.html.dialog.off( "mousedown" ).on( "mousedown", function ( e ) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        } );

        this.html.clear.off( "click" ).on( "click", function () {
            SELF.clear();
        } );

        this.html.dialog.off( "." + this.name ).on( 'selectstart.' + this.name, function ( event ) {
            "use strict";
            event.preventDefault();
        } );

        this.html.close.off( "click" ).on( 'click', function () {
            SELF.close();
        } );

        this.html.title.off( "click" ).on( "click", function () {
            SELF.html.title.toggleClass( NAME + "-year-open" );
        } );

        this.html.today.off( 'click' ).on( 'click', function () {
            var dis = false;
            if ( SELF.settings.max && SELF.today > SELF.settings.max ) {
                dis = true;
            }
            if ( SELF.settings.min && SELF.today < SELF.settings.min ) {
                dis = true;
            }

            if ( !dis ) {
                SELF.select( SELF.today );
                SELF.current = SELF.today;
                SELF.close();
            }
        } );

        this.html.next.off( 'click' ).on( 'click', function () {
            SELF.current = new Date( SELF.current.getFullYear(), SELF.current.getMonth() + 1, 1 );
            SELF.update();
        } );

        this.html.previous.off( 'click' ).on( 'click', function () {
            SELF.current = new Date( SELF.current.getFullYear(), SELF.current.getMonth() - 1, 1 );
            SELF.update();
        } );

        return this;
    };
    FancyDate.api.select           = function select( date ) {
        var SELF = this;
        if ( (this.settings.min && this.settings.min.getTime() > date.getTime()) || (this.settings.max && this.settings.max.getTime() < date.getTime()) ) {
            SELF.close();
            return;
        }
        SELF.element.val( SELF.encode( date ) );
        SELF.selected = date;
        if ( typeof SELF.settings.onSelect == "function" ) {
            SELF.settings.onSelect( SELF.selected );
        }
        SELF.close();
        return this;
    };
    FancyDate.api.encode           = function encode( date, format ) {
        var SELF = this;
        format   = format || SELF.settings.format;
        return format.replace( 'dd', (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) ).replace( 'mm', (date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) ).replace( 'yyyy', date.getFullYear().toString() );
    };
    FancyDate.api.decode           = function decode( date ) {
        var SELF   = this;
        var format = {
            d: parseInt( date.substring( SELF.settings.format.indexOf( 'dd' ), SELF.settings.format.indexOf( 'dd' ) + 2 ) ),
            m: parseInt( date.substring( SELF.settings.format.indexOf( 'mm' ), SELF.settings.format.indexOf( 'mm' ) + 2 ) ) - 1,
            y: parseInt( date.substring( SELF.settings.format.indexOf( 'yyyy' ), SELF.settings.format.indexOf( 'yyyy' ) + 4 ) )
        };
        return new Date( format.y, format.m, format.d );
    };
    FancyDate.api.translate        = function translate( key, value ) {
        var l = FancyDate.translation[ navigator.language ] ? navigator.language : 'en',
            t = FancyDate.translation[ l ][ key ];
        if ( typeof t[ 0 ] == "undefined" && typeof value == "number" ) {
            value = findByKey( t, value );
        }
        if ( t ) {
            t = FancyDate.translation[ l ][ key ][ value ];
        }
        return t;
    };
    FancyDate.api.setYear          = function setYear( year ) {
        this.current.setYear( year );
        this.create();
    };
    FancyDate.api.clear            = function clear() {
        this.element.val( "" );
        this.selected = null;
        this.current  = this.today;
        if ( typeof this.settings.onSelect == "function" ) {
            this.settings.onSelect( this.selected );
        }
        this.close();
    };

    FancyDate.translation = {
        de: {
            month : [ 'Januar', 'Februar', 'M&auml;rz', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember' ],
            day   : {
                mon: "Montag",
                mo : "Mo",
                tue: "Dienstag",
                tu : "Di",
                wen: "Mittwoch",
                we : "Mi",
                thu: "Donnerstag",
                th : "Do",
                fri: "Freitag",
                fr : "Fr",
                sat: "Samstag",
                sa : "Sa",
                sun: "Sonntag",
                su : "So"
            },
            button: {
                close: 'Schlie&szlig;en',
                today: 'Heute',
                clear: 'L&ouml;schen'
            }
        },
        en: {
            month : [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
            day   : {
                mon: 'Mon',
                tue: 'Tue',
                wen: 'Wed',
                thu: 'Thu',
                fri: 'Fri',
                sat: 'Sat',
                sun: 'Sun'
            },
            button: {
                close: 'Close',
                today: 'Today',
                clear: 'Clear'
            }
        }
    };
    /*Fancy.api.date              = function ( settings ) {
     return this.set( NAME, function ( el ) {
     return new FancyDate( el, settings )
     } );
     };*/
    window.FancyDateTranslation = FancyDate.translation;
})( window, jQuery, Fancy );
