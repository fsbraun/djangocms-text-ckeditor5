

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import CMSPluginCommand from "./cmsplugincommand";


export default class CMSPluginEditing extends Plugin {
    static get requires() {
        return [ Widget ];
    }

    init() {
        console.log( 'CMSPluginEditing#init() got called' );
        this._defineSchema();
        this._defineConverters();
        this.editor.commands.add( 'cms-plugin', new CMSPluginCommand( this.editor ) );
    }

   _defineSchema() {                                                          // ADDED
        const schema = this.editor.model.schema;

        schema.register( 'cms-plugin', {
            // Allow wherever text is allowed:
            allowWhere: '$text',

            // The placeholder will act as an inline node:
            isInline: true,

            // The inline widget is self-contained so it cannot be split by the caret and can be selected:
            isObject: true,

            // The inline widget can have the same attributes as text (for example linkHref, bold).
            allowAttributesOf: '$text',

            // The placeholder can have many types, like date, name, surname, etc:
            allowAttributes: [ 'plugin_id', 'plugin_type' ]
        } );
    }

     _defineConverters() {                                                      // ADDED
        const conversion = this.editor.conversion;

        conversion.for( 'upcast' ).elementToElement( {
            view: {
                name: 'cms-plugin',
            },
            model: ( viewElement, { writer: modelWriter } ) => {
                // Extract the "name" from "{name}".
                const plugin_type = 'unknown' ; //viewElement.getChild( 0 ).attr("plugin-type");

                return modelWriter.createElement( 'cms-plugin', {
                    plugin_id: null,
                    plugin_type: plugin_type
                } );
            }
        } );

        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'cms-plugin',
            view: ( modelItem, { writer: viewWriter } ) => {
                const widgetElement = createCMSPluginView( modelItem, viewWriter );

                // Enable widget handling on a cms-plugion element inside the editing view.
                return toWidget( widgetElement, viewWriter );
            }
        } );

        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'cms-plugin',
            view: ( modelItem, { writer: viewWriter } ) => createCMSPluginView( modelItem, viewWriter )
        } );

        // Helper method for both downcast converters.
        function createCMSPluginView( modelItem, viewWriter ) {
            const plugin_type = modelItem.getAttribute( 'plugin_type' );
            const plugin_id = modelItem.getAttribute( 'plugin_id' );

            const cmsPluginView = viewWriter.createContainerElement( 'cms-plugin', {
                class: 'placeholder',
                plugin_type: plugin_type,
                plugin_id: plugin_id
            } );

            // Insert the placeholder name (as a text).
            const content = 'A plugin with <a href="https://ckeditor.com">some link.';
            const innerHTML = viewWriter.createRawElement(
                'span', {
                    class: 'placeholder',
                }, function( domElement ) {
	                domElement.innerHTML = content;
                } );
            viewWriter.insert( viewWriter.createPositionAt( cmsPluginView, 0 ), innerHTML );

            return cmsPluginView;
        }
    }
}
