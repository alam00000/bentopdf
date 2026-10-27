import { createHash } from 'crypto';
import { serializeJsonLd } from './json-ld.mjs';

const INLINE_TAGS = new Set([
  'a',
  'abbr',
  'b',
  'bdi',
  'bdo',
  'cite',
  'data',
  'del',
  'dfn',
  'em',
  'i',
  'ins',
  'mark',
  'q',
  's',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'time',
  'u',
]);

const ALWAYS_OPAQUE_TAGS = new Set([
  'audio',
  'br',
  'canvas',
  'code',
  'iframe',
  'img',
  'input',
  'kbd',
  'math',
  'samp',
  'svg',
  'var',
  'video',
  'wbr',
]);

const SKIPPED_TAGS = new Set([
  'head',
  'noscript',
  'pre',
  'script',
  'style',
  'template',
  'textarea',
]);

const TRANSLATABLE_ATTRIBUTES = ['alt', 'title', 'placeholder', 'aria-label'];

const META_SELECTORS = [
  'meta[name="description"]',
  'meta[property="og:title"]',
  'meta[property="og:description"]',
  'meta[name="twitter:title"]',
  'meta[name="twitter:description"]',
];

const PROTECTED_TERMS = [
  'BentoPDF',
  'Hyper Compress',
  'Kura',
  'GitHub',
  'PyMuPDF',
  'Ghostscript',
  'CoherentPDF',
  'LibreOffice',
  'Tesseract',
  'DigitalOcean',
  'Fubarpie',
  'Trustpilot',
  'LinkedIn',
  'Discord',
  'WebAssembly',
  'PDF/A',
  'PDF/UA',
  'PDF/X',
  'PDF',
];

const PROTECTED_PATTERN = new RegExp(
  PROTECTED_TERMS.map((term) =>
    term.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
  ).join('|'),
  'gi'
);

const LETTERS = /\p{L}{2}/u;
const PLACEHOLDER_SOURCE = '<(\\/?)(\\d+)(\\/?)>';
const SPACES = /[ \t\r\n\f]+/g;

function placeholders(text) {
  return Array.from(text.matchAll(new RegExp(PLACEHOLDER_SOURCE, 'g')));
}

function hasPlaceholder(text) {
  return new RegExp(PLACEHOLDER_SOURCE).test(text);
}

export function segmentId(markup) {
  return createHash('sha1').update(markup).digest('hex').slice(0, 12);
}

function escapeText(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function decodeText(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function isTranslatable(markup) {
  const text = markup
    .replace(new RegExp(PLACEHOLDER_SOURCE, 'g'), ' ')
    .replace(PROTECTED_PATTERN, ' ');
  return LETTERS.test(text);
}

function normalize(text) {
  return text.replace(SPACES, ' ').trim();
}

function tagOf(element) {
  return element.tagName.toLowerCase();
}

function isInlineLike(element) {
  const tag = tagOf(element);
  if (ALWAYS_OPAQUE_TAGS.has(tag)) return true;
  if (!INLINE_TAGS.has(tag)) return false;
  if (element.hasAttribute('data-i18n')) return true;
  return Array.from(element.children).every(isInlineLike);
}

function isSkippedBlock(element) {
  return (
    SKIPPED_TAGS.has(tagOf(element)) ||
    element.hasAttribute('data-i18n') ||
    element.getAttribute('translate') === 'no' ||
    element.hasAttribute('data-no-i18n') ||
    element.hasAttribute('contenteditable')
  );
}

function isOpaque(element) {
  return (
    ALWAYS_OPAQUE_TAGS.has(tagOf(element)) ||
    element.hasAttribute('data-i18n') ||
    element.getAttribute('translate') === 'no' ||
    !LETTERS.test(element.textContent || '')
  );
}

function serialize(nodes, state) {
  let out = '';
  for (const node of nodes) {
    if (node.nodeType === 3) {
      out += escapeText(node.data);
    } else if (node.nodeType === 1) {
      state.count += 1;
      const index = state.count;
      state.elements[index] = node;
      if (isOpaque(node)) {
        out += `<${index}/>`;
      } else {
        out += `<${index}>${serialize(Array.from(node.childNodes), state)}</${index}>`;
      }
    }
  }
  return out;
}

export function parseTranslation(text, elements) {
  const root = { children: [] };
  const stack = [root];
  const seen = new Set();
  let last = 0;
  const pushText = (piece) => {
    if (!piece) return true;
    if (/[<>]/.test(piece)) return false;
    stack[stack.length - 1].children.push({ text: decodeText(piece) });
    return true;
  };
  for (const match of placeholders(text)) {
    if (!pushText(text.slice(last, match.index))) return null;
    last = match.index + match[0].length;
    const closing = match[1] === '/';
    const selfClosing = match[3] === '/';
    const index = Number(match[2]);
    const source = elements[index];
    if (!source || (closing && selfClosing)) return null;
    if (selfClosing) {
      if (!isOpaque(source) || seen.has(index)) return null;
      seen.add(index);
      stack[stack.length - 1].children.push({ element: index });
    } else if (!closing) {
      if (isOpaque(source) || seen.has(index)) return null;
      seen.add(index);
      const node = { element: index, children: [] };
      stack[stack.length - 1].children.push(node);
      stack.push(node);
    } else {
      const top = stack[stack.length - 1];
      if (top.element !== index) return null;
      stack.pop();
    }
  }
  if (!pushText(text.slice(last))) return null;
  if (stack.length !== 1) return null;
  if (seen.size !== Object.keys(elements).length) return null;
  return root.children;
}

function buildFragment(document, children, elements) {
  const fragment = document.createDocumentFragment();
  for (const child of children) {
    if ('text' in child) {
      fragment.appendChild(document.createTextNode(child.text));
    } else if (child.children) {
      const clone = elements[child.element].cloneNode(false);
      clone.appendChild(buildFragment(document, child.children, elements));
      fragment.appendChild(clone);
    } else {
      fragment.appendChild(elements[child.element].cloneNode(true));
    }
  }
  return fragment;
}

function significantNodes(nodes) {
  return nodes.filter(
    (node) => node.nodeType !== 3 || normalize(node.data) !== ''
  );
}

function handleSegment(markup, tag, context, apply) {
  const { options, stats } = context;
  const id = segmentId(markup);
  stats.found += 1;
  if (options.record) options.record(id, markup, tag);
  if (!options.translate) return;
  const translation = options.translate(id);
  if (!translation) return;
  if (apply(translation)) stats.translated += 1;
  else stats.invalid.add(id);
}

function handleAttributes(element, context) {
  for (const name of TRANSLATABLE_ATTRIBUTES) {
    if (!element.hasAttribute(name)) continue;
    if (element.hasAttribute(`data-i18n-${name}`)) continue;
    const value = normalize(element.getAttribute(name));
    if (!isTranslatable(escapeText(value))) continue;
    handleSegment(escapeText(value), tagOf(element), context, (translation) => {
      if (hasPlaceholder(translation)) return false;
      element.setAttribute(name, decodeText(translation));
      return true;
    });
  }
}

function handleRun(nodes, tag, context) {
  const significant = significantNodes(nodes);
  if (significant.length === 0) return;
  for (const node of nodes) {
    if (node.nodeType !== 1) continue;
    handleAttributes(node, context);
    node
      .querySelectorAll('*')
      .forEach((child) => handleAttributes(child, context));
  }
  if (
    significant.length === 1 &&
    significant[0].nodeType === 1 &&
    !isOpaque(significant[0])
  ) {
    handleRun(Array.from(significant[0].childNodes), tag, context);
    return;
  }
  const state = { count: 0, elements: {} };
  const markup = normalize(serialize(nodes, state));
  if (!isTranslatable(markup)) return;
  handleSegment(markup, tag, context, (translation) => {
    const children = parseTranslation(translation, state.elements);
    if (!children) return false;
    const document = significant[0].ownerDocument;
    const fragment = buildFragment(document, children, state.elements);
    const anchor = nodes[0];
    anchor.parentNode.insertBefore(fragment, anchor);
    nodes.forEach((node) => node.parentNode.removeChild(node));
    return true;
  });
}

function visitChildren(parent, context) {
  const tag = tagOf(parent);
  let run = [];
  const flush = () => {
    if (run.length > 0) handleRun(run, tag, context);
    run = [];
  };
  for (const node of Array.from(parent.childNodes)) {
    if (node.nodeType === 3) {
      run.push(node);
    } else if (node.nodeType === 1 && isInlineLike(node)) {
      run.push(node);
    } else {
      flush();
      if (node.nodeType === 1 && !isSkippedBlock(node)) {
        handleAttributes(node, context);
        visitChildren(node, context);
      }
    }
  }
  flush();
}

function processMeta(document, context) {
  const title = document.querySelector('title');
  if (title) {
    const value = normalize(title.textContent || '');
    if (isTranslatable(escapeText(value))) {
      handleSegment(escapeText(value), 'title', context, (translation) => {
        if (hasPlaceholder(translation)) return false;
        title.textContent = decodeText(translation);
        return true;
      });
    }
  }
  for (const selector of META_SELECTORS) {
    document.querySelectorAll(selector).forEach((meta) => {
      const value = normalize(meta.getAttribute('content') || '');
      if (!isTranslatable(escapeText(value))) return;
      handleSegment(escapeText(value), 'meta', context, (translation) => {
        if (hasPlaceholder(translation)) return false;
        meta.setAttribute('content', decodeText(translation));
        return true;
      });
    });
  }
}

const STRUCTURED_DATA_TEXT_KEYS = new Set([
  'name',
  'description',
  'text',
  'headline',
]);

const STRUCTURED_DATA_SKIPPED_TYPES = new Set([
  'BreadcrumbList',
  'FAQPage',
  'ImageObject',
  'ListItem',
  'Offer',
  'Organization',
  'Person',
  'Question',
  'WebSite',
]);

function walkStructuredData(value, handle) {
  if (Array.isArray(value)) {
    value.forEach((item) => walkStructuredData(item, handle));
    return;
  }
  if (!value || typeof value !== 'object') return;
  if (STRUCTURED_DATA_SKIPPED_TYPES.has(value['@type'])) return;
  for (const [key, child] of Object.entries(value)) {
    if (typeof child === 'string') {
      if (STRUCTURED_DATA_TEXT_KEYS.has(key)) handle(value, key);
    } else if (key === 'featureList' && Array.isArray(child)) {
      child.forEach((item, index) => {
        if (typeof item === 'string') handle(child, index);
      });
    } else {
      walkStructuredData(child, handle);
    }
  }
}

function processStructuredData(document, context) {
  document
    .querySelectorAll('script[type="application/ld+json"]')
    .forEach((script) => {
      let data;
      try {
        data = JSON.parse(script.textContent || '');
      } catch {
        return;
      }
      let changed = false;
      walkStructuredData(data, (container, key) => {
        const value = normalize(container[key]);
        if (!isTranslatable(escapeText(value))) return;
        handleSegment(escapeText(value), 'ld', context, (translation) => {
          if (hasPlaceholder(translation)) return false;
          container[key] = decodeText(translation);
          changed = true;
          return true;
        });
      });
      if (changed) script.textContent = serializeJsonLd(data);
    });
}

const BLOCK_TAGS = new Set([
  'p',
  'div',
  'ul',
  'ol',
  'li',
  'table',
  'tr',
  'td',
  'th',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'section',
]);

function blockText(node) {
  if (node.nodeType !== 1) return node.textContent || '';
  const text = Array.from(node.childNodes).map(blockText).join('');
  return BLOCK_TAGS.has(tagOf(node)) ? ` ${text} ` : text;
}

function rebuildFaqSchema(document) {
  const items = [];
  for (const details of document.querySelectorAll('details.faq-d')) {
    const summary = details.querySelector('summary');
    if (!summary) continue;
    const question = normalize(summary.textContent || '');
    const answerText = normalize(
      Array.from(details.childNodes)
        .filter((child) => child !== summary)
        .map(blockText)
        .join(' ')
    );
    if (!question || !answerText) continue;
    items.push({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answerText },
    });
  }
  if (items.length === 0) return;
  document
    .querySelectorAll('script[type="application/ld+json"]')
    .forEach((script) => {
      let data;
      try {
        data = JSON.parse(script.textContent || '');
      } catch {
        return;
      }
      if (data && data['@type'] === 'FAQPage') {
        script.textContent = serializeJsonLd({ ...data, mainEntity: items });
      }
    });
}

export function processDocument(document, options) {
  const context = {
    options,
    stats: { found: 0, translated: 0, invalid: new Set() },
  };
  if (!options.skipMeta) processMeta(document, context);
  const roots = options.roots
    ? options.roots(document)
    : [document.body].filter(Boolean);
  for (const root of roots) {
    if (!isSkippedBlock(root)) {
      handleAttributes(root, context);
      visitChildren(root, context);
    }
  }
  if (!options.skipMeta) {
    if (options.translate) rebuildFaqSchema(document);
    processStructuredData(document, context);
  }
  return {
    found: context.stats.found,
    translated: context.stats.translated,
    invalid: [...context.stats.invalid],
  };
}

export const ENGLISH_ONLY_PAGES = new Set(['terms', 'privacy', 'licensing']);

export function processPage(document, pageName, options) {
  if (ENGLISH_ONLY_PAGES.has(pageName)) {
    return processDocument(document, {
      ...options,
      skipMeta: true,
      roots: shellRoots,
    });
  }
  return processDocument(document, options);
}

export function shellRoots(document) {
  return Array.from(document.querySelectorAll('header, nav, footer')).filter(
    (element) => !element.parentElement?.closest('header, nav, footer')
  );
}

function placeholderParents(markup) {
  const stack = [];
  const parents = [];
  for (const match of placeholders(markup)) {
    const [, closing, index, selfClosing] = match;
    if (closing) {
      if (stack.pop() !== index) return null;
    } else {
      parents.push(`${index}:${stack.at(-1) ?? ''}`);
      if (!selfClosing) stack.push(index);
    }
  }
  return stack.length === 0 ? parents.sort().join(',') : null;
}

function placeholderSignature(markup) {
  return placeholders(markup)
    .map((match) => `${match[1]}${match[2]}${match[3]}`)
    .sort()
    .join(',');
}

export function validateTranslationPair(sourceMarkup, translation) {
  if (typeof translation !== 'string' || translation.trim() === '') {
    return 'empty';
  }
  if (
    placeholderSignature(sourceMarkup) !== placeholderSignature(translation)
  ) {
    return 'placeholders differ';
  }
  const nesting = placeholderParents(translation);
  if (nesting === null || nesting !== placeholderParents(sourceMarkup)) {
    return 'placeholders nested differently';
  }
  const stripped = translation.replace(new RegExp(PLACEHOLDER_SOURCE, 'g'), '');
  if (/[<>]/.test(stripped)) return 'contains raw angle brackets';
  const unknownEntity = stripped.match(
    /&(?!(?:amp|lt|gt|quot|nbsp|#39);)[#\w]+;/
  );
  if (unknownEntity) return `unsupported entity ${unknownEntity[0]}`;
  return null;
}
