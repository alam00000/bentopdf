# النشر على Cloudflare Pages

يوفر [Cloudflare Pages](https://pages.cloudflare.com) استضافة سريعة وعالمية للمواقع الثابتة مع نطاق ترددي غير محدود.

## نشر سريع

1. انتقل إلى [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. انقر على "Create a project"
3. اربط مستودع GitHub الخاص بك

## إعدادات البناء

| الإعداد                | القيمة          |
| ---------------------- | --------------- |
| Framework preset       | None            |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | `/`             |

## متغيرات البيئة

أضف هذه في Settings ← Environment variables:

| المتغير                 | القيمة                                     |
| ----------------------- | ------------------------------------------ |
| `NODE_VERSION`          | `18`                                       |
| `SIMPLE_MODE`           | `false` (اختياري)                          |
| `VITE_BRAND_NAME`       | اسم العلامة التجارية (اختياري)             |
| `VITE_BRAND_LOGO`       | مسار الشعار نسبةً إلى `public/` (اختياري)  |
| `VITE_FOOTER_TEXT`      | نص التذييل/حقوق النشر (اختياري)            |
| `VITE_DEFAULT_LANGUAGE` | لغة الواجهة الافتراضية، مثل `fr` (اختياري) |

## ملف الإعدادات

أنشئ `_headers` في مجلد `public`:

```
# Required security headers for SharedArrayBuffer (used by LibreOffice WASM)
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: cross-origin

# Pre-compressed LibreOffice WASM binary
/libreoffice-wasm/soffice.wasm.gz
  Content-Type: application/wasm
  Content-Encoding: gzip
  Cache-Control: public, max-age=31536000, immutable

# Pre-compressed LibreOffice WASM data
/libreoffice-wasm/soffice.data.gz
  Content-Type: application/octet-stream
  Content-Encoding: gzip
  Cache-Control: public, max-age=31536000, immutable

# Cache WASM files aggressively
/*.wasm
  Cache-Control: public, max-age=31536000, immutable
  Content-Type: application/wasm

# Service worker
/sw.js
  Cache-Control: no-cache
```

::: warning مهم
الترويستان `Cross-Origin-Embedder-Policy` و`Cross-Origin-Opener-Policy` مطلوبتان لتحويلات Word/ODT/Excel/PowerPoint إلى PDF. بدونهما لن يتوفر `SharedArrayBuffer` وسيفشل محرك LibreOffice WASM في التهيئة.
:::

أنشئ `_redirects` لتوجيه تطبيق الصفحة الواحدة (SPA):

```
/*    /index.html   200
```

## نطاق مخصص

1. انتقل إلى مشروع Pages الخاص بك
2. انقر على "Custom domains"
3. أضف نطاقك
4. سيضبط Cloudflare إعدادات DNS تلقائيًا إذا كان النطاق على Cloudflare

## المزايا

- **نطاق ترددي غير محدود ومجاني**
- **شبكة CDN عالمية** بأكثر من 300 موقع طرفي
- **HTTPS تلقائي**
- **عمليات نشر معاينة** لطلبات السحب
- **بناء سريع**

## استكشاف الأخطاء وإصلاحها

### رفع الملفات الكبيرة

يدعم Cloudflare Pages ملفات حتى 25 MB. يفترض أن تعمل وحدات WASM بدون مشكلة، لكن إذا وصلت إلى الحدود، فجرّب:

```bash
# Split large files during build
npm run build
```

### حدود حجم Worker

إذا كنت تستخدم Cloudflare Workers للتوجيه المتقدم، فانتبه إلى حد 1 MB في الخطط المجانية.

## Worker وكيل CORS (للتوقيعات الرقمية)

تتطلب أداة التوقيع الرقمي وكيل CORS لجلب سلاسل الشهادات. انشر الـ Worker المضمّن:

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### ميزات الأمان

| الميزة                   | الوصف                             |
| ------------------------ | --------------------------------- |
| **قيود الروابط**         | يُسمح بروابط الشهادات فقط         |
| **حد حجم الملف**         | حتى 10MB لكل طلب                  |
| **تحديد المعدل**         | 60 طلبًا/IP/دقيقة (يتطلب KV)      |
| **حظر عناوين IP الخاصة** | يحظر localhost والعناوين الداخلية |

### تفعيل تحديد المعدل

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### البناء مع رابط الوكيل

```bash
VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
```

أو باستخدام Docker:

```bash
export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
DOCKER_BUILDKIT=1 docker build \
  --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
  -t your-bentopdf .
```

> **ملاحظة:** راجع [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required) لإعداد توقيع HMAC.
