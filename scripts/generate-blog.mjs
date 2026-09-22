import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POSTS_DIR = path.resolve(__dirname, '../blog/posts');
const BLOG_DIR = path.resolve(__dirname, '../blog');
const SITE_URL = 'https://www.bentopdf.com';
const AUTHOR = {
  name: 'Alam',
  url: `${SITE_URL}/blog/author-alam`,
  image: `${SITE_URL}/images/author-alam.jpg`,
  profiles: [
    'https://github.com/alam00000',
    'https://www.linkedin.com/in/abdullah-alam01/',
    'https://x.com/alamdraws',
  ],
};

const LINK_CLASS = 'text-indigo-300 hover:text-indigo-400';

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function styleBody(html) {
  return html
    .replace(/<h2>/g, '<h2 class="text-2xl font-bold text-white mt-10 mb-4">')
    .replace(/<h3>/g, '<h3 class="text-xl font-semibold text-white mt-6 mb-2">')
    .replace(/<p>/g, '<p class="text-gray-300 leading-relaxed mb-5">')
    .replace(
      /<ol>/g,
      '<ol class="list-decimal list-inside text-gray-300 leading-relaxed mb-5 space-y-2">'
    )
    .replace(
      /<ul>/g,
      '<ul class="list-disc list-inside text-gray-300 leading-relaxed mb-5 space-y-2">'
    )
    .replace(
      /<a href="http/g,
      `<a rel="noopener" class="${LINK_CLASS}" href="http`
    )
    .replace(/<a href="\//g, `<a class="${LINK_CLASS}" href="/`);
}

function renderInline(markdown) {
  return styleBody(marked.parseInline(markdown));
}

function formatDate(iso) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function parsePost(file) {
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
  if (/[—–]/.test(raw)) {
    throw new Error(
      `${file}: contains an em or en dash, which the house style forbids`
    );
  }
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error(`${file}: missing JSON frontmatter between --- markers`);
  }
  let meta;
  try {
    meta = JSON.parse(match[1]);
  } catch (err) {
    throw new Error(`${file}: frontmatter is not valid JSON: ${err.message}`, {
      cause: err,
    });
  }
  for (const key of [
    'title',
    'h1',
    'description',
    'date',
    'breadcrumb',
    'card',
  ]) {
    if (!meta[key]) throw new Error(`${file}: frontmatter missing "${key}"`);
  }
  return { slug: file.replace(/\.md$/, ''), meta, body: match[2].trim() };
}

function plainText(markdown) {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*[-+]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function questionSections(body) {
  const sections = [];
  const parts = body.split(/^##\s+/m).slice(1);
  for (const part of parts) {
    const newline = part.indexOf('\n');
    const heading = (newline === -1 ? part : part.slice(0, newline)).trim();
    if (!heading.endsWith('?')) continue;
    const answer = plainText(newline === -1 ? '' : part.slice(newline + 1));
    if (!answer) continue;
    sections.push({ q: heading, a: answer.slice(0, 600) });
  }
  return sections;
}

function faqSchema(entries) {
  if (entries.length === 0) return '';
  return `
    <script type="application/ld+json">
      ${JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: entries.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: plainText(f.a) },
          })),
        },
        null,
        2
      )}
    </script>`;
}

function renderFaqs(faqs) {
  if (!faqs || faqs.length === 0) return '';
  const items = faqs
    .map(
      (f) => `        <details class="faq-d">
          <summary class="faq-d-q">${escapeHtml(f.q)}<i data-lucide="plus" class="faq-d-icon"></i></summary>
          <p class="faq-d-a">
            ${renderInline(f.a)}
          </p>
        </details>`
    )
    .join('\n');
  return `
      <h2 class="text-2xl font-bold text-white mt-10 mb-4">FAQ</h2>
      <div class="faq-list">
${items}
      </div>`;
}

function renderCta(cta) {
  if (!cta) return '';
  return `
      <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 my-10">
        <p class="text-white font-semibold mb-2">${escapeHtml(cta.heading)}</p>
        <p class="text-gray-400 mb-4">${escapeHtml(cta.text)}</p>
        <a
          href="${cta.href}"
          class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg"
          >${escapeHtml(cta.label)}</a
        >
      </div>`;
}

function renderPost({ slug, meta, body }) {
  const url = `${SITE_URL}/blog/${slug}`;
  const updated = meta.updated || meta.date;
  const bodyHtml = styleBody(marked.parse(body));
  const faqEntries =
    meta.faqs && meta.faqs.length > 0 ? meta.faqs : questionSections(body);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${escapeHtml(meta.ogTitle || meta.h1)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:image" content="${SITE_URL}/images/og-tools.png" />
    <meta property="og:site_name" content="BentoPDF" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="icon" type="image/svg+xml" href="/images/favicon.svg" />
    <link rel="icon" href="/favicon.ico" sizes="32x32" />
    <link href="/src/css/styles.css" rel="stylesheet" />
  </head>

  <body class="antialiased bg-gray-900">
    {{> navbar }}

    <article class="max-w-3xl mx-auto px-4 py-12">
      <nav
        class="flex items-center gap-2 text-sm text-gray-400 mb-6"
        aria-label="Breadcrumb"
      >
        <a href="/blog" class="hover:text-indigo-300">Blog</a>
        <i class="ph ph-caret-right text-xs" aria-hidden="true"></i>
        <span class="text-gray-300">${escapeHtml(meta.breadcrumb)}</span>
      </nav>

      <h1 class="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
        ${escapeHtml(meta.h1)}
      </h1>

      <div class="flex items-center gap-3 mb-10 text-sm text-gray-400">
        <img
          src="/images/author-alam.jpg"
          alt="${AUTHOR.name}"
          width="40"
          height="40"
          class="rounded-full"
        />
        <div>
          <a href="/blog/author-alam" class="text-gray-200 font-semibold hover:text-indigo-300">${AUTHOR.name}</a>,
          builds BentoPDF ·
          <time datetime="${meta.date}">${formatDate(meta.date)}</time>
        </div>
      </div>

${bodyHtml}
${renderCta(meta.cta)}
${renderFaqs(meta.faqs)}
    </article>

    {{> footer }}
    <script type="module" src="/src/js/utils/lucide-init.ts"></script>
    <script type="module" src="/src/js/mobileMenu.ts"></script>
    <script type="module">
      import '@phosphor-icons/web/regular';
    </script>

    <script type="application/ld+json">
      ${JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: meta.h1,
          description: meta.description,
          url,
          datePublished: meta.date,
          dateModified: updated,
          image: `${SITE_URL}/images/og-tools.png`,
          author: {
            '@type': 'Person',
            name: AUTHOR.name,
            url: AUTHOR.url,
            sameAs: AUTHOR.profiles,
          },
          publisher: {
            '@type': 'Organization',
            name: 'BentoPDF',
            url: SITE_URL,
          },
        },
        null,
        2
      )}
    </script>
    <script type="application/ld+json">
      ${JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Blog',
              item: `${SITE_URL}/blog/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: meta.breadcrumb,
              item: url,
            },
          ],
        },
        null,
        2
      )}
    </script>${faqSchema(faqEntries)}
  </body>
</html>
`;
}

function renderIndex(posts) {
  const cards = posts
    .map(
      ({ slug, meta }) => `        <a
          href="/blog/${slug}"
          class="block bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-indigo-500 transition-colors"
        >
          <h2 class="text-xl font-bold text-white mb-2">
            ${escapeHtml(meta.h1)}
          </h2>
          <p class="text-gray-400 mb-3">
            ${escapeHtml(meta.card)}
          </p>
          <span class="text-sm text-gray-500">${formatDate(meta.date)}</span>
        </a>`
    )
    .join('\n\n');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>The BentoPDF Blog | Privacy-First PDF Guides</title>
    <meta
      name="description"
      content="Guides and honest comparisons from the maintainer of BentoPDF: how PDF tools handle your files, and how to get things done without uploading them."
    />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${SITE_URL}/blog/" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${SITE_URL}/blog/" />
    <meta property="og:title" content="The BentoPDF Blog" />
    <meta
      property="og:description"
      content="Guides and honest comparisons from the maintainer of BentoPDF."
    />
    <meta property="og:image" content="${SITE_URL}/images/og-tools.png" />
    <meta property="og:site_name" content="BentoPDF" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="icon" type="image/svg+xml" href="/images/favicon.svg" />
    <link rel="icon" href="/favicon.ico" sizes="32x32" />
    <link href="/src/css/styles.css" rel="stylesheet" />
  </head>

  <body class="antialiased bg-gray-900">
    {{> navbar }}

    <section class="max-w-3xl mx-auto px-4 py-12">
      <h1 class="text-3xl md:text-4xl font-bold text-white mb-4">The BentoPDF Blog</h1>
      <p class="text-gray-300 leading-relaxed mb-2">
        I'm <a href="/blog/author-alam" class="${LINK_CLASS}">Alam</a>. I build
        BentoPDF and write about PDFs, how they work, and the weird things I
        run into along the way.
      </p>
    </section>

    <section class="max-w-3xl mx-auto px-4 pb-16">
      <div class="space-y-6">
${cards}
      </div>
    </section>

    {{> footer }}
    <script type="module" src="/src/js/utils/lucide-init.ts"></script>
    <script type="module" src="/src/js/mobileMenu.ts"></script>

    <script type="application/ld+json">
      ${JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'The BentoPDF Blog',
          url: `${SITE_URL}/blog/`,
          description:
            'Guides and honest comparisons from the maintainer of BentoPDF.',
          publisher: {
            '@type': 'Organization',
            name: 'BentoPDF',
            url: SITE_URL,
          },
        },
        null,
        2
      )}
    </script>
  </body>
</html>
`;
}

function generate() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.log('generate-blog: no blog/posts directory, skipping');
    return;
  }
  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort();
  const posts = files.map(parsePost);
  posts.sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1));

  const keep = new Set(['index.html', 'author-alam.html']);
  for (const post of posts) {
    fs.writeFileSync(
      path.join(BLOG_DIR, `${post.slug}.html`),
      renderPost(post)
    );
    keep.add(`${post.slug}.html`);
  }
  fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), renderIndex(posts));

  for (const entry of fs.readdirSync(BLOG_DIR)) {
    if (entry.endsWith('.html') && !keep.has(entry)) {
      fs.rmSync(path.join(BLOG_DIR, entry));
      console.log(`generate-blog: removed stale ${entry}`);
    }
  }

  console.log(
    `generate-blog: ${posts.length} posts + index generated from blog/posts/`
  );
}

generate();
