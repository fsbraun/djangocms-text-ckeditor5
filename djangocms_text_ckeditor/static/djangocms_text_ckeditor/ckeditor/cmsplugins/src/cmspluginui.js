/**
 * @module userstyle/userstyle
 */

import { Plugin } from 'ckeditor5/src/core';
import { Collection } from 'ckeditor5/src/utils';
import { Model, createDropdown, addListToDropdown } from 'ckeditor5/src/ui';

import cmsPluginIcon from './../theme/icons/puzzle.svg';

export default class CMSPluginUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CMSPluginUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		const options = this._getLocalizedOptions();

		// const command = editor.commands.get( FONT_FAMILY );

		// Register UI component.
		editor.ui.componentFactory.add( 'insertCMSPlugin', locale => {
			const dropdownView = createDropdown( locale );
			addListToDropdown( dropdownView, _prepareListOptions( options, command ) );

			dropdownView.buttonView.set( {
				label: t( 'CMS Plugins' ),
				icon: cmsPluginIcon,
				tooltip: true
			} );

			dropdownView.extendTemplate( {
				attributes: {
					class: 'ck-cms-plugins-dropdown'
				}
			} );

			dropdownView.bind( 'isEnabled' ).to( command );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdownView, 'execute', evt => {
				editor.execute( evt.source.commandName, { value: evt.source.commandParam } );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}

	/**
	 * Returns options as defined in `config.fontFamily.options` but processed to account for
	 * editor localization, i.e. to display {@link module:font/fontfamily~FontFamilyOption}
	 * in the correct language.
	 *
	 * Note: The reason behind this method is that there is no way to use {@link module:utils/locale~Locale#t}
	 * when the user configuration is defined because the editor does not exist yet.
	 *
	 * @private
	 * @returns {Array.<module:font/fontfamily~FontFamilyOption>}.
	 */
	_getLocalizedOptions() {
		const editor = this.editor;
		const t = editor.t;

		const options = normalizeOptions( editor.config.get( FONT_FAMILY ).options );

		return options.map( option => {
			// The only title to localize is "Default" others are font names.
			if ( option.title === 'Default' ) {
				option.title = t( 'Default' );
			}

			return option;
		} );
	}
}
