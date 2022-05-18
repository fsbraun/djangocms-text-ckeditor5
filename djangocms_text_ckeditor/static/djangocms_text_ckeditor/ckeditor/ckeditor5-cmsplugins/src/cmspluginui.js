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
        const placeholderNames = ['date', 'first name', 'surname'];

        // The "placeholder" dropdown must be registered among the UI components of the editor
        // to be displayed in the toolbar.
        editor.ui.componentFactory.add('cms-plugin', locale => {
            const dropdownView = createDropdown(locale);

            // Populate the list in the dropdown with items.
            addListToDropdown(dropdownView, getDropdownItemsDefinitions(placeholderNames));

            dropdownView.buttonView.set({
                // The t() function helps localize the editor. All strings enclosed in t() can be
                // translated and change when the language of the editor changes.
                label: t('Placeholder'),
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
    }
}

function getDropdownItemsDefinitions( placeholderNames ) {
    const itemDefinitions = new Collection();

    for ( const name of placeholderNames ) {
        const definition = {
            type: 'button',
            model: new Model( {
                commandParam: name,
                label: name,
                withText: true
            } )
        };

        // Add the item definition to the collection.
        itemDefinitions.add( definition );
    }

    return itemDefinitions;
}

