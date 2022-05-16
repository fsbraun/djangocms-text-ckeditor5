/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module highlight/highlightui
 */

import { Plugin, icons } from 'ckeditor5/src/core';
import { ButtonView, SplitButtonView, ToolbarSeparatorView, createDropdown, addToolbarToDropdown } from 'ckeditor5/src/ui';

import markerIcon from './../theme/icons/marker.svg';
import penIcon from './../theme/icons/pen.svg';

/**
 * The default highlight UI plugin. It introduces:
 *
 * * The `'highlight'` dropdown,
 * * The `'removeUserStyle'` and `'highlight:*'` buttons.
 *
 * The default configuration includes the following buttons:
 *
 * * `'highlight:yellowMarker'`
 * * `'highlight:greenMarker'`
 * * `'highlight:pinkMarker'`
 * * `'highlight:blueMarker'`
 * * `'highlight:redPen'`
 * * `'highlight:greenPen'`
 *
 * See the {@link module:highlight/highlight~UserStyleConfig#options configuration} to learn more
 * about the defaults.
 *
 * @extends module:core/plugin~Plugin
 */
export default class UserStyleUI extends Plugin {
	/**
	 * Returns the localized option titles provided by the plugin.
	 *
	 * The following localized titles corresponding with default
	 * {@link module:highlight/highlight~UserStyleConfig#options} are available:
	 *
	 * * `'Yellow marker'`,
	 * * `'Green marker'`,
	 * * `'Pink marker'`,
	 * * `'Blue marker'`,
	 * * `'Red pen'`,
	 * * `'Green pen'`.
	 *
	 * @readonly
	 * @type {Object.<String,String>}
	 */
	get localizedOptionTitles() {
		const t = this.editor.t;

		return {
			'Yellow marker': t( 'Yellow marker' ),
			'Green marker': t( 'Green marker' ),
			'Pink marker': t( 'Pink marker' ),
			'Blue marker': t( 'Blue marker' ),
			'Red pen': t( 'Red pen' ),
			'Green pen': t( 'Green pen' )
		};
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'UserStyleUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const options = this.editor.config.get( 'userstyle.options' );

		for ( const option of options ) {
			this._addUserStylerButton( option );
		}

		this._addRemoveUserStyleButton();

		this._addDropdown( options );
	}

	/**
	 * Creates the "Remove highlight" button.
	 *
	 * @private
	 */
	_addRemoveUserStyleButton() {
		const t = this.editor.t;
		const command = this.editor.commands.get( 'userstyle' );

		this._addButton( 'removeUserStyle', t( 'Remove user style' ), icons.eraser, null, button => {
			button.bind( 'isEnabled' ).to( command, 'isEnabled' );
		} );
	}

	/**
	 * Creates a toolbar button from the provided highlight option.
	 *
	 * @param {module:highlight/highlight~UserStyleOption} option
	 * @private
	 */
	_addUserStylerButton( option ) {
		const command = this.editor.commands.get( 'userstyle' );

		// TODO: change naming
		this._addButton( 'userstyle:' + option.model, option.title, getIconForType( option.type ), option.model, decorateUserStyleButton );

		function decorateUserStyleButton( button ) {
			button.bind( 'isEnabled' ).to( command, 'isEnabled' );
			button.bind( 'isOn' ).to( command, 'value', value => value === option.model );
			button.iconView.fillColor = option.color;
			button.isToggleable = true;
		}
	}

	/**
	 * Internal method for creating userstyle buttons.
	 *
	 * @param {String} name The name of the button.
	 * @param {String} label The label for the button.
	 * @param {String} icon The button icon.
	 * @param {*} value The `value` property passed to the executed command.
	 * @param {Function} decorateButton A callback getting ButtonView instance so that it can be further customized.
	 * @private
	 */
	_addButton( name, label, icon, value, decorateButton ) {
		const editor = this.editor;

		editor.ui.componentFactory.add( name, locale => {
			const buttonView = new ButtonView( locale );

			const localized = this.localizedOptionTitles[ label ] ? this.localizedOptionTitles[ label ] : label;

			buttonView.set( {
				label: localized,
				icon,
				tooltip: true
			} );

			buttonView.on( 'execute', () => {
				editor.execute( 'userstyle', { value } );
				editor.editing.view.focus();
			} );

			// Add additional behavior for buttonView.
			decorateButton( buttonView );

			return buttonView;
		} );
	}

	/**
	 * Creates the split button dropdown UI from the provided userstyle options.
	 *
	 * @param {Array.<module:userstyle/userstyle~UserStyleOption>} options
	 * @private
	 */
	_addDropdown( options ) {
		const editor = this.editor;
		const t = editor.t;
		const componentFactory = editor.ui.componentFactory;

		const startingUserStyler = options[ 0 ];

		const optionsMap = options.reduce( ( retVal, option ) => {
			retVal[ option.model ] = option;

			return retVal;
		}, {} );

		componentFactory.add( 'userstyle', locale => {
			const command = editor.commands.get( 'userstyle' );
			const dropdownView = createDropdown( locale, SplitButtonView );
			const splitButtonView = dropdownView.buttonView;

			splitButtonView.set( {
				tooltip: t( 'UserStyle' ),
				// Holds last executed userstyler.
				lastExecuted: startingUserStyler.model,
				// Holds current userstyler to execute (might be different then last used).
				commandValue: startingUserStyler.model,
				isToggleable: true
			} );

			// Dropdown button changes to selection (command.value):
			// - If selection is in userstyle it get active userstyle appearance (icon, color) and is activated.
			// - Otherwise it gets appearance (icon, color) of last executed userstyle.
			splitButtonView.bind( 'icon' ).to( command, 'value', value => getIconForType( getActiveOption( value, 'type' ) ) );
			splitButtonView.bind( 'color' ).to( command, 'value', value => getActiveOption( value, 'color' ) );
			splitButtonView.bind( 'commandValue' ).to( command, 'value', value => getActiveOption( value, 'model' ) );
			splitButtonView.bind( 'isOn' ).to( command, 'value', value => !!value );

			splitButtonView.delegate( 'execute' ).to( dropdownView );

			// Create buttons array.
			const buttons = options.map( option => {
				// Get existing userstyler button.
				const buttonView = componentFactory.create( 'userstyle:' + option.model );

				// Update lastExecutedUserStyle on execute.
				this.listenTo( buttonView, 'execute', () => dropdownView.buttonView.set( { lastExecuted: option.model } ) );

				return buttonView;
			} );

			// Make toolbar button enabled when any button in dropdown is enabled before adding separator and eraser.
			dropdownView.bind( 'isEnabled' ).toMany( buttons, 'isEnabled', ( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled ) );

			// Add separator and eraser buttons to dropdown.
			buttons.push( new ToolbarSeparatorView() );
			buttons.push( componentFactory.create( 'removeUserStyle' ) );

			addToolbarToDropdown( dropdownView, buttons );
			bindToolbarIconUserStyleToActiveColor( dropdownView );

			dropdownView.toolbarView.ariaLabel = t( 'Text user style toolbar' );

			// Execute current action from dropdown's split button action button.
			splitButtonView.on( 'execute', () => {
				editor.execute( 'userstyle', { value: splitButtonView.commandValue } );
				editor.editing.view.focus();
			} );

			// Returns active userstyler option depending on current command value.
			// If current is not set or it is the same as last execute this method will return the option key (like icon or color)
			// of last executed userstyler. Otherwise it will return option key for current one.
			function getActiveOption( current, key ) {
				const whichUserStyler = !current ||
				current === splitButtonView.lastExecuted ? splitButtonView.lastExecuted : current;

				return optionsMap[ whichUserStyler ][ key ];
			}

			return dropdownView;
		} );
	}
}

// Extends split button icon style to reflect last used button style.
function bindToolbarIconUserStyleToActiveColor( dropdownView ) {
	const actionView = dropdownView.buttonView.actionView;

	actionView.iconView.bind( 'fillColor' ).to( dropdownView.buttonView, 'color' );
}

// Returns icon for given userstyler type.
function getIconForType( type ) {
	return type === 'marker' ? markerIcon : penIcon;
}
