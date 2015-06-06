( function ( $ ) {

	Fancy.require ( {
		jQuery: false,
		Fancy: "1.1.0"
	} );
	var i = 1,
	    NAME = "FancyScroll",
	    VERSION = "2.1.0",
	    timer = 0,
	    mouse = {},
	    logged = false;

	function sp ( el ) {
		var position = el.css ( "position" ),
		    excludeStaticParent = position === "absolute",
		    scrollParent = el.prop ( 'nodeName' ) == "TEXTAREA" && el [ 0 ].scrollHeight - el.outerHeight ( ) > 0 ? el : false;
		if ( !el )
			scrollParent = el.parents ( ).filter ( function ( ) {
				var parent = $ ( this );
				if ( excludeStaticParent && parent.css ( "position" ) === "static" ) {
					return false;
				}
				return ( /(auto|scroll)/ ).test ( parent.css ( "overflow" ) + parent.css ( "overflow-y" ) + parent.css ( "overflow-x" ) ) && parent [ 0 ].scrollHeight - parent.outerHeight ( ) > 0;
			} ).eq ( 0 );
		return position === "fixed" || !scrollParent.length ? $ ( el [ 0 ].ownerDocument || document ) : scrollParent;
	}

	/**
	 * FancyScroll
	 * @param {Object} element
	 * @param {Object} settings
	 */

	function FancyScroll ( element, settings ) {
		var el = $( element ) [ 0 ].nodeName == "#document" ? $ ( 'body' ) : $ ( element );

		var SELF = this;
		SELF.id = i;
		SELF.name = NAME;
		SELF.version = VERSION;
		SELF.element = el;
		SELF.disabled = false;
		SELF.isBody = el [ 0 ].nodeName == "#document" || el [ 0 ].nodeName == 'BODY';
		SELF.wrapper = el.parent ( );
		SELF.timer = [ ];
		i++;

		if ( !logged ) {
			logged = true;
			Fancy.version ( SELF );
		}

		SELF.settings = $.extend ( {}, Fancy.settings [ NAME ], settings );
		SELF.direction = {};

		SELF.init ( );
		SELF.addEventListener ( );
		SELF.hideCursor ( );
		SELF.resize ( );
		SELF.position ( );
		SELF.element.data ( SELF.name, SELF );
		return SELF;
	}


	FancyScroll.api = FancyScroll.prototype = {};
	FancyScroll.api.version = VERSION;
	FancyScroll.api.name = NAME;
	FancyScroll.api.init = function ( ) {
		var SELF = this;
		SELF.y = $ ( '<div/>', {
			id: SELF.name + '-y-' + SELF.id,
			class: SELF.name + '-rail ' + SELF.name + '-y-rail'
		} );
		SELF.y.cursor = $ ( '<div/>', {
			id: SELF.name + '-y-cursor-' + SELF.id,
			class: SELF.name + '-cursor'
		} );

		SELF.x = $ ( '<div/>', {
			id: SELF.name + '-x-' + SELF.id,
			class: SELF.name + '-rail ' + SELF.name + '-x-rail'
		} );
		SELF.x.cursor = $ ( '<div/>', {
			id: SELF.name + '-x-cursor-' + SELF.id,
			class: SELF.name + '-cursor'
		} );

		SELF.left = SELF.element.scrollLeft ( );
		SELF.top = SELF.element.scrollTop ( );

		// add classes and make unscrollable
		SELF.element.addClass ( SELF.name + '-element' );
		if ( SELF.settings.mobile ? true : !Fancy.mobile )
			SELF.element.css ( {
				overflow: 'hidden'
			} );
		else
			SELF.element.css ( {
				overflow: 'auto'
			} );
		if ( SELF.settings.y && SELF.settings.mobile ? true : !Fancy.mobile ) {
			SELF.y.append ( SELF.y.cursor );
			SELF.wrapper.append ( SELF.y );
		}
		if ( SELF.settings.x && SELF.settings.mobile ? true : !Fancy.mobile ) {
			// currently disabled due to uncomplete
			// SELF.x.append( SELF.x.cursor );
			// SELF.wrapper.append( SELF.x );
		}

		SELF.y.cursor.css ( {
			background: SELF.settings.cursorColor,
			position: 'relative',
			right: 0,
			border: ( SELF.settings.borderColor ? '1px solid ' + SELF.settings.borderColor : '' ),
			borderRadius: SELF.settings.borderRadius,
			cursor: SELF.settings.cursorCursor
		} ).addClass ( SELF.name + '-theme-' + SELF.settings.theme + '-cursor' );

		SELF.x.cursor.css ( {
			background: SELF.settings.cursorColor,
			position: 'relative',
			top: 0,
			border: ( SELF.settings.borderColor ? '1px solid ' + SELF.settings.borderColor : '' ),
			borderRadius: SELF.settings.borderRadius,
			cursor: SELF.settings.cursorCursor
		} ).addClass ( SELF.name + '-theme-' + SELF.settings.theme + '-cursor' );

		SELF.y.css ( {
			position: ( SELF.isBody ? 'fixed' : 'absolute' ),
			backgroundColor: SELF.settings.railColor,
			width: SELF.settings.cursorWidth
		} ).addClass ( SELF.name + '-theme-' + SELF.settings.theme + '-rail' );
		SELF.x.css ( {
			position: ( SELF.isBody ? 'fixed' : 'absolute' ),
			backgroundColor: SELF.settings.railColor,
			width: SELF.settings.cursorWidth
		} ).addClass ( SELF.name + '-theme-' + SELF.settings.theme + '-rail' );

	};
	FancyScroll.api.showCursor = function ( rail ) {
		// in case it is not disabled and there is a ratio AND if my rails is Y
		if ( !this.disabled && this.ratioY > 1 && ( !rail || rail == 'y' ) ) {
			this.y.removeClass ( this.name + '-mode-' + this.settings.hideMode + '-out' ).addClass ( this.name + '-mode-' + this.settings.hideMode + '-in' );

			// if i am allowed to hide, and i'm not holding the mouse over the rail and i'm not dragged, hide the cursor after 1 min
			if ( this.settings.autoHide )
				this.delay ( function ( ) {
					if ( !this.y.cursor.active && !this.y.cursor.dragged )
						this.hideCursor ( );
				}, 1000 );
		}

		// in case it is not disabled and there is a ratio AND if my rails is X
		if ( !this.disabled && this.ratioX > 1 && ( !rail || rail == 'x' ) ) {
			this.x.removeClass ( this.name + '-mode-' + this.settings.hideMode + '-out' ).addClass ( this.name + '-mode-' + this.settings.hideMode + '-in' );

			// if i am allowed to hide, and i'm not holding the mouse over the rail and i'm not dragged, hide the cursor after 1 min
			if ( this.settings.autoHide )
				this.delay ( function ( ) {
					if ( !this.x.cursor.active && !this.y.cursor.dragged )
						this.hideCursor ( );
				}, 1000 );
		}
		return this;
	};
	FancyScroll.api.hideCursor = function ( ) {
		// check again if i am enabled
		if ( !this.disabled ) {
			// remove the animation classes (css)
			this.y.removeClass ( this.name + '-mode-' + this.settings.hideMode + '-in' ).addClass ( this.name + '-mode-' + this.settings.hideMode + '-out' );
			this.x.removeClass ( this.name + '-mode-' + this.settings.hideMode + '-in' ).addClass ( this.name + '-mode-' + this.settings.hideMode + '-out' );
		}
		return this;
	};
	FancyScroll.api.disable = function ( ) {
		// hide me and disable me
		this.hideCursor ( );
		this.disabled = true;

		// hide me complete to prevent visibility
		this.y.hide ( ).removeClass ( this.name + '-mode-' + this.settings.hideMode + '-in' ).addClass ( this.name + '-mode-' + this.settings.hideMode + '-in' );
		this.x.hide ( ).removeClass ( this.name + '-mode-' + this.settings.hideMode + '-in' ).addClass ( this.name + '-mode-' + this.settings.hideMode + '-in' );
		return this;
	};
	FancyScroll.api.enable = function ( ) {
		var SELF = this;
		SELF.disabled = false;
		// enable me and removy my display style
		SELF.y.css ( 'display', '' );
		SELF.x.css ( 'display', '' );
		return SELF;
	};
	FancyScroll.api.resize = function ( ) {
		var SELF = this;
		// other behaviour for body
		// get WayToScroll
		if ( SELF.isBody ) {
			SELF.element.wtsY = SELF.element [ 0 ].scrollHeight - window.innerHeight;
		} else {
			SELF.element.wtsY = SELF.element [ 0 ].scrollHeight - SELF.element.outerHeight ( );
		}
		// other behaviour for body
		// get WayToScroll
		if ( SELF.isBody ) {
			SELF.element.wtsX = SELF.element [ 0 ].scrollWidth - window.innerWidth;
		} else {
			SELF.element.wtsX = SELF.element [ 0 ].scrollWidth - SELF.element.outerWidth ( );
		}

		// style my rail
		SELF.y.css ( {
			top: SELF.element.position ( ).top + parseInt ( SELF.element.css ( 'borderTop' ) || 0 ) + parseInt ( SELF.element.css ( 'marginTop' ) || 0 ),
			height: SELF.isBody ? '100%' : SELF.element.innerHeight ( )
		} );
		SELF.x.css ( {
			left: SELF.element.position ( ).left + parseInt ( SELF.element.css ( 'marginRight' ) ),
			width: SELF.isBody ? '100%' : SELF.element.outerWidth ( )
		} );

		// style my cursor
		SELF.y.cursor.css ( {
			height: SELF.y.height ( ) - ( SELF.y.height ( ) * ( SELF.element.wtsY / SELF.element [ 0 ].scrollHeight ) ),
			minHeight: SELF.settings.cursorMinHeight
		} );
		SELF.x.cursor.css ( {
			width: SELF.element.outerWidth ( ) - ( SELF.element.outerWidth ( ) * ( SELF.element.wtsX / SELF.element [ 0 ].scrollWidth ) ),
			minWidht: SELF.settings.cursorMinHeight
		} );

		SELF.moveCursor ( );

		// calculate WayToScroll for my rails
		SELF.y.wts = SELF.y.height ( ) - SELF.y.cursor.outerHeight ( );
		SELF.x.wts = SELF.x.width ( ) - SELF.x.cursor.outerWidth ( );

		// calculate ratio
		SELF.ratioY = SELF.element.wtsY / SELF.y.wts;
		SELF.ratioX = SELF.element.wtsX / SELF.x.wts;

		// hide rails if no ratio available
		if ( SELF.ratioY < 1 )
			SELF.y.css ( 'display', 'none' );
		else
			SELF.y.css ( 'display', '' );

		if ( SELF.ratioX < 1 )
			SELF.x.css ( 'display', 'none' );
		else
			SELF.x.css ( 'display', '' );

		return SELF;
	};
	FancyScroll.api.reload = function ( data ) {
		var params = $.extend ( {
			max: this.settings.infinitemax,
			offset: 0
		}, data );
		// refill cache
		//this.getCache( params );
	};
	FancyScroll.api.destroy = function ( ) {
		// remove class
		this.element.removeClass ( this.name + '-element' );
		// reset overflow and unbind events
		this.element.css ( 'overflow', '' ).unbind ( '.' + this.name );
		$ ( window ).unbind ( '.' + this.name );
		// reset cursor
		$ ( 'html' ).css ( {
			cursor: ''
		} );
		//re move rails
		this.y.remove ( );
		this.x.remove ( );
	};
	FancyScroll.api.addEventListener = function ( ) {
		var SELF = this,
		    scrolltimer = 0,
		    lastY = 0;

		function doScroll ( e ) {
			clearTimeout ( SELF.timer [ "scroll" ] );
			SELF.timer [ "scroll" ] = setTimeout ( function ( ) {
				scrolltimer = false;
			}, 3 );
			if ( scrolltimer )
				return;
			scrolltimer = true;
			if ( !SELF.disabled ) {

				if ( SELF.settings.mobile ? true : !Fancy.mobile ) {
					var delta = 0;
					if ( !e )
						e = window.event;
					if ( e.wheelDelta ) {
						delta = e.wheelDelta / 120;
					} else if ( e.detail ) {
						delta = -e.detail / 3;
					}
					var closest = $ ( e.target ).closest ( '.' + SELF.name + '-element' ),
					    up = delta > 0,
					    scrollable = sp ( $ ( e.target ) );

					// if i am prevented and i am body and closest is not this element -> dont scroll
					if ( SELF.settings.preventDefault && ( closest.length && !closest.is ( SELF.element ) ) ) {
						SELF.debug ( 'has fancyscroll' );
						if ( up && closest.data ( 'FancyScroll' ).infinite && closest.data ( 'FancyScroll' ).infinite.last.up ) {
							SELF.debug ( 'the ' + SELF.name + '-element has infiniteScroll, is currently on way up and is not on top yet' );
							return true;
						}
						if ( up && closest.scrollTop ( ) ) {
							SELF.debug ( 'the ' + SELF.name + '-element is currently on way up and is not on top yet' );
							return;
						} else if ( !up && closest.scrollTop ( ) < closest [ 0 ].scrollHeight - closest.outerHeight ( ) ) {
							SELF.debug ( 'the ' + SELF.name + '-element is currently on way down and is not on bottom yet' );
							return true;
						}
					}
					// if i am prevented and closest scrollable element is not this.element and closest scrollable element is not document -> dont scroll
					if ( SELF.settings.preventDefault && ( !scrollable.is ( SELF.element ) && !scrollable.is ( $ ( document ) ) ) ) {
						SELF.debug ( 'scrollable parent' );
						if ( up && scrollable.scrollTop ( ) ) {
							SELF.debug ( 'the container, the mouse is in, is currently on way up and didnt stop on top' );
							return;
						} else if ( !up && scrollable.scrollTop ( ) < scrollable [ 0 ].scrollHeight - scrollable.outerHeight ( ) ) {
							SELF.debug ( 'the container, the mouse is in, is currently on way down and didnt stop on bottom' );
							return true;
						}
					}

					if ( Fancy.mobile ) {
						// get mobile touch event
						var currentY = e.touches && e.touches [ 0 ].clientY;
						up = currentY >= lastY;
						if ( up ) {
							// SCROLLING UP
							SELF.scrollTo ( SELF.left, SELF.top - ( currentY - lastY ) );
						} else {
							// SCROLLING DOWN
							SELF.scrollTo ( SELF.left, SELF.top + ( lastY - currentY ) );
						}
						lastY = currentY;
					} else {
						// get direction by wheelDelta or detail
						if ( up ) {
							// SCROLLING UP
							SELF.scrollTo ( SELF.left, SELF.top - SELF.settings.scrollValue * delta );
						} else {
							// SCROLLING DOWN
							SELF.scrollTo ( SELF.left, SELF.top + SELF.settings.scrollValue * -delta );
						}
					}
					e.preventDefault ( );
				} else {
					SELF.scrollEvents ( );
				}
			} else {
				e.preventDefault ( );
			}

		}


		SELF.element.on ( 'mouseenter.' + SELF.name, function ( ) {
			if ( !SELF.disabled ) {
				// add class hovered
				SELF.y.addClass ( 'hovered' );
				SELF.showCursor ( );
			}
		} ).on ( 'mouseleave.' + SELF.name, function ( ) {
			// remove class hovered
			SELF.y.removeClass ( 'hovered' );
		} ).on ( "touchstart", function ( e ) {
			lastY = e.originalEvent.touches [ 0 ].clientY;
		} );

		SELF.element.on ( 'DOMMouseScroll.' + this.name + ' mousewheel.' + this.name + ' MozMousePixelScroll.' + this.name + ' touchmove.' + this.name, function ( e ) {
			doScroll ( e.originalEvent );
		} );
		/** IE/Opera. */
		SELF.element [ 0 ].onmousewheel = SELF.element [ 0 ].onmousewheel = doScroll;

		SELF.y.on ( 'mouseenter.' + SELF.name, function ( ) {
			// add class hovered and stay
			SELF.y.addClass ( 'hovered' );
			SELF.y.cursor.active = true;
			SELF.showCursor ( );
		} ).on ( 'mouseleave.' + SELF.name, function ( ) {
			// remove class hovered
			SELF.y.removeClass ( 'hovered' );
			SELF.y.cursor.active = false;
		} );

		// cursor grab event
		SELF.y.cursor.on ( 'mousedown.' + SELF.name, function ( e ) {
			"use strict";
			mouse = {};
			mouse.start = e.clientY;
			mouse.old = e.clientY;
			SELF.y.cursor.dragged = true;
			SELF.y.cursor.active = true;
			$ ( 'html' ).css ( {
				cursor: SELF.settings.cursorCursor
			} );

			mouse.wts = {};
			mouse.wts.up = mouse.start - parseInt ( SELF.y.cursor.css ( 'top' ) ) - 2;
			mouse.wts.down = mouse.start + SELF.y.wts - parseInt ( SELF.y.cursor.css ( 'top' ) ) + 2;
			// calculate ways and set cursor for all and prevent selection

			$ ( document, 'body' ).on ( 'selectstart.' + SELF.name, function ( event ) {
				"use strict";
				event.preventDefault ( );
			} );
		} );

		$ ( window ).on ( 'mousemove.' + SELF.name, function ( e ) {
			"use strict";

			// just if im dragged
			if ( SELF.y.cursor.dragged ) {
				var wts;
				// other behaviour for !chrome and body
				// calculate scroll
				if ( SELF.isBody && !Fancy.isChrome ) {
					wts = SELF.wrapper.scrollTop ( ) + ( ( SELF.element.wtsY / SELF.y.wts ) * ( e.clientY - mouse.old ) );
				} else {
					wts = SELF.element.scrollTop ( ) + ( ( SELF.element.wtsY / SELF.y.wts ) * ( e.clientY - mouse.old ) );
				}
				SELF.scrollTo ( SELF.left, Math.round ( wts ) );

				// resize but dont reposition
				SELF.resize ( );

				// set old position for another calculation
				if ( e.clientY >= mouse.wts.up && e.clientY <= mouse.wts.down ) {
					mouse.old = e.clientY;
				}
			}
		} );

		$ ( window ).on ( 'mouseup.' + SELF.name + ' touchend.' + SELF.name, function ( ) {
			"use strict";
			// unbind selection
			$ ( document ).unbind ( 'selectstart.' + SELF.name );
			// reset cursor
			$ ( 'html' ).css ( {
				cursor: ''
			} );
			// destroy mouse
			mouse = {};
			SELF.y.cursor.active = false;
			SELF.y.cursor.dragged = false;
		} );

		// create an observer instance
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
		var observer = new MutationObserver ( function ( mutations ) {
			mutations.forEach ( function ( mutation ) {
				SELF.resize ( );
				SELF.position ( );
			} );
		} );

		// pass in the target node, as well as the observer options
		observer.observe ( SELF.element [ 0 ], {
			subtree: false,
			attributeOldValue: false,
			attributes: true,
			childList: true,
			characterData: true
		} );

		SELF.element.on ( 'DOMAttrModified', function ( e ) {
			if ( e.attrName === 'style' ) {
				SELF.resize ( );
				SELF.position ( );
			}
		} );
	};
	FancyScroll.api.position = function ( ) {
		this.y.css ( {
			left: this.element.position ( ).left - this.settings.margin + this.element.outerWidth ( ) - this.y.width ( ) - parseInt ( this.element.css ( 'borderRight' ) || 0 ) + parseInt ( this.element.css ( 'marginLeft' ) )
		} );
		this.x.css ( {
			top: this.element.position ( ).top - this.settings.margin + this.element.outerHeight ( ) - this.x.height ( ) + parseInt ( this.element.css ( 'marginTop' ) )
		} );
		return this;
	};
	FancyScroll.api.scrollTo = function ( x, y, speed ) {
		var SELF = this;
		if ( x < 0 )
			x = 0;
		if ( y < 0 )
			y = 0;
		if ( x > SELF.element.wtsX )
			x = SELF.element.wtsX;
		if ( y > SELF.element.wtsY )
			y = SELF.element.wtsY;

		// define scrollDirection to see where it goes
		if ( x > SELF.left )
			SELF.direction.x = 'right';
		else if ( x < SELF.left )
			SELF.direction.x = 'left';
		else
			SELF.direction.x = false;

		if ( y > SELF.top )
			SELF.direction.y = 'down';
		else if ( y < SELF.top )
			SELF.direction.y = 'up';
		else
			SELF.direction.y = false;
		function scrollLeft ( type ) {
			SELF [ type ].scrollLeft ( x );
			SELF.left = x;
			// fire scrollevents
			if ( SELF.direction.x )
				SELF.scrollEvents ( );
		}

		function scrollTop ( type ) {
			SELF [ type ].scrollTop ( y );
			SELF.top = y;
			// fire scrollevents
			if ( SELF.direction.y )
				SELF.scrollEvents ( );
		}

		scrollTop ( 'element' );
		scrollLeft ( 'element' );
		// move cursor
		SELF.moveCursor ( );
		// resize the scroller
		SELF.resize ( );
		// and show the cursor
		SELF.showCursor ( );
		return SELF;
	};
	FancyScroll.api.moveCursor = function ( ) {
		var SELF = this;

		function move ( type ) {

			var rx = ( SELF.y.height ( ) - SELF.y.cursor.outerWidth ( ) ) / SELF.element.wtsX,
			    ry = ( SELF.y.height ( ) - SELF.y.cursor.outerHeight ( ) ) / SELF.element.wtsY,
			    sx = ( SELF.left ) * rx,
			    sy = ( SELF.top ) * ry,
			    x = ( SELF.scrollDirection == 'up' ? Math.max ( 0, sx ) : Math.min ( SELF.x.wts, sx ) ),
			    y = ( SELF.scrollDirection == 'up' ? Math.max ( 0, sy ) : Math.min ( SELF.y.wts, sy ) );

			// stop cursor and reposition
			SELF.y.cursor.css ( {
				top: SELF [ type ].scrollTop ( ) * ry
			} );
			// stop cursor and reposition
			SELF.x.cursor.css ( {
				left: SELF [ type ].scrollLeft ( ) * rx
			} );
		}

		move ( 'element' );
		/*if ( SELF.isBody && !Fancy.isChrome ) {
		 move( 'wrapper' );
		 } else {
		 }*/
		return SELF;
	};
	FancyScroll.api.delay = function ( callback, ms ) {
		var SELF = this;
		clearTimeout ( timer );
		timer = setTimeout ( function ( ) {
			callback.call ( SELF );
		}, ms );
	};
	FancyScroll.api.timeout = function ( callback, ms ) {
		var SELF = this;
		setTimeout ( function ( ) {
			callback.call ( SELF );
		}, ms );
	};
	FancyScroll.api.scrollEvents = function ( ) {
		var SELF = this;
		// function to trigger
		function triggerEvent ( type ) {
			var event = $.Event ( {
				type: SELF.name + ':' + type,
				FancyScroll: SELF,
				y: SELF.y,
				x: SELF.x
			} );
			SELF.element.trigger ( event );
		}

		// if option is in percent
		// check if i reached this position
		// and trigger the event for it
		if ( SELF.settings.beforeTop.toString ( ).indexOf ( '%' ) > 0 ) {
			if ( SELF.element.scrollTop ( ) * 100 / SELF.element.wtsY <= parseInt ( SELF.settings.beforeTop ) && SELF.direction.y == "up" ) {
				triggerEvent ( 'top' );
			}
		} else {
			if ( SELF.element.scrollTop ( ) <= 0 + SELF.settings.beforeTop && SELF.direction.y == "up" ) {
				triggerEvent ( 'top' );
			}
		}
		if ( SELF.settings.beforeBottom.toString ( ).indexOf ( '%' ) > 0 ) {
			if ( SELF.element.scrollTop ( ) * 100 / SELF.element.wtsY >= 100 - parseInt ( SELF.settings.beforeBottom ) && SELF.direction.y == "down" ) {
				triggerEvent ( 'bottom' );
			}
		} else {
			if ( SELF.element.scrollTop ( ) >= SELF.element.wtsY - SELF.settings.beforeBottom && SELF.direction.y == "down" ) {
				triggerEvent ( 'bottom' );
			}
		}
		// trigger scroll event and direction event
		SELF.element.trigger ( SELF.name + ':scroll' );
		SELF.element.trigger ( SELF.name + ':' + SELF.scrollDirection );
	};
	FancyScroll.api.debug = function ( ) {
		if ( this.settings.debug )
			console.log ( arguments );
	};

	Fancy.settings [ NAME ] = {
		scrollValue: 100, // how many pixel to scroll?
		margin: 0, // want a margin?
		beforeTop: 0, // how mouch before reaching top to trigger Top-Event? 100 || '20%'
		beforeBottom: 0, // how mouch before reaching bottom to trigger Bottom-Event? 100 || '20%'
		cursorMinHeight: false, // min height of the cursor?
		cursorWidth: false, // how big you want the railcursor?
		cursorColor: false, // which colour should it have?
		railColor: false, // which colour should the rail have?
		mobile: false, // replace in mobile? events will fired if you dont want to replace
		selectEnabled: true, // enable scrolling while selecting?
		autoHide: true, // hide the scroller automaticly?
		preventDefault: true, // want to prevent outer scrollbar on scrolling in inner container?
		borderColor: false, // color of the border frm cursor
		borderRadius: false, // border-radius from the cursor
		smooth: false, // want smooth scroll?
		linear: false, // linear scrolling or scroll as fast as mousewheel
		x: false, // show y-rail?
		y: true, // show x-rail?
		debug: false, // want to log all what can happen?
		theme: 'default', // which them to apply?
		cursorCursor: 'pointer', // do you want a cursor?
		hideMode: 'fade', // which mode do you prefer?
		infiniteUrl: '', // url which is called
		infiniteSize: 250, // cachesize
		infiniteStart: 0, // which strtpoint (offset)
		infiniteMax: 20, // how much max displayed
		infiniteData: {}, // parameters to add
		infiniteBuffer: 5, // how much to buffer?
		infiniteAppend: 1, // how much to append/prepend?
		infiniteStop: {
			up: 0,
			down: false
		} // stop at this points when scrolling
	};
	Fancy.scroll = true;
	Fancy.api.scroll = function ( settings ) {
		return this.set ( FancyScroll, settings );
	};

} ) ( jQuery );
