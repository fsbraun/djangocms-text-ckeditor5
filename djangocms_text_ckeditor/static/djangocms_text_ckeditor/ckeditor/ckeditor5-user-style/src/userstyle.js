/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module userstyle/userstyle
 */

import { Plugin } from 'ckeditor5/src/core';

import UserStyleEditing from './userstyleediting';
import UserStyleUI from './userstyleui';

/**
 * The userstyle plugin.
 *
 * For a detailed overview, check the {@glink features/userstyle UserStyle feature} documentation.
 *
 * This is a "glue" plugin which loads the {@link module:userstyle/userstyleediting~UserStyleEditing} and
 * {@link module:userstyle/userstyleui~UserStyleUI} plugins.
 *
 * @extends module:core/plugin~Plugin
 */
export default class UserStyle extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ UserStyleEditing, UserStyleUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'UserStyle';
	}
}

/**
 * The userstyle option descriptor. See {@link module:userstyle/userstyle~UserStyleConfig} to learn more.
 *
 *		{
 *			model: 'pinkMarker',
 *			class: 'marker-pink',
 *			title: 'Pink Marker',
 *			color: 'var(--ck-userstyle-marker-pink)',
 *			type: 'marker'
 *		}
 *
 * @typedef {Object} module:userstyle/userstyle~UserStyleOption
 * @property {String} title The user-readable title of the option.
 * @property {String} model The unique attribute value in the model.
 * @property {String} color The CSS `var()` used for the userstyler. The color is used in the user interface to represent the userstyler.
 * There is a possibility to use the default color format like rgb, hex or hsl, but you need to care about the color of `<mark>`
 * by adding CSS classes definition.
 * @property {String} class The CSS class used on the `<mark>` element in the view. It should match the `color` setting.
 * @property {'marker'|'pen'} type The type of userstyler:
 *
 * * `'marker'` &ndash; Uses the `color` as the `background-color` userstyle,
 * * `'pen'` &ndash; Uses the `color` as the font `color` userstyle.
 */

/**
 * The configuration of the {@link module:userstyle/userstyle~UserStyle} feature.
 *
 * Read more in {@link module:userstyle/userstyle~UserStyleConfig}.
 *
 * @member {module:userstyle/userstyle~UserStyleConfig} module:core/editor/editorconfig~EditorConfig#userstyle
 */

/**
 * The configuration of the {@link module:userstyle/userstyle~UserStyle userstyle feature}.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				userstyle:  ... // UserStyle feature configuration.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface UserStyleConfig
 */

/**
 * The available userstyle options. The default value is:
 *
 *		options: [
 *			{
 *				model: 'yellowMarker',
 *				class: 'marker-yellow',
 *				title: 'Yellow marker',
 *				color: 'var(--ck-userstyle-marker-yellow)',
 *				type: 'marker'
 *			},
 *			{
 *				model: 'greenMarker',
 *				class: 'marker-green',
 *				title: 'Green marker',
 *				color: 'var(--ck-userstyle-marker-green)',
 *				type: 'marker'
 *			},
 *			{
 *				model: 'pinkMarker',
 *				class: 'marker-pink',
 *				title: 'Pink marker',
 *				color: 'var(--ck-userstyle-marker-pink)',
 *				type: 'marker'
 *			},
 *			{
 *				model: 'blueMarker',
 *				class: 'marker-blue',
 *				title: 'Blue marker',
 *				color: 'var(--ck-userstyle-marker-blue)',
 *				type: 'marker'
 *			},
 *			{
 *				model: 'redPen',
 *				class: 'pen-red',
 *				title: 'Red pen',
 *				color: 'var(--ck-userstyle-pen-red)',
 *				type: 'pen'
 *			},
 *			{
 *				model: 'greenPen',
 *				class: 'pen-green',
 *				title: 'Green pen',
 *				color: 'var(--ck-userstyle-pen-green)',
 *				type: 'pen'
 *			}
 *		]
 *
 * There are two types of userstylers available:
 *
 * * `'marker'` &ndash; Rendered as a `<mark>` element, userstyled with the `background-color`.
 * * `'pen'` &ndash; Rendered as a `<mark>` element, userstyled with the font `color`.
 *
 * **Note**: The userstyle feature provides a userstylesheet with the CSS classes and corresponding colors defined
 * as CSS variables.
 *
 *		:root {
 *			--ck-userstyle-marker-yellow: #fdfd77;
 *			--ck-userstyle-marker-green: #63f963;
 *			--ck-userstyle-marker-pink: #fc7999;
 *			--ck-userstyle-marker-blue: #72cdfd;
 *			--ck-userstyle-pen-red: #e91313;
 *			--ck-userstyle-pen-green: #118800;
 *		}
 *
 *		.marker-yellow { ... }
 *		.marker-green { ... }
 *		.marker-pink { ... }
 *		.marker-blue { ... }
 *		.pen-red { ... }
 *		.pen-green { ... }
 *
 * It is possible to define the `color` property directly as `rgba(R, G, B, A)`,
 * `#RRGGBB[AA]` or `hsla(H, S, L, A)`. In such situation, the color will **only** apply to the UI of
 * the editor and the `<mark>` elements in the content must be styled by custom classes provided by
 * a dedicated stylesheet.
 *
 * **Note**: It is recommended for the `color` property to correspond to the class in the content
 * stylesheet because it represents the userstyler in the user interface of the editor.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				userstyle: {
 *					options: [
 *						{
 *							model: 'pinkMarker',
 *							class: 'marker-pink',
 *							title: 'Pink Marker',
 *							color: 'var(--ck-userstyle-marker-pink)',
 *							type: 'marker'
 *						},
 *						{
 *							model: 'redPen',
 *							class: 'pen-red',
 *							title: 'Red Pen',
 *							color: 'var(--ck-userstyle-pen-red)',
 *							type: 'pen'
 *						},
 *					]
 *				}
 *		} )
 *		.then( ... )
 *		.catch( ... );
 *
 * @member {Array.<module:userstyle/userstyle~UserStyleOption>} module:userstyle/userstyle~UserStyleConfig#options
 */
