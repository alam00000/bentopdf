# راهنمای میزبانی شخصی

BentoPDF را می‌توان روی زیرساخت خودتان میزبانی کرد. این راهنما گزینه‌های مختلف استقرار را پوشش می‌دهد.

## شروع سریع با Docker / Podman

سریع‌ترین راه برای میزبانی شخصی BentoPDF:

> [!TIP]
> BentoPDF در دو نسخهٔ ساخت عرضه می‌شود:
>
> - **نسخهٔ میزبانی شخصی**: `ghcr.io/alam00000/bentopdf-simple:latest`. همهٔ ابزارهای PDF، **بدون** بخش‌های تبلیغاتی (بدون hero، پرسش‌های متداول، نظرات کاربران، پاورقی). از این نسخه برای استقرارهای داخلی، تیمی یا سازمانی استفاده کنید. این نسخه یک نسخهٔ «سبک» با امکانات کمتر **نیست**.
> - **نسخهٔ تجاری**: `ghcr.io/alam00000/bentopdf:latest`. سایت کامل تبلیغاتی که خود bentopdf.com و دارندگان مجوز تجاری برای استقرارهای عمومی از آن استفاده می‌کنند.
>
> اگر مطمئن نیستید: نسخهٔ میزبانی شخصی را دریافت کنید.

> [!IMPORTANT]
> تبدیل فایل‌های Office به `SharedArrayBuffer` نیاز دارد، یعنی برنامه باید هم جداسازی‌شده بین مبدأها (cross-origin isolated) باشد و هم از یک بستر امن ارائه شود. ایمیج رسمی از قبل هدرهای لازم COOP/COEP را ارسال می‌کند، اما مرورگرها همچنان `SharedArrayBuffer` را روی مبداهای HTTP ساده در شبکهٔ محلی مانند `http://192.168.x.x` غیرفعال می‌کنند.
>
> از `http://localhost` فقط برای آزمایش روی همان دستگاه استفاده کنید. اگر کاربران از طریق IP یا نام میزبان شبکهٔ محلی به BentoPDF دسترسی دارند، آن را با HTTPS ارائه کنید.

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

یا با Docker Compose / Podman Compose:

```yaml
# docker-compose.yml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    restart: unless-stopped
```

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Podman Quadlet (Linux Systemd)

BentoPDF را به‌عنوان یک سرویس systemd اجرا کنید. فایل `~/.config/containers/systemd/bentopdf.container` را بسازید:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry

[Service]
Restart=always

[Install]
WantedBy=default.target
```

```bash
systemctl --user daemon-reload
systemctl --user enable --now bentopdf
```

برای مستندات کامل Quadlet، [راهنمای استقرار با Docker](/fa/self-hosting/docker) را ببینید.

## ساخت از کد منبع

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## گزینه‌های پیکربندی

### نسخهٔ میزبانی شخصی (Simple Mode)

نسخهٔ میزبانی شخصی (ایمیج `bentopdf-simple` که Simple Mode هم نامیده می‌شود) از نظر عملکرد **کاملاً یکسان** با نسخهٔ تجاری است؛ همهٔ ابزارهای PDF وجود دارند و یکسان رفتار می‌کنند. این نسخه فقط بخش‌های تبلیغاتی را پنهان می‌کند که تنها روی خود bentopdf.com یا یک استقرار عمومی تجاری معنا دارند. **این نسخه یک نسخهٔ «سبک» یا با امکانات کمتر نیست.**

**آنچه نسخهٔ میزبانی شخصی پنهان می‌کند** (فقط ظاهری؛ هیچ قابلیت PDF حذف نمی‌شود):

- نوار پیمایش، بخش hero، بخش ویژگی‌ها، پرسش‌های متداول، نظرات کاربران، پاورقی
- عنوان صفحه را به «ابزارهای PDF» تغییر می‌دهد

**آنچه نسخهٔ میزبانی شخصی نگه می‌دارد** (هر چیزی که واقعاً کار PDF انجام می‌دهد):

- همهٔ ابزارهای PDF (ادغام، تقسیم، ویرایش، امضا، OCR، تبدیل Office و غیره)
- پشتیبانی از برندسازی سفارشی، همهٔ پیکربندی‌های زمان ساخت و زمان اجرا

نسخهٔ تجاری (`ghcr.io/alam00000/bentopdf:latest`) همان چیزی است که خود bentopdf.com را اجرا می‌کند و دارندگان مجوز تجاری برای استقرارهای عمومی از آن استفاده می‌کنند؛ این نسخه hero، پرسش‌های متداول، نظرات کاربران و پاورقی را اضافه می‌کند که برای یک ابزار داخلی معنایی ندارند.

اگر BentoPDF را برای تیم یا سازمان خود یا به‌عنوان یک ابزار داخلی میزبانی می‌کنید، نسخهٔ میزبانی شخصی را دریافت کنید:

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

برای جزئیات کامل [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md) را ببینید.

### نسخهٔ تجاری (استقرارهای عمومی با برند خودتان)

نسخهٔ تجاری (ایمیج `bentopdf`، بدون پسوند `-simple`) همان چیزی است که خود bentopdf.com را اجرا می‌کند. این نسخه علاوه بر همهٔ ابزارهای PDF، سایت کامل تبلیغاتی (hero، ویژگی‌ها، پرسش‌های متداول، نظرات کاربران، پاورقی) را دارد. وقتی می‌خواهید **BentoPDF را به‌عنوان یک سرویس عمومی PDF با برند خودتان مستقر کنید** از این نسخه استفاده کنید، برای مثال:

- BentoPDF را به‌عنوان یک SaaS میزبانی‌شده برای کاربران نهایی روی دامنهٔ خودتان اجرا می‌کنید
- تجربهٔ صفحهٔ فرود (بخش‌های تبلیغاتی + ابزارها) را می‌خواهید، نه فقط ابزارهای خالی
- دارندهٔ مجوز تجاری هستید و BentoPDF را در یک محصول تجاری جاسازی می‌کنید

**اجرای بدون تغییر** (با برند BentoPDF؛ برای پیش‌نمایش نسخه مفید است):

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**ساخت با برند خودتان** (گردش کار معمول تجاری):

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

همهٔ گزینه‌های دیگر زمان ساخت (`BASE_URL`، `VITE_DEFAULT_LANGUAGE`، `DISABLE_TOOLS`، بازنویسی URLهای WASM و غیره) دقیقاً مانند نسخهٔ میزبانی شخصی کار می‌کنند.

::: warning مجوز
اجرای نسخهٔ تجاری تحت هر یک از دو گزینهٔ مجوز BentoPDF مجاز است:

- **AGPL-3.0** (رایگان): مجاز است اگر استقرار شما کد منبع کامل خود را تحت AGPL منتشر کند، از جمله هرگونه تغییر برندسازی و منطق تجاری پیرامون آن.
- **مجوز تجاری** (۷۹ دلار مادام‌العمر): برای استقرارهای بسته یا اختصاصی لازم است که فورک برندسازی یا کد تجاری خود را متن‌باز نمی‌کنید.

برای مقایسهٔ کامل [صفحهٔ مجوزها](https://www.bentopdf.com/licensing) را ببینید. ماژول‌های WASM با مجوز AGPL (PyMuPDF، Ghostscript، CoherentPDF) در زمان اجرا از یک CDN بارگذاری می‌شوند، بنابراین وارد ایمیج شما نمی‌شوند و وضعیت مجوز شما را تغییر نمی‌دهند.
:::

### URL پایه

استقرار در یک زیرپوشه:

```bash
BASE_URL=/pdf-tools/ npm run build
```

### برندسازی سفارشی

لوگو، نام و متن پاورقی پیش‌فرض BentoPDF را در زمان ساخت با موارد خودتان جایگزین کنید:

| متغیر              | توضیح                                      | پیش‌فرض                                 |
| ------------------ | ------------------------------------------ | --------------------------------------- |
| `VITE_BRAND_NAME`  | نام برند نمایش‌داده‌شده در سرصفحه و پاورقی | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | مسیر لوگو نسبت به `public/`                | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | متن سفارشی پاورقی/حق نشر                   | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

یا از طریق Docker:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

برندسازی هم در حالت کامل و هم در Simple Mode کار می‌کند و می‌توان آن را با همهٔ گزینه‌های دیگر زمان ساخت (`BASE_URL`، `SIMPLE_MODE`، `VITE_DEFAULT_LANGUAGE`) ترکیب کرد.

### غیرفعال کردن ابزارهای خاص

ابزارهای جداگانه را برای انطباق یا امنیت پنهان کنید. ابزارهای غیرفعال از صفحهٔ اصلی، جستجو، میان‌برها، سازندهٔ گردش کار و دسترسی مستقیم با URL حذف می‌شوند.

شناسهٔ ابزارها همان URL صفحه بدون `.html` است؛ هر ابزاری را باز کنید و به URL نگاه کنید (مثلاً `edit-pdf`، `sign-pdf`، `encrypt-pdf`).

**زمان ساخت** (درون بسته قرار می‌گیرد):

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**زمان اجرا** (بدون نیاز به ساخت دوباره؛ یک `config.json` را mount کنید):

```json
{
  "disabledTools": ["edit-pdf", "sign-pdf"]
}
```

```bash
docker run -d -p 3000:8080 \
  -v ./config.json:/usr/share/nginx/html/config.json:ro \
  ghcr.io/alam00000/bentopdf-simple:latest
```

هر دو روش را می‌توان ترکیب کرد؛ فهرست‌ها با هم ادغام می‌شوند.

همچنین می‌توانید با افزودن `editorDisabledCategories` به `config.json`، قابلیت‌های خاصی را درون ویرایشگر PDF (مثلاً سانسور) غیرفعال کنید، بدون اینکه کل ابزار غیرفعال شود. برای فهرست کامل دسته‌ها [راهنمای Docker](/fa/self-hosting/docker#غیرفعال-کردن-قابلیت‌های-ویرایشگر) را ببینید.

## راهنماهای استقرار

پلتفرم خود را انتخاب کنید:

- [Vercel](/fa/self-hosting/vercel)
- [Netlify](/fa/self-hosting/netlify)
- [Cloudflare Pages](/fa/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/fa/self-hosting/aws)
- [Hostinger](/fa/self-hosting/hostinger)
- [Nginx](/fa/self-hosting/nginx)
- [Apache](/fa/self-hosting/apache)
- [Docker](/fa/self-hosting/docker)
- [Kubernetes](/fa/self-hosting/kubernetes)
- [پراکسی CORS](/fa/self-hosting/cors-proxy) - برای امضاهای دیجیتال لازم است

## مشکلات رایج

### تبدیل Word / ODT / Excel / PowerPoint به PDF متوقف می‌شود (SharedArrayBuffer در دسترس نیست)

**نشانه**: تبدیل‌های اسناد مبتنی بر LibreOffice (Word، ODT، Excel، PowerPoint به PDF) در حدود ۵۵٪ متوقف می‌شوند یا شروع نمی‌شوند. کنسول مرورگر ممکن است این را نشان دهد:

> `ReferenceError: SharedArrayBuffer is not defined`

…یا `window.crossOriginIsolated` مقدار `false` را گزارش می‌کند، یا کامپایل WASM خطای `expected magic word 00 61 73 6d, found 1f 8b 08 08` را می‌دهد.

**علت**: LibreOffice WASM به `SharedArrayBuffer` نیاز دارد که مرورگر فقط وقتی آن را فعال می‌کند که صفحه **جداسازی‌شده بین مبدأها (cross-origin isolated)** باشد و از یک **بستر امن** ارائه شود. یعنی دو شرط باید برقرار باشد:

1. هر پاسخ هر دو هدر را داشته باشد:
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. صفحه از `https://...` یا `http://localhost` ارائه شود. HTTP ساده روی IP شبکهٔ محلی (مثلاً `http://192.168.x.x`) امن به حساب نمی‌آید و مرورگرها `SharedArrayBuffer` را در آنجا غیرفعال می‌کنند.

ناسازگاری `00 61 73 6d / 1f 8b 08 08` یک نشانهٔ فرعی جداگانه است: فایل‌های از پیش فشرده‌شدهٔ `.wasm.gz` / `.data.gz` هدر پاسخ `Content-Encoding: gzip` را ندارند، بنابراین مرورگر به‌جای WASM از حالت فشرده خارج‌شده، بایت‌های خام gzip را دریافت می‌کند.

**راه‌حل**: برای پیکربندی دقیق، راهنمای استقرار پلتفرم خود را ببینید:

- [Nginx ←](/fa/self-hosting/nginx#تبدیل-word-odt-excel-به-pdf-کار-نمی‌کند)
- [Apache ←](/fa/self-hosting/apache#تبدیل-word-odt-excel-به-pdf-کار-نمی‌کند)
- [AWS S3 + CloudFront ←](/fa/self-hosting/aws#گام-۳b-سیاست-سرآیندهای-پاسخ-لازم-برای-libreoffice-wasm)
- [Cloudflare Pages ←](/fa/self-hosting/cloudflare#فایل-پیکربندی) (فایل `_headers`)
- [Netlify ←](/fa/self-hosting/netlify#تبدیل-word-odt-excel-به-pdf-در-۵۵٪-متوقف-می‌شود) (`netlify.toml`)
- [Vercel ←](/fa/self-hosting/vercel#تبدیل-word-odt-excel-به-pdf-کار-نمی‌کند) (`vercel.json`)
- [Hostinger ←](/fa/self-hosting/hostinger#ابزارهای-libreoffice-کار-نمی‌کنند) (`.htaccess`)
- [Kubernetes ←](/fa/self-hosting/kubernetes#اطمینان-از-کارکرد-هدرهای-sharedarraybuffer-ingress-gateway)
- **Docker**: به‌طور خودکار توسط پیکربندی nginx همراه انجام می‌شود؛ نیازی به اقدام نیست.

**بررسی**: Console در DevTools را روی هر صفحهٔ BentoPDF باز کنید و اجرا کنید:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

اگر صفحه HTTPS یا `http://localhost` باشد و هر دو هدر COEP/COOP روی همهٔ پاسخ‌ها وجود داشته باشند، هر دو بررسی موفق می‌شوند. اگر روی `http://192.168.x.x` یا مبدأ HTTP دیگری غیر از loopback هستید، آن را با HTTPS ارائه کنید؛ هیچ راه‌حلی فقط با هدر وجود ندارد.

### فایل‌های `.mjs` با `application/octet-stream` ارائه می‌شوند

**نشانه**: امضای PDF / پرکنندهٔ فرم / برخی ابزارهای دیگر نمایشگر خالی نشان می‌دهند یا بارگذاری نمی‌شوند. کنسول مرورگر گزارش می‌دهد:

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**علت**: وب‌سرور یا پراکسی معکوس شما نگاشت نوع MIME برای فایل‌های `.mjs` ندارد (نمایشگر PDF همراه، ماژول‌های ES را با این پسوند ارائه می‌دهد). بسیاری از پیکربندی‌های پیش‌فرض سرور برای پسوندهای ناشناخته از `application/octet-stream` استفاده می‌کنند که مرورگرها از اجرای آن به‌عنوان ماژول ES خودداری می‌کنند.

**راه‌حل**: برای قطعه‌کد دقیق، راهنمای استقرار پلتفرم خود را ببینید:

- [Nginx ←](/fa/self-hosting/nginx#امضای-pdf-یا-پرکنندهٔ-فرم-نمایشگر-خالی-نشان-می‌دهد-خطای-mime-برای-mjs)
- [Apache ←](/fa/self-hosting/apache#امضای-pdf-یا-پرکنندهٔ-فرم-نمایشگر-خالی-نشان-می‌دهد-خطای-mime-برای-mjs)
- [AWS S3 + CloudFront ←](/fa/self-hosting/aws#گام-۲-ساخت-و-بارگذاری) (`aws s3 cp ... --include "*.mjs"` را ببینید)
- [Kubernetes ←](/fa/self-hosting/kubernetes#خطاهای-نوع-mime-برای-mjs-خالی-بودن-iframe-امضای-pdf-پرکنندهٔ-فرم)
- **Docker، Vercel، Netlify، Cloudflare Pages، Hostinger**: به‌طور خودکار انجام می‌شود؛ نیازی به اقدام نیست.

**بررسی**: DevTools ← زبانهٔ Network را باز کنید، درخواست ناموفق `.mjs` را پیدا کنید و هدر پاسخ `Content-Type` را بررسی کنید. باید `application/javascript` باشد. اگر هنوز `application/octet-stream` است، ممکن است یک پراکسی معکوس بیرونی یا CDN نوع را دوباره تشخیص دهد؛ هر لایه از زنجیرهٔ ارائهٔ خود را بررسی کنید.

## پیکربندی WASM (اجزای AGPL)

BentoPDF کتابخانه‌های پردازشی با مجوز AGPL را در کد منبع خود **همراه نمی‌کند**، اما **URLهای CDN را از پیش پیکربندی می‌کند** تا همهٔ قابلیت‌ها بی‌درنگ کار کنند؛ نیازی به راه‌اندازی دستی نیست.

::: tip بدون پیکربندی به‌طور پیش‌فرض
از نسخهٔ v2.0.0، ماژول‌های WASM از طریق متغیرهای محیطی برای بارگذاری از CDN jsDelivr از پیش پیکربندی شده‌اند. همهٔ قابلیت‌های پیشرفته بدون هیچ پیکربندی از سوی کاربر بی‌درنگ کار می‌کنند.
:::

| جزء             | مجوز     | قابلیت‌ها                                             |
| --------------- | -------- | ----------------------------------------------------- |
| **PyMuPDF**     | AGPL-3.0 | تبدیل EPUB/MOBI/FB2/XPS، استخراج تصویر، استخراج جدول  |
| **Ghostscript** | AGPL-3.0 | تبدیل PDF/A، فشرده‌سازی، صاف‌کردن کجی، تبدیل به تصویر |
| **CoherentPDF** | AGPL-3.0 | فهرست مطالب، پیوست‌ها، ادغام PDF با نشانک‌ها          |

### متغیرهای محیطی پیش‌فرض

این‌ها در `.env.production` تنظیم شده‌اند و درون نسخهٔ ساخت قرار می‌گیرند:

```bash
VITE_WASM_PYMUPDF_URL=https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/
VITE_WASM_GS_URL=https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/
VITE_WASM_CPDF_URL=https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/
VITE_TESSERACT_WORKER_URL=
VITE_TESSERACT_CORE_URL=
VITE_TESSERACT_LANG_URL=
VITE_TESSERACT_AVAILABLE_LANGUAGES=
VITE_OCR_FONT_BASE_URL=
```

### بازنویسی URLهای WASM

می‌توانید پیش‌فرض‌ها را در زمان ساخت برای استقرارهای سفارشی بازنویسی کنید:

```bash
# Via Docker build args
docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://your-server.com/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://your-server.com/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://your-server.com/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://your-server.com/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://your-server.com/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://your-server.com/ocr/lang-data \
  --build-arg VITE_TESSERACT_AVAILABLE_LANGUAGES=eng,deu \
  --build-arg VITE_OCR_FONT_BASE_URL=https://your-server.com/ocr/fonts \
  -t bentopdf .

# Or via .env.production before building from source
VITE_WASM_PYMUPDF_URL=https://your-server.com/pymupdf/ npm run build
```

برای غیرفعال کردن کامل یک ماژول (نیاز به پیکربندی دستی کاربر از طریق تنظیمات پیشرفته)، متغیر آن را روی رشتهٔ خالی تنظیم کنید.

برای OCR، یا همهٔ متغیرهای `VITE_TESSERACT_*` را خالی بگذارید و از دارایی‌های آنلاین پیش‌فرض استفاده کنید، یا URLهای worker/core/lang را با هم برای OCR میزبانی‌شده یا آفلاین تنظیم کنید. اگر فقط زبان‌های OCR خاصی را همراه می‌کنید، `VITE_TESSERACT_AVAILABLE_LANGUAGES` را نیز روی همان کدهای جداشده با ویرگول تنظیم کنید تا رابط کاربری فقط زبان‌های نصب‌شده را پیشنهاد دهد و انتخاب‌های پشتیبانی‌نشده با خطای توصیفی شکست بخورند. برای خروجی PDF قابل جستجوی کاملاً آفلاین، `VITE_OCR_FONT_BASE_URL` را نیز روی پوشهٔ داخلی که قلم‌های OCR همراه را ارائه می‌دهد تنظیم کنید.

کاربران همچنین می‌توانند هر زمان این پیش‌فرض‌ها را از طریق **تنظیمات پیشرفته** در رابط کاربری بازنویسی کنند؛ بازنویسی‌های کاربر که در مرورگر ذخیره می‌شوند بر پیش‌فرض‌های محیطی اولویت دارند.

### استقرار ایزوله / آفلاین

برای شبکه‌های بدون دسترسی به اینترنت (دولتی، درمانی، مالی و غیره). URLهای WASM در **زمان ساخت** درون JavaScript قرار می‌گیرند؛ فایل‌های واقعی WASM در زمان اجرا توسط **مرورگر کاربر** دانلود می‌شوند. بنابراین باید همه چیز را روی دستگاهی با اینترنت آماده کنید و سپس به شبکهٔ ایزوله منتقل کنید.

#### اسکریپت خودکار (پیشنهادی)

اسکریپت همراه `prepare-airgap.sh` کل فرایند را خودکار می‌کند: دانلود بسته‌های WASM، ساخت ایمیج Docker و تولید یک بستهٔ مستقل همراه با اسکریپت راه‌اندازی.

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Show supported OCR language codes (for --ocr-languages)
bash scripts/prepare-airgap.sh --list-ocr-languages

# Search OCR language codes by name or abbreviation
bash scripts/prepare-airgap.sh --search-ocr-language german

# Interactive mode — prompts for all options
bash scripts/prepare-airgap.sh

# Or fully automated
bash scripts/prepare-airgap.sh --wasm-base-url https://internal.example.com/wasm
```

این یک پوشهٔ بسته تولید می‌کند:

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

بسته را از طریق USB، مخزن داخلی آرتیفکت یا روش تأییدشده به شبکهٔ ایزوله منتقل کنید. سپس اسکریپت راه‌اندازی همراه را اجرا کنید:

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

اسکریپت راه‌اندازی ایمیج Docker را بارگذاری می‌کند، فایل‌های WASM را استخراج می‌کند و در صورت تمایل کانتینر را اجرا می‌کند.

**گزینه‌های اسکریپت:**

| پرچم                           | توضیح                                                            | پیش‌فرض                                |
| ------------------------------ | ---------------------------------------------------------------- | -------------------------------------- |
| `--wasm-base-url <url>`        | محل میزبانی داخلی WASMها                                         | _(الزامی، در صورت نبود پرسیده می‌شود)_ |
| `--image-name <name>`          | برچسب ایمیج Docker                                               | `bentopdf`                             |
| `--output-dir <path>`          | پوشهٔ خروجی بسته                                                 | `./bentopdf-airgap-bundle`             |
| `--simple-mode`                | فعال کردن Simple Mode                                            | خاموش                                  |
| `--base-url <path>`            | URL پایهٔ زیرپوشه (مثلاً `/pdf/`)                                | `/`                                    |
| `--language <code>`            | زبان پیش‌فرض رابط کاربری (مثلاً `fr`، `de`)                      | _(هیچ)_                                |
| `--brand-name <name>`          | نام برند سفارشی                                                  | _(هیچ)_                                |
| `--brand-logo <path>`          | مسیر لوگو نسبت به `public/`                                      | _(هیچ)_                                |
| `--footer-text <text>`         | متن سفارشی پاورقی                                                | _(هیچ)_                                |
| `--ocr-languages <list>`       | زبان‌های OCR برای همراه کردن، جداشده با ویرگول                   | `eng`                                  |
| `--list-ocr-languages`         | چاپ کدها و نام‌های OCR پشتیبانی‌شده و سپس خروج                   | خاموش                                  |
| `--search-ocr-language <term>` | جستجوی کدهای OCR بر اساس نام یا اختصار                           | خاموش                                  |
| `--dockerfile <path>`          | Dockerfile مورد استفاده                                          | `Dockerfile`                           |
| `--skip-docker`                | رد شدن از ساخت و خروجی گرفتن Docker                              | خاموش                                  |
| `--skip-wasm`                  | رد شدن از دانلود WASM (استفادهٔ دوباره از فایل‌های `.tgz` موجود) | خاموش                                  |

ورودی تعاملی همچنین `list` را برای چاپ فهرست کامل کدهای پشتیبانی‌شدهٔ Tesseract و `search <term>` را برای یافتن موارد منطبق مانند `search german` یا `search chi` می‌پذیرد.

::: warning الزام هم‌مبدأ بودن
فایل‌های WASM باید از **همان مبدأ** برنامهٔ BentoPDF ارائه شوند. Web Workerها از `importScripts()` استفاده می‌کنند که نمی‌تواند اسکریپت‌ها را از مبدأ دیگری بارگذاری کند. برای مثال، اگر BentoPDF روی `https://internal.example.com` اجرا می‌شود، URL پایه برای WASM نیز باید `https://internal.example.com/wasm` باشد.
:::

#### گام‌های دستی

<details>
<summary>اگر ترجیح می‌دهید بدون اسکریپت و به‌صورت دستی انجام دهید</summary>

**گام ۱: دانلود بسته‌های WASM و OCR** (روی دستگاهی با اینترنت)

```bash
npm pack @bentopdf/pymupdf-wasm@0.11.14
npm pack @bentopdf/gs-wasm
npm pack coherentpdf
npm pack tesseract.js@7.0.0
npm pack tesseract.js-core@7.0.0
mkdir -p tesseract-langdata
curl -fsSL https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz -o tesseract-langdata/eng.traineddata.gz
mkdir -p ocr-fonts
curl -fsSL https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf -o ocr-fonts/NotoSans-Regular.ttf
```

**گام ۲: ساخت ایمیج Docker با URLهای داخلی**

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data \
  --build-arg VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts \
  -t bentopdf .
```

**گام ۳: خروجی گرفتن از ایمیج Docker**

```bash
docker save bentopdf -o bentopdf.tar
```

**گام ۴: انتقال به شبکهٔ ایزوله**

از طریق USB، مخزن داخلی آرتیفکت یا روش انتقال تأییدشده کپی کنید:

- `bentopdf.tar`: ایمیج Docker
- پنج بستهٔ `.tgz` مربوط به WASM/OCR از گام ۱
- پوشهٔ `tesseract-langdata/` از گام ۱
- پوشهٔ `ocr-fonts/` از گام ۱

**گام ۵: راه‌اندازی درون شبکهٔ ایزوله**

```bash
# Load the Docker image
docker load -i bentopdf.tar

# Extract WASM packages
mkdir -p ./wasm/pymupdf ./wasm/gs ./wasm/cpdf ./wasm/ocr/core ./wasm/ocr/lang-data ./wasm/ocr/fonts
tar xzf bentopdf-pymupdf-wasm-0.11.14.tgz -C ./wasm/pymupdf --strip-components=1
tar xzf bentopdf-gs-wasm-*.tgz -C ./wasm/gs --strip-components=1
tar xzf coherentpdf-*.tgz -C ./wasm/cpdf --strip-components=1
TEMP_TESS=$(mktemp -d)
tar xzf tesseract.js-7.0.0.tgz -C "$TEMP_TESS"
cp "$TEMP_TESS/package/dist/worker.min.js" ./wasm/ocr/worker.min.js
rm -rf "$TEMP_TESS"
tar xzf tesseract.js-core-7.0.0.tgz -C ./wasm/ocr/core --strip-components=1
cp ./tesseract-langdata/*.traineddata.gz ./wasm/ocr/lang-data/
cp ./ocr-fonts/* ./wasm/ocr/fonts/

# Run BentoPDF
docker run -d -p 3000:8080 --restart unless-stopped bentopdf
```

مطمئن شوید فایل‌ها در URLهایی که در گام ۲ پیکربندی کردید در دسترس هستند، از جمله `.../ocr/worker.min.js`، `.../ocr/core`، `.../ocr/lang-data` و `.../ocr/fonts`.

</details>

::: info به‌جای Docker از کد منبع می‌سازید؟
پیش از اجرای `npm run build`، متغیرها را در `.env.production` تنظیم کنید:

```bash
VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/
VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/
VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/
VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js
VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core
VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data
VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts
```

:::

### میزبانی پراکسی WASM خودتان

اگر لازم است فایل‌های WASM با مجوز AGPL را با هدرهای CORS مناسب ارائه کنید، می‌توانید یک پراکسی ساده مستقر کنید. برای نمونه پیاده‌سازی، [راهنمای Cloudflare WASM Proxy](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md) را ببینید.

::: tip چرا جداگانه؟
این جداسازی تضمین می‌کند:

- انطباق حقوقی روشن برای کاربران تجاری
- هستهٔ BentoPDF تحت مجوز دوگانهٔ خود (AGPL-3.0 / تجاری) باقی می‌ماند
- فایل‌های WASM در زمان اجرا بارگذاری می‌شوند، نه اینکه در کد منبع همراه شوند
  :::

## نیازمندی‌های سیستم

| نیازمندی        | حداقل                                       |
| --------------- | ------------------------------------------- |
| فضای ذخیره‌سازی | حدود ۱۰۰ مگابایت (هسته بدون ماژول‌های AGPL) |
| RAM             | ۵۱۲ مگابایت                                 |
| CPU             | هر پردازندهٔ مدرن                           |

::: tip
BentoPDF یک سایت ایستاست؛ به هیچ پایگاه داده یا سرور بک‌اندی نیاز نیست!
:::
