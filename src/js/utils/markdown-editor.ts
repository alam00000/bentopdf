import MarkdownIt, {
  type MarkdownIt as MarkdownItParser,
  type StateInline,
} from 'markdown-it';
import DOMPurify from 'dompurify';
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
import type { Mermaid } from 'mermaid';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { fullEmoji } from '@mdit/plugin-emoji';
import { tasklist } from '@mdit/plugin-tasklist';
import { katex as katexPlugin } from '@mdit/plugin-katex-slim';
import { useMarkdownPlugins } from './markdown-plugins';
import { applyTranslations, trHtml, trText } from '../i18n/i18n';
import type {
  WindowWithLucide,
  WindowWithI18next,
  MarkdownItOptions,
  MarkdownItToken,
  MarkdownItRendererSelf,
  MarkdownItRenderRule,
} from '@/types';

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

export type { MarkdownItOptions } from '@/types';

const MIN_TABLE_ZOOM = 0.6;
const TABLE_BREAK_CLASS = 'md-table-break-anywhere';
const PREVIEW_SANITIZE_OPTIONS = {
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['style', 'form', 'dialog'],
  FORBID_ATTR: ['popover'],
};
const ESCAPED_MATH: ReadonlyArray<[string, string, boolean]> = [
  ['\\\\[', '\\\\]', true],
  ['\\\\(', '\\\\)', false],
  ['\\[', '\\]', true],
];

function escapedMath(state: StateInline, silent: boolean): boolean {
  for (const [open, close, display] of ESCAPED_MATH) {
    if (!state.src.startsWith(open, state.pos)) continue;
    const start = state.pos + open.length;
    const end = state.src.indexOf(close, start);
    if (end <= start || end + close.length > state.posMax) return false;
    if (!silent) {
      const token = state.push(
        display ? 'math_display_inline' : 'math_inline',
        'math',
        0
      );
      token.content = state.src.slice(start, end);
    }
    state.pos = end + close.length;
    return true;
  }
  return false;
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
| Math | ✓ | LaTeX via KaTeX |

## Math

Inline math with dollar signs like $E = mc^2$, or with brackets like \\(a^2 + b^2 = c^2\\).

Display math with double dollar signs:

$$
\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}
$$

Or with square brackets:

\\[
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
\\]

Or in a math code block:

\`\`\`math
\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}
\\begin{pmatrix} x \\\\ y \\end{pmatrix}
=
\\begin{pmatrix} ax + by \\\\ cx + dy \\end{pmatrix}
\`\`\`

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
  private md: MarkdownItParser;
  private editor: HTMLTextAreaElement | null = null;
  private preview: HTMLElement | null = null;
  private onBack?: () => void;
  private syncScroll: boolean = false;
  private isSyncing: boolean = false;
  private mermaid: Promise<Mermaid> | null = null;
  private mdOptions: MarkdownItOptions = {
    html: true,
    breaks: false,
    linkify: true,
    typographer: true,
  };

  constructor(container: HTMLElement, options: MarkdownEditorOptions) {
    this.container = container;
    this.onBack = options.onBack;

    this.md = this.createMarkdownIt();
    this.configureLinkRenderer();

    this.render();

    if (options.initialContent) {
      this.setContent(options.initialContent);
    } else {
      this.setContent(DEFAULT_MARKDOWN);
    }
  }

  private loadMermaid(): Promise<Mermaid> {
    this.mermaid ??= import('mermaid').then(
      ({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          look: 'classic',
          securityLevel: 'strict',
          htmlLabels: false,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        });
        return mermaid;
      },
      (error: unknown) => {
        this.mermaid = null;
        throw error;
      }
    );
    return this.mermaid;
  }

  private configureLinkRenderer(): void {
    const existingRule = this.md.renderer.rules.link_open;
    const defaultRender: MarkdownItRenderRule = existingRule
      ? (existingRule as unknown as MarkdownItRenderRule)
      : (
          tokens: MarkdownItToken[],
          idx: number,
          options: MarkdownItOptions,
          env: unknown,
          self: MarkdownItRendererSelf
        ) => self.renderToken(tokens, idx, options);

    this.md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
      const token = tokens[idx] as unknown as MarkdownItToken;
      token.attrSet('target', '_blank');
      token.attrSet('rel', 'noopener noreferrer');
      return defaultRender(
        tokens as unknown as MarkdownItToken[],
        idx,
        options as unknown as MarkdownItOptions,
        env as unknown,
        self as unknown as MarkdownItRendererSelf
      );
    };
  }

  private render(): void {
    this.container.innerHTML = `
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
      <div class="md-editor light-mode">
        <div class="md-editor-wrapper">
          <div class="md-editor-header">
            <div class="md-editor-actions">
              <input type="file" accept=".md,.markdown,.txt" id="mdFileInput" style="display: none;" />
              <button class="md-editor-btn md-editor-btn-secondary" id="mdUpload">
                <i data-lucide="upload"></i>
                <span data-i18n="tools:markdownToPdf.btnUpload">Select</span>
              </button>
              <div class="theme-toggle">
                <i data-lucide="moon" width="16" height="16"></i>
                <div class="theme-toggle-slider active" id="themeToggle"></div>
                <i data-lucide="sun" width="16" height="16"></i>
              </div>
              <button class="md-editor-btn md-editor-btn-secondary" id="mdSyncScroll" title="${trHtml('Toggle sync scroll')}">
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
      
    `;

    this.editor = document.getElementById('mdTextarea') as HTMLTextAreaElement;
    this.preview = document.getElementById('mdPreview') as HTMLElement;

    this.setupEventListeners();
    this.applyI18n();

    // Initialize Lucide icons
    if (typeof (window as WindowWithLucide).lucide !== 'undefined') {
      (window as WindowWithLucide).lucide?.createIcons();
    }
  }

  private setupEventListeners(): void {
    // Editor input
    this.editor?.addEventListener('input', () => {
      this.updatePreview();
    });

    window
      .matchMedia('print')
      .addEventListener('change', (event) =>
        this.fitTablesToPage(event.matches)
      );
    window.addEventListener('afterprint', () => this.fitTablesToPage(false));

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
        const scrollPercentage =
          this.editor.scrollTop /
          (this.editor.scrollHeight - this.editor.clientHeight);
        this.preview.scrollTop =
          scrollPercentage *
          (this.preview.scrollHeight - this.preview.clientHeight);
        setTimeout(() => (this.isSyncing = false), 10);
      }
    });

    // Preview scroll sync (bidirectional)
    this.preview?.addEventListener('scroll', () => {
      if (this.syncScroll && !this.isSyncing && this.editor && this.preview) {
        this.isSyncing = true;
        const scrollPercentage =
          this.preview.scrollTop /
          (this.preview.scrollHeight - this.preview.clientHeight);
        this.editor.scrollTop =
          scrollPercentage *
          (this.editor.scrollHeight - this.editor.clientHeight);
        setTimeout(() => (this.isSyncing = false), 10);
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
    document
      .getElementById('mdCloseSettings')
      ?.addEventListener('click', () => {
        const modal = document.getElementById('mdSettingsModal');
        if (modal) {
          modal.style.display = 'none';
        }
      });

    // Close modal on overlay click
    document
      .getElementById('mdSettingsModal')
      ?.addEventListener('click', (e) => {
        if (
          (e.target as HTMLElement).classList.contains(
            'md-editor-modal-overlay'
          )
        ) {
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

    document
      .getElementById('mdOptTypographer')
      ?.addEventListener('change', (e) => {
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
        this.editor!.value =
          value.substring(0, start) + '  ' + value.substring(end);
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
      this.mdOptions = {
        html: false,
        breaks: false,
        linkify: false,
        typographer: false,
      };
    } else if (preset === 'zero') {
      this.mdOptions = {
        html: false,
        breaks: false,
        linkify: false,
        typographer: false,
      };
    } else {
      this.mdOptions = {
        html: true,
        breaks: false,
        linkify: true,
        typographer: true,
      };
    }

    // Update UI checkboxes
    (document.getElementById('mdOptHtml') as HTMLInputElement).checked =
      this.mdOptions.html;
    (document.getElementById('mdOptBreaks') as HTMLInputElement).checked =
      this.mdOptions.breaks;
    (document.getElementById('mdOptLinkify') as HTMLInputElement).checked =
      this.mdOptions.linkify;
    (document.getElementById('mdOptTypographer') as HTMLInputElement).checked =
      this.mdOptions.typographer;

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

  private createMarkdownIt(): MarkdownItParser {
    // Use preset if commonmark or zero
    let md: MarkdownItParser;
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
              return hljs.highlight(str, {
                language: lang,
                ignoreIllegals: true,
              }).value;
            } catch {
              // Fall through to default
            }
          }
          return ''; // Use external default escaping
        },
      });
    }

    // Apply plugins only for default preset (plugins may not work well with commonmark/zero)
    if (this.currentPreset === 'default') {
      useMarkdownPlugins(md)
        .use(fullEmoji) // Emoji: :smile: -> 😄
        .use(tasklist, {
          disabled: false,
          label: false,
          containerClass: 'contains-task-list',
        }) // Task lists: - [x] done
        .use(katexPlugin, {
          delimiters: 'all' as const,
          mathFence: true,
          throwOnError: false,
        });
      md.inline.ruler.before('escape', 'math_escaped', escapedMath);
      md.renderer.rules.math_display_inline = (tokens, idx) =>
        katex.renderToString(tokens[idx].content, {
          displayMode: true,
          throwOnError: false,
          strict: (code: string) =>
            code === 'newLineInDisplayMode' ? 'ignore' : 'warn',
        });
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
    this.preview.innerHTML = DOMPurify.sanitize(html, PREVIEW_SANITIZE_OPTIONS);
    this.renderMermaidDiagrams();
  }

  private async renderMermaidDiagrams(): Promise<void> {
    if (!this.preview) return;

    const mermaidBlocks = this.preview.querySelectorAll(
      'pre > code.language-mermaid'
    );

    for (let i = 0; i < mermaidBlocks.length; i++) {
      const block = mermaidBlocks[i] as HTMLElement;
      const code = block.textContent || '';
      const pre = block.parentElement;

      if (pre && code.trim()) {
        try {
          const id = `mermaid-diagram-${i}-${Date.now()}`;
          const mermaid = await this.loadMermaid();
          const { svg } = await mermaid.render(id, code.trim());

          const wrapper = document.createElement('div');
          wrapper.className = 'mermaid-diagram';
          // Mermaid already sanitizes SVG at securityLevel: 'strict' (including
          // foreignObject HTML labels). A second DOMPurify pass with the SVG-only
          // profile strips those labels and leaves empty flowchart nodes.
          wrapper.innerHTML = svg;

          pre.replaceWith(wrapper);
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          const errorDiv = document.createElement('div');
          errorDiv.className = 'mermaid-error';
          errorDiv.textContent = trText('Mermaid Error: {{error}}', {
            error: (error as Error).message,
          });
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

  private fitTablesToPage(printing: boolean): void {
    if (!this.preview) return;
    const available = this.preview.clientWidth;
    for (const table of this.preview.querySelectorAll('table')) {
      table.style.zoom = '';
      table.classList.remove(TABLE_BREAK_CLASS);
      if (!printing || table.scrollWidth <= available) continue;
      if (available / table.scrollWidth < MIN_TABLE_ZOOM) {
        table.classList.add(TABLE_BREAK_CLASS);
      }
      let zoom = 1;
      for (let attempt = 0; attempt < 5; attempt++) {
        const width = table.getBoundingClientRect().width;
        if (width <= available) break;
        zoom = Math.floor(((zoom * available) / width) * 100) / 100;
        table.style.zoom = String(zoom);
      }
    }
  }

  private exportPdf(): void {
    // Use browser's native print functionality
    window.print();
  }

  private applyI18n(): void {
    // Apply translations to elements within this component
    applyTranslations();

    // Special handling for select options (data-i18n on options doesn't work with applyTranslations)
    const presetSelect = document.getElementById(
      'mdPreset'
    ) as HTMLSelectElement;
    if (presetSelect) {
      const options = presetSelect.querySelectorAll('option[data-i18n]');
      options.forEach((option) => {
        const key = option.getAttribute('data-i18n');
        if (key) {
          // Use i18next directly for option text
          const translated = (window as WindowWithI18next).i18next?.t(key);
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
