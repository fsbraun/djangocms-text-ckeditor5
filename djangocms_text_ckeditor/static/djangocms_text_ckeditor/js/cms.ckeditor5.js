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
                    editor_instance.model.document.on('change:data', function () {
                        CMS.CKEditor5.editors[options.plugin_id].changed = true;
                    });
                    setup.callback(editor_instance, setup);
                })
                .catch(function (error) {
                    console.error(error);
                });
        },

        startInlineEditor: function (plugin_id, url, initialEvent) {
            $.get(url, {}, function (response) {
                // get form incl. csrf token
                var responseDOM = $(response);
                var csrfmiddlewaretoken = responseDOM.find('input[name="csrfmiddlewaretoken"]');
                var content = responseDOM.find('textarea[name="body"]');

                if (csrfmiddlewaretoken) {  // success <=> middleware token
                    var wrapper = $('.cms-ckeditor-inline-wrapper.cms-plugin-' + plugin_id)
                        .attr('contenteditable', 'true');
                    var options = {};
                    var settings_script_tag = responseDOM.find('.ck-settings')[0];

                    wrapper.html(content.val());
                    for (var attr in settings_script_tag.dataset) {
                        if (settings_script_tag.dataset.hasOwnProperty(attr)) {
                            options[attr] = settings_script_tag.dataset[attr];
                            if (attr === 'lang' || attr === 'plugins' || attr === 'settings') {
                                options[attr] = JSON.parse(options[attr]);
                            }
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
                                    CMS.CKEditor5.save_data(plugin_id);
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
                }
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

                        if (CMS.CKEditor5.editors[plugin_id] === undefined) {
                            CMS.CKEditor5.startInlineEditor(plugin_id, url);
                        }
                    }
                });
            }, {
                root: null,
                threshold: 0.5
            });

            CMS._plugins.forEach(function (plugin) {
                if (plugin[1].plugin_type === 'TextPlugin') {
                    var url = plugin[1].urls.edit_plugin;
                    var plugin_id = plugin[1].plugin_id;
                    var elements = $('.cms-plugin.cms-plugin-' + plugin_id);

                    if (elements.length > 0) {
                        var wrapper = elements
                            .wrapAll("<div class='cms-ckeditor-inline-wrapper'></div>")
                            .parent();

                        elements.removeClass('cms-plugin').removeClass('cms-plugin-' + plugin_id);
                        wrapper.addClass('cms-plugin').addClass('cms-plugin-' + plugin_id);
                        wrapper.attr('data-edit_url', url);
                        wrapper.attr('data-plugin_id', plugin_id);
                        CMS.CKEditor5.observer.observe(wrapper[0]);  // let observer load inline editor for visible text plugins
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
                        action(response);
                    }
                    // var scripts = $(response).find("script").addClass("cms-ckeditor5-result");
                    // $("body").append(scripts);
                }).fail(function (error) {
                    CMS.API.Messages.open(error);
                    console.error(error);
                });
            }
            CMS.CKEditor5.editors[id].changed = false;
        },

        _resetInlineEditors: function () {
            if (CMS.CKEditor5.CSS !== null && $('style[data-cke="true"]').length === 0) {
                $('head').append(CMS.CKEditor5.CSS);
            }
            CMS.CKEditor5._killAll();
            CMS.CKEditor5._initAll();
        },

        _initAll: function () {
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
