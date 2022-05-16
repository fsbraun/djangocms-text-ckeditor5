/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module userstyle/userstylecommand
 */

import { Command } from 'ckeditor5/src/core';

/**
 * The userstyle command. It is used by the {@link module:userstyle/userstyleediting~UserStyleEditing userstyle feature}
 * to apply the text styleing.
 *
 *		editor.execute( 'userstyle', { value: 'greenMarker' } );
 *
 * **Note**: Executing the command without a value removes the attribute from the model. If the selection is collapsed
 * inside a text with the userstyle attribute, the command will remove the attribute from the entire range
 * of that text.
 *
 * @extends module:core/command~Command
 */
export default class UserStylecommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		/**
		 * A value indicating whether the command is active. If the selection has some userstyle attribute,
		 * it corresponds to the value of that attribute.
		 *
		 * @observable
		 * @readonly
		 * @member {undefined|String} module:userstyle/userstylecommand~UserStyleCommand#value
		 */
		this.value = doc.selection.getAttribute( 'userstyle' );
		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, 'userstyle' );
	}

	/**
	 * Executes the command.
	 *
	 * @param {Object} [options] Options for the executed command.
	 * @param {String} [options.value] The value to apply.
	 *
	 * @fires execute
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		const userstyler = options.value;

		model.change( writer => {
			if ( selection.isCollapsed ) {
				const position = selection.getFirstPosition();

				// When selection is inside text with `userstyle` attribute.
				if ( selection.hasAttribute( 'userstyle' ) ) {
					// Find the full styleed range.
					const isSameUserStyle = value => {
						return value.item.hasAttribute( 'userstyle' ) && value.item.getAttribute( 'userstyle' ) === this.value;
					};

					const userstyleStart = position.getLastMatchingPosition( isSameUserStyle, { direction: 'backward' } );
					const userstyleEnd = position.getLastMatchingPosition( isSameUserStyle );

					const userstyleRange = writer.createRange( userstyleStart, userstyleEnd );

					// Then depending on current value...
					if ( !userstyler || this.value === userstyler ) {
						// ...remove attribute when passing userstyler different then current or executing "eraser".

						// If we're at the end of the styleed range, we don't want to remove userstyle of the range.
						if ( !position.isEqual( userstyleEnd ) ) {
							writer.removeAttribute( 'userstyle', userstyleRange );
						}

						writer.removeSelectionAttribute( 'userstyle' );
					} else {
						// ...update `userstyle` value.

						// If we're at the end of the styleed range, we don't want to change the userstyle of the range.
						if ( !position.isEqual( userstyleEnd ) ) {
							writer.setAttribute( 'userstyle', userstyler, userstyleRange );
						}

						writer.setSelectionAttribute( 'userstyle', userstyler );
					}
				} else if ( userstyler ) {
					writer.setSelectionAttribute( 'userstyle', userstyler );
				}
			} else {
				const ranges = model.schema.getValidRanges( selection.getRanges(), 'userstyle' );

				for ( const range of ranges ) {
					if ( userstyler ) {
						writer.setAttribute( 'userstyle', userstyler, range );
					} else {
						writer.removeAttribute( 'userstyle', range );
					}
				}
			}
		} );
	}
}
