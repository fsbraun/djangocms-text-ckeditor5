/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */


// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import InlineEditorBase from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor';
import BalloonEditorBase from  '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import BlockToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/block/blocktoolbar';


import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
// import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Autosave from '@ckeditor/ckeditor5-autosave/src/autosave';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import Font from '@ckeditor/ckeditor5-font/src/font';
import BlockQuote from './ckeditor5-block-quote/src/blockquote';
import CodeBlock from './ckeditor5-code-block/src/codeblock';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import HeadingButtonsUI from '@ckeditor/ckeditor5-heading/src/headingbuttonsui';
// import Base64UploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter';
// import Image from '@ckeditor/ckeditor5-image/src/image';
// import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
// import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
// import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
// import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ParagraphButtonUI from '@ckeditor/ckeditor5-paragraph/src/paragraphbuttonui';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import HorizontalLine from './ckeditor5-horizontal-line/src/horizontalline';
import UserStyle from './ckeditor5-user-style/src/userstyle';

import CMSPlugin from './ckeditor5-cmsplugins/src/cmsplugin';

class ClassicEditor extends ClassicEditorBase {}
// class InlineEditor extends InlineEditorBase {}
class BalloonEditor extends BalloonEditorBase {}

// Plugins to include in the build.
var builtinPlugins = [
	Essentials,
	// UploadAdapter,
	Autoformat,
	Autosave,
    Alignment,
    BlockToolbar,
	Bold,
	Italic,
    Underline,
    Strikethrough,
    Code,
    Subscript,
    Superscript,
    Font,
    CodeBlock,
	BlockQuote,
	Heading,
    HeadingButtonsUI,
    HorizontalLine,
    // Base64UploadAdapter,
	Image,
	// ImageCaption,
	// ImageStyle,
	// ImageToolbar,
    // ImageUpload,
	Indent,
	Link,
	List,
	MediaEmbed,
	Paragraph,
    ParagraphButtonUI,
	PasteFromOffice,
	SourceEditing,
	Table,
	TableToolbar,
	TextTransformation,
    UserStyle,
    CMSPlugin
];

ClassicEditor.builtinPlugins = builtinPlugins;
// InlineEditor.builtinPlugins = builtinPlugins;
BalloonEditor.builtinPlugins = builtinPlugins;

// Editor configuration.
var defaultConfig = {
	toolbar: {
		items: [
            'heading', '|',
            'bold', 'italic', 'alignment', '|',
			'link', '|',
            'bulletedList', 'numberedList', 'outdent', 'indent', '|',
            'code', 'codeblock', '|',
            'fontFamily', 'fontSize', 'fontColor', '|',
            'mediaEmbed', 'insertTable', 'horizontalLine', 'blockQuote',
		],
        shouldNotGroupWhenFull: true
	},
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: '' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: '' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: '' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: '' },
            { model: 'heading4', view: 'h4', title: 'Heading 4', class: '' },
            { model: 'heading5', view: 'h5', title: 'Heading 5', class: '' }
        ]
    },
    blockquote: {
        options: {
            classes: 'blockquote'
        }
    },
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells'
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};

ClassicEditor.defaultConfig = Object.assign({}, defaultConfig);
ClassicEditor.defaultConfig.toolbar.items.push('|', 'sourceEditing');
// InlineEditor.defaultConfig = defaultConfig;
BalloonEditor.defaultConfig = {
    heading: defaultConfig.heading,
    table: defaultConfig.table,
    language: defaultConfig.language,
    image: defaultConfig.image,
    blockquote: defaultConfig.blockquote,
    toolbar: {
		items: [
            'bold', 'italic', 'alignment', '|',
			'link', '|',
            'code', '|', 'userstyle',
            'fontFamily', 'fontSize', 'fontColor', '|',
		]
	},
    blockToolbar: {
        items: [
            'paragraph', 'heading2', 'heading3', 'heading4', 'heading5',
            '|',
            'bulletedList', 'numberedList', 'outdent', 'indent', '|',
             'cms-plugin', '|',
            'codeblock', '|',
            'mediaEmbed', 'insertTable', 'horizontalLine', 'blockQuote',
        ],
        shouldNotGroupWhenFull: true
    }
};

export default {
    ClassicEditor, BalloonEditor, // InlineEditor
};
