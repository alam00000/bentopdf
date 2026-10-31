declare module 'markdown-it-table-of-contents' {
  import type { MarkdownIt } from 'markdown-it';
  const plugin: (
    md: MarkdownIt,
    options?: {
      markerPattern?: RegExp;
      includeLevel?: number[];
      listType?: 'ul' | 'ol';
    }
  ) => void;
  export default plugin;
}
