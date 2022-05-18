/**
 * @module userstyle/userstyle
 */

import { Plugin } from 'ckeditor5/src/core';
import { Collection } from 'ckeditor5/src/utils';
import { Model, createDropdown, addListToDropdown } from 'ckeditor5/src/ui';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

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

