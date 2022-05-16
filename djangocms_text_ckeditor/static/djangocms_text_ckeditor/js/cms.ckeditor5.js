(function ($) {
    // CMS.$ will be passed for $
    /**
     * CMS.CKEditor5
     *
     * @description: Adds cms specific plugins to CKEditor
     */
    CMS.CKEditor5 = {
        static_url: '/static/djangocms-text-ckeditor/',
        ckeditor_basepath: '/static/djangocms-text-ckeditor/ckeditor/',
        CSS: null,
        editors: {},

        init: function (container, options, setup) {
            setup.editor.create(container)
                .then(function (editor_instance) {
                    if (editor_instance.id in CMS.CKEditor5.editors) {
                        CMS.CKEditor5.editors[editor_instance.id].editor.destroy(false);
                    }
                    console.log('editor id', editor_instance.id);
                    CMS.CKEditor5.editors[editor_instance.id] = {
                        editor: editor_instance,
                        options: options,
                        container: container,
                        setup: setup,
                        changed: false
                    };
                    if (container.classList.contains('cms-ckeditor-inline-wrapper')) {
                        // inline editor
                    }
                    editor_instance.model.document.on('change:data', function () {
                        CMS.CKEditor5.editors[editor_instance.id].changed = true;
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
            CMS.CKEditor5.observer  = CMS.CKEditor5.observer || new IntersectionObserver(function (entries, opts) {
                entries.forEach(function (entry ){
                    if (entry.isIntersecting) {
                        var plugin_id = entry.target.dataset.plugin_id;
                        var url = entry.target.dataset.edit_url;

                        if (!$(entry).data("ckeditor-initialized")) {
                            CMS.CKEditor5.startInlineEditor(plugin_id, url);
                        }
                    }
                });
            }, {
                root: null,
                threshold: 0.05
            });

            console.log("Starting obeservers");
            CMS._plugins.forEach(function (plugin) {
                if (plugin[1].plugin_type === 'TextPlugin') {
                    var url = plugin[1].urls.edit_plugin;
                    var plugin_id = plugin[1].plugin_id;
                    var elements = $('.cms-plugin.cms-plugin-' + plugin_id),
                        wrapper;

                    if (elements.length > 0) {
                        if (elements.length === 1 && elements.prop('tagName') === 'DIV') {  // already wrapped?
                            wrapper = elements.addClass('cms-ckeditor-inline-wrapper');
                        } else {  // no, wrap now!
                            wrapper = elements
                                .wrapAll("<div class='cms-ckeditor-inline-wrapper'></div>")
                                .parent();
                            elements.removeClass('cms-plugin').removeClass('cms-plugin-' + plugin_id);
                            wrapper.addClass('cms-plugin').addClass('cms-plugin-' + plugin_id);
                        }
                        wrapper.attr('data-edit_url', url);
                        wrapper.attr('data-plugin_id', plugin_id);
                        wrapper.data('placeholder_id', plugin[1].placeholder_id);
                        CMS.CKEditor5.observer.observe(wrapper[0]);  // let observer load inline editor for visible text plugins
                    }
                }
            });
        },

        startInlineEditor: function (plugin_id, url, initialEvent) {
            console.log("startInlineEditor", plugin_id);
            var wrapper = $('.cms-plugin.cms-plugin-' + plugin_id)
                .attr('contenteditable', 'true'),
                optionsElement, options;

            optionsElement = document.getElementById('ck-cfg-' + plugin_id);
            options = optionsElement ? JSON.parse(optionsElement.textContent) : {};

            if (wrapper.data('ckeditor-initialized')) {
                return;
            }
            wrapper.data('ckeditor-initialized', true);

            CMS.CKEditor5.init(
                wrapper[0],
                options,
                {
                    editor: CKEDITOR.BalloonEditor,
                    url: url,
                    callback: function (editor) {
                        console.log("calllback", editor);
                        var styles = $('style[data-cke="true"]');

                        if (styles.length > 0) {
                            CMS.CKEditor5.CSS = styles.clone();
                        }
                        wrapper.on('click', function (event) {
                            CMS.CKEditor5._highlight_Textplugin(plugin_id);
                        });
                        wrapper.on('dblclick', function (event) {
                            event.stopPropagation();
                        });
                        wrapper.on('pointerover', function (event) {
                            event.stopPropagation();
                        });
                        $(window).on('beforeunload', function () {
                           if (CMS.CKEditor5.editors[editor.id].changed) {
                               return 'Do you really want to leave this page?';
                           }
                        });
                        wrapper.on('blur', function click_outside() {
                            CMS.CKEditor5.save_data(editor.id);
                        });
                        if (initialEvent !== undefined) {
                            setTimeout(function () {
                                console.log("Fire", initialEvent);
                                wrapper.trigger(initialEvent);
                            }, 0);
                        }
                    }
                }
            );
        },

        save_data: function (id, action) {
            var instance = CMS.CKEditor5.editors[id];

            if (instance.changed) {
                var data = instance.editor.getData();

                console.log('save called', id, instance.setup);
                CMS.API.Toolbar.showLoader();
                $.post(instance.setup.url, {  // send changes
                    csrfmiddlewaretoken: CMS.config.csrf,
                    body: data,
                    _save: 'Save'
                }, function (response) {
                    instance.changed = false;
                    CMS.API.Toolbar.hideLoader();
                    if (action !== undefined) {
                        action(response);
                    }
                    // var scripts = $(response).find("script").addClass("cms-ckeditor5-result");
                    // $("body").append(scripts);
                }).fail(function (error) {
                    CMS.API.Toolbar.hideLoader();
                    console.error("Save", error);
                    CMS.API.Messages.open(error);
                });
            }
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

        _loadToolbar: function () {
            CMS.API.StructureBoard._loadToolbar()
                .done(function (newToolbar) {
                    CMS.API.Toolbar._refreshMarkup($(newToolbar).find('.cms-toolbar'));
                })
                .fail(CMS.API.Helpers.reloadBrowser);
        },

        _highlight_Textplugin: function (pluginId) {
            var HIGHLIGHT_TIMEOUT = 10;

            var draggable = $('.cms-draggable-' + pluginId);
            var doc = $(document);
            var currentExpandmode = doc.data('expandmode');


            // expand necessary parents
            doc.data('expandmode', false);
            draggable
                .parents('.cms-draggable')
                .find('> .cms-dragitem-collapsable:not(".cms-dragitem-expanded") > .cms-dragitem-text')
                .each(function (i, el) {
                    $(el).triggerHandler(CMS.Plugin.click);
                });
            if (draggable.length > 0) {  // Expanded elements available
                setTimeout(function () {
                    doc.data('expandmode', currentExpandmode);
                });
                setTimeout(function () {
                    CMS.Plugin._highlightPluginStructure(draggable.find('.cms-dragitem:first'),
                        { successTimeout: 200, delay: 2000, seeThrough: true });
                }, HIGHLIGHT_TIMEOUT);
            }
        },

        _resetInlineEditors: function () {
            if (CMS.CKEditor5.CSS !== null && $('style[data-cke="true"]').length === 0) {
                $('head').append(CMS.CKEditor5.CSS);
            }
            CMS.CKEditor5._killAll();
            CMS.CKEditor5._initAll();
        },

        _initAll: function () {
            console.log("Start Editor init");
            CMS.CKEditor5.initInlineEditors();
            CMS.CKEditor5.initAdminEditors();
        },

        _killAll: function() {
            for (var key in CMS.CKEditor5.editors) {
                if (CMS.CKEditor5.editors.hasOwnProperty(key)) {
                    CMS.CKEditor5.editors[key].editor.destroy();
                }
            }
            CMS.CKEditor5.editors = {};
        }
    };
    setTimeout(CMS.CKEditor5._initAll, 0);
    $(window).on('cms-content-refresh', CMS.CKEditor5._resetInlineEditors);

})(CMS.$);
