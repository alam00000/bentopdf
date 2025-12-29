import { MarkdownEditor } from '../utils/markdown-editor.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('markdown-editor-container');

    if (!container) {
        console.error('Markdown editor container not found');
        return;
    }

    const editor = new MarkdownEditor(container, {});

    console.log('Markdown editor initialized');

    const backButton = document.getElementById('back-to-tools');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = '/';
        });
    }
});
