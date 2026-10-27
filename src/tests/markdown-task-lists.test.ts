import { describe, it, expect, beforeEach } from 'vitest';
import { MarkdownEditor } from '@/js/utils/markdown-editor';

describe('Markdown to PDF - Task Lists with Links (Fixes #715)', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders task list items containing links without unclosed anchor tags or swallows', () => {
    const markdown = `- [ ] [Links](https://bentopdf.com)

Paragraph below link`;

    new MarkdownEditor(container, {
      initialContent: markdown,
    });

    const preview = container.querySelector('#mdPreview');
    expect(preview).not.toBeNull();

    const html = preview?.innerHTML || '';

    // Check that the checkbox is rendered
    expect(html).toContain('type="checkbox"');

    // Check that the link is properly closed and contains the correct URL
    const anchor = preview?.querySelector('a');
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute('href')).toBe('https://bentopdf.com');
    expect(anchor?.textContent?.trim()).toBe('Links');

    // Check that the paragraph below is rendered as a separate sibling paragraph and NOT inside the anchor
    const paragraph = preview?.querySelector('p');
    expect(paragraph).not.toBeNull();
    expect(paragraph?.textContent?.trim()).toBe('Paragraph below link');
    expect(anchor?.contains(paragraph)).toBe(false);
  });

  it('correctly handles checked task lists with links and formatting', () => {
    const markdown = `- [x] [Completed Link](https://bentopdf.com) with **bold text**
- [ ] Regular task without link`;

    new MarkdownEditor(container, {
      initialContent: markdown,
    });

    const preview = container.querySelector('#mdPreview');
    const checkboxes = preview?.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes?.length).toBe(2);

    const checkedBox = checkboxes?.[0] as HTMLInputElement;
    expect(checkedBox?.checked).toBe(true);

    const anchor = preview?.querySelector('a');
    expect(anchor?.getAttribute('href')).toBe('https://bentopdf.com');
    expect(anchor?.textContent?.trim()).toBe('Completed Link');

    const strong = preview?.querySelector('strong');
    expect(strong?.textContent).toBe('bold text');
    expect(anchor?.contains(strong)).toBe(false);
  });
});
