import { CodeBlockLowlight as TiptapCodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

export const CodeBlockLowlight = TiptapCodeBlockLowlight.extend({
    addOptions() {
        return {
            ...this.parent?.(),
            lowlight: createLowlight(common),
            defaultLanguage: null,
            languageClassPrefix: 'language-',
            exitOnTripleEnter: false,
            HTMLAttributes: {
                class: 'block-node',
            },
        };
    },
});

export default CodeBlockLowlight;
