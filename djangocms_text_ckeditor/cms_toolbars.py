from cms.cms_toolbars import BasicToolbar
from cms.toolbar_pool import toolbar_pool


@toolbar_pool.register
class InlineEditingToolbar(BasicToolbar):
    class Media:
        css = {"all": ("djangocms_text_ckeditor/css/cms.ckeditor.inline.css",)}
        js = ("djangocms_text_ckeditor/js/vendor/ckeditor/ckeditor.js",
              "djangocms_text_ckeditor/js/ckeditor.inline.js",)


