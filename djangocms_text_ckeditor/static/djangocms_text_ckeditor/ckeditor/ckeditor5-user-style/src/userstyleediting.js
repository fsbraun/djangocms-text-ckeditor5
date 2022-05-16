/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module userstyle/userstyleediting
 */

import { Plugin } from 'ckeditor5/src/core';

import UserStyleCommand from './userstylecommand';

/**
 * The userstyle editing feature. It introduces the {@link module:userstyle/userstylecommand~UserStyleCommand command} and the `userstyle`
 * attribute in the {@link module:engine/model/model~Model model} which renders in the {@link module:engine/view/view view}
 * as a `<mark>` element with a `class` attribute (`<mark class="marker-green">...</mark>`) depending
 * on the {@link module:userstyle/userstyle~UserStyleConfig configuration}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class UserStyleEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'UserStyleEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'userstyle', {
			options: [
				{
					model: 'primaryText',
					class: 'text-primary',
					title: 'Primary text',
					color: 'var(--ck-userstyle-marker-yellow)',
					type: 'marker'
				},
				{
					model: 'warningBadge',
					class: 'badge bg-warning',
					title: 'Warning badge',
					color: 'var(--ck-userstyle-marker-green)',
					type: 'marker'
				},
				{
					model: 'pinkMarker',
					class: 'marker-pink',
					title: 'Pink marker',
					color: 'var(--ck-userstyle-marker-pink)',
					type: 'marker'
				},
				{
					model: 'blueMarker',
					class: 'marker-blue',
					title: 'Blue marker',
					color: 'var(--ck-userstyle-marker-blue)',
					type: 'marker'
				},
				{
					model: 'redPen',
					class: 'pen-red',
					title: 'Red pen',
					color: 'var(--ck-userstyle-pen-red)',
					type: 'pen'
				},
				{
					model: 'greenPen',
					class: 'pen-green',
					title: 'Green pen',
					color: 'var(--ck-userstyle-pen-green)',
					type: 'pen'
				}
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Allow userstyle attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: 'userstyle' } );

		const options = editor.config.get( 'userstyle.options' );

		// Set-up the two-way conversion.
		editor.conversion.attributeToElement( _buildDefinition( options ) );

		editor.commands.add( 'userstyle', new UserStyleCommand( editor ) );
	}
}

// Converts the options array to a converter definition.
//
// @param {Array.<module:userstyle/userstyle~UserStyleOption>} options An array with configured options.
// @returns {module:engine/conversion/conversion~ConverterDefinition}
function _buildDefinition( options ) {
	const definition = {
		model: {
			key: 'userstyle',
			values: []
		},
		view: {}
	};

	for ( const option of options ) {
		definition.model.values.push( option.model );
		definition.view[ option.model ] = {
			name: 'span',
			classes: option.class
		};
	}

	return definition;
}
