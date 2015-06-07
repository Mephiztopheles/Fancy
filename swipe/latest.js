(function ( window, $ ) {

    Fancy.require ( {
        jQuery: false,
        Fancy : "1.1.0"
    } );

    function getType ( e ) {
        var t = e.originalEvent.touches,
            r = e.originalEvent.changedTouches;
        t     = t ? t [ 0 ] : false;
        r     = r ? r [ 0 ] : false;
        if ( t ) {
            return {
                x: t.clientX,
                y: t.clientY
            };
        } else if ( r ) {
            return {
                x: r.clientX,
                y: r.clientY
            };
        } else {
            return {
                x: e.clientX,
                y: e.clientY
            };
        }

    }

    function preventSelect ( e ) {
        e.attr ( "unselectable", "on" ).css ( "user-select", "none" ).on ( "selectstart", false );
    }

    function enableSelect ( e ) {
        e.removeAttr ( "unselectable" ).css ( "user-select", "" ).unbind ( "selectstart" );
    }

    var NAME    = "FancySwipe",
        VERSION = "2.1.0",
        logged  = false;

    function FancySwipe ( element, settings ) {
        var SELF      = this;
        SELF.name     = NAME;
        SELF.version  = VERSION;
        SELF.element  = element;
        SELF.settings = $.extend ( {}, Fancy.settings [ NAME ], settings );

        if ( !logged ) {
            logged = true;
            Fancy.version ( SELF );
        }
        SELF.element.on ( 'mousedown touchstart', function ( e ) {
            var startX = getType ( e ).x,
                dir    = '',
                startY = getType ( e ).y,
                marginX,
                marginY;
            preventSelect ( $ ( document ) );
            SELF.settings.onMouseDown.call ( SELF.element, startX, startX );
            $ ( document ).on ( 'mousemove.' + NAME + ' touchmove.' + NAME, function ( e ) {
                var x = getType ( e ).x,
                    y = getType ( e ).y;
                //                        moving right
                if ( x > startX ) {
                    marginX = x - startX;
                    if ( marginX > SELF.settings.min )
                        dir = 'right';
                } else if ( x < startX ) {
                    //                            moving left
                    marginX = startX - x;
                    if ( marginX > SELF.settings.min )
                        dir = 'left';
                }
                if ( y > startY ) {
                    //                            moving down
                    marginY = y - startY;
                    if ( marginY > SELF.settings.min )
                        dir = ( dir && dir != 'down' ? dir + ' ' : '' ) + 'down';
                } else if ( y < startY ) {
                    //                            moving up
                    marginY = startY - y;
                    if ( marginY > SELF.settings.min )
                        dir = ( dir && dir != 'up' ? dir + ' ' : '' ) + 'up';
                }
                SELF.settings.onMouseMove.call ( SELF.element, e, dir, marginX, marginY );
            } ).on ( 'mouseup.' + NAME + ' touchend.' + NAME, function ( e ) {
                enableSelect ( $ ( document ).unbind ( '.' + NAME ) );
                if ( marginX > SELF.settings.min && ( SELF.settings.max ? marginX < SELF.settings.max : true ) ) {
                    SELF.settings.onMouseUp.call ( SELF.element, e, dir, marginX, marginY );
                } else if ( marginY > SELF.settings.min && ( SELF.settings.max ? marginY < SELF.settings.max : true ) ) {
                    SELF.settings.onMouseUp.call ( SELF.element, e, dir, marginX, marginY );
                }
            } );
        } ).on ( "remove", function () {
            enableSelect ( $ ( document ).unbind ( '.' + NAME ) );
        } );
        SELF.element.data ( NAME, SELF );
        return SELF;
    }


    FancySwipe.api = FancySwipe.prototype = {};
    FancySwipe.api.version = VERSION;
    FancySwipe.api.name    = NAME;

    Fancy.settings [ NAME ] = {
        min        : false,
        max        : false,
        onMouseUp  : function () {
        },
        onMouseMove: function () {
        },
        onMouseDown: function () {
        }

    };

    Fancy.swipe     = true;
    Fancy.api.swipe = function ( settings ) {
        return this.set ( FancySwipe, settings );
    };
}) ( window, jQuery );
