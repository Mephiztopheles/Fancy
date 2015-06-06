( function ($ ) {

	Fancy.require ( {
		jQuery: false,
		Fancy: "1.1.0"
	} );
	var i = 1,
	    NAME = "FancySelect",
	    VERSION = "2.1.0",
	    logged = false;

	function nameEvent ( event, name ) {
		return event + '.' + name;
	}

	function FancySelect ( element, settings ) {
		var el = $ ( element );
		var SELF = this;
		SELF.id = i;
		SELF.name = NAME;
		SELF.version = version;
		SELF.element = el;
		SELF.defaultValue = SELF.value = SELF.element.val ( );
		SELF.settings = $.extend ( {
			multiple: SELF.element.attr ( 'multiple' ) || SELF.element.hasClass ( 'multiple' ),
			search: SELF.element.attr ( 'search' ) || SELF.element.hasClass ( 'search' ),
			selectedText: false,
			create: SELF.element.attr ( 'create' ) || SELF.element.hasClass ( 'create' )
		}, settings );
		if ( !logged ) {
			Fancy.version ( SELF );
			logged = true;

			$ ( document ).on ( nameEvent ( 'click', SELF.name ), function ( e ) {
				var closeable = !$ ( e.target ).closest ( '.' + SELF.name ).length;
				closeable = closeable || $ ( e.target ).hasClass ( '.' + SELF.name + '-option' );
				if ( $ ( e.target ).closest ( '.' + SELF.name ).hasClass ( SELF.name + '-multiple' ) )
					closeable = closeable && !$ ( e.target ).hasCLass ( '.' + SELF.name + '-option' );
				closeable = closeable || $ ( e.target ).hasClass ( SELF.name + '-option-reset' );

				if ( closeable ) {
					$ ( '.' + SELF.name ).each ( function ( ) {
						FancySelect.api.close ( this );
					} );
				}

			} );
		}

		SELF.createClient ( );
		SELF.buildOptions ( );
		SELF.buildFilter ( );
		SELF.applySettings ( );
		SELF.addEventListener ( );

		SELF.select ( SELF.element.val ( ) );

		if ( typeof Fancy.scroll == 'function' ) {
			SELF.scroller = new Fancy.scroll ( SELF.client.options );
		}

		SELF.element.data ( SELF.name, SELF );
		SELF.client.data ( SELF.name, SELF );
		i++;
		return SELF;
	}


	FancySelect.api = FancySelect.prototype = {};
	FancySelect.api.version = VERSION;
	FancySelect.api.name = NAME;
	FancySelect.api.open = function ( element ) {
		var SELF = Fancy ( element ).get ( NAME ) || this;
		if ( SELF.length ) {
			for ( var a in SELF ) {
				SELF [ a ].client.addClass ( SELF [ a ].name + '-open' );
				if ( SELF [ a ].scroller ) {
					SELF [ a ].scroller.resize ( );
				}
			}
		} else {
			SELF.client.addClass ( SELF.name + '-open' );
			if ( SELF.scroller ) {
				SELF.scroller.resize ( );
			}
		}
		return SELF;
	};
	FancySelect.api.close = function ( element ) {
		var SELF = Fancy ( element ).get ( NAME ) || this;
		if ( SELF.length ) {
			for ( var a in SELF ) {
				SELF [ a ].client.removeClass ( SELF [ a ].name + '-open' );
			}
		} else {
			SELF.client.removeClass ( SELF.name + '-open' );
		}
		return SELF;
	};
	FancySelect.api.createClient = function ( ) {
		var SELF = this;
		SELF.client = $ ( '<div/>', {
			id: SELF.name + '-box-' + SELF.id,
			class: SELF.name
		} );
		SELF.client.selected = $ ( '<div/>', {
			id: SELF.name + '-selected-' + SELF.id,
			class: SELF.name + '-selected'
		} );
		SELF.client.options = $ ( '<div/>', {
			id: SELF.name + '-options-' + SELF.id,
			class: SELF.name + '-options'
		} );

		// place SelectBox after origin
		SELF.element.after ( SELF.client );
		SELF.client.prepend ( SELF.element );
		// hide origin and connect to SelectBox
		SELF.element.addClass ( SELF.name + '-element' );
		// set width , include selected , include options
		SELF.client.prepend ( SELF.client.selected ).append ( SELF.client.options );
	};
	FancySelect.api.buildOptions = function ( ) {
		var SELF = this;
		// init option-Elements of SelectBox
		SELF.options = [ ];
		SELF.search = [ ];

		// in origin elements
		var b = 1,
		    ingroup = false,
		    group;
		SELF.client.options.html ( '' );
		SELF.element.children ( ).each ( function ( a ) {
			var self = $ ( this );
			a++;
			// create new Option
			var option = $ ( '<div/>', {
				id: SELF.name + '-' + SELF.id + '-option-' + a
			} );

			// set text data-text or raw text
			var txt = $ ( '<span/>', {
				id: SELF.name + '-' + SELF.id + '-option-text-' + a,
				class: SELF.name + '-option-text',
				html: self.text ( )
			} );
			option.append ( txt );
			if ( self.data ( 'description' ) ) {
				var desc = $ ( '<span/>', {
					id: SELF.name + '-' + SELF.id + '-option-description-' + a,
					class: SELF.name + '-option-description',
					html: self.data ( 'description' )
				} );
				option.append ( desc );
			}
			// copy Data-attribute
			$.each ( self.data ( ), function ( name, val ) {
				option.data ( name, val );
			} );
			//                value is value attr or text
			var value = self.prop ( 'value' );
			if ( !value ) {
				value = "";
				option.addClass ( SELF.name + '-option-reset' );
			}
			// set data-value
			option.data ( 'value', value ).attr ( 'unselectable', 'on' ).css ( 'user-select', 'none' ).on ( 'selectstart', false );

			option.addClass ( SELF.name + '-option' );

			if ( self.parent() [ 0 ].nodeName != "OPTGROUP" ) {
				// include option
				SELF.search.push ( [ option.text ( ).toLowerCase ( ), ( option.data ( 'search' ) ? option.data ( 'search' ).toLowerCase ( ) : '' ), option ] );
				SELF.client.options.append ( option );
				SELF.options.push ( option );
				ingroup = false;
			} else {
				// create group
				if ( !self.parent ( ).is ( ingroup ) ) {
					group = $ ( '<div/>', {
						id: SELF.name + '-' + SELF.id + '-optgroup-' + b
					} );
					group.addClass ( SELF.name + '-optgroup' );
					var title = $ ( '<div/>', {
						id: SELF.name + '-' + SELF.id + '-opttitle-' + b,
						html: self.parent ( ).attr ( 'label' )
					} );
					title.addClass ( SELF.name + '-opttitle' );
					group.append ( title );
					SELF.client.options.append ( group );
					ingroup = self.parent ( );
				}
				group.append ( option );
				b++;
			}
		} );

		if ( !SELF.settings.fallback ) {
			if ( SELF.options [ 0 ].hasClass ( SELF.name + '-option-reset' ) ) {
				SELF.settings.fallback = SELF.options [ 0 ].data ( 'text' ) || SELF.options [ 0 ].html ( );
			} else {
				SELF.settings.fallback = SELF.element.attr ( 'placeholder' );
			}
		}

		return SELF;
	};
	FancySelect.api.buildFilter = function ( ) {
		var SELF = this;
		if ( SELF.settings.search && !SELF.settings.create ) {
			// create searchfield henceforth referred to as input
			SELF.input = $ ( '<input/>', {
				type: 'text',
				class: SELF.name + '-input'
			} );
			// create clear-button
			SELF.input.clear = $ ( '<div/>', {
				style: 'position: absolute; display: none;',
				class: SELF.name + '-input-clear',
				html: 'x'
			} );
			// include input top of options
			SELF.client.options.prepend ( SELF.input );
			SELF.input.after ( SELF.input.clear );
			// bind search function to input
			SELF.input.on ( 'input', function ( ) {
				// case of something typed
				if ( SELF.input.val ( ).length > 0 ) {
					// search in oprions
					for ( var a in SELF.search ) {
						var it = SELF.search [ a ];
						SELF.input.clear.show ( );
						var text,
						    search;
						if ( SELF.settings.search == 'strict' ) {
							// case of raw text was found
							text = it [ 0 ].indexOf ( SELF.input.val ( ).toLowerCase ( ) ) == 0;
							// case of data-search was found
							search = it [ 1 ].indexOf ( SELF.input.val ( ).toLowerCase ( ) ) == 0;
						} else {
							// case of raw text was found
							text = it [ 0 ].indexOf ( SELF.input.val ( ).toLowerCase ( ) ) >= 0;
							// case of data-search was found
							search = it [ 1 ].indexOf ( SELF.input.val ( ).toLowerCase ( ) ) >= 0;
						}

						// for searched content
						if ( text || search ) {
							it [ 2 ].show ( );
						} else {
							it [ 2 ].hide ( );
						}
					}
				} else {
					// case of search cleared
					SELF.input.clear.hide ( );
					for ( var a in SELF.search ) {
						SELF.search[a] [ 2 ].show ( );
					}
				}
				if ( typeof Fancy.scroll == 'function' ) {
					SELF.scroller.enable ( ).resize ( );
				}
			} );

			SELF.input.clear.on ( 'click', function ( ) {
				SELF.input.val ( '' );
				SELF.input.trigger ( 'input' );
			} );
		} else if ( SELF.settings.create ) {
			SELF.input = $ ( '<input/>', {
				type: 'text',
				class: SELF.name + '-input'
			} );
			SELF.client.options.prepend ( SELF.input );
			SELF.input.on ( 'input', function ( ) {
				// case of something typed
				if ( SELF.input.val ( ).length > 0 ) {
					SELF.element.attr ( 'value', input.val ( ) ).trigger ( 'change' );
				} else {
					$ ( '#' + SELF.name + '-' + i + '-option-1' ).trigger ( 'click' );
				}
			} );
		}

		return this;
	};
	FancySelect.api.applySettings = function ( ) {
		if ( this.settings.multiple ) {
			// multiple Select
			this.client.addClass ( this.name + '-multiple' );
		}
	};
	FancySelect.api.addEventListener = function ( ) {
		var SELF = this;

		function toggle ( ) {
			if ( !SELF.client.hasClass ( SELF.name + '-open' ) ) {
				// if is opened
				// close all
				$ ( '.' + SELF.name ).each ( function ( ) {
					FancySelect.api.close ( $ ( this ) );
				} );
				// open this
				SELF.open ( );
			} else {
				// close this
				SELF.close ( );
			}
		}


		SELF.client.on ( nameEvent ( 'click', SELF.name ), function ( e ) {
			// get target henceforth referred to as t
			var t = $ ( e.target ),
			    isSelf = t.hasClass ( SELF.name + '-selected' ) || t.parent ( ).hasClass ( SELF.name + '-selected' ),
			    isOption = t.hasClass ( SELF.name + '-option' ) || t.parent ( ).hasClass ( SELF.name + '-option' );
			//  selected positioned above SelectBox
			if ( isSelf ) {
				//TOGGLE
				toggle ( );

			} else if ( isOption ) {
				t = t.hasClass ( SELF.name + '-option' ) ? t : t.parent ( );
				/**
				 * TRIGGER SELECTION
				 */
				// case of option was selected
				if ( !SELF.settings.multiple ) {
					// get value
					var newVal = t.data ( 'value' ),
					    changed = newVal != SELF.value;
					SELF.select ( newVal );
					if ( changed )
						SELF.element.trigger ( 'change' );
					SELF.close ( );
				} else {
					/**
					 * multiple Select
					 * @type {Array}
					 */
					var newVal = [ ],
					// is first option ?
					    first = t.hasClass ( SELF.name + '-option-reset' ) || t.parent ( ).hasClass ( SELF.name + '-option-reset' ),
					// is first selected ?
					    selectedFirst = SELF.client.options.children ( ).first ( ).hasClass ( 'selected' ) && SELF.client.options.children ( ).first ( ).hasClass ( SELF.name + '-option-reset' ),
					    text = '',
					    opt = '';

					// case of selectedValue is in List
					if ( t.hasClass ( 'selected' ) ) {
						/**
						 * IS SELECTED
						 */
						// Do not clear first selected!!
						if ( !first ) {
							t.removeClass ( 'selected' );
							var value = [ ],
							    selected = SELF.client.options.children ( '.selected' );
							selected.each ( function ( ) {
								value.push ( $ ( this ).data ( 'value' ) );
							} );
							SELF.element.val ( value );
							SELF.element.trigger ( 'change' );
						} else {
							SELF.close ( );
						}

						// multiple.selected(newVal, first, selectedFirst, text,
						// opt);
					} else {
						/**
						 * is none of selected options - ADD TO LIST
						 */
						t.addClass ( 'selected' );
						if ( !first && selectedFirst || selectedFirst ) {
							// is not first and first is selected -- OR -- first
							// is selected - REMOVE FROM LIST
							SELF.client.options.children ( ).first ( ).removeClass ( 'selected' );
						} else if ( first ) {
							// is first element - REMOVE ALL FROM LIST AND
							// REACTIVATE INIT
							SELF.client.options.children ( '.selected' ).removeClass ( 'selected' );
							SELF.client.options.children ( ).first ( ).addClass ( 'selected' );
							SELF.close ( );
						}
						var value = [ ],
						    selected = SELF.client.options.children ( '.selected' );
						selected.each ( function ( ) {
							value.push ( $ ( this ).data ( 'value' ) );
						} );
						var changed = value != SELF.value;
						SELF.element.val ( value );
						if ( changed )
							SELF.element.trigger ( 'change' );
					}
				}
			}
		} );

		SELF.client.on ( nameEvent ( 'selectstart', SELF.name ), function ( event ) {
			event.preventDefault ( );
		} );

		SELF.element.on ( nameEvent ( 'change', SELF.name ), function ( ) {
			SELF.select ( SELF.element.val ( ) );
		} ).on ( SELF.name + ':change', function ( ) {
			SELF.select ( SELF.element.val ( ) );
		} );

	};
	FancySelect.api.select = function ( value, element ) {
		var SELF = Fancy ( element ).get ( NAME ) || this,
		    newHTML = "",
		    newText = '';

		if ( SELF.settings.multiple ) {
			if ( typeof value == 'string' )
				value = value.split ( ',' );

			SELF.client.options.children ( '.selected' ).removeClass ( 'selected' );
			if ( value ) {
				$.each ( value, function ( a, item ) {
					for ( var b in SELF.options ) {
						var option = SELF.options [ b ];
						if ( option.data ( 'value' ) == item ) {
							option.addClass ( 'selected' );
							newHTML += ( a > 0 ? ', ' : '' ) + ( option.data ( 'text' ) || option.html ( ) );
							newText += ( a > 0 ? ', ' : '' ) + ( option.data ( 'text' ) || option.children() [ 0 ].innerHTML );
						}
					}
				} );
			} else {
				var children = SELF.options [ 0 ];
				if ( children.hasClass ( SELF.name + '-option-reset' ) ) {
					children.addClass ( 'selected' );
					newHTML = children.data ( 'text' ) || children.html ( );
					newText = children.data ( 'text' ) || children.children() [ 0 ].innerHTML;
				}
			}
		} else if ( SELF.settings.create ) {
			for ( var a in SELF.options ) {
				var it = SELF.options [ a ];
				if ( value == SELF.client.options.children ( ).first ( ).data ( 'value' ) || value == null || value == '' ) {
					if ( it.data ( 'value' ) == it.data ( 'text' ) ) {
						it.addClass ( 'selected' );
						newHTML = it.data ( 'text' ) || it.html ( );
						newText = it.data ( 'text' ) || it.children() [ 0 ].innerHTML;
					} else {
						it.removeClass ( 'selected' );
					}
				} else {
					if ( it.data ( 'value' ) == text ) {
						it.addClass ( 'selected' );
						newHTML = it.data ( 'text' ) || it.html ( );
						newText = it.data ( 'text' ) || it.children() [ 0 ].innerHTML;
					} else {
						it.removeClass ( 'selected' );
					}
				}
			}
		} else {
			for ( var a in SELF.options ) {
				var it = SELF.options [ a ];
				if ( it.data ( 'value' ) == value ) {
					it.addClass ( 'selected' );
					newHTML = it.data ( 'text' ) || it.html ( );
					newText = it.data ( 'text' ) || it.children() [ 0 ].innerHTML;
				} else {
					it.removeClass ( 'selected' );
				}
			}
		}

		if ( !newText ) {
			newText = SELF.settings.fallback;
			newHTML = SELF.settings.fallback;
		}
		if ( SELF.client.options.children ( '.' + SELF.name + '-option-reset' ).data ( 'text' ) != newText )
			$ ( SELF.settings.selectedtext ).html ( newText );
		SELF.client.selected.html ( newHTML ).attr ( 'title', newText );
		SELF.element.val ( value );
		SELF.value = value;
	};

	Fancy.select = true;
	Fancy.api.select = function ( settings ) {
		return this.set ( FancySwipe, settings );
	};
} ) ( jQuery );
