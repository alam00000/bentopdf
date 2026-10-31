# النشر على Netlify

توفّر [Netlify](https://netlify.com) استضافة ممتازة للمواقع الثابتة مع خطة مجانية سخية.

## النشر بنقرة واحدة

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## النشر اليدوي

### الخطوة 1: ربط المستودع

1. سجّل الدخول إلى [Netlify](https://app.netlify.com)
2. انقر على "Add new site" ← "Import an existing project"
3. اربط حسابك على GitHub
4. اختر نسخة BentoPDF المتفرعة (fork) الخاصة بك

### الخطوة 2: ضبط إعدادات البناء

| الإعداد    | القيمة          |
| ---------- | --------------- |
| أمر البناء | `npm run build` |
| مجلد النشر | `dist`          |
| إصدار Node | 18+             |

### الخطوة 3: النشر

انقر على "Deploy site" وانتظر اكتمال البناء.

## ملف الإعداد

أنشئ `netlify.toml` في جذر مشروعك:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

# Required security headers for SharedArrayBuffer (used by LibreOffice WASM)
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Embedder-Policy = "require-corp"
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Resource-Policy = "cross-origin"

# Pre-compressed LibreOffice WASM binary - must be served with Content-Encoding
[[headers]]
  for = "/libreoffice-wasm/soffice.wasm.gz"
  [headers.values]
    Content-Type = "application/wasm"
    Content-Encoding = "gzip"
    Cache-Control = "public, max-age=31536000, immutable"

# Pre-compressed LibreOffice WASM data - must be served with Content-Encoding
[[headers]]
  for = "/libreoffice-wasm/soffice.data.gz"
  [headers.values]
    Content-Type = "application/octet-stream"
    Content-Encoding = "gzip"
    Cache-Control = "public, max-age=31536000, immutable"

# Cache other WASM files
[[headers]]
  for = "*.wasm"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Content-Type = "application/wasm"

# SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

::: warning مهم
ترويستا `Cross-Origin-Embedder-Policy` و`Cross-Origin-Opener-Policy` مطلوبتان لتحويلات Word/ODT/Excel/PowerPoint إلى PDF. بدونهما يصبح `SharedArrayBuffer` غير متاح وسيفشل محرك LibreOffice WASM في التهيئة.

تخبر الترويستان `Content-Encoding: gzip` الخاصتان بملفي `.wasm.gz` و`.data.gz` المتصفح بفك ضغطهما تلقائيًا. بدونهما يتلقى المتصفح بايتات gzip الخام وتفشل ترجمة WASM.
:::

## متغيرات البيئة

اضبطها في Site settings ← Environment variables:

| المتغير                 | الوصف                                                      |
| ----------------------- | ---------------------------------------------------------- |
| `SIMPLE_MODE`           | اضبطه على `true` لبناء مبسط                                |
| `VITE_BRAND_NAME`       | اسم العلامة التجارية المخصص (يحل محل "BentoPDF")           |
| `VITE_BRAND_LOGO`       | مسار الشعار نسبةً إلى `public/` (مثل `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | نص التذييل/حقوق النشر المخصص                               |
| `VITE_DEFAULT_LANGUAGE` | لغة الواجهة الافتراضية (مثل `fr` و`de` و`es`)              |

## نطاق مخصص

1. انتقل إلى Site settings ← Domain management
2. انقر على "Add custom domain"
3. اتبع تعليمات إعداد DNS

## الوسائط الكبيرة

بالنسبة إلى ملفات WASM الكبيرة، فكّر في تفعيل [Netlify Large Media](https://docs.netlify.com/large-media/overview/):

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## استكشاف الأخطاء وإصلاحها

### تحويل Word/ODT/Excel إلى PDF يتوقف عند 55%

إذا توقفت تحويلات المستندات عند 55%، فافتح وحدة تحكم DevTools وتحقق:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

إذا كانت قيمة `crossOriginIsolated` هي `false`، فإن ترويسات COEP/COOP من `netlify.toml` لا تُطبَّق. تأكد من أن الملف في جذر مشروعك وأعد النشر.

إذا ظهرت `expected magic word 00 61 73 6d, found 1f 8b 08 08` في وحدة التحكم، فإن ملفات `.wasm.gz` تفتقر إلى ترويسات `Content-Encoding: gzip`. تأكد من وجود كتل `[[headers]]` الخاصة بـ `soffice.wasm.gz` و`soffice.data.gz` في `netlify.toml`.

### فشل البناء

تحقق من توافق إصدار Node:

```toml
[build.environment]
  NODE_VERSION = "20"
```

### بطء التحميل الأولي

فعّل تحسين الأصول في Site settings ← Build & deploy ← Asset optimization.
