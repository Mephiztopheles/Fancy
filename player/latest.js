( function ( window, $ ) {

	Fancy.require ( {
		jQuery: false,
		Fancy: "1.1.0"
	} );
	function preventSelect ( el ) {
		return el.on ( "selectstart", false ).attr ( 'unselectable', "on" ).css ( "userSelect", "none" );
	}

	function calcTime ( seconds ) {
		var full = [ ];
		var h = parseInt ( seconds / 3600 );
		var m = parseInt ( ( seconds - ( h * 3600 ) ) / 60 );
		var s = Math.floor ( ( seconds - ( ( h * 3600 ) + ( m * 60 ) ) ) );
		if ( h ) {
			full.push ( h < 10 ? "0" + h : h );
		}
		full.push ( m < 10 ? "0" + m : m );
		full.push ( s < 10 ? "0" + s : s );
		return full.join ( ':' );
	}

	function globalEvent ( e ) {
		$ ( document ).trigger ( e );
	}

	var i = 1,
	    NAME = "FancyPlayer",
	    VERSION = "2.1.1",
	    logged = false;

	function setSelector ( el, type ) {
		type = type ? "-" + type + "-" : "-";
		return el.attr ( "id", NAME + type + i ).addClass ( NAME + type.substring ( 0, type.length - 1 ) );
	}

	function addClass ( el ) {
		var type = [ ];
		for ( var i = 1; i < arguments.length; i++ ) {
			type.push ( arguments [ i ] );
		}
		type.forEach ( function ( it ) {
			el.addClass ( NAME + "-" + it );
		} );
		return el;
	}

	function removeClass ( el ) {
		var type = [ ];
		for ( var i = 1; i < arguments.length; i++ ) {
			type.push ( arguments [ i ] );
		}
		type.forEach ( function ( it ) {
			el.removeClass ( NAME + "-" + it );
		} );
		return el;
	}

	function FancyPlayer ( element, settings ) {
		var SELF = this;
		SELF.id = i;
		SELF.name = NAME;
		SELF.version = VERSION;
		SELF.element = element [ 0 ];
		SELF.element.controls = false;
		SELF.controls = false;
		SELF.timer = [ ];

		SELF.onEnd = function ( ) {
		};
		SELF.onPlay = function ( ) {
		};
		SELF.onPause = function ( ) {
		};
		SELF.onVolume = function ( ) {
		};

		SELF.settings = $.extend ( {}, Fancy.settings [ NAME ], settings );

		SELF.html = {
			wrapper: addClass ( setSelector ( $ ( "<div/>" ) ), "theme-" + SELF.settings.theme ),
			controls: setSelector ( $ ( "<div/>" ), "controls" ),
			left: setSelector ( $ ( "<div/>" ), "controls-left" ),
			right: setSelector ( $ ( "<div/>" ), "controls-right" ),
			play: addClass ( setSelector ( $ ( "<div/>" ), "play" ), "control" ),
			fullscreen: addClass ( setSelector ( $ ( "<div/>" ), "fullscreen" ), "control" ),
			timeCurrent: setSelector ( $ ( "<div/>", {
				html: "00:00"
			} ), "time-current" ),
			timeFull: setSelector ( $ ( "<div/>", {
				html: "00:00"
			} ), "time-full" ),
			timePopout: setSelector ( $ ( "<div/>" ), "time-popout" ),
			timeSlider: setSelector ( $ ( "<div/>" ), "time-slider" ),
			timeSliderCurrent: setSelector ( $ ( "<div/>" ), "time-slider-current" ),
			timeSliderCurrentThumb: setSelector ( $ ( "<span/>" ), "time-slider-current-thumb" ),
			timeSliderBuffer: setSelector ( $ ( "<div/>" ), "time-slider-buffer" ),
			timeSliderFull: setSelector ( $ ( "<div/>" ), "time-slider-full" ),
			volume: setSelector ( $ ( "<div/>" ), "volume" ),
			volumeSlider: setSelector ( $ ( "<div/>" ), "volume-slider" ),
			volumeSliderCurrent: setSelector ( $ ( "<div/>" ), "volume-slider-current" ),
			volumeSliderCurrentThumb: setSelector ( $ ( "<span/>" ), "volume-slider-current-thumb" ),
			volumeSliderFull: setSelector ( $ ( "<div/>" ), "volume-slider-full" ),
			mute: addClass ( setSelector ( $ ( "<div/>" ), "volume-mute" ), "control" ),
			loop: addClass ( setSelector ( $ ( "<div/>" ), "loop" ), "control" )
		};

		element.wrap ( SELF.html.wrapper );
		SELF.html.wrapper = element.parent ( );
		SELF.html.wrapper.append ( SELF.html.controls );
		SELF.html.controls.append ( SELF.html.left );
		SELF.html.left.append ( SELF.html.play );
		if ( SELF.settings.loopable )
			SELF.html.left.append ( SELF.html.loop );
		SELF.html.left.append ( SELF.html.timeCurrent );
		SELF.html.left.append ( SELF.html.timeFull );
		SELF.html.controls.append ( SELF.html.timeSlider );
		SELF.html.controls.append ( SELF.html.right );
		SELF.html.controls.append ( SELF.html.timePopout );
		SELF.html.right.append ( SELF.html.volume );
		SELF.html.right.append ( SELF.html.fullscreen );
		SELF.html.timeSlider.append ( SELF.html.timeSliderFull );
		SELF.html.timeSliderFull.append ( SELF.html.timeSliderBuffer );
		SELF.html.timeSliderFull.append ( SELF.html.timeSliderCurrent );
		SELF.html.timeSliderCurrent.append ( SELF.html.timeSliderCurrentThumb );
		SELF.html.volume.append ( SELF.html.mute );
		SELF.html.volume.append ( SELF.html.volumeSlider );
		SELF.html.volumeSlider.append ( SELF.html.volumeSliderFull );
		SELF.html.volumeSliderFull.append ( SELF.html.volumeSliderCurrent );
		SELF.html.volumeSliderCurrent.append ( SELF.html.volumeSliderCurrentThumb );

		if ( !logged ) {
			logged = true;
			Fancy.version ( SELF );
		}
		SELF.duration = 0;
		SELF.volume = SELF.element.volume;
		SELF.muted = SELF.element.muted;
		addClass ( SELF.html.wrapper, "volume-" + SELF.settings.volumeStyle );
		SELF.eventListener ( );
		addClass ( SELF.html.wrapper, "paused" );

		if ( SELF.settings.start ) {
			SELF.seek ( SELF.settings.start );
			SELF.html.timerSliderCurrent.css ( 'marginLeft', SELF.settings.start );
			SELF.html.timeSliderBuffer.css ( 'marginLeft', SELF.settings.start );
		}
		SELF.play ( );
		if ( !SELF.settings.autoplay ) {
			SELF.pause ( );
		}
		preventSelect ( SELF.html.wrapper );
		element.data ( NAME, SELF );
		SELF.element.load ( );
		var observer = new MutationObserver ( function ( mutation ) {
			for ( var i = 0; i < mutation.length; i++ ) {
				var mut = mutation [ i ];
				if ( mut.type = "attributes" && mut.attributeName == "src" ) {
					SELF.element.load ( );
				}
			}

		} );
		observer.observe ( element.find("source") [ 0 ], {
			attributes: true
		} );

		return SELF;
	}


	FancyPlayer.api = FancyPlayer.prototype = {};
	FancyPlayer.api.version = VERSION;
	FancyPlayer.api.name = NAME;
	FancyPlayer.api.pause = function ( ) {
		this.element.pause ( );
		this.showControls ( );
		return this;
	};
	FancyPlayer.api.play = function ( ) {
		if ( this.element.ended ) {
			this.reset ( );
			this.play ( );
		} else {
			this.element.play ( );
			this.showControls ( );
		}
		return this;
	};

	FancyPlayer.api.seek = function ( value ) {
		var SELF = this;
		clearTimeout ( SELF.timer [ "seek" ] );
		SELF.timer [ "seek" ] = setInterval ( function ( ) {
			if ( SELF.element.readyState == 4 ) {
				clearTimeout ( SELF.timer [ "seek" ] );
				SELF.element.currentTime = value;
				SELF.update ( true );
			}
		}, 10 );
		return SELF;
	};

	FancyPlayer.api.update = function ( instant ) {
		var SELF = this;
		SELF.currentTime = SELF.element.currentTime;
		SELF.duration = SELF.element.duration || 0;
		if ( instant ) {
			SELF.html.timeSliderCurrent.stop ( true ).width ( ( ( SELF.currentTime - SELF.settings.start ) / SELF.duration * 100 ) + "%" );
			SELF.html.timeSliderBuffer.stop ( true ).width ( ( ( SELF.element.buffered.end ( 0 ) - SELF.settings.start ) / SELF.duration * 100 ) + "%" );
		} else if ( SELF.element.readyState == 4 ) {
			SELF.buffered = [ SELF.element.buffered.start ( 0 ), SELF.element.buffered.end ( 0 ) ];
			SELF.played = [ SELF.settings.start, SELF.element.currentTime ];
			SELF.html.timeSliderCurrent.animate ( {
				width: ( ( SELF.currentTime + 1 - SELF.settings.start ) / SELF.duration * 100 ) + "%"
			}, 1000, "linear" );
			SELF.html.timeSliderBuffer.animate ( {
				width: ( ( SELF.buffered [ 1 ] - SELF.settings.start ) / SELF.duration * 100 ) + "%"
			}, 1000, "linear" );
		}

		SELF.html.timeFull.html ( calcTime ( SELF.duration ) );
		SELF.html.timeCurrent.html ( calcTime ( SELF.currentTime ) );
		return this;
	};

	FancyPlayer.api.toggle = function ( ) {
		var SELF = this;
		if ( SELF.element.paused ) {
			SELF.play ( );
		} else {
			SELF.pause ( );
		}
		return this;
	};

	FancyPlayer.api.eventListener = function ( ) {
		var SELF = this;
		SELF.html.play.on ( "click", function ( ) {
			SELF.toggle ( );
		} );

		$ ( SELF.element ).on ( "ended", function ( ) {
			removeClass ( SELF.html.wrapper, "played", "paused" );
			addClass ( SELF.html.wrapper, "ended" );
			SELF.update ( true );
			var e = {
				type: "FancyPlayer:ended",
				player: SELF.element,
				api: SELF,
				id: SELF.id
			};
			globalEvent ( e );
			SELF.onEnd ( );
		} ).on ( "pause", function ( ) {
			SELF.update ( true );
			clearInterval ( SELF.timer [ "played" ] );

			addClass ( SELF.html.wrapper, "paused" );
			removeClass ( SELF.html.wrapper, "played", "ended" );
			var e = new $.Event ( {
				type: "FancyPlayer:pause",
				player: SELF.element,
				api: SELF,
				id: SELF.id
			} );
			globalEvent ( e );
			SELF.html.timeSliderCurrent.stop ( true );
			SELF.html.timeSliderBuffer.stop ( true );
			SELF.onPause ( );
		} ).on ( "play", function ( ) {
			addClass ( SELF.html.wrapper, "played" );
			removeClass ( SELF.html.wrapper, "paused", "ended" );
			var e = {
				type: "FancyPlayer:play",
				player: SELF.element,
				api: SELF,
				id: SELF.id
			};
			globalEvent ( e );
			SELF.update ( );
			SELF.timer [ "played" ] = setInterval ( function ( ) {
				SELF.update ( );
			}, 1000 );
			SELF.onPlay ( );
		} ).on ( "volumechange", function ( ) {
			SELF.volume = 100 * SELF.element.volume;
			function set ( vol ) {
				if ( SELF.html.volumeSliderFull.height ( ) > SELF.html.volumeSliderFull.width ( ) )
					SELF.html.volumeSliderCurrent.css ( {
						height: vol + "%"
					} );
				else
					SELF.html.volumeSliderCurrent.css ( {
						width: vol + "%"
					} );
			}

			//set(SELF.volume);
			if ( SELF.element.muted || SELF.volume === 0 ) {
				addClass ( SELF.html.wrapper, "muted" );
				set ( 0 );
			} else {
				removeClass ( SELF.html.wrapper, "muted" );
				set ( SELF.volume );
			}
			var e = {
				type: "FancyPlayer:volume",
				player: SELF.element,
				api: SELF,
				id: SELF.id
			};
			globalEvent ( e );
			SELF.onVolume ( );
		} ).on ( "contextmenu", function ( e ) {
			e.preventDefault ( );
			return false;
		} ).on ( "click", function ( ) {
			if ( !Fancy.swipe && Fancy.mobile ) {
				if ( !SELF.controls ) {
					SELF.showControls ( );
				} else {
					SELF.toggle ( );
				}
			} else {
				SELF.toggle ( );
			}
		} ).on ( "dblclick", function ( ) {
			SELF.fullscreen ( );
		} ).on ( "waiting", function ( ) {
		} ).on ( "loadstart", function ( ) {
			if ( SELF.settings.poster ) {
				$ ( this ).attr ( "poster", SELF.settings.poster );
			}
		} ).on ( "canplay", function ( ) {
			$ ( this ).removeAttr ( "poster" );
			SELF.update ( true );
		} );

		SELF.html.fullscreen.on ( "click", function ( ) {
			SELF.fullscreen ( );
		} );

		SELF.html.mute.on ( "click", function ( ) {
			SELF.element.muted = !SELF.element.muted;
			SELF.muted = SELF.element.muted;
		} );

		SELF.html.timeSlider.on ( "click", function ( e ) {
			SELF.seek ( SELF.calcTime ( e ) );
			SELF.update ( true );
		} );

		function calcVolume ( e ) {
			if ( SELF.html.wrapper.hasClass ( NAME + "-volume-y" ) ) {
				var m = 100 - 100 * ( e.pageY - SELF.html.volumeSliderFull.offset ( ).top ) / SELF.html.volumeSliderFull.height ( );
				m = m > 100 ? 100 : ( m < 0 ? 0 : m );
				SELF.setVolume ( m );
			} else {
				var m = 100 * ( e.pageX - SELF.html.volumeSliderFull.offset ( ).left ) / SELF.html.volumeSliderFull.width ( );
				m = m > 100 ? 100 : ( m < 0 ? 0 : m );
				SELF.setVolume ( m );
			}
		}


		SELF.html.volumeSliderFull.on ( "click", function ( e ) {
			calcVolume ( e );
		} );

		SELF.html.loop.on ( "click", function ( e ) {
			e.preventDefault ( );
			e.stopPropagation ( );
			SELF.html.loop.toggleClass ( "checked" );
			SELF.toggleLoop ( );
		} );

		SELF.html.wrapper.on ( "mousemove", function ( ) {
			if ( !Fancy.mobile ) {
				SELF.showControls ( );
			}
		} );

		if ( SELF.html.wrapper.hasClass ( NAME + "-volume-y" ) ) {

			SELF.html.volume.on ( "mousemove", function ( ) {
				SELF.html.volumeSlider.show ( );
				clearTimeout ( SELF.timer [ "volume" ] );
				SELF.timer [ "volume" ] = setTimeout ( function ( ) {
					if ( !$ ( "#" + SELF.html.volume.attr ( "id" ) + ":hover" ).length )
						SELF.html.volumeSlider.fadeOut ( );
				}, Fancy.mobile && SELF.settings.hideControlsMobile ? SELF.settings.hideControlsMobile : SELF.settings.hideControlsDesktop );
			} );

		}

		if ( Fancy.swipe ) {
			Fancy ( SELF.html.volumeSliderFull ).swipe ( {
				onMouseMove: function ( e ) {
					calcVolume ( e );
				}

			} );

			Fancy ( SELF.html.timeSlider ).swipe ( {
				onMouseMove: function ( e ) {
					var m = 100 * ( e.pageX - SELF.html.timeSliderFull.offset ( ).left ) / SELF.html.timeSliderFull.width ( );
					m = m > 100 ? 100 : ( m < 0 ? 0 : m );
					SELF.seek ( SELF.element.duration * m / 100 );
					SELF.update ( true );
				}

			} );

			if ( Fancy.mobile ) {
				SELF.showControls ( );
				Fancy ( SELF.element ).swipe ( {
					onMouseUp: function ( e, dir, x, y ) {
						if ( dir.indexOf ( "up" ) >= 0 && x < 100 ) {
							SELF.showControls ( );
						} else if ( dir.indexOf ( "down" ) >= 0 && x < 100 ) {
							SELF.hideControls ( );
						}
					},
					onMouseMove: function ( e ) {
						e.preventDefault ( );
					}

				} );
			}

		}

		SELF.html.timeSlider.on ( "mousemove", function ( e ) {
			SELF.html.timePopout.show ( ).html ( SELF.getTime ( e ) );
			var left = e.offsetX + SELF.html.timeSlider.position ( ).left,
			    width = SELF.html.timePopout.outerWidth ( );
			left = Math.min ( left, ( SELF.html.timeSlider.width ( ) + SELF.html.timeSlider.position ( ).left ) - ( width / 2 ) - 5 );
			left = Math.max ( left, width / 2 + 5 );

			SELF.html.timePopout.css ( {
				left: left
			} );
		} ).on ( "mouseout", function ( ) {
			SELF.html.timePopout.fadeOut ( );
		} );

		$ ( document ).on ( "webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange", function ( ) {
			if ( !document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
				removeClass ( SELF.html.wrapper, "fullscreen" );
			} else {
				addClass ( SELF.html.wrapper, "fullscreen" );
			}
		} );

		return this;
	};

	FancyPlayer.api.fullscreen = function ( mode ) {
		if ( !mode || mode === "toggle" ) {
			if ( !document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
				mode = "enter";
			} else {
				mode = "leave";
			}
		}
		if ( mode === "enter" ) {
			var elem = this.html.wrapper [ 0 ];
			if ( elem.requestFullscreen ) {
				elem.requestFullscreen ( );
			} else if ( elem.msRequestFullscreen ) {
				elem.msRequestFullscreen ( );
			} else if ( elem.mozRequestFullScreen ) {
				elem.mozRequestFullScreen ( );
			} else if ( elem.webkitRequestFullscreen ) {
				elem.webkitRequestFullscreen ( );
			}
		} else if ( mode === "leave" ) {
			if ( document.exitFullscreen ) {
				document.exitFullscreen ( );
			} else if ( document.msExitFullscreen ) {
				document.msExitFullscreen ( );
			} else if ( document.mozCancelFullScreen ) {
				document.mozCancelFullScreen ( );
			} else if ( document.webkitExitFullscreen ) {
				document.webkitExitFullscreen ( );
			}
		} else {
			throw "ERROE: Mode " + mode + " not supported";
		}
		return this;

	};

	FancyPlayer.api.setVolume = function ( value ) {
		if ( typeof value == "number" ) {
			this.element.muted = false;
			this.element.volume = value / 100;
		}
		console.log ( value );
		console.trace ( );
		return this;
	};

	FancyPlayer.api.reset = function ( ) {
		this.element.load ( );
		this.seek ( this.settings.start );
		this.html.timeSliderCurrent.width ( 0 );
		return this;
	};

	FancyPlayer.api.toggleLoop = function ( bool ) {
		if ( typeof bool != "undefined" )
			this.element.loop = bool ? true : false;
		else
			this.element.loop = !this.element.loop;
	};

	FancyPlayer.api.showControls = function ( ) {
		var SELF = this;
		SELF.controls = true;
		addClass ( SELF.html.wrapper, "controls-show" );
		if ( ( SELF.settings.hideControlsDesktop && !Fancy.mobile ) || ( Fancy.mobile && SELF.settings.hideControlsMobile ) ) {
			clearTimeout ( SELF.timer [ "hide" ] );
			SELF.timer [ "hide" ] = setTimeout ( function ( ) {
				if ( !Fancy.mobile && !$ ( "#" + SELF.html.controls.attr ( "id" ) + ":hover" ).length ) {
					SELF.hideControls ( );
				} else if ( Fancy.mobile ) {
					SELF.hideControls ( );
				}
			}, Fancy.mobile && SELF.settings.hideControlsMobile ? SELF.settings.hideControlsMobile : SELF.settings.hideControlsDesktop );
		}
	};

	FancyPlayer.api.hideControls = function ( ) {
		this.controls = false;
		removeClass ( this.html.wrapper, "controls-show" );
	};

	FancyPlayer.api.calcTime = function ( e ) {
		return ( this.element.duration * e.offsetX || 0 ) / this.html.timeSlider.width ( );
	};

	FancyPlayer.api.getTime = function ( e ) {
		return calcTime ( this.calcTime ( e ) );
	};

	Fancy.settings [ NAME ] = {
		autoplay: false,
		start: 0,
		theme: "default",
		volumeStyle: "x",
		loopable: false,
		hideControlsDesktop: 1500,
		hideControlsMobile: false,
		poster: false
	};

	Fancy.player = true;
	Fancy.api.player = function ( settings ) {
		return this.set ( FancyPlayer, settings );
	};
} ) ( window, jQuery );
