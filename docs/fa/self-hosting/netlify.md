# استقرار روی Netlify

[Netlify](https://netlify.com) میزبانی عالی برای سایت‌های ایستا با یک طرح رایگان سخاوتمندانه ارائه می‌دهد.

## استقرار با یک کلیک

[![استقرار روی Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## استقرار دستی

### گام ۱: اتصال مخزن

1. وارد [Netlify](https://app.netlify.com) شوید
2. روی «Add new site» ← «Import an existing project» کلیک کنید
3. حساب GitHub خود را متصل کنید
4. فورک BentoPDF خود را انتخاب کنید

### گام ۲: پیکربندی تنظیمات ساخت

| تنظیم        | مقدار           |
| ------------ | --------------- |
| فرمان ساخت   | `npm run build` |
| پوشهٔ انتشار | `dist`          |
| نسخهٔ Node   | 18+             |

### گام ۳: استقرار

روی «Deploy site» کلیک کنید و منتظر ساخت بمانید.

## فایل پیکربندی

فایل `netlify.toml` را در ریشهٔ پروژه بسازید:

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
هدرهای `Cross-Origin-Embedder-Policy` و `Cross-Origin-Opener-Policy` برای تبدیل Word/ODT/Excel/PowerPoint به PDF لازم هستند. بدون آن‌ها، `SharedArrayBuffer` در دسترس نیست و موتور LibreOffice WASM راه‌اندازی نمی‌شود.

هدرهای `Content-Encoding: gzip` روی فایل‌های `.wasm.gz` و `.data.gz` به مرورگر می‌گویند آن‌ها را به‌طور خودکار از حالت فشرده خارج کند. بدون این هدرها، مرورگر بایت‌های خام gzip را دریافت می‌کند و کامپایل WASM شکست می‌خورد.
:::

## متغیرهای محیطی

این موارد را در Site settings ← Environment variables تنظیم کنید:

| متغیر                   | توضیح                                                    |
| ----------------------- | -------------------------------------------------------- |
| `SIMPLE_MODE`           | برای ساخت حداقلی روی `true` تنظیم کنید                   |
| `VITE_BRAND_NAME`       | نام برند سفارشی (جایگزین «BentoPDF»)                     |
| `VITE_BRAND_LOGO`       | مسیر لوگو نسبت به `public/` (مثلاً `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | متن سفارشی پاورقی/حق نشر                                 |
| `VITE_DEFAULT_LANGUAGE` | زبان پیش‌فرض رابط کاربری (مثلاً `fr`، `de`، `es`)        |

## دامنهٔ سفارشی

1. به Site settings ← Domain management بروید
2. روی «Add custom domain» کلیک کنید
3. دستورالعمل‌های پیکربندی DNS را دنبال کنید

## رسانه‌های بزرگ

برای فایل‌های بزرگ WASM، فعال کردن [Netlify Large Media](https://docs.netlify.com/large-media/overview/) را در نظر بگیرید:

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## عیب‌یابی

### تبدیل Word/ODT/Excel به PDF در ۵۵٪ متوقف می‌شود

اگر تبدیل اسناد در ۵۵٪ متوقف می‌شود، Console در DevTools را باز کنید و بررسی کنید:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

اگر `crossOriginIsolated` برابر `false` باشد، هدرهای COEP/COOP از `netlify.toml` شما اعمال نمی‌شوند. مطمئن شوید فایل در ریشهٔ پروژه است و دوباره مستقر کنید.

اگر در کنسول `expected magic word 00 61 73 6d, found 1f 8b 08 08` را می‌بینید، هدرهای `Content-Encoding: gzip` برای فایل‌های `.wasm.gz` وجود ندارد. مطمئن شوید بلوک‌های `[[headers]]` برای `soffice.wasm.gz` و `soffice.data.gz` در `netlify.toml` شما هستند.

### ساخت شکست می‌خورد

سازگاری نسخهٔ Node را بررسی کنید:

```toml
[build.environment]
  NODE_VERSION = "20"
```

### بارگذاری اولیهٔ کند

بهینه‌سازی دارایی‌ها را در Site settings ← Build & deploy ← Asset optimization فعال کنید.
