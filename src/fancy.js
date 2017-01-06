var root = (function () {
    var e = document.getElementsByTagName( "script" ), n = e[ e.length - 1 ], r = n.src.replace( location.origin, "" ).split( "/" ), t = location.pathname.split( "/" ), i = !1, o = 0;
    for ( var a in r )i || (r[ a ] == t[ a ] ? o++ : i = !0);
    return location.origin + t.slice( 0, o ).join( "/" );
})();
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

function isArrayLike( obj ) {

    var length = !!obj && "length" in obj && obj.length,
        type   = Fancy.type( obj );

    if ( type === "function" || obj === window ) {
        return false;
    }

    return type === "array" || length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj;
}

/**
 * Fancy core function
 * @param selector
 * @param settings
 * @returns {Fancy}
 * @constructor
 */
function Fancy( selector, settings ) {
    if ( !(this instanceof Fancy) ) {
        return new Fancy( selector, settings );
    }
    Fancy.version( this );
    var elements = [];
    jQuery( selector ).each( function () {
        elements.push( this );
    } );

    if ( Fancy.settings[ this.name ] ) {
        this.settings = Fancy.extend( {}, Fancy.settings[ this.name ], settings );
    }

    this.selector = selector;
    return Fancy.makeArray( elements, this );
}

versions[ "Fancy" ] = "2.0.0";
/** @lends Fancy */
Fancy.api = Fancy.prototype = {
    name       : "Fancy",
    constructor: Fancy,
    each       : function ( callback ) {
        return Fancy.each( this, callback );
    }
};


window.Fancy = Fancy;