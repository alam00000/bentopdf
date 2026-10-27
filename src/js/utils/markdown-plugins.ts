import type { MarkdownIt } from 'markdown-it';
import { sub } from '@mdit/plugin-sub';
import { sup } from '@mdit/plugin-sup';
import { footnote } from '@mdit/plugin-footnote';
import { dl } from '@mdit/plugin-dl';
import { abbr } from '@mdit/plugin-abbr';
import { ins } from '@mdit/plugin-ins';
import { mark } from '@mdit/plugin-mark';
import { anchor } from '@mdit/plugin-anchor';
import tableOfContents from 'markdown-it-table-of-contents';

export function useMarkdownPlugins(md: MarkdownIt): MarkdownIt {
  md.linkify.set({ fuzzyLink: true });
  return md
    .use(sub) // Subscript: ~text~ -> <sub>text</sub>
    .use(sup) // Superscript: ^text^ -> <sup>text</sup>
    .use(footnote) // Footnotes: [^1] and [^1]: footnote text
    .use(dl) // Definition lists
    .use(abbr) // Abbreviations: *[abbr]: full text
    .use(ins) // Inserted text: ++text++ -> <ins>text</ins>
    .use(mark) // Marked text: ==text== -> <mark>text</mark>
    .use(anchor) // Header anchors
    .use(tableOfContents, {
      markerPattern: /^(?:\$\{toc\}|\[\[?_?toc_?\]?\])[ \t]*$/im,
      includeLevel: [1, 2, 3, 4, 5, 6],
      listType: 'ol',
    }); // Table of contents: ${toc}
}
