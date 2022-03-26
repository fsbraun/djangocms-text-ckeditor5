CMS.InlineEditors = CMS.InlineEditors || {};

CMS.InlineEditors.CKEditor5 = function (element, url, name, breadcrumb, source) {
    CMS.$.get(url, {}, function (response) {
        // get form incl. csrf token
        const csrf_token = CMS.$(response).find('input[name="csrfmiddlewaretoken"]').val();
        console.log(csrf_token);
        const save_data = (endpoint, data, action) => CMS.$.post(endpoint, {  // send changes
            csrfmiddlewaretoken: csrf_token,
            body: data,
            _save: "Save"
        }, function (response) {
            if (action !== undefined) {
                action();
            }
            const scripts = $(response).find("script").addClass("cms-ckeditor5-result");
            $("body").append(scripts);
        }).fail(error => {
            console.log(error);
            alert("Error saving data" + error)
        });

        const elements = $(`.cms-plugin.cms-plugin-${element.options.plugin_id}`)
            .removeClass('cms-plugin')
            .removeClass(`.cms-plugin-${element.options.plugin_id}`);

        const wrapper = elements.wrapAll("<div class='cms-ckeditor5-wrapper'></div>").parent();
        console.log("Wrapper", wrapper[0])
        CKEDITOR.InlineEditor.create(wrapper[0], {})
            .then(editor => {
                wrapper.addClass('ck-focused');
                const noop = (event) => {
                    event.stopPropagation();
                };
                wrapper.on('dblclick', noop);
                wrapper.on('pointerover', noop);
                wrapper.on("blur", function click_outside(event) {
                    const data = editor.getData();
                    save_data(url, data, () => {
                        editor.destroy().then(() => {delete editor; console.log("Editor destroyed", editor)}).catch(error => {
                            console.log(error);
                        });
                        wrapper.replaceWith(CMS.$(data).addClass("cms-plugin")
                            .addClass(`cms-plugin-${element.options.plugin_id}`));
                    });
                });
            })
            .catch(error => {
                console.log(error);
            });
    }).fail(error => {
        console.log(error);
        alert("Error opeing editor")
    });
};
