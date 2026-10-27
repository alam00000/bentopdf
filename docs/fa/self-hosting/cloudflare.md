# استقرار روی Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) میزبانی سریع و جهانی سایت‌های ایستا با پهنای باند نامحدود ارائه می‌دهد.

## استقرار سریع

1. به [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages) بروید
2. روی "Create a project" کلیک کنید
3. مخزن GitHub خود را متصل کنید

## پیکربندی ساخت

| تنظیم            | مقدار           |
| ---------------- | --------------- |
| Framework preset | None            |
| فرمان ساخت       | `npm run build` |
| پوشهٔ خروجی ساخت | `dist`          |
| پوشهٔ ریشه       | `/`             |

## متغیرهای محیطی

این‌ها را در Settings ← Environment variables اضافه کنید:

| متغیر                   | مقدار                                          |
| ----------------------- | ---------------------------------------------- |
| `NODE_VERSION`          | `18`                                           |
| `SIMPLE_MODE`           | `false` (اختیاری)                              |
| `VITE_BRAND_NAME`       | نام برند سفارشی (اختیاری)                      |
| `VITE_BRAND_LOGO`       | مسیر لوگو نسبت به `public/` (اختیاری)          |
| `VITE_FOOTER_TEXT`      | متن سفارشی پاصفحه یا کپی‌رایت (اختیاری)        |
| `VITE_DEFAULT_LANGUAGE` | زبان پیش‌فرض رابط کاربری، مثلاً `fr` (اختیاری) |

## فایل پیکربندی

فایل `_headers` را در پوشهٔ `public` خود بسازید:

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
سرآیندهای `Cross-Origin-Embedder-Policy` و `Cross-Origin-Opener-Policy` برای تبدیل Word/ODT/Excel/PowerPoint به PDF لازم هستند. بدون آن‌ها، `SharedArrayBuffer` در دسترس نیست و موتور LibreOffice WASM راه‌اندازی نمی‌شود.
:::

فایل `_redirects` را برای مسیریابی SPA بسازید:

```
/*    /index.html   200
```

## دامنهٔ سفارشی

1. به پروژهٔ Pages خود بروید
2. روی "Custom domains" کلیک کنید
3. دامنهٔ خود را اضافه کنید
4. اگر دامنه روی Cloudflare باشد، Cloudflare به‌طور خودکار DNS را پیکربندی می‌کند

## مزایا

- **پهنای باند نامحدود رایگان**
- **CDN جهانی** با بیش از ۳۰۰ نقطهٔ لبه
- **HTTPS خودکار**
- **استقرارهای پیش‌نمایش** برای pull requestها
- **ساخت سریع**

## عیب‌یابی

### بارگذاری فایل‌های بزرگ

Cloudflare Pages از فایل‌هایی تا ۲۵ مگابایت پشتیبانی می‌کند. ماژول‌های WASM باید مشکلی نداشته باشند، اما اگر به محدودیت برخوردید، این را در نظر بگیرید:

```bash
# Split large files during build
npm run build
```

### محدودیت اندازهٔ Worker

اگر از Cloudflare Workers برای مسیریابی پیشرفته استفاده می‌کنید، به محدودیت ۱ مگابایت در طرح‌های رایگان توجه کنید.

## Worker پراکسی CORS (برای امضاهای دیجیتال)

ابزار امضای دیجیتال برای دریافت زنجیرهٔ گواهی‌ها به یک پراکسی CORS نیاز دارد. worker همراه را مستقر کنید:

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### ویژگی‌های امنیتی

| ویژگی                    | توضیح                                       |
| ------------------------ | ------------------------------------------- |
| **محدودیت URL**          | فقط URLهای گواهی مجاز هستند                 |
| **محدودیت اندازهٔ فایل** | حداکثر 10MB برای هر درخواست                 |
| **محدودسازی نرخ**        | ۶۰ درخواست برای هر IP در دقیقه (نیازمند KV) |
| **مسدودسازی IP خصوصی**   | مسدود کردن localhost و IPهای داخلی          |

### فعال‌سازی محدودسازی نرخ

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### ساخت با URL پراکسی

```bash
VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
```

یا با Docker:

```bash
export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
DOCKER_BUILDKIT=1 docker build \
  --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
  -t your-bentopdf .
```

> **نکته:** برای راه‌اندازی امضای HMAC، [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required) را ببینید.
