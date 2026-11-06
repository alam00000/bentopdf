# Pixel PDF — دليل التعديلات

**الاسم:** `Pixel PDF` · **اسم الحزمة:** `pixel-pdf` · **النطاق:** `https://www.pixelpdf.com` (Placeholder، غيّره عبر `SITE_URL`).

ألوان الواجهة مأخوذة من الشعار المرفق:

| الرمز | القيمة | الاستخدام |
| --- | --- | --- |
| `--px-ink` | `#2b3446` | النصوص / كلمة Pixel |
| `--px-blue` | `#0e8bf5` | بداية التدرّج |
| `--px-indigo` | `#3a2bb0` | نهاية التدرّج |
| `--px-bg` | `#f5f7fb` | خلفية الصفحة |
| `--px-surface` | `#ffffff` | البطاقات |
| `--px-line` | `#dfe5f0` | الحدود |
| `--px-gradient` | `linear-gradient(120deg,#0e8bf5,#2567e8 48%,#3a2bb0)` | الأزرار / كلمة PDF |

---

## 1. `package.json` + `package-lock.json`

```json
{
  "name": "pixel-pdf",
  "private": true,
  "version": "2.8.11"
}
```

## 2. `public/site.webmanifest`

```json
{
  "id": "/",
  "name": "Pixel PDF",
  "short_name": "Pixel PDF",
  "description": "Pixel PDF - free online PDF tools. A privacy-first PDF toolkit that works 100% in your browser.",
  "background_color": "#f5f7fb",
  "theme_color": "#0e8bf5",
  "icons": [
    { "src": "/images/favicon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable any" },
    { "src": "/images/favicon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable any" },
    { "src": "/images/apple-touch-icon.png", "sizes": "180x180", "type": "image/png", "purpose": "any" }
  ]
}
```

## 3. `vite.config.ts`

```ts
const docsUrl =
  baseUrl === '/' && (command === 'serve' || process.env.INCLUDE_DOCS === 'true')
    ? '/docs/'
    : 'https://www.pixelpdf.com/docs';

server: {
  host: process.env.VITE_DEV_HOST || 'localhost',
  allowedHosts: process.env.VITE_DEV_ALLOWED_HOSTS
    ? process.env.VITE_DEV_ALLOWED_HOSTS.split(',')
    : true,
}
```

## 4. `src/partials/navbar.html` / `footer.html` / `navbar-simple.html` / `footer-simple.html`

```html
<img
  id="nav-logo"
  src="{{baseUrl}}{{#if brandLogo}}{{brandLogo}}{{else}}images/pixelpdf-icon.png{{/if}}"
  alt="{{#if brandName}}{{brandName}}{{else}}Pixel PDF{{/if}} Logo"
  class="h-8 w-8"
/>
<span id="nav-brand" class="px-brand text-xl ml-2">
  <a href="/"
    >{{#if brandName}}{{brandName}}{{else}}Pixel<span class="px-brand-accent">PDF</span>{{/if}}</a
  >
</span>
```

```html
<span id="footer-brand" class="px-brand text-xl">
  {{#if brandName}}{{brandName}}{{else}}Pixel<span class="px-brand-accent">PDF</span>{{/if}}
</span>
<!-- &copy; 2026 Pixel PDF. All rights reserved. -->
```

## 5. `src/css/pixel-theme.css` (ملف جديد، مستورد من `styles.css`)

```css
:root {
  --px-ink: #2b3446;
  --px-ink-soft: #5f6d87;
  --px-bg: #f5f7fb;
  --px-surface: #ffffff;
  --px-line: #dfe5f0;
  --px-blue: #0e8bf5;
  --px-indigo: #3a2bb0;
  --px-gradient: linear-gradient(120deg, #0e8bf5 0%, #2567e8 48%, #3a2bb0 100%);
}

html, body { background-color: var(--px-bg); color: var(--px-ink); }

/* تحويل كلاسات الواجهة الداكنة إلى ألوان الشعار الفاتحة */
.text-white:not([class*='bg-indigo']):not([class*='bg-blue']):not([class*='bg-gray-8']):not([class*='bg-black']) {
  color: var(--px-ink);
}

.bg-indigo-600, .bg-indigo-700, .btn-gradient, .lp-btn--primary {
  background-image: var(--px-gradient);
}

.px-brand { font-weight: 700; color: var(--px-ink); }
.px-brand-accent {
  margin-left: .18em;
  background: var(--px-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## 6. `src/css/styles.css`

```css
@import './pixel-theme.css';
@import 'tailwindcss';

@theme {
  /* مقلوب لأن الـ HTML كُتب أصلاً لواجهة داكنة */
  --color-gray-900: #f5f7fb;   /* خلفية الصفحة */
  --color-gray-800: #ffffff;   /* البطاقات */
  --color-gray-700: #d7deea;   /* الحدود */
  --color-gray-400: #5f6d87;   /* نص ثانوي */
  --color-gray-300: #42506b;   /* نص أساسي */
  --color-indigo-500: #0e8bf5;
  --color-indigo-600: #1167e6;
  --color-indigo-700: #2f3fc4;
  --color-black: #111a2e;
}

body { background-color: #f5f7fb; color: #3c4a63; }
```

## 7. `src/css/landing.css`

```css
body.lp {
  --lp-bg: #f5f7fb;
  --lp-bg-2: #ffffff;
  --lp-bg-3: #e2e8f4;
  --lp-line: rgba(43, 52, 70, 0.08);
  --lp-text: #2b3446;
  --lp-text-2: #4a5670;
  --lp-accent: #0e7bf0;
  --lp-accent-hover: #2f3fc4;
  --lp-white: #ffffff;
}

.lp-btn--primary, .lp-cell--accent {
  background-color: #0e8bf5;
  background-image: linear-gradient(120deg, #0e8bf5 0%, #2567e8 48%, #3a2bb0 100%);
}
```

## 8. `index.html` — الشعار الكامل فوق عنوان الـ Hero

```html
<div class="lp-hero-content">
  <img src="/images/pixelpdf-logo.png" alt="Pixel PDF" class="lp-hero-logo" />
  <h1 class="lp-h1">…</h1>
</div>
```

```html
<title>Pixel PDF - Free Online PDF Tools | Privacy-First PDF Toolkit</title>
<link rel="canonical" href="https://www.pixelpdf.com/" />
<meta property="og:site_name" content="Pixel PDF" />
<meta name="twitter:site" content="@PixelPDF" />
```

نفس الاستبدال طُبّق على `about.html`, `faq.html`, `contact.html`, `privacy.html`, `terms.html`,
`licensing.html`, `404.html`, `simple-index.html`, كل صفحات `src/pages/*.html`،
وكل ملفات `public/locales/**` و `translations/**` و `docs/**` و `blog/**`.

## 9. `public/images/favicon.svg` + `favicon-no-bg.svg` (جديد)

```svg
<linearGradient id="pixelGradient" x1="4" y1="2" x2="58" y2="62" gradientUnits="userSpaceOnUse">
  <stop offset="0" stop-color="#0E8BF5"/>
  <stop offset="0.52" stop-color="#2567E8"/>
  <stop offset="1" stop-color="#3A2BB0"/>
</linearGradient>
<rect width="64" height="64" rx="14" fill="#F5F7FB"/>
<g transform="translate(8, 8)" fill="url(#pixelGradient)"> … علامة الملف البكسلية … </g>
```

## 10. `src/js/workflow/serialization.ts` — ترحيل مفتاح التخزين المحلي

```ts
const TEMPLATES_KEY = 'pixel-pdf-workflow-templates';
const LEGACY_TEMPLATES_KEY = 'bento-pdf-workflow-templates'; // يُقرأ مرة واحدة ثم يُرحّل
```

## 11. الروابط المرنة

```bash
# .env.example
SITE_URL=https://www.pixelpdf.com
```

```js
// scripts/indexing-policy.mjs
export const OFFICIAL_SITE_URL = 'https://www.pixelpdf.com';
// scripts/generate-blog.mjs
const SITE_URL = (process.env.SITE_URL || 'https://www.pixelpdf.com').replace(/\/$/, '');
```

## 12. الأصول الجديدة / المُحدَّثة

```
public/images/pixelpdf-logo.png       الشعار الكامل (خلفية شفافة)
public/images/pixelpdf-icon.png       علامة الملف البكسلية
public/images/favicon.svg
public/images/favicon-no-bg.svg
public/images/favicon.png / favicon-192x192.png / favicon-512x512.png
public/images/apple-touch-icon.png
public/images/og-home.png / twitter-home.png
public/images/og-tools.png / og-pdf-*.png / pixelpdf-tools.png
public/favicon.ico
scripts/generate-pixel-brand-assets.sh   لإعادة توليد الأصول: bash scripts/generate-pixel-brand-assets.sh
unraid_pixelpdf.xml                      (كان unraid_bentopdf.xml)
```

## 13. ملاحظات

- كل روابط النطاق القديم صارت `pixelpdf.com` (canonical، OG، JSON-LD، sitemap، robots، CORS، funding…).
  النطاق Placeholder جاهز للتعديل من مكان واحد عبر `SITE_URL`.
- روابط مستودع GitHub الرئيسية صارت `https://github.com/mohammedalhinaki-cloud/Pixel-PDF`.
- **لم تُغيّر** المعرّفات التقنية للحزم المُضمّنة (`@bentopdf/gs-wasm`,
  `bentopdf-pdfium`, `bentopdf-viewer`, `bentopdf-airgap-bundle`) ولا روابط منتجات المنبع
  (`bentopdf-kura`, `bentopdf-hyper-compress`) ولا permalinks ريديت في الشهادات،
  لأن تغييرها يكسر البناء/الروابط الحقيقية.
- التحقق: `npx tsc --noEmit` ✅ · `npx vite build` ✅ · `npx vitest run` ✅ (1262 اختبار).
