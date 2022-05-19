/**
 * @module userstyle/userstyle
 */

import { Plugin } from 'ckeditor5/src/core';
import { Collection } from 'ckeditor5/src/utils';
import { Model, createDropdown, addListToDropdown } from 'ckeditor5/src/ui';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import cmsPluginIcon from './../theme/icons/puzzle.svg';
import IframeView from "ckeditor5/src/ui";
import {addLinkProtocolIfApplicable} from "@ckeditor/ckeditor5-link/src/utils";

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

        // The "placeholder" dropdown must be registered among the UI components of the editor
        // to be displayed in the toolbar.
        editor.ui.componentFactory.add('cms-plugin', locale => {
            const dropdownView = createDropdown(locale);

            // Populate the list in the dropdown with items.
            addListToDropdown(dropdownView, getDropdownItemsDefinitions(editor));

            dropdownView.buttonView.set({
                // The t() function helps localize the editor. All strings enclosed in t() can be
                // translated and change when the language of the editor changes.
                label: editor.config.get('cmsPlugin.lang.toolbar', t('CMS Plugins')),
                icon: cmsPluginIcon,
                tooltip: true,
                withText: false,
            });

            // Disable the placeholder button when the command is disabled.
            const command = editor.commands.get('cms-plugin');
            dropdownView.bind('isEnabled').to(command);

            // Execute the command when the dropdown item is clicked (executed).
            this.listenTo(dropdownView, 'execute', evt => {
                editor.execute('cms-plugin', {value: evt.source.commandParam});
                editor.editing.view.focus();
            });

            return dropdownView;
        });

        for ( const plugin of editor.config.get('cmsPlugin.installed_plugins') ) {
            if (plugin.icon) {

                editor.ui.componentFactory.add(plugin.value, locale => {
                    const buttonView = new ButtonView(locale);

                    buttonView.set({
                        // The t() function helps localize the editor. All strings enclosed in t() can be
                        // translated and change when the language of the editor changes.
                        label: plugin.name,
                        icon: plugin.icon,
                        tooltip: true,
                        withText: false,
                        commandParam: plugin.value,
                    });

                    // Disable the placeholder button when the command is disabled.
                    const command = editor.commands.get('cms-plugin');
                    buttonView.bind('isEnabled').to(command);

                    // Execute the command when the dropdown item is clicked (executed).
                    this.listenTo(buttonView, 'execute', evt => {
                        editor.execute('cms-plugin', {value: evt.source.commandParam});
                        editor.editing.view.focus();
                    });

                    return buttonView;
                });
            }
        }
		this.formView = this._createFormView();
    }

	/**
	 * @inheritDoc
	 */
    destroy() {
		super.destroy();

		// Destroy created UI components as they are not automatically destroyed (see ckeditor5#1341).
		this.formView.destroy();
	}

    _createFormView() {
        const editor = this.editor;
		const editCommand = editor.commands.get( 'cms-plugin' );
		// const defaultProtocol = editor.config.get( 'link.defaultProtocol' );

		const formView = new IframeView( editor.locale, editCommand );

		formView.urlInputView.fieldView.bind( 'value' ).to( linkCommand, 'value' );

		// Form elements should be read-only when corresponding commands are disabled.
		formView.urlInputView.bind( 'isReadOnly' ).to( linkCommand, 'isEnabled', value => !value );
		formView.saveButtonView.bind( 'isEnabled' ).to( linkCommand );

		// Execute link command after clicking the "Save" button.
		this.listenTo( formView, 'submit', () => {
			const { value } = formView.urlInputView.fieldView.element;
			const parsedUrl = addLinkProtocolIfApplicable( value, defaultProtocol );
			editor.execute( 'link', parsedUrl, formView.getDecoratorSwitchesState() );
			this._closeFormView();
		} );

		// Hide the panel after clicking the "Cancel" button.
		this.listenTo( formView, 'cancel', () => {
			this._closeFormView();
		} );

		// Close the panel on esc key press when the **form has focus**.
		formView.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._closeFormView();
			cancel();
		} );

		return formView;
	}



        const iframe = new IframeView();

        iframe.render();
        document.body.appendChild( iframe.element );

        iframe.on( 'loaded', () => {
            console.log( 'The iframe has loaded', iframe.element.contentWindow );
        } );

        iframe.element.src = 'https://ckeditor.com'

    }

}

function getDropdownItemsDefinitions( editor ) {
    const itemDefinitions = new Collection();

    console.log("getDropdownItemsDefinitions", editor);
    for ( const plugin of editor.config.get('cmsPlugin.installed_plugins') ) {
        if (!plugin.icon) {
            // only collect items in dropdown that do not have an own icon
            const definition = {
                type: 'button',
                model: new Model( {
                    commandParam: plugin.value,
                    label: plugin.name,
                    withText: true
                } )
            };

            // Add the item definition to the collection.
            itemDefinitions.add( definition );
        }

        }
    return itemDefinitions;
}

