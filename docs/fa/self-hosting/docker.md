# استقرار با Docker / Podman

ساده‌ترین راه برای میزبانی شخصی BentoPDF در محیط production.

> [!IMPORTANT]
> **سرآیندهای لازم برای تبدیل فایل‌های Office**
>
> ابزارهای مبتنی بر LibreOffice (تبدیل Word، Excel، PowerPoint) برای پشتیبانی از `SharedArrayBuffer` به این سرآیندهای HTTP نیاز دارند:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> صفحه همچنین باید از یک بستر امن (secure context) ارائه شود. `http://localhost` برای آزمایش محلی کار می‌کند، اما `http://192.168.x.x` یا دیگر IPهای شبکهٔ محلی معمولاً واجد شرایط نیستند، بنابراین تبدیل Office روی HTTP ساده حتی با وجود سرآیندها شکست می‌خورد.
>
> ایمیج‌های رسمی کانتینر این سرآیندها را دارند. اگر از پراکسی معکوس (مانند Traefik، Caddy و غیره) استفاده می‌کنید، مطمئن شوید این سرآیندها حفظ یا اضافه می‌شوند و برای دسترسی غیر loopback از HTTPS استفاده کنید.

> [!TIP]
> **کاربران Podman:** همهٔ فرمان‌های `docker` با Podman کار می‌کنند؛ کافی است `docker` را با `podman` و `docker-compose` را با `podman-compose` جایگزین کنید.

## شروع سریع

> [!TIP]
> BentoPDF در دو نسخهٔ ساخت عرضه می‌شود:
>
> - **نسخهٔ میزبانی شخصی**: `ghcr.io/alam00000/bentopdf-simple:latest`. همهٔ ابزارهای PDF، **بدون** بخش‌های بازاریابی (بدون hero، پرسش‌های متداول، نظرات کاربران و پاصفحه). از این نسخه برای استقرارهای داخلی، تیمی و سازمانی استفاده کنید. این نسخه یک نسخهٔ «سبک» با قابلیت‌های کمتر **نیست**.
> - **نسخهٔ تجاری**: `ghcr.io/alam00000/bentopdf:latest`. سایت کامل بازاریابی که خود bentopdf.com و دارندگان مجوز تجاری برای استقرارهای عمومی از آن استفاده می‌کنند.
>
> اگر مطمئن نیستید: نسخهٔ میزبانی شخصی را دریافت کنید.

```bash
# Docker
docker run -d \
  --name bentopdf \
  -p 3000:8080 \
  --restart unless-stopped \
  ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d \
  --name bentopdf \
  -p 3000:8080 \
  ghcr.io/alam00000/bentopdf-simple:latest
```

## Docker Compose / Podman Compose

فایل `docker-compose.yml` را بسازید:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    container_name: bentopdf
    ports:
      - '3000:8080'
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:8080']
      interval: 30s
      timeout: 10s
      retries: 3
```

اجرا:

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## ساخت ایمیج شخصی

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

ساخت و اجرا:

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## متغیرهای محیطی

| متغیر                                | توضیح                                                                                                                                                                               | پیش‌فرض                                                        |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | ساخت نسخهٔ میزبانی شخصی (بخش‌های بازاریابی bentopdf.com، یعنی hero، پرسش‌های متداول، نظرات کاربران و پاصفحه را پنهان می‌کند). همهٔ ابزارهای PDF باقی می‌مانند.                      | `false`                                                        |
| `BASE_URL`                           | استقرار در زیرپوشه                                                                                                                                                                  | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | URL ماژول PyMuPDF WASM                                                                                                                                                              | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | URL ماژول Ghostscript WASM                                                                                                                                                          | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | URL ماژول CoherentPDF WASM                                                                                                                                                          | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | URL اسکریپت worker برای OCR                                                                                                                                                         | _(خالی؛ استفاده از CDN پیش‌فرض Tesseract.js)_                  |
| `VITE_TESSERACT_CORE_URL`            | پوشهٔ هستهٔ اجرایی OCR                                                                                                                                                              | _(خالی؛ استفاده از CDN پیش‌فرض Tesseract.js)_                  |
| `VITE_TESSERACT_LANG_URL`            | پوشهٔ traineddata برای OCR                                                                                                                                                          | _(خالی؛ استفاده از CDN پیش‌فرض Tesseract.js)_                  |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | زبان‌های OCR نمایش‌داده‌شده در رابط کاربری، جداشده با کاما                                                                                                                          | _(خالی؛ نمایش فهرست کامل)_                                     |
| `VITE_OCR_FONT_BASE_URL`             | پوشهٔ فونت‌های لایهٔ متنی OCR                                                                                                                                                       | _(خالی؛ استفاده از URLهای راه دور فونت Noto)_                  |
| `VITE_DEFAULT_LANGUAGE`              | زبان پیش‌فرض رابط کاربری                                                                                                                                                            | `en`                                                           |
| `VITE_BRAND_NAME`                    | نام برند سفارشی                                                                                                                                                                     | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | مسیر لوگو نسبت به `public/`                                                                                                                                                         | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | متن سفارشی پاصفحه یا کپی‌رایت                                                                                                                                                       | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | شناسه‌های ابزارهایی که پنهان می‌شوند، جداشده با کاما                                                                                                                                | _(خالی؛ همهٔ ابزارها فعال)_                                    |
| `DISABLE_GITHUB_STARS`               | از دریافت تعداد ستاره‌های GitHub هنگام بارگذاری صفحه صرف‌نظر می‌کند و `api.github.com` را از CSP حذف می‌کند. ساخت‌های Simple Mode همیشه از آن صرف‌نظر می‌کنند.                      | `false`                                                        |
| `SITE_URL`                           | URL عمومی که در پیوندهای canonical، hreflang و sitemap نوشته می‌شود. آن را روی پیش‌فرض نگه دارید، مگر اینکه بخواهید موتورهای جستجو استقرار شما را سایتی مستقل بدانند.               | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | با `SITE_URL` سفارشی، همهٔ صفحات `noindex` علامت‌گذاری می‌شوند تا نسخهٔ شما در نتایج جستجو با bentopdf.com رقابت نکند. برای اجازهٔ نمایه‌سازی به موتورهای جستجو، آن را `true` کنید. | `false`                                                        |

URLهای ماژول‌های WASM با پیش‌فرض‌های CDN از پیش پیکربندی شده‌اند؛ همهٔ قابلیت‌های پیشرفته بلافاصله کار می‌کنند. برای استقرارهای ایزوله یا میزبانی شخصی، این‌ها را بازنویسی کنید.

### موتورهای جستجو

به‌طور پیش‌فرض، همهٔ صفحات bentopdf.com را به‌عنوان نسخهٔ اصلی به موتورهای جستجو معرفی می‌کنند تا استقرار شما به‌صورت تکراری نمایش داده نشود. برای یک نمونهٔ خصوصی یا داخلی نیازی به تغییر چیزی نیست.

- **کاملاً بیرون نگه داشتن نمونهٔ شما از نتایج جستجو:** کانتینر را با `-e ROBOTS_NOINDEX=true` اجرا کنید. این فقط به راه‌اندازی مجدد نیاز دارد، نه ساخت دوباره.
- **تبدیل نمونهٔ شما به سایتی مستقل در نتایج جستجو:** با `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true` بسازید. بدون `ALLOW_INDEXING=true`، یک `SITE_URL` سفارشی همهٔ صفحات را `noindex` علامت‌گذاری می‌کند.

### Content-Security-Policy

ایمیج nginx با یک سرآیند `Content-Security-Policy` اجباری عرضه می‌شود. دستورهای `script-src`، `connect-src` و `font-src` در CSP **هنگام ساخت** از متغیرهای URL `VITE_*` بالا تولید می‌شوند؛ هر میزبانی که از طریق `--build-arg` بدهید به‌طور خودکار به سیاست افزوده می‌شود.

در نتیجه:

- اگر `VITE_CORS_PROXY_URL` یا `VITE_WASM_*_URL` را هنگام ساخت بازنویسی کنید، CSP به‌طور خودکار آن مبدأها را مجاز می‌کند؛ نیازی به پیکربندی اضافه نیست.
- برای URLهای روی `cdn.jsdelivr.net`، `script-src` فقط پوشهٔ دقیق بسته با نسخهٔ مشخص را مجاز می‌کند، برای مثال `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`، نه کل CDN را. jsDelivr هر بستهٔ عمومی npm یا مخزن GitHub را ارائه می‌کند، پس مجاز کردن کل میزبان به هر یک از آن‌ها اجازه می‌دهد روی نمونهٔ شما اجرا شوند. URLهای روی هر میزبان دیگر بر اساس مبدأ مجاز می‌شوند.
- اگر URLهای سفارشی WASM را در _زمان اجرا_ از طریق صفحهٔ «تنظیمات پیشرفته» درون برنامه پیکربندی کنید، آن مبدأها در CSP **نیستند** و مرورگر درخواست‌ها به آن‌ها را مسدود می‌کند. این برای نسخهٔ دیگری از همان بسته روی `cdn.jsdelivr.net` نیز صدق می‌کند، چون فقط نسخهٔ تنظیم‌شده هنگام ساخت مجاز است. پیکربندی زمان اجرا برای آزمایش در نظر گرفته شده است؛ برای URLهای سفارشی دائمی، build arg متناظر `VITE_*` را تنظیم کنید.
- در استقرارهای ایزوله‌ای که هر سه مقدار `VITE_WASM_*_URL` را بازنویسی می‌کنند، آن پوشه‌های بسته روی `cdn.jsdelivr.net` نیز از CSP حذف می‌شوند (هر پیش‌فرض جایگزین می‌شود، نه اینکه به آن افزوده شود). پیش‌فرض‌های Tesseract OCR روی `cdn.jsdelivr.net` تا زمانی که سه مقدار `VITE_TESSERACT_*` را نیز تنظیم نکنید در سیاست باقی می‌مانند. به همین ترتیب، تنظیم `VITE_CORS_PROXY_URL` جایگزین پیش‌فرض عمومی `bentopdf-cors-proxy.bentopdf.workers.dev` می‌شود.

CSP شامل `'unsafe-eval'` در `script-src` است، زیرا محیط اجرایی LibreOffice WASM (که ابزارهای تبدیل Word/Excel/PowerPoint از آن استفاده می‌کنند) و کتابخانهٔ تصویر wasm-vips (که PDF به TIFF از آن استفاده می‌کند) کد توزیع داخلی را از طریق `new Function()` کامپایل می‌کنند. حذف آن این ابزارها را از کار می‌اندازد. اگر در `SIMPLE_MODE` (بدون LibreOffice) می‌سازید و به PDF به TIFF نیاز ندارید، می‌توانید فایل تولیدشدهٔ `security-headers.conf` را دستی ویرایش کنید و برای سیاستی سخت‌گیرانه‌تر `'unsafe-eval'` را حذف کنید.

برای OCR، متغیرهای `VITE_TESSERACT_*` را خالی بگذارید تا از منابع آنلاین پیش‌فرض استفاده شود، یا برای OCR میزبانی‌شده یا آفلاین هر سه را با هم تنظیم کنید. بازنویسی‌های ناقص OCR رد می‌شوند، چون worker، هستهٔ اجرایی و پوشهٔ traineddata باید با هم سازگار باشند. برای خروجی PDF قابل‌جستجوی کاملاً آفلاین، `VITE_OCR_FONT_BASE_URL` را نیز تنظیم کنید تا فونت‌های لایهٔ متنی OCR به‌جای URLهای عمومی فونت Noto از سرور داخلی شما بارگذاری شوند.

`VITE_DEFAULT_LANGUAGE` زبان رابط کاربری را برای بازدیدکنندگان بار اول تعیین می‌کند. مقادیر پشتیبانی‌شده: `en`، `ar`، `be`، `fr`، `de`، `es`، `zh`، `zh-TW`، `vi`، `tr`، `id`، `it`، `pt`، `nl`، `da`. کاربران همچنان می‌توانند زبان را تغییر دهند؛ این فقط پیش‌فرض را تغییر می‌دهد.

مثال:

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### برندسازی سفارشی

لوگو، نام و متن پاصفحهٔ پیش‌فرض BentoPDF را با موارد خودتان جایگزین کنید. فایل لوگوی خود را در پوشهٔ `public/` قرار دهید (یا از یک تصویر موجود استفاده کنید)، سپس متغیرهای برندسازی را هنگام ساخت ارسال کنید:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

برندسازی هم در حالت کامل و هم در Simple Mode کار می‌کند و با همهٔ گزینه‌های دیگر زمان ساخت قابل ترکیب است.

### غیرفعال کردن ابزارهای مشخص

ابزارها را برای الزامات انطباق یا امنیتی از رابط کاربری پنهان کنید. ابزارهای غیرفعال از صفحهٔ اصلی، نتایج جستجو، میان‌برهای صفحه‌کلید و سازندهٔ گردش کار حذف می‌شوند. دسترسی مستقیم از طریق URL صفحهٔ «ابزار در دسترس نیست» را نشان می‌دهد.

شناسهٔ ابزار همان URL صفحه بدون `.html` است. برای مثال، اگر ابزار در `bentopdf.com/edit-pdf.html` باشد، شناسه `edit-pdf` است.

#### یافتن شناسهٔ ابزارها

ساده‌ترین راه: هر ابزاری را در BentoPDF باز کنید و به URL نگاه کنید. بخش آخر مسیر (بدون `.html`) شناسهٔ ابزار است.

<details>
<summary>فهرست کامل شناسه‌های ابزارها</summary>

**ویرایش و حاشیه‌نویسی:** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**تبدیل به PDF:** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**تبدیل از PDF:** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**سازماندهی و مدیریت:** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**بهینه‌سازی و تعمیر:** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**امنیت:** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### گزینهٔ ۱: زمان ساخت (Docker build arg)

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

این کار فهرست غیرفعال‌ها را در بستهٔ JavaScript قرار می‌دهد. تغییر آن به ساخت دوباره نیاز دارد.

#### گزینهٔ ۲: زمان اجرا (config.json)

یک فایل `config.json` را در پوشهٔ ارائه‌شده mount کنید؛ نیازی به ساخت دوباره نیست:

```json
{
  "disabledTools": ["edit-pdf", "sign-pdf", "encrypt-pdf"]
}
```

```bash
docker run -d \
  -p 3000:8080 \
  -v ./config.json:/usr/share/nginx/html/config.json:ro \
  ghcr.io/alam00000/bentopdf-simple:latest
```

یا با Docker Compose:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

هر دو روش قابل ترکیب هستند؛ فهرست‌ها ادغام می‌شوند. اگر ابزاری در هر یک از آن‌ها باشد، غیرفعال می‌شود.

#### غیرفعال کردن قابلیت‌های ویرایشگر

همچنین می‌توانید قابلیت‌های مشخصی را در ویرایشگر PDF (مثلاً حذف محتوای حساس، حاشیه‌نویسی‌ها، فرم‌ها) بدون غیرفعال کردن کل ابزار ویرایشگر غیرفعال کنید. `editorDisabledCategories` را به `config.json` خود اضافه کنید:

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>فهرست کامل دسته‌های ویرایشگر</summary>

**بزرگنمایی:** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**حاشیه‌نویسی:** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**اشکال:** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**فرم:** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**حذف محتوای حساس:** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**سند:** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**صفحه:** `page`, `spread`, `rotate`, `scroll`, `navigation`

**پنل:** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**ابزارها:** `tools`, `pan`, `pointer`, `capture`

**انتخاب:** `selection`, `selection-copy`

**تاریخچه:** `history`, `history-undo`, `history-redo`

</details>

دسته‌ها سلسله‌مراتبی هستند؛ غیرفعال کردن یک والد (مثلاً `annotation`) همهٔ فرزندان آن را غیرفعال می‌کند.

### غیرفعال کردن شمارندهٔ ستاره‌های GitHub

نوار ناوبری تعداد زندهٔ ستاره‌های GitHub را نشان می‌دهد که هنگام بارگذاری صفحه از `api.github.com` دریافت می‌شود. این تنها درخواست خارجی است که به یک قابلیت PDF مربوط نیست. آن را هنگام ساخت غیرفعال کنید تا کد دریافت از بسته حذف شود و `api.github.com` از Content-Security-Policy کنار گذاشته شود:

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

ساخت‌های Simple Mode (`bentopdf-simple`) همیشه از شمارندهٔ ستاره صرف‌نظر می‌کنند؛ این پرچم فقط در نسخهٔ تجاری یا ساخت‌های کامل سفارشی لازم است.

### URLهای سفارشی WASM (ایزوله / میزبانی شخصی)

> [!IMPORTANT]
> URLهای WASM **هنگام ساخت** در JavaScript قرار می‌گیرند. فایل‌های WASM در زمان اجرا توسط **مرورگر کاربر** دانلود می‌شوند؛ Docker آن‌ها را هنگام ساخت دانلود نمی‌کند. برای شبکه‌های ایزوله، باید فایل‌های WASM را روی یک سرور داخلی که مرورگرها به آن دسترسی دارند میزبانی کنید.

**روند کامل محیط ایزوله:**

```bash
# 1. On a machine WITH internet — download WASM packages
bash scripts/prepare-airgap.sh --list-ocr-languages
bash scripts/prepare-airgap.sh --search-ocr-language german

# 2. Download WASM/OCR packages
npm pack @bentopdf/pymupdf-wasm@0.11.14
npm pack @bentopdf/gs-wasm
npm pack coherentpdf
npm pack tesseract.js@7.0.0
npm pack tesseract.js-core@7.0.0
mkdir -p tesseract-langdata
curl -fsSL https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz -o tesseract-langdata/eng.traineddata.gz
mkdir -p ocr-fonts
curl -fsSL https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf -o ocr-fonts/NotoSans-Regular.ttf

# 3. Build the image with your internal server URLs
docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data \
  --build-arg VITE_TESSERACT_AVAILABLE_LANGUAGES=eng,deu \
  --build-arg VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts \
  -t bentopdf .

# 4. Export the image
docker save bentopdf -o bentopdf.tar

# 5. Transfer bentopdf.tar + the .tgz packages + tesseract-langdata/ + ocr-fonts/ into the air-gapped network

# 6. Inside the air-gapped network — load and run
docker load -i bentopdf.tar

# Extract WASM packages to your internal web server
mkdir -p /var/www/wasm/pymupdf /var/www/wasm/gs /var/www/wasm/cpdf /var/www/wasm/ocr/core /var/www/wasm/ocr/lang-data /var/www/wasm/ocr/fonts
tar xzf bentopdf-pymupdf-wasm-0.11.14.tgz -C /var/www/wasm/pymupdf --strip-components=1
tar xzf bentopdf-gs-wasm-*.tgz -C /var/www/wasm/gs --strip-components=1
tar xzf coherentpdf-*.tgz -C /var/www/wasm/cpdf --strip-components=1
TEMP_TESS=$(mktemp -d)
tar xzf tesseract.js-7.0.0.tgz -C "$TEMP_TESS"
cp "$TEMP_TESS/package/dist/worker.min.js" /var/www/wasm/ocr/worker.min.js
rm -rf "$TEMP_TESS"
tar xzf tesseract.js-core-7.0.0.tgz -C /var/www/wasm/ocr/core --strip-components=1
cp ./tesseract-langdata/*.traineddata.gz /var/www/wasm/ocr/lang-data/
cp ./ocr-fonts/* /var/www/wasm/ocr/fonts/

# Run BentoPDF
docker run -d -p 3000:8080 --restart unless-stopped bentopdf
```

برای `--ocr-languages` از کدهایی استفاده کنید که `bash scripts/prepare-airgap.sh --list-ocr-languages` چاپ می‌کند، یا با `bash scripts/prepare-airgap.sh --search-ocr-language <term>` بر اساس نام جستجو کنید. وقتی با زیرمجموعهٔ محدودی از زبان‌های OCR می‌سازید، همان کدها را به `VITE_TESSERACT_AVAILABLE_LANGUAGES` بدهید تا برنامه فقط زبان‌های همراه را نشان دهد. برای خروجی OCR کاملاً آفلاین، پوشهٔ همراه `ocr-fonts/` را نیز میزبانی کنید و `VITE_OCR_FONT_BASE_URL` را به آن اشاره دهید.

یک متغیر را با رشتهٔ خالی تنظیم کنید تا آن ماژول غیرفعال شود (کاربران باید آن را دستی از طریق «تنظیمات پیشرفته» پیکربندی کنند).

## پورت سفارشی

به‌طور پیش‌فرض، BentoPDF درون کانتینر روی پورت `8080` گوش می‌دهد. برای تغییر آن، متغیر محیطی `PORT` را در زمان اجرا تنظیم کنید:

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| متغیر  | توضیح                      | پیش‌فرض |
| ------ | -------------------------- | ------- |
| `PORT` | پورت شنود Nginx در کانتینر | `8080`  |

این با هر دو Dockerfile استاندارد و nonroot کار می‌کند.

## شناسهٔ کاربر سفارشی (PUID/PGID)

برای محیط‌هایی که اجرا با یک کاربر غیر root مشخص را لازم دارند (دستگاه‌های NAS، Kubernetes با security context، سیاست‌های سازمانی)، BentoPDF یک Dockerfile جداگانه با پشتیبانی PUID/PGID به سبک LSIO ارائه می‌دهد.

### ساخت و اجرا

```bash
# Build the non-root image
docker build -f Dockerfile.nonroot -t bentopdf-nonroot .

# Run with custom UID/GID
docker run -d \
  --name bentopdf \
  -p 3000:8080 \
  -e PUID=1000 \
  -e PGID=1000 \
  --restart unless-stopped \
  bentopdf-nonroot
```

### متغیرهای محیطی

| متغیر          | توضیح                  | پیش‌فرض |
| -------------- | ---------------------- | ------- |
| `PUID`         | شناسهٔ کاربر برای اجرا | `1000`  |
| `PGID`         | شناسهٔ گروه برای اجرا  | `1000`  |
| `PORT`         | پورت شنود Nginx        | `8080`  |
| `DISABLE_IPV6` | غیرفعال کردن شنود IPv6 | `false` |

### Docker Compose

```yaml
services:
  bentopdf:
    build:
      context: .
      dockerfile: Dockerfile.nonroot
    container_name: bentopdf
    ports:
      - '3000:8080'
    environment:
      - PUID=1000
      - PGID=1000
    restart: unless-stopped
```

### نحوهٔ کار

کانتینر با root شروع می‌شود، کاربری با PUID/PGID مشخص‌شده می‌سازد، مالکیت همهٔ پوشه‌های قابل‌نوشتن را تنظیم می‌کند و سپس با `su-exec` از دسترسی‌ها صرف‌نظر می‌کند. فرایند nginx کاملاً با کاربر مشخص‌شدهٔ شما اجرا می‌شود.

> [!NOTE]
> `Dockerfile` استاندارد از `nginx-unprivileged` (UID 101) استفاده می‌کند و برای بیشتر استقرارها توصیه می‌شود. فقط وقتی به UID/GID مشخصی نیاز دارید از `Dockerfile.nonroot` استفاده کنید.

> [!WARNING]
> PUID/PGID نمی‌تواند `0` (root) باشد. entrypoint ورودی‌ها را اعتبارسنجی می‌کند و برای مقادیر نامعتبر با خطا خارج می‌شود.

## با Traefik (پراکسی معکوس)

```yaml
services:
  traefik:
    image: traefik:v2.10
    command:
      - '--providers.docker=true'
      - '--entrypoints.web.address=:80'
      - '--entrypoints.websecure.address=:443'
      - '--certificatesresolvers.letsencrypt.acme.email=you@example.com'
      - '--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json'
      - '--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web'
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt

  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.bentopdf.rule=Host(`pdf.example.com`)'
      - 'traefik.http.routers.bentopdf.entrypoints=websecure'
      - 'traefik.http.routers.bentopdf.tls.certresolver=letsencrypt'
      - 'traefik.http.services.bentopdf.loadbalancer.server.port=8080'
      # Required headers for SharedArrayBuffer (LibreOffice WASM)
      - 'traefik.http.routers.bentopdf.middlewares=bentopdf-headers'
      - 'traefik.http.middlewares.bentopdf-headers.headers.customresponseheaders.Cross-Origin-Opener-Policy=same-origin'
      - 'traefik.http.middlewares.bentopdf-headers.headers.customresponseheaders.Cross-Origin-Embedder-Policy=require-corp'
    restart: unless-stopped
```

## با Caddy (پراکسی معکوس)

```yaml
services:
  caddy:
    image: caddy:2
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data

  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    restart: unless-stopped

volumes:
  caddy_data:
```

Caddyfile:

```
pdf.example.com {
    reverse_proxy bentopdf:8080
    header Cross-Origin-Opener-Policy "same-origin"
    header Cross-Origin-Embedder-Policy "require-corp"
}
```

## محدودیت منابع

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M
```

## Podman Quadlet (یکپارچگی با Systemd)

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) به شما امکان می‌دهد کانتینرهای Podman را به‌صورت سرویس‌های systemd اجرا کنید. این برای استقرارهای production روی سیستم‌های Linux ایدئال است.

### راه‌اندازی پایهٔ Quadlet

یک فایل واحد کانتینر در `~/.config/containers/systemd/bentopdf.container` (کاربر) یا `/etc/containers/systemd/bentopdf.container` (سیستم) بسازید:

```ini
[Unit]
Description=BentoPDF - Privacy-first PDF toolkit
After=network-online.target
Wants=network-online.target

[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry

[Service]
Restart=always
TimeoutStartSec=300

[Install]
WantedBy=default.target
```

### فعال‌سازی و شروع

```bash
# Reload systemd to detect new unit
systemctl --user daemon-reload

# Start the service
systemctl --user start bentopdf

# Enable on boot
systemctl --user enable bentopdf

# Check status
systemctl --user status bentopdf

# View logs
journalctl --user -u bentopdf -f
```

> [!TIP]
> برای استقرار در سطح سیستم، از `systemctl` بدون پرچم `--user` استفاده کنید و فایل را در `/etc/containers/systemd/` قرار دهید.

### Quadlet با بررسی سلامت

```ini
[Unit]
Description=BentoPDF with health monitoring
After=network-online.target
Wants=network-online.target

[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry
HealthCmd=wget --spider -q http://localhost:8080 || exit 1
HealthInterval=30s
HealthTimeout=10s
HealthRetries=3

[Service]
Restart=always
TimeoutStartSec=300

[Install]
WantedBy=default.target
```

### به‌روزرسانی خودکار با Quadlet

Podman می‌تواند هنگام در دسترس بودن ایمیج‌های جدید، کانتینرها را به‌طور خودکار به‌روز کند:

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### پیکربندی شبکهٔ Quadlet

برای پیکربندی شبکهٔ سفارشی، یک فایل شبکه به نام `bentopdf.network` بسازید:

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

سپس در فایل کانتینر خود به آن ارجاع دهید:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## به‌روزرسانی

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
