# النشر باستخدام Docker / Podman

أسهل طريقة لاستضافة BentoPDF ذاتيًا في بيئة إنتاج.

> [!IMPORTANT]
> **الترويسات المطلوبة لتحويل ملفات Office**
>
> تتطلب الأدوات المعتمدة على LibreOffice (تحويل Word وExcel وPowerPoint) ترويسات HTTP هذه لدعم `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> يجب أيضًا تقديم الصفحة من سياق آمن. يعمل `http://localhost` للاختبار المحلي، لكن `http://192.168.x.x` أو غيره من عناوين الشبكة المحلية لا يُعد مؤهلًا عادةً، لذا سيفشل تحويل Office عبر HTTP العادي حتى لو كانت الترويسات موجودة.
>
> تتضمن صور الحاويات الرسمية هذه الترويسات. إذا كنت تستخدم وكيلًا عكسيًا (Traefik أو Caddy وغيرهما)، فتأكد من الحفاظ على هذه الترويسات أو إضافتها، واستخدم HTTPS للوصول من غير عنوان الحلقة المحلية.

> [!TIP]
> **مستخدمو Podman:** تعمل جميع أوامر `docker` مع Podman باستبدال `docker` بـ `podman` و`docker-compose` بـ `podman-compose`.

## بداية سريعة

> [!TIP]
> يتوفر BentoPDF بنسختين:
>
> - **نسخة الاستضافة الذاتية**: `ghcr.io/alam00000/bentopdf-simple:latest`. جميع أدوات PDF، **بدون** عناصر التسويق (بلا واجهة رئيسية أو أسئلة شائعة أو آراء مستخدمين أو تذييل). استخدمها لعمليات النشر الداخلية وللفرق والمؤسسات. وهي **ليست** نسخة "مخففة" بميزات أقل.
> - **النسخة التجارية**: `ghcr.io/alam00000/bentopdf:latest`. موقع التسويق الكامل، ويستخدمه bentopdf.com نفسه وأصحاب التراخيص التجارية الذين ينشرون خدمات موجهة للعامة.
>
> إذا كنت غير متأكد: استخدم نسخة الاستضافة الذاتية.

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

أنشئ `docker-compose.yml`:

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

شغّل:

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## بناء صورتك الخاصة

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

ابنِ وشغّل:

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## متغيرات البيئة

| المتغير                              | الوصف                                                                                                                                                | الافتراضي                                                      |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | بناء نسخة الاستضافة الذاتية (تخفي عناصر تسويق bentopdf.com: الواجهة الرئيسية والأسئلة الشائعة وآراء المستخدمين والتذييل). تبقى جميع أدوات PDF.       | `false`                                                        |
| `BASE_URL`                           | النشر في مجلد فرعي                                                                                                                                   | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | عنوان وحدة PyMuPDF WASM                                                                                                                              | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | عنوان وحدة Ghostscript WASM                                                                                                                          | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | عنوان وحدة CoherentPDF WASM                                                                                                                          | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | عنوان سكربت عامل OCR                                                                                                                                 | _(فارغ؛ يستخدم CDN الافتراضي لـ Tesseract.js)_                 |
| `VITE_TESSERACT_CORE_URL`            | مجلد بيئة OCR الأساسية                                                                                                                               | _(فارغ؛ يستخدم CDN الافتراضي لـ Tesseract.js)_                 |
| `VITE_TESSERACT_LANG_URL`            | مجلد traineddata الخاص بـ OCR                                                                                                                        | _(فارغ؛ يستخدم CDN الافتراضي لـ Tesseract.js)_                 |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | لغات OCR المعروضة في الواجهة، مفصولة بفواصل                                                                                                          | _(فارغ؛ عرض الفهرس الكامل)_                                    |
| `VITE_OCR_FONT_BASE_URL`             | مجلد خطوط الطبقة النصية لـ OCR                                                                                                                       | _(فارغ؛ يستخدم روابط خطوط Noto البعيدة)_                       |
| `VITE_DEFAULT_LANGUAGE`              | لغة الواجهة الافتراضية                                                                                                                               | `en`                                                           |
| `VITE_BRAND_NAME`                    | اسم العلامة التجارية المخصص                                                                                                                          | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | مسار الشعار نسبةً إلى `public/`                                                                                                                      | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | نص التذييل/حقوق النشر المخصص                                                                                                                         | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | معرّفات الأدوات المراد إخفاؤها، مفصولة بفواصل                                                                                                        | _(فارغ؛ جميع الأدوات مفعّلة)_                                  |
| `DISABLE_GITHUB_STARS`               | تخطي جلب عدد نجوم GitHub عند تحميل الصفحة وحذف `api.github.com` من CSP. عمليات بناء Simple Mode تتخطاه دائمًا.                                       | `false`                                                        |
| `SITE_URL`                           | العنوان العام المكتوب في روابط canonical وhreflang وخريطة الموقع. اتركه على الافتراضي ما لم تكن تريد أن تعامل محركات البحث نشرك كموقع مستقل.         | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | مع `SITE_URL` مخصص، توضع على كل صفحة علامة `noindex` لكي لا تنافس نسختك bentopdf.com في نتائج البحث. اضبطه على `true` للسماح لمحركات البحث بفهرستها. | `false`                                                        |

عناوين وحدات WASM مُعدّة مسبقًا بقيم CDN افتراضية، فتعمل جميع الميزات المتقدمة مباشرة. غيّرها في عمليات النشر المعزولة عن الإنترنت أو المستضافة ذاتيًا.

### محركات البحث

افتراضيًا، تشير كل صفحة محركات البحث إلى bentopdf.com بوصفه الأصل، فلا يظهر نشرك كنسخة مكررة. لا تحتاج إلى تغيير أي شيء لنسخة خاصة أو داخلية.

- **إبقاء نسختك خارج نتائج البحث تمامًا:** شغّل الحاوية مع `-e ROBOTS_NOINDEX=true`. يتطلب هذا إعادة تشغيل فقط، وليس إعادة بناء.
- **جعل نسختك موقعًا مستقلًا في نتائج البحث:** ابنِ مع `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true`. بدون `ALLOW_INDEXING=true`، يضع `SITE_URL` المخصص وسم `noindex` على كل صفحة.

### Content-Security-Policy

تأتي صورة nginx مع ترويسة `Content-Security-Policy` مُفعَّلة. توجيهات `script-src` و`connect-src` و`font-src` في CSP **تُولَّد وقت البناء** من متغيرات الروابط `VITE_*` أعلاه، وأي مضيفات تمررها عبر `--build-arg` تُضاف تلقائيًا إلى السياسة.

ونتيجة لذلك:

- إذا غيّرت `VITE_CORS_PROXY_URL` أو `VITE_WASM_*_URL` وقت البناء، تسمح CSP بهذه المصادر تلقائيًا، دون إعداد إضافي.
- بالنسبة للروابط على `cdn.jsdelivr.net`، يسمح `script-src` بمجلد الحزمة المُرقَّم بدقة فقط، مثل `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`، وليس بكامل CDN. تقدّم jsDelivr أي حزمة npm عامة أو مستودع GitHub، فالسماح بالمضيف كاملًا سيتيح تشغيلها كلها على نسختك. أما الروابط على أي مضيف آخر فيُسمح بها حسب المصدر.
- إذا ضبطت عناوين WASM مخصصة _وقت التشغيل_ عبر صفحة الإعدادات المتقدمة داخل التطبيق، فهذه المصادر **ليست** في CSP وسيحظر المتصفح الجلب منها. وينطبق ذلك أيضًا على إصدار مختلف من الحزمة نفسها على `cdn.jsdelivr.net`، لأن الإصدار المضبوط وقت البناء وحده مسموح. الضبط وقت التشغيل مخصص للتجربة؛ وللعناوين المخصصة الدائمة اضبط معامل البناء `VITE_*` المطابق.
- في عمليات النشر المعزولة عن الإنترنت التي تغيّر قيم `VITE_WASM_*_URL` الثلاث جميعها، تُزال أيضًا مجلدات حزم `cdn.jsdelivr.net` تلك من CSP (يُستبدل كل افتراضي ولا يُضاف إليه). وتبقى القيم الافتراضية لـ Tesseract OCR على `cdn.jsdelivr.net` في السياسة حتى تضبط أيضًا قيم `VITE_TESSERACT_*` الثلاث. وبالمثل، فإن ضبط `VITE_CORS_PROXY_URL` يستبدل الافتراضي العام `bentopdf-cors-proxy.bentopdf.workers.dev`.

تتضمن CSP القيمة `'unsafe-eval'` في `script-src` لأن بيئة LibreOffice WASM (المستخدمة في أدوات تحويل Word/Excel/PowerPoint) ومكتبة الصور wasm-vips (المستخدمة في PDF إلى TIFF) تجمّعان شيفرة توزيع داخلية عبر `new Function()`. إزالتها ستعطّل هذه الأدوات. إذا بنيت بوضع `SIMPLE_MODE` (بدون LibreOffice) ولا تحتاج PDF إلى TIFF، فيمكنك تعديل ملف `security-headers.conf` المُولَّد يدويًا لحذف `'unsafe-eval'` والحصول على سياسة أكثر صرامة.

بالنسبة لـ OCR، اترك متغيرات `VITE_TESSERACT_*` فارغة لاستخدام الأصول الافتراضية عبر الإنترنت، أو اضبطها الثلاثة معًا لـ OCR المستضاف ذاتيًا أو بدون اتصال. تُرفض التغييرات الجزئية لإعدادات OCR لأن العامل والبيئة الأساسية ومجلد traineddata يجب أن تتطابق. وللحصول على ملف PDF قابل للبحث بالكامل دون اتصال، اضبط أيضًا `VITE_OCR_FONT_BASE_URL` لكي تُحمَّل خطوط الطبقة النصية الخاصة بـ OCR من خادمك الداخلي بدل روابط خطوط Noto العامة.

يحدد `VITE_DEFAULT_LANGUAGE` لغة الواجهة للزوار لأول مرة. القيم المدعومة: `en` و`ar` و`be` و`fr` و`de` و`es` و`zh` و`zh-TW` و`vi` و`tr` و`id` و`it` و`pt` و`nl` و`da`. ما زال بإمكان المستخدمين تبديل اللغة، وهذا يغيّر الافتراضي فقط.

مثال:

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### العلامة التجارية المخصصة

استبدل شعار BentoPDF الافتراضي واسمه ونص التذييل بما يخصك. ضع ملف الشعار في مجلد `public/` (أو استخدم صورة موجودة)، ثم مرّر متغيرات العلامة التجارية وقت البناء:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

تعمل العلامة التجارية في الوضع الكامل ووضع Simple Mode، ويمكن دمجها مع جميع خيارات وقت البناء الأخرى.

### تعطيل أدوات محددة

أخفِ أدوات من الواجهة لأغراض الامتثال أو الأمان. تُزال الأدوات المعطلة من الصفحة الرئيسية ونتائج البحث واختصارات لوحة المفاتيح ومنشئ سير العمل. يعرض الوصول المباشر عبر الرابط صفحة "الأداة غير متاحة".

معرّف الأداة هو رابط الصفحة بدون `.html`. مثلًا، إذا كانت الأداة على `bentopdf.com/edit-pdf.html`، فالمعرّف هو `edit-pdf`.

#### العثور على معرّفات الأدوات

أسهل طريقة: افتح أي أداة في BentoPDF وانظر إلى الرابط. الجزء الأخير من المسار (بدون `.html`) هو معرّف الأداة.

<details>
<summary>القائمة الكاملة لمعرّفات الأدوات</summary>

**التحرير والتعليق:** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**التحويل إلى PDF:** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**التحويل من PDF:** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**التنظيم والإدارة:** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**التحسين والإصلاح:** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**الأمان:** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### الخيار 1: وقت البناء (معامل بناء Docker)

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

يدمج هذا قائمة الأدوات المعطلة في حزمة JavaScript. يتطلب إعادة بناء لتغييرها.

#### الخيار 2: وقت التشغيل (config.json)

اربط ملف `config.json` في المجلد المقدَّم، دون الحاجة لإعادة بناء:

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

أو باستخدام Docker Compose:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

يمكن دمج الطريقتين، إذ تُدمج القوائم. إذا ظهرت أداة في أي منهما، فهي معطلة.

#### تعطيل ميزات المحرر

يمكنك أيضًا تعطيل ميزات محددة داخل محرر PDF (مثل التنقيح والتعليقات التوضيحية والنماذج) دون تعطيل أداة المحرر بالكامل. أضف `editorDisabledCategories` إلى `config.json`:

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>القائمة الكاملة لفئات المحرر</summary>

**التكبير:** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**التعليقات التوضيحية:** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**الأشكال:** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**النماذج:** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**التنقيح:** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**المستند:** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**الصفحة:** `page`, `spread`, `rotate`, `scroll`, `navigation`

**اللوحة:** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**الأدوات:** `tools`, `pan`, `pointer`, `capture`

**التحديد:** `selection`, `selection-copy`

**السجل:** `history`, `history-undo`, `history-redo`

</details>

الفئات هرمية، فتعطيل فئة أب (مثل `annotation`) يعطّل جميع فئاتها الفرعية.

### تعطيل عداد نجوم GitHub

يعرض شريط التنقل عدد نجوم GitHub الحي، ويُجلب من `api.github.com` عند تحميل الصفحة. وهو الطلب الخارجي الوحيد الذي لا يخدم ميزة PDF. عطّله وقت البناء لإزالة شيفرة الجلب من الحزمة وحذف `api.github.com` من Content-Security-Policy:

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

عمليات بناء Simple Mode (`bentopdf-simple`) تتخطى عداد النجوم دائمًا، فهذا الخيار مطلوب فقط في النسخة التجارية أو عمليات البناء الكاملة المخصصة.

### عناوين WASM مخصصة (بيئات معزولة عن الإنترنت / استضافة ذاتية)

> [!IMPORTANT]
> تُدمج عناوين WASM في JavaScript **وقت البناء**. وتُنزَّل ملفات WASM بواسطة **متصفح المستخدم** وقت التشغيل، فلا ينزّلها Docker أثناء البناء. في الشبكات المعزولة عن الإنترنت، يجب استضافة ملفات WASM على خادم داخلي تصل إليه المتصفحات.

**سير العمل الكامل للبيئات المعزولة:**

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

استخدم الرموز التي يطبعها الأمر `bash scripts/prepare-airgap.sh --list-ocr-languages`، أو ابحث بالاسم عبر `bash scripts/prepare-airgap.sh --search-ocr-language <term>`، لقيمة `--ocr-languages`. وعند البناء بمجموعة OCR مقيّدة، مرّر الرموز نفسها إلى `VITE_TESSERACT_AVAILABLE_LANGUAGES` لكي يعرض التطبيق اللغات المضمّنة فقط. وللحصول على إخراج OCR كامل دون اتصال، استضف أيضًا مجلد `ocr-fonts/` المضمّن ووجّه `VITE_OCR_FONT_BASE_URL` إليه.

اضبط المتغير على سلسلة فارغة لتعطيل تلك الوحدة (يجب على المستخدمين ضبطها يدويًا عبر الإعدادات المتقدمة).

## منفذ مخصص

افتراضيًا، يستمع BentoPDF على المنفذ `8080` داخل الحاوية. لتغييره، اضبط متغير البيئة `PORT` وقت التشغيل:

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| المتغير | الوصف                        | الافتراضي |
| ------- | ---------------------------- | --------- |
| `PORT`  | منفذ استماع Nginx في الحاوية | `8080`    |

يعمل هذا مع Dockerfile القياسي وغير الجذري (nonroot) معًا.

## معرّف مستخدم مخصص (PUID/PGID)

للبيئات التي تتطلب التشغيل بمستخدم محدد غير جذري (أجهزة NAS وKubernetes مع سياقات الأمان وسياسات المؤسسات)، يوفر BentoPDF ملف Dockerfile منفصلًا يدعم PUID/PGID بأسلوب LSIO.

### البناء والتشغيل

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

### متغيرات البيئة

| المتغير        | الوصف                  | الافتراضي |
| -------------- | ---------------------- | --------- |
| `PUID`         | معرّف المستخدم للتشغيل | `1000`    |
| `PGID`         | معرّف المجموعة للتشغيل | `1000`    |
| `PORT`         | منفذ استماع Nginx      | `8080`    |
| `DISABLE_IPV6` | تعطيل مستمع IPv6       | `false`   |

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

### كيف يعمل

تبدأ الحاوية كمستخدم جذر، وتنشئ مستخدمًا بقيم PUID/PGID المحددة، وتضبط الملكية على جميع المجلدات القابلة للكتابة، ثم تتخلى عن الصلاحيات باستخدام `su-exec`. وتعمل عملية nginx بالكامل بصفتك المستخدم الذي حددته.

> [!NOTE]
> يستخدم `Dockerfile` القياسي الصورة `nginx-unprivileged` (UID 101) ويُوصى به لمعظم عمليات النشر. استخدم `Dockerfile.nonroot` فقط عندما تحتاج إلى UID/GID محدد.

> [!WARNING]
> لا يمكن أن يكون PUID/PGID هو `0` (الجذر). يتحقق نقطة الدخول من المدخلات وسيخرج بخطأ عند القيم غير الصالحة.

## مع Traefik (وكيل عكسي)

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

## مع Caddy (وكيل عكسي)

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

## حدود الموارد

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

## تكامل Podman Quadlet مع Systemd

يتيح لك [Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) تشغيل حاويات Podman كخدمات systemd. وهذا مثالي لعمليات النشر الإنتاجية على أنظمة Linux.

### إعداد Quadlet الأساسي

أنشئ ملف وحدة حاوية في `~/.config/containers/systemd/bentopdf.container` (للمستخدم) أو `/etc/containers/systemd/bentopdf.container` (للنظام):

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

### التفعيل والتشغيل

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
> للنشر على مستوى النظام، استخدم `systemctl` بدون الخيار `--user` وضع الملف في `/etc/containers/systemd/`.

### Quadlet مع فحص الصحة

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

### التحديث التلقائي مع Quadlet

يمكن لـ Podman تحديث الحاويات تلقائيًا عند توفر صور جديدة:

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### إعداد شبكة Quadlet

لإعداد شبكة مخصص، أنشئ ملف شبكة `bentopdf.network`:

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

ثم أشر إليه في ملف الحاوية:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## التحديث

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
