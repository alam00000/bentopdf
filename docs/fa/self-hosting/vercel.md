# استقرار روی Vercel

[Vercel](https://vercel.com) ساده‌ترین تجربهٔ استقرار را برای سایت‌های ایستا ارائه می‌دهد.

## استقرار با یک کلیک

[![استقرار با Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## استقرار دستی

### گام ۱: فورک کردن مخزن

مخزن [bentopdf/bentopdf](https://github.com/alam00000/bentopdf) را در حساب GitHub خود فورک کنید.

### گام ۲: وارد کردن به Vercel

1. به [vercel.com/new](https://vercel.com/new) بروید
2. مخزن فورک‌شدهٔ خود را انتخاب کنید
3. پروژه را پیکربندی کنید:

| تنظیم            | مقدار           |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### گام ۳: متغیرهای محیطی (اختیاری)

در صورت نیاز این موارد را اضافه کنید:

| متغیر                   | توضیح                                                    |
| ----------------------- | -------------------------------------------------------- |
| `SIMPLE_MODE`           | برای رابط کاربری حداقلی روی `true` تنظیم کنید            |
| `VITE_BRAND_NAME`       | نام برند سفارشی (جایگزین «BentoPDF»)                     |
| `VITE_BRAND_LOGO`       | مسیر لوگو نسبت به `public/` (مثلاً `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | متن سفارشی پاورقی/حق نشر                                 |
| `VITE_DEFAULT_LANGUAGE` | زبان پیش‌فرض رابط کاربری (مثلاً `fr`، `de`، `es`)        |

### گام ۴: استقرار

روی «Deploy» کلیک کنید و منتظر بمانید تا ساخت کامل شود.

## دامنهٔ سفارشی

1. به تنظیمات پروژه بروید
2. به بخش «Domains» بروید
3. دامنهٔ سفارشی خود را اضافه کنید
4. DNS را طبق دستورالعمل پیکربندی کنید

## محدودیت‌ها

::: warning فایل‌های بزرگ
توابع serverless در Vercel محدودیت ۵۰ مگابایت دارند. از آنجا که BentoPDF یک سایت ایستاست، این موضوع نباید بر شما اثر بگذارد، اما ماژول‌های WASM بزرگ هستند (در مجموع حدود ۱۰۰ مگابایت). مطمئن شوید که از پوشهٔ `/public` ارائه می‌شوند.
:::

## عیب‌یابی

### پایان زمان ساخت

اگر زمان ساخت به پایان می‌رسد، این را امتحان کنید:

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### خطای 404 هنگام تازه‌سازی

برای مسیریابی SPA یک فایل `vercel.json` اضافه کنید:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### تبدیل Word/ODT/Excel به PDF کار نمی‌کند

تبدیل‌های LibreOffice WASM به `SharedArrayBuffer` نیاز دارند که آن هم به این هدرهای پاسخ در همهٔ صفحات نیاز دارد:

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

فایل‌های از پیش فشرده‌شدهٔ `.wasm.gz` و `.data.gz` نیز به `Content-Encoding: gzip` نیاز دارند تا مرورگر آن‌ها را از حالت فشرده خارج کند.

این موارد را به `vercel.json` خود اضافه کنید:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Resource-Policy", "value": "cross-origin" }
      ]
    },
    {
      "source": "/libreoffice-wasm/soffice.wasm.gz",
      "headers": [
        { "key": "Content-Type", "value": "application/wasm" },
        { "key": "Content-Encoding", "value": "gzip" }
      ]
    },
    {
      "source": "/libreoffice-wasm/soffice.data.gz",
      "headers": [
        { "key": "Content-Type", "value": "application/octet-stream" },
        { "key": "Content-Encoding", "value": "gzip" }
      ]
    }
  ]
}
```

برای بررسی، Console در DevTools را باز کنید و `console.log(window.crossOriginIsolated)` را اجرا کنید؛ باید `true` برگرداند.
