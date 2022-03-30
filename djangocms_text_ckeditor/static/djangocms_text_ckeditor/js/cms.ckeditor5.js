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
            skin: 'moono-lisa',
            toolbar_CMS: [
                ['Undo', 'Redo'],
                ['cmsplugins', 'cmswidget', '-', 'ShowBlocks'],
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
            toolbarCanCollapse: false,
            removePlugins: 'resize',
            extraPlugins: ''
        },
        static_url: '/static/djangocms-text-ckeditor/',
        ckeditor_basepath: '/static/djangocms-text-ckeditor/ckeditor/',
        CSS: [],
        editors: {},

        init: function (container, options, editor, callback) {
            console.log(container, options, editor);
            editor.create(container)
                .then(function (editor_instance) {
                    console.log("Created editor for", options.plugin_id);
                    CMS.CKEditor5.editors[options.plugin_id] = {
                        editor: editor_instance,
                        options: options,
                        container: container,
                        changed: false
                    };
                    if (container.classList.contains('cms-ckeditor-inline-wrapper')) {
                        // inline editor
                    }
                    editor.model.document.on( 'change:data', function () {
                        CMS.CKEditor5.editors[options.plugin_id].changed = true;
                    });
                    callback(editor);
                })
                .catch(function (error) {
                    console.error(error);
                });
        },

        initInlineEditors: function () {
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
                                    settings = {},
                                    settings_script_tag = responseDOM.find('.ck-settings')[0];

                                elements = elements
                                        .removeClass('cms-plugin')
                                        .removeClass('cms-plugin-' + id);
                                wrapper.addClass('cms-plugin').addClass('cms-plugin-' + id);
                                wrapper.html(content.val());
                                for (var attr in settings_script_tag.dataset) {
                                    settings[attr] = settings_script_tag.dataset[attr];
                                    if (attr === 'lang' || attr === 'plugins') {
                                        settings[attr] = JSON.parse(settings[attr]);
                                    }
                                }
                                CMS.CKEditor5.init(
                                    wrapper[0],
                                    settings,
                                    CKEDITOR.InlineEditor,
                                    function () {
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
                var selector = editorConfig[0].id;

                if (selector.match(/__prefix__/)) {
                    dynamics.push(editorConfig);
                } else {
                    CMS.CKEditor5.init(
                        editorConfig[0],
                        editorConfig[1],
                        CKEDITOR.ClassicEditor
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
                                CKEDITOR.ClassicEditor);
                        }
                    });
                });
            });
        },

        save_data: function (id) {
            console.log('save called', id, CMS.CKEditor5.editors);
            CMS.CKEditor5.editors[id].changed = false;
        },

        _resetInlineEditors: function () {
            CMS.CKEditor5.CSS.forEach(function (stylefile) {
                if ($('link[href="' + stylefile + '"]').length === 0) {
                    $('head').append($('<link rel="stylesheet" type="text/css" href="' + stylefile + '">'))
                }
            });
            CMS.CKEditor5._initAll();
        },

        _initAll: function () {
            var config = document.querySelector('script.ckeditor5-config').dataset;

            CMS.CKEditor5.static_url = config.static_url;
            CMS.CKEditor5.initInlineEditors();
            CMS.CKEditor5.initAdminEditors();
        }
    };
    setTimeout(function init() {
        CMS.CKEditor5._initAll();
    }, 0);

})(CMS.$);
