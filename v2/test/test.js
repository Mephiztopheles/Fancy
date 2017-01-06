function minError( module, ErrorConstructor ) {
    ErrorConstructor = ErrorConstructor || Error;
    return function () {
        var SKIP_INDEXES = 2;

        var args     = arguments,
            code     = args[ 0 ],
            message  = '[' + (module ? module + ':' : '') + code + '] ',
            template = args[ 1 ];

        message += template.replace( /\{\d+\}/g, function ( match ) {
            var index        = +match.slice( 1, -1 ),
                shiftedIndex = index + SKIP_INDEXES;

            if ( shiftedIndex < args.length ) {
                return toDebugString( args[ shiftedIndex ] );
            }

            return match;
        } );
        return new ErrorConstructor( message );
    }
}
function serializeObject( obj ) {
    var seen = [];

    return JSON.stringify( obj, function ( key, val ) {
        if ( isObject( val ) ) {
            if ( seen.indexOf( val ) >= 0 ) {
                return '...';
            }
            seen.push( val );
        }
        return val;
    } );
}
function isObject( value ) {
    return value !== null && typeof value === 'object';
}
function toDebugString( obj ) {
    if ( typeof obj === 'function' ) {
        return obj.toString().replace( / \{[\s\S]*$/, '' );
    } else if ( isUndefined( obj ) ) {
        return 'undefined';
    } else if ( typeof obj !== 'string' ) {
        return serializeObject( obj );
    }
    return obj;
}
function isUndefined( value ) {return typeof value === 'undefined';}

var fancyMinError = minError( "Fancy" );
function Fancy( selector ) {
    if ( !(this instanceof Fancy) ) {
        throw fancyMinError( "construct", "TypeError: Failed to construct 'Fancy': Please use the 'new' operator, this DOM object constructor cannot be called as a function." );
    }
    return this;
}

Fancy.minError = minError;

Fancy.api = Fancy.prototype = {};

function FancyDate() {
    if ( !(this instanceof FancyDate) ) {
        throw fancyDateMinError( "construct", "TypeError: Failed to construct '{0}': Please use the 'new' operator, this DOM object constructor cannot be called as a function.", FancyDate.api.name );
    }
    this.select = function () {
        return this;
    };
    console.log( this );
    return this;
}
FancyDate.api = FancyDate.prototype = {
    name   : "Fancy.date",
    version: "2.0.0"
};
var fancyDateMinError = minError( FancyDate.api.name );
Fancy.api.date        = FancyDate;