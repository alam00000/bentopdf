import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import markdownLang from 'highlight.js/lib/languages/markdown';
import sql from 'highlight.js/lib/languages/sql';
import java from 'highlight.js/lib/languages/java';
import csharp from 'highlight.js/lib/languages/csharp';
import cpp from 'highlight.js/lib/languages/cpp';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import yaml from 'highlight.js/lib/languages/yaml';
import 'highlight.js/styles/github.css';
import mermaid from 'mermaid';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import footnote from 'markdown-it-footnote';
import deflist from 'markdown-it-deflist';
import abbr from 'markdown-it-abbr';
import { full as emoji } from 'markdown-it-emoji';
import ins from 'markdown-it-ins';
import mark from 'markdown-it-mark';
import taskLists from 'markdown-it-task-lists';
import anchor from 'markdown-it-anchor';
import tocDoneRight from 'markdown-it-toc-done-right';
import { applyTranslations } from '../i18n/i18n';



// Register highlight.js languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('markdown', markdownLang);
hljs.registerLanguage('md', markdownLang);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('java', java);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('cs', csharp);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c', cpp);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);

export interface MarkdownEditorOptions {
  /** Initial markdown content */
  initialContent?: string;
  /** Callback when user wants to go back */
  onBack?: () => void;
}

export interface MarkdownItOptions {
  /** Enable HTML tags in source */
  html: boolean;
  /** Convert '\n' in paragraphs into <br> */
  breaks: boolean;
  /** Autoconvert URL-like text to links */
  linkify: boolean;
  /** Enable some language-neutral replacement + quotes beautification */
  typographer: boolean;
  /** Highlight function for fenced code blocks */
  highlight?: (str: string, lang: string) => string;
}

const DEFAULT_MARKDOWN = `# Welcome to BentoPDF Markdown Editor

This is a **live preview** markdown editor with full plugin support.

\${toc}

## Basic Formatting

- **Bold** and *italic* text
- ~~Strikethrough~~ text
- [Links](https://bentopdf.com)
- ==Highlighted text== using mark
- ++Inserted text++ using ins
- H~2~O for subscript
- E=mc^2^ for superscript

## Task Lists

- [x] Completed task
- [x] Another done item
- [ ] Pending task
- [ ] Future work

## Emoji Support :rocket:

Use emoji shortcodes: :smile: :heart: :thumbsup: :star: :fire:

## Code with Syntax Highlighting

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return { message: 'Welcome!' };
}
\`\`\`

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`

## Tables

| Feature | Supported | Notes |
|---------|:---------:|-------|
| Headers | ✓ | Multiple levels |
| Lists | ✓ | Ordered & unordered |
| Code | ✓ | With highlighting |
| Tables | ✓ | With alignment |
| Emoji | ✓ | :white_check_mark: |
| Mermaid | ✓ | Diagrams! |

## Mermaid Diagrams

### Flowchart

\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[OK]
    B -->|No| D[Cancel]
\`\`\`

### Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant User
    participant BentoPDF
    participant Server
    User->>BentoPDF: Upload PDF
    BentoPDF->>BentoPDF: Process locally
    BentoPDF-->>User: Download result
    Note over BentoPDF: No server needed!
\`\`\`

### Pie Chart

\`\`\`mermaid
pie title PDF Tools Usage
    "Merge" : 35
    "Compress" : 25
    "Convert" : 20
    "Edit" : 15
    "Other" : 5
\`\`\`

### Class Diagram

\`\`\`mermaid
classDiagram
    class PDFDocument {
        +String title
        +int pageCount
        +merge()
        +split()
        +compress()
    }
    class Page {
        +int number
        +rotate()
        +crop()
    }
    PDFDocument "1" --> "*" Page
\`\`\`

### Gantt Chart

\`\`\`mermaid
gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Planning
        Research      :a1, 2024-01-01, 7d
        Design        :a2, after a1, 5d
    section Development
        Implementation :a3, after a2, 14d
        Testing       :a4, after a3, 7d
\`\`\`

### Entity Relationship

\`\`\`mermaid
erDiagram
    USER ||--o{ DOCUMENT : uploads
    DOCUMENT ||--|{ PAGE : contains
    DOCUMENT {
        string id
        string name
        date created
    }
    PAGE {
        int number
        string content
    }
\`\`\`

### Mindmap

\`\`\`mermaid
mindmap
    root((BentoPDF))
        Convert
            Word to PDF
            Excel to PDF
            Image to PDF
        Edit
            Merge
            Split
            Compress
        Secure
            Encrypt
            Sign
            Watermark
\`\`\`

## Footnotes

Here's a sentence with a footnote[^1].

## Definition Lists

Term 1
:   Definition for term 1

Term 2
:   Definition for term 2
:   Another definition for term 2

## Abbreviations

The HTML specification is maintained by the W3C.

*[HTML]: Hyper Text Markup Language
*[W3C]: World Wide Web Consortium

---

Start editing to see the magic happen!

[^1]: This is the footnote content.
`;

export class MarkdownEditor {
  private container: HTMLElement;
  private md: MarkdownIt;
  private editor: HTMLTextAreaElement | null = null;
  private preview: HTMLElement | null = null;
  private onBack?: () => void;
  private syncScroll: boolean = false;
  private isSyncing: boolean = false;
  private mermaidInitialized: boolean = false;
  private mdOptions: MarkdownItOptions = {
    html: true,
    breaks: false,
    linkify: true,
    typographer: true
  };

  constructor(container: HTMLElement, options: MarkdownEditorOptions) {
    this.container = container;
    this.onBack = options.onBack;

    this.initMermaid();
    this.md = this.createMarkdownIt();
    this.configureLinkRenderer();

    this.render();

    if (options.initialContent) {
      this.setContent(options.initialContent);
    } else {
      this.setContent(DEFAULT_MARKDOWN);
    }
  }

  private initMermaid(): void {
    if (!this.mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      });
      this.mermaidInitialized = true;
    }
  }

  private configureLinkRenderer(): void {
    // Override link renderer to add target="_blank" and rel="noopener"
    const defaultRender = this.md.renderer.rules.link_open ||
      ((tokens: any[], idx: number, options: any, _env: any, self: any) => self.renderToken(tokens, idx, options));

    this.md.renderer.rules.link_open = (tokens: any[], idx: number, options: any, env: any, self: any) => {
      const token = tokens[idx];
      token.attrSet('target', '_blank');
      token.attrSet('rel', 'noopener noreferrer');
      return defaultRender(tokens, idx, options, env, self);
    };
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="md-editor light-mode">
        <div class="md-editor-wrapper">
          <div class="md-editor-header">
            <div class="md-editor-actions">
              <input type="file" accept=".md,.markdown,.txt" id="mdFileInput" style="display: none;" />
              <button class="md-editor-btn md-editor-btn-secondary" id="mdUpload">
                <i data-lucide="upload"></i>
                <span data-i18n="tools:markdownToPdf.btnUpload">Upload</span>
              </button>
              <div class="theme-toggle">
                <i data-lucide="moon" width="16" height="16"></i>
                <div class="theme-toggle-slider active" id="themeToggle"></div>
                <i data-lucide="sun" width="16" height="16"></i>
              </div>
              <button class="md-editor-btn md-editor-btn-secondary" id="mdSyncScroll" title="Toggle sync scroll">
                <i data-lucide="git-compare"></i>
                <span data-i18n="tools:markdownToPdf.btnSyncScroll">Sync Scroll</span>
              </button>
              <button class="md-editor-btn md-editor-btn-secondary" id="mdSettings">
                <i data-lucide="settings"></i>
                <span data-i18n="tools:markdownToPdf.btnSettings">Settings</span>
              </button>
              <button class="md-editor-btn md-editor-btn-primary" id="mdExport">
                <i data-lucide="download"></i>
                <span data-i18n="tools:markdownToPdf.btnExportPdf">Export PDF</span>
              </button>
            </div>
          </div>
          
          <div class="md-editor-main">
            <div class="md-editor-pane">
              <div class="md-editor-pane-header">
                <span data-i18n="tools:markdownToPdf.paneMarkdown">Markdown</span>
              </div>
              <textarea class="md-editor-textarea" id="mdTextarea" spellcheck="false"></textarea>
            </div>
            <div class="md-editor-pane">
              <div class="md-editor-pane-header">
                <span data-i18n="tools:markdownToPdf.panePreview">Preview</span>
              </div>
              <div class="md-editor-preview" id="mdPreview"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Settings Modal (hidden by default) -->
      <div class="md-editor-modal-overlay" id="mdSettingsModal" style="display: none;">
        <div class="md-editor-modal">
          <div class="md-editor-modal-header">
            <h2 class="md-editor-modal-title" data-i18n="tools:markdownToPdf.settingsTitle">Markdown Settings</h2>
            <button class="md-editor-modal-close" id="mdCloseSettings">
              <i data-lucide="x" width="20" height="20"></i>
            </button>
          </div>
          <div class="md-editor-settings-group">
            <h3 data-i18n="tools:markdownToPdf.settingsPreset">Preset</h3>
            <select id="mdPreset">
              <option value="default" selected data-i18n="tools:markdownToPdf.presetDefault">Default (GFM-like)</option>
              <option value="commonmark" data-i18n="tools:markdownToPdf.presetCommonmark">CommonMark (strict)</option>
              <option value="zero" data-i18n="tools:markdownToPdf.presetZero">Minimal (no features)</option>
            </select>
          </div>
          <div class="md-editor-settings-group">
            <h3 data-i18n="tools:markdownToPdf.settingsOptions">Markdown Options</h3>
            <label class="md-editor-checkbox">
              <input type="checkbox" id="mdOptHtml" ${this.mdOptions.html ? 'checked' : ''} />
              <span data-i18n="tools:markdownToPdf.optAllowHtml">Allow HTML tags</span>
            </label>
            <label class="md-editor-checkbox">
              <input type="checkbox" id="mdOptBreaks" ${this.mdOptions.breaks ? 'checked' : ''} />
              <span data-i18n="tools:markdownToPdf.optBreaks">Convert newlines to &lt;br&gt;</span>
            </label>
            <label class="md-editor-checkbox">
              <input type="checkbox" id="mdOptLinkify" ${this.mdOptions.linkify ? 'checked' : ''} />
              <span data-i18n="tools:markdownToPdf.optLinkify">Auto-convert URLs to links</span>
            </label>
            <label class="md-editor-checkbox">
              <input type="checkbox" id="mdOptTypographer" ${this.mdOptions.typographer ? 'checked' : ''} />
              <span data-i18n="tools:markdownToPdf.optTypographer">Typographer (smart quotes, etc.)</span>
            </label>
          </div>
        </div>
      </div>
    `;

    this.editor = document.getElementById('mdTextarea') as HTMLTextAreaElement;
    this.preview = document.getElementById('mdPreview') as HTMLElement;

    this.setupEventListeners();
    this.applyI18n();

    // Initialize Lucide icons
    if (typeof (window as any).lucide !== 'undefined') {
      (window as any).lucide.createIcons();
    }
  }


  private setupEventListeners(): void {
    // Editor input
    this.editor?.addEventListener('input', () => {
      this.updatePreview();
    });

    // Sync scroll
    const syncScrollBtn = document.getElementById('mdSyncScroll');
    syncScrollBtn?.addEventListener('click', () => {
      this.syncScroll = !this.syncScroll;
      syncScrollBtn.classList.toggle('md-editor-btn-primary');
      syncScrollBtn.classList.toggle('md-editor-btn-secondary');
    });

    // Editor scroll sync
    this.editor?.addEventListener('scroll', () => {
      if (this.syncScroll && !this.isSyncing && this.editor && this.preview) {
        this.isSyncing = true;
        const scrollPercentage = this.editor.scrollTop / (this.editor.scrollHeight - this.editor.clientHeight);
        this.preview.scrollTop = scrollPercentage * (this.preview.scrollHeight - this.preview.clientHeight);
        setTimeout(() => this.isSyncing = false, 10);
      }
    });

    // Preview scroll sync (bidirectional)
    this.preview?.addEventListener('scroll', () => {
      if (this.syncScroll && !this.isSyncing && this.editor && this.preview) {
        this.isSyncing = true;
        const scrollPercentage = this.preview.scrollTop / (this.preview.scrollHeight - this.preview.clientHeight);
        this.editor.scrollTop = scrollPercentage * (this.editor.scrollHeight - this.editor.clientHeight);
        setTimeout(() => this.isSyncing = false, 10);
      }
    });

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const editorContainer = document.querySelector('.md-editor');
    themeToggle?.addEventListener('click', () => {
      editorContainer?.classList.toggle('light-mode');
      themeToggle.classList.toggle('active');
    });

    // Settings modal open
    document.getElementById('mdSettings')?.addEventListener('click', () => {
      const modal = document.getElementById('mdSettingsModal');
      if (modal) {
        modal.style.display = 'flex';
      }
    });

    // Settings modal close
    document.getElementById('mdCloseSettings')?.addEventListener('click', () => {
      const modal = document.getElementById('mdSettingsModal');
      if (modal) {
        modal.style.display = 'none';
      }
    });

    // Close modal on overlay click
    document.getElementById('mdSettingsModal')?.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).classList.contains('md-editor-modal-overlay')) {
        const modal = document.getElementById('mdSettingsModal');
        if (modal) {
          modal.style.display = 'none';
        }
      }
    });

    // Settings checkboxes
    document.getElementById('mdOptHtml')?.addEventListener('change', (e) => {
      this.mdOptions.html = (e.target as HTMLInputElement).checked;
      this.updateMarkdownIt();
    });

    document.getElementById('mdOptBreaks')?.addEventListener('change', (e) => {
      this.mdOptions.breaks = (e.target as HTMLInputElement).checked;
      this.updateMarkdownIt();
    });

    document.getElementById('mdOptLinkify')?.addEventListener('change', (e) => {
      this.mdOptions.linkify = (e.target as HTMLInputElement).checked;
      this.updateMarkdownIt();
    });

    document.getElementById('mdOptTypographer')?.addEventListener('change', (e) => {
      this.mdOptions.typographer = (e.target as HTMLInputElement).checked;
      this.updateMarkdownIt();
    });

    // Preset selector
    document.getElementById('mdPreset')?.addEventListener('change', (e) => {
      const preset = (e.target as HTMLSelectElement).value;
      this.applyPreset(preset as 'default' | 'commonmark' | 'zero');
    });

    // Upload button
    document.getElementById('mdUpload')?.addEventListener('click', () => {
      document.getElementById('mdFileInput')?.click();
    });

    // File input change
    document.getElementById('mdFileInput')?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.loadFile(file);
      }
    });

    // Export PDF
    document.getElementById('mdExport')?.addEventListener('click', () => {
      this.exportPdf();
    });

    // Keyboard shortcuts
    this.editor?.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + S to export
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.exportPdf();
      }
      // Tab key for indentation
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.editor!.selectionStart;
        const end = this.editor!.selectionEnd;
        const value = this.editor!.value;
        this.editor!.value = value.substring(0, start) + '  ' + value.substring(end);
        this.editor!.selectionStart = this.editor!.selectionEnd = start + 2;
        this.updatePreview();
      }
    });
  }

  private currentPreset: 'default' | 'commonmark' | 'zero' = 'default';

  private applyPreset(preset: 'default' | 'commonmark' | 'zero'): void {
    this.currentPreset = preset;

    // Update options based on preset
    if (preset === 'commonmark') {
      this.mdOptions = { html: false, breaks: false, linkify: false, typographer: false };
    } else if (preset === 'zero') {
      this.mdOptions = { html: false, breaks: false, linkify: false, typographer: false };
    } else {
      this.mdOptions = { html: true, breaks: false, linkify: true, typographer: true };
    }

    // Update UI checkboxes
    (document.getElementById('mdOptHtml') as HTMLInputElement).checked = this.mdOptions.html;
    (document.getElementById('mdOptBreaks') as HTMLInputElement).checked = this.mdOptions.breaks;
    (document.getElementById('mdOptLinkify') as HTMLInputElement).checked = this.mdOptions.linkify;
    (document.getElementById('mdOptTypographer') as HTMLInputElement).checked = this.mdOptions.typographer;

    this.updateMarkdownIt();
  }

  private async loadFile(file: File): Promise<void> {
    try {
      const text = await file.text();
      this.setContent(text);
    } catch (error) {
      console.error('Failed to load file:', error);
    }
  }


  private createMarkdownIt(): MarkdownIt {
    // Use preset if commonmark or zero
    let md: MarkdownIt;
    if (this.currentPreset === 'commonmark') {
      md = new MarkdownIt('commonmark');
    } else if (this.currentPreset === 'zero') {
      md = new MarkdownIt('zero');
      // Enable basic features for zero preset
      md.enable(['paragraph', 'newline', 'text']);
    } else {
      md = new MarkdownIt({
        ...this.mdOptions,
        highlight: (str: string, lang: string) => {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
            } catch {
              // Fall through to default
            }
          }
          return ''; // Use external default escaping
        }
      });
    }

    // Apply plugins only for default preset (plugins may not work well with commonmark/zero)
    if (this.currentPreset === 'default') {
      md.use(sub)           // Subscript: ~text~ -> <sub>text</sub>
        .use(sup)           // Superscript: ^text^ -> <sup>text</sup>
        .use(footnote)      // Footnotes: [^1] and [^1]: footnote text
        .use(deflist)       // Definition lists
        .use(abbr)          // Abbreviations: *[abbr]: full text
        .use(emoji)         // Emoji: :smile: -> 😄
        .use(ins)           // Inserted text: ++text++ -> <ins>text</ins>
        .use(mark)          // Marked text: ==text== -> <mark>text</mark>
        .use(taskLists, { enabled: true, label: true, labelAfter: true })  // Task lists: - [x] done
        .use(anchor, { permalink: false })  // Header anchors
        .use(tocDoneRight); // Table of contents: ${toc}
    }

    return md;
  }

  private updateMarkdownIt(): void {
    this.md = this.createMarkdownIt();
    this.configureLinkRenderer();
    this.updatePreview();
  }

  private updatePreview(): void {
    if (!this.editor || !this.preview) return;

    const markdown = this.editor.value;
    const html = this.md.render(markdown);
    this.preview.innerHTML = html;
    this.renderMermaidDiagrams();
  }

  private async renderMermaidDiagrams(): Promise<void> {
    if (!this.preview) return;

    const mermaidBlocks = this.preview.querySelectorAll('pre > code.language-mermaid');

    for (let i = 0; i < mermaidBlocks.length; i++) {
      const block = mermaidBlocks[i] as HTMLElement;
      const code = block.textContent || '';
      const pre = block.parentElement;

      if (pre && code.trim()) {
        try {
          const id = `mermaid-diagram-${i}-${Date.now()}`;
          const { svg } = await mermaid.render(id, code.trim());

          const wrapper = document.createElement('div');
          wrapper.className = 'mermaid-diagram';
          wrapper.innerHTML = svg;

          pre.replaceWith(wrapper);
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          const errorDiv = document.createElement('div');
          errorDiv.className = 'mermaid-error';
          errorDiv.textContent = `Mermaid Error: ${(error as Error).message}`;
          pre.replaceWith(errorDiv);
        }
      }
    }
  }

  public setContent(content: string): void {
    if (this.editor) {
      this.editor.value = content;
      this.updatePreview();
    }
  }

  public getContent(): string {
    return this.editor?.value || '';
  }

  public getHtml(): string {
    return this.md.render(this.getContent());
  }

  private exportPdf(): void {
    // Use browser's native print functionality
    window.print();
  }

  private getStyledHtml(): string {
    const content = this.getHtml();

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
      line-height: 1.25;
    }
    h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1em; }
    p { margin: 1em 0; }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 0.9em;
      background: #f6f8fa;
      padding: 0.2em 0.4em;
      border-radius: 3px;
    }
    pre {
      background: #f6f8fa;
      padding: 16px;
      overflow: auto;
      border-radius: 6px;
      line-height: 1.45;
    }
    pre code {
      background: none;
      padding: 0;
    }
    blockquote {
      margin: 1em 0;
      padding: 0 1em;
      color: #6a737d;
      border-left: 4px solid #dfe2e5;
    }
    ul, ol {
      margin: 1em 0;
      padding-left: 2em;
    }
    li { margin: 0.25em 0; }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #dfe2e5;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background: #f6f8fa;
      font-weight: 600;
    }
    tr:nth-child(even) { background: #f6f8fa; }
    hr {
      border: none;
      border-top: 1px solid #eee;
      margin: 2em 0;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    /* Syntax highlighting - GitHub style */
    .hljs {
      color: #24292e;
      background: #f6f8fa;
    }
    .hljs-comment,
    .hljs-quote {
      color: #6a737d;
      font-style: italic;
    }
    .hljs-keyword,
    .hljs-selector-tag,
    .hljs-subst {
      color: #d73a49;
    }
    .hljs-number,
    .hljs-literal,
    .hljs-variable,
    .hljs-template-variable,
    .hljs-tag .hljs-attr {
      color: #005cc5;
    }
    .hljs-string,
    .hljs-doctag {
      color: #032f62;
    }
    .hljs-title,
    .hljs-section,
    .hljs-selector-id {
      color: #6f42c1;
      font-weight: bold;
    }
    .hljs-type,
    .hljs-class .hljs-title {
      color: #6f42c1;
    }
    .hljs-tag,
    .hljs-name,
    .hljs-attribute {
      color: #22863a;
    }
    .hljs-regexp,
    .hljs-link {
      color: #032f62;
    }
    .hljs-symbol,
    .hljs-bullet {
      color: #e36209;
    }
    .hljs-built_in,
    .hljs-builtin-name {
      color: #005cc5;
    }
    .hljs-meta {
      color: #6a737d;
      font-weight: bold;
    }
    .hljs-deletion {
      color: #b31d28;
      background-color: #ffeef0;
    }
    .hljs-addition {
      color: #22863a;
      background-color: #f0fff4;
    }
    /* Plugin styles */
    mark {
      background-color: #fff3cd;
      padding: 0.1em 0.2em;
      border-radius: 2px;
    }
    ins {
      text-decoration: none;
      background-color: #d4edda;
      padding: 0.1em 0.2em;
      border-radius: 2px;
    }
    sub, sup {
      font-size: 0.75em;
    }
    .task-list-item {
      list-style-type: none;
      margin-left: -1.5em;
    }
    .task-list-item input[type="checkbox"] {
      margin-right: 0.5em;
    }
    .footnotes {
      margin-top: 2em;
      padding-top: 1em;
      border-top: 1px solid #eee;
      font-size: 0.9em;
    }
    .footnotes-sep {
      display: none;
    }
    .footnote-ref {
      font-size: 0.75em;
      vertical-align: super;
    }
    .footnote-backref {
      font-size: 0.75em;
      margin-left: 0.25em;
    }
    dl {
      margin: 1em 0;
    }
    dt {
      font-weight: 600;
      margin-top: 1em;
    }
    dd {
      margin-left: 2em;
      margin-top: 0.25em;
      color: #6a737d;
    }
    abbr {
      text-decoration: underline dotted;
      cursor: help;
    }
    .table-of-contents {
      background: #f6f8fa;
      padding: 1em 1.5em;
      border-radius: 6px;
      margin: 1em 0;
    }
    .table-of-contents ul {
      margin: 0;
      padding-left: 1.5em;
    }
    .table-of-contents li {
      margin: 0.25em 0;
    }
    /* Mermaid diagrams */
    .mermaid-diagram {
      display: flex;
      justify-content: center;
      margin: 1.5em 0;
      padding: 1em;
      background: #f6f8fa;
      border-radius: 6px;
    }
    .mermaid-diagram svg {
      max-width: 100%;
      height: auto;
    }
    .mermaid-error {
      color: #cb2431;
      background: #ffeef0;
      padding: 1em;
      border-radius: 6px;
      font-family: monospace;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
${content}
</body>
</html>`;
  }

  private applyI18n(): void {
    // Apply translations to elements within this component
    applyTranslations();

    // Special handling for select options (data-i18n on options doesn't work with applyTranslations)
    const presetSelect = document.getElementById('mdPreset') as HTMLSelectElement;
    if (presetSelect) {
      const options = presetSelect.querySelectorAll('option[data-i18n]');
      options.forEach((option) => {
        const key = option.getAttribute('data-i18n');
        if (key) {
          // Use i18next directly for option text
          const translated = (window as any).i18next?.t(key);
          if (translated && translated !== key) {
            option.textContent = translated;
          }
        }
      });
    }
  }

  public destroy(): void {
    this.container.innerHTML = '';
  }
}
