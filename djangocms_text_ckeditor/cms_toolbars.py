from cms.cms_toolbars import CMSToolbar
from cms.toolbar.items import BaseItem
from cms.toolbar_pool import toolbar_pool
from django import forms
from django.templatetags.static import static
from django.utils.safestring import mark_safe
from djangocms_text_ckeditor import settings


class InlineEditingItem(BaseItem):
    """Make ckeditor config available for inline editing"""
    def render(self):
        return mark_safe(
            f'<script class="ckeditor5-config" '
            f'data-static_url="{ static("djangocms_text_ckeditor") }" '
            f'data-ckeditor_basepath="{settings.TEXT_CKEDITOR_BASE_PATH}"></script>')


@toolbar_pool.register
class InlineEditingToolbar(CMSToolbar):
    @property
    def media(self):
        if self.toolbar.edit_mode_active:
            return forms.Media(
                css={"all": ("djangocms_text_ckeditor/css/cms.ckeditor.inline.css",)},
                js=("djangocms_text_ckeditor/js/dist/bundle.ckeditor5.js",
                    "djangocms_text_ckeditor/js/cms.ckeditor5.js")
            )
        return forms.Media()

    def populate(self):
        self.toolbar.add_item(InlineEditingItem(), position=None)

