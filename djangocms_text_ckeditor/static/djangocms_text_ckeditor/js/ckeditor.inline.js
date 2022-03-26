CMS.CKInlineEditors = CMS.CKInlineEditors || {};


ck_close_editor = function(ckinlineeditor) {
    if(ckinlineeditor.editor !== undefined) {
        ckinlineeditor.editor.destroy();
        ckinlineeditor.wrapper
            .contents()
            .addClass("cms-plugin")
            .addClass(`cms-plugin-${ckinlineeditor.id}`)
            .unwrap();
    }
}

ck_open_editor = function (element) {
    function close_old_editor(id) {
        if (id in CMS.CKInlineEditors) {
            ck_close_editor(CMS.CKInlineEditors[id]);
        }
        CMS.CKInlineEditors[id] = {}
    }
    const url = element.urls.edit_plugin,
          id = element.plugin_id;
    CMS.$.get(url, {}, function (response) {
        // get form incl. csrf token
        close_old_editor(id);
        const elements = $(`.cms-plugin.cms-plugin-${id}`)
            .removeClass('cms-plugin')
            .removeClass(`.cms-plugin-${id}`),
            wrapper = elements.wrapAll("<div class='cms-ckeditor5-wrapper'></div>").parent();

        CMS.CKInlineEditors[id] = {
            csrfmiddlewaretoken: CMS.$(response).find('input[name="csrfmiddlewaretoken"]').val(),
            url: url,
            wrapper: wrapper,
            id: id,
        };
        const save_data = (endpoint, data, action) => CMS.$.post(endpoint, {  // send changes
            csrfmiddlewaretoken: CMS.CKInlineEditors[id].csrfmiddlewaretoken,
            body: data,
            _save: "Save"
        }, function (response) {
            if (action !== undefined) {
                action();
            }
            const scripts = $(response).find("script").addClass("cms-ckeditor5-result");
            // $("body").append(scripts);
        }).fail(error => {
            console.log(error);
            alert("Error saving data" + error)
        });

        console.log("Wrapper", wrapper[0])
        CKEDITOR.InlineEditor.create(wrapper[0], {})
            .then(editor => {
                // wrapper.addClass('ck-focused');
                const noop = (event) => {
                    event.stopPropagation();
                };
                CMS.CKInlineEditors[id].editor = editor;
                wrapper.on('dblclick', noop);
                wrapper.on('pointerover', noop);
                wrapper.on("blur", function click_outside(event) {
                    const data = editor.getData();
                    save_data(url, data);
                    // () => {
                    //     editor.destroy().then(() => {delete editor; console.log("Editor destroyed", editor)}).catch(error => {
                    //         console.log(error);
                    //     });
                    //     wrapper.replaceWith(CMS.$(data).addClass("cms-plugin")
                    //         .addClass(`cms-plugin-${element.options.plugin_id}`));
                    // });
                });
            })
            .catch(error => {
                console.log(error);
            });
    }).fail(error => {
        console.log(error);
        alert("Error opening editor")
    });
};

open_editors = () => {
    for (const plugin of CMS._plugins) {
        if (plugin[1].plugin_type === "TextPlugin") {
            console.log("Load editor for", plugin[1].plugin_id);
            ck_open_editor(plugin[1]);
        }
    }
};

close_editors = () => {
    for (const editor in CMS.CKInlineEditors) {
        console.log("Destroying editor", editor);
        ck_close_editor(CMS.CKInlineEditors[editor]);
        CMS.CKInlineEditors[editor] = {};
    }
}
open_editors();
CMS.$(window).on('cms-content-refresh', open_editors);
CMS.$(window).on('cms-content-about-to-refresh', close_editors);
