(function ($) {
    // CMS.$ will be passed for $
    /**
     * CMS.CKEditor5
     *
     * @description: Adds cms specific plugins to CKEditor
     */
    CMS.CKEditor5 = {
        options: {
            // ckeditor default settings, will be overwritten by CKEDITOR_SETTINGS
            language: 'en',
            toolbar_CMS: [
                'undo', 'redo', '|',
                'heading', '|',
                'bold', 'italic', 'underline', '|',
                'bulletedList', 'numberedList', 'outdent', 'indent', '|',
                'sourceEditing', '-',
                'cmsplugins', 'cmswidget', '-', 'ShowBlocks', '|',

                ['Format', 'Styles'],
                ['TextColor', 'BGColor', '-', 'PasteText', 'PasteFromWord'],
                ['Scayt'],
                ['Maximize', ''],
                '/',
                ['Bold', 'Italic', 'Underline', 'Strike', '-', 'Subscript', 'Superscript', '-', 'RemoveFormat'],
                ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'],
                ['HorizontalRule'],
                ['NumberedList', 'BulletedList'],
                ['Outdent', 'Indent', '-', 'Blockquote', '-', 'Link', 'Unlink', '-', 'Table'],
                ['Source']
            ],
            toolbar_HTMLField: [
                ['Undo', 'Redo'],
                ['ShowBlocks'],
                ['Format', 'Styles'],
                ['TextColor', 'BGColor', '-', 'PasteText', 'PasteFromWord'],
                ['Scayt'],
                ['Maximize', ''],
                '/',
                ['Bold', 'Italic', 'Underline', 'Strike', '-', 'Subscript', 'Superscript', '-', 'RemoveFormat'],
                ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'],
                ['HorizontalRule'],
                ['Link', 'Unlink'],
                ['NumberedList', 'BulletedList'],
                ['Outdent', 'Indent', '-', 'Blockqote', '-', 'Link', 'Unlink', '-', 'Table'],
                ['Source']
            ],

            allowedContent: true,
            removePlugins: 'resize',
            extraPlugins: ''
        },
        static_url: '/static/djangocms-text-ckeditor/',
        ckeditor_basepath: '/static/djangocms-text-ckeditor/ckeditor/',
        CSS: null,
        editors: {},

        init: function (container, options, setup) {
            console.log("container", container);
            console.log("options", options);
            console.log("setup", setup);
            setup.editor.create(container)
                .then(function (editor_instance) {
                    console.log("Created editor for", options.plugin_id);
                    if (options.plugin_id in CMS.CKEditor5.editors) {
                        CMS.CKEditor5.editors[options.plugin_id].editor.destroy(false);
                    }
                    CMS.CKEditor5.editors[options.plugin_id] = {
                        editor: editor_instance,
                        options: options,
                        container: container,
                        setup: setup,
                        changed: false
                    };
                    if (container.classList.contains('cms-ckeditor-inline-wrapper')) {
                        // inline editor
                    }
                    editor_instance.model.document.on( 'change:data', function () {
                        CMS.CKEditor5.editors[options.plugin_id].changed = true;
                    });
                    setup.callback(editor_instance, setup);
                })
                .catch(function (error) {
                    console.error(error);
                });
        },

        initInlineEditors: function () {
            if (CMS._plugins === undefined) {
                // no plugins -> no inline editors
                return;
            }
            CMS._plugins.forEach(function (plugin) {
                if (plugin[1].plugin_type === 'TextPlugin') {
                    var url = plugin[1].urls.edit_plugin,
                        id = plugin[1].plugin_id,
                        container_id = '_ck_inline-' + plugin[1].plugin_id,
                        elements = $('.cms-plugin.cms-plugin-' + id);

                    if (elements.length > 0) {
                        $.get(url, {}, function (response) {
                            // get form incl. csrf token
                            var responseDOM = $(response);
                            var csrfmiddlewaretoken = responseDOM.find('input[name="csrfmiddlewaretoken"]');
                            var content = responseDOM.find('textarea[name="body"]');

                            if (csrfmiddlewaretoken) {  // success <=> middleware token
                                var wrapper = elements
                                    .wrapAll("<div class='cms-ckeditor-inline-wrapper' contenteditable='true'></div>")
                                    .parent(),
                                    options = {},
                                    settings_script_tag = responseDOM.find('.ck-settings')[0];

                                elements = elements
                                        .removeClass('cms-plugin')
                                        .removeClass('cms-plugin-' + id);
                                wrapper.addClass('cms-plugin').addClass('cms-plugin-' + id);
                                wrapper.html(content.val());
                                for (var attr in settings_script_tag.dataset) {
                                    options[attr] = settings_script_tag.dataset[attr];
                                    if (attr === 'lang' || attr === 'plugins' || attr === "settings") {
                                        options[attr] = JSON.parse(options[attr]);
                                    }
                                }
                                CMS.CKEditor5.init(
                                    wrapper[0],
                                    options,
                                    {
                                        editor: CKEDITOR.InlineEditor,
                                        url: url,
                                        csrfmiddlewaretoken: csrfmiddlewaretoken.val(),
                                        callback: function () {
                                            var styles = $('style[data-cke="true"]');

                                            if (styles.length > 0) {
                                                CMS.CKEditor5.CSS = styles.clone();
                                            }
                                            wrapper.on('dblclick', function (event) {
                                                event.stopPropagation();
                                            });
                                            wrapper.on('pointerover', function (event) {
                                                event.stopPropagation();
                                            });
                                            wrapper.on('blur', function click_outside() {
                                                CMS.CKEditor5.save_data(id);
                                            });
                                         }
                                    }
                                );
                            }
                        });
                    }
                }
            });
        },

        initAdminEditors: function () {
            window._cmsCKEditors = window._cmsCKEditors || [];
            var dynamics = [];

            window._cmsCKEditors.forEach(function (editorConfig) {
                if (editorConfig[0].match(/__prefix__/)) {
                    dynamics.push(editorConfig);
                } else {
                    CMS.CKEditor5.init(
                        document.getElementById(editorConfig[0]),
                        editorConfig[1],
                        {
                            editor: CKEDITOR.ClassicEditor,
                            callback: function () {}
                        }
                    );
                }
            });

            $('.add-row a').on('click', function () {
                $('.CMS_CKEditor').each(function (i, el) {
                    var container = $(el);

                    if (container.data('ckeditor-initialized')) {
                        return;
                    }

                    var containerId = container.attr('id');

                    // in case there are multiple different inlines we need to check
                    // newly added one against all of them
                    dynamics.forEach(function (config) {
                        var selector = config[0].id;
                        var regex = new RegExp(selector.replace('__prefix__', '\\d+'));

                        if (containerId.match(regex)) {
                            CMS.CKEditor5.init(
                                document.getElementById(containerId),
                                config[1],
                                {
                                    editor: CKEDITOR.ClassicEditor
                                }
                            );
                        }
                    });
                });
            });
        },

        save_data: function (id, action) {
            var instance = CMS.CKEditor5.editors[id];

            if (instance.changed) {
                var data = instance.editor.getData();

                console.log('save called', id, instance.setup);
                $.post(instance.setup.url, {  // send changes
                    csrfmiddlewaretoken: instance.setup.csrfmiddlewaretoken,
                    body: data,
                    _save: 'Save'
                }, function (response) {
                    if (action !== undefined) {
                        // action();
                    }
                    // var scripts = $(response).find("script").addClass("cms-ckeditor5-result");
                    // $("body").append(scripts);
                }).fail(function (error) {
                    console.log(error);
                    alert("Error saving data" + error)
                });
            }
            CMS.CKEditor5.editors[id].changed = false;
        },

        _resetInlineEditors: function () {
            if (CMS.CKEditor5.CSS !== null && $('style[data-cke="true"]').length === 0) {
                $('head').append(CMS.CKEditor5.CSS);
            }
            CMS.CKEditor5._initAll();
        },

        _initAll: function () {
//            var config = document.querySelector('script.ckeditor5-config').dataset;

//           CMS.CKEditor5.static_url = config.static_url;
            console.log("Init inline");
            CMS.CKEditor5.initInlineEditors();
            console.log("Init admin");
            CMS.CKEditor5.initAdminEditors();
        }
    };
    setTimeout(CMS.CKEditor5._initAll, 0);
    $(window).on('cms-content-refresh', CMS.CKEditor5._resetInlineEditors);

})(CMS.$);
