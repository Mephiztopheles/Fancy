(function ( w ) {
    var logged = false;

    function r () {
        var origin   = location.protocol + "//" + location.hostname,
            scripts  = document.getElementsByTagName ( 'script' ),
            script   = scripts [ scripts.length - 1 ],
            path     = script.src.replace ( origin, '' ).split ( '/' ),
            pathname = location.pathname.split ( '/' ),
            notSame  = false,
            same     = 0;
        for ( var i in path ) {
            if ( !notSame ) {
                if ( path [ i ] == pathname [ i ] ) {
                    same++;
                } else {
                    notSame = true;
                }
            }
        }
        return origin + pathname.slice ( 0, same ).join ( '/' );
    }

    var root     = r ();
    w.createLink = function createLink ( options ) {
        this.name    = 'createLink';
        this.version = '2.0.0';

        var um = createLink.urlMapping,
            o  = {
                // get controller by searching in path for the index of the $controller var in urlMapping
                controller: location.href.replace ( root, '' ).substr ( um.indexOf ( '$controller' ), location.href.replace ( root, '' ).indexOf ( '/', um.indexOf ( '$controller' ) ) - 1 ),
            };

        for ( var i in options ) {
            o [ i ] = options [ i ];
        }
        // if uri is not set
        if ( !o.uri ) {
            // get urlMappings and split them by '/'
            var path = um;
            for ( var i in o ) {
                var index = path.indexOf ( i );
                if ( index >= 0 ) {
                    if ( path [ index - 1 ] == "$" ) {
                        path = path.replace ( path.substring ( index - 1, index + i.length ), o [ i ] );
                    }
                }
            }
            return root + path;

        } else {
            // set uri as link
            return root + o.uri;
        }

    };
    // structure to create the returned link
    createLink.urlMapping = '/$controller/$action?/$id?';

}) ( window );
