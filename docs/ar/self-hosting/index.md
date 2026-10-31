# دليل الاستضافة الذاتية

يمكن استضافة BentoPDF ذاتيًا على بنيتك التحتية. يغطي هذا الدليل خيارات النشر المختلفة.

## بداية سريعة مع Docker / Podman

أسرع طريقة لاستضافة BentoPDF ذاتيًا:

> [!TIP]
> يأتي BentoPDF في بنائين:
>
> - **بناء الاستضافة الذاتية**: `ghcr.io/alam00000/bentopdf-simple:latest`. يتضمن كل أدوات PDF، **بدون** الواجهة التسويقية (لا قسم رئيسي ولا أسئلة شائعة ولا شهادات ولا تذييل). استخدمه للنشر الداخلي أو لفرق العمل أو المؤسسات. وهو **ليس** نسخة "خفيفة" منقوصة الميزات.
> - **البناء التجاري**: `ghcr.io/alam00000/bentopdf:latest`. الموقع التسويقي الكامل، ويستخدمه bentopdf.com نفسه وحاملو الترخيص التجاري الذين يشغّلون عمليات نشر موجهة للجمهور.
>
> إذا كنت في شك: استخدم بناء الاستضافة الذاتية.

> [!IMPORTANT]
> يتطلب تحويل ملفات Office وجود `SharedArrayBuffer`، ما يعني أن التطبيق يجب أن يكون معزولًا عبر الأصول (cross-origin isolated) ومقدَّمًا من سياق آمن. تُرسل الصورة الرسمية ترويستي COOP/COEP المطلوبتين، لكن المتصفحات تظل تعطّل `SharedArrayBuffer` على أصول HTTP العادية في الشبكات المحلية مثل `http://192.168.x.x`.
>
> استخدم `http://localhost` للاختبار على الجهاز نفسه فقط. إذا كان المستخدمون يصلون إلى BentoPDF عبر عنوان IP محلي أو اسم مضيف، فأنهِ الاتصال بـ HTTPS.

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

أو باستخدام Docker Compose / Podman Compose:

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

## Podman Quadlet (خدمة systemd على Linux)

شغّل BentoPDF كخدمة systemd. أنشئ الملف `~/.config/containers/systemd/bentopdf.container`:

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

راجع [دليل نشر Docker](/ar/self-hosting/docker) للاطلاع على توثيق Quadlet الكامل.

## البناء من المصدر

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## خيارات الإعداد

### بناء الاستضافة الذاتية (الوضع المبسط)

بناء الاستضافة الذاتية (صورة `bentopdf-simple`، ويسمى أيضًا الوضع المبسط) **مطابق وظيفيًا** للبناء التجاري: كل أداة PDF موجودة وتعمل بالطريقة نفسها. هو فقط يُخفي الواجهة التسويقية التي لا معنى لها إلا على bentopdf.com نفسه أو في نشر تجاري موجه للجمهور. **وهو ليس نسخة منقوصة الميزات أو "خفيفة".**

**ما يخفيه بناء الاستضافة الذاتية** (تجميلي فقط، ولا تُزال أي ميزات PDF):

- شريط التنقل، والقسم الرئيسي، وقسم المزايا، والأسئلة الشائعة، والشهادات، والتذييل
- يحدّث عنوان الصفحة إلى "أدوات PDF"

**ما يحتفظ به بناء الاستضافة الذاتية** (كل ما يقوم فعلًا بعمل PDF):

- كل أدوات PDF (الدمج، والتقسيم، والتحرير، والتوقيع، وOCR، وتحويل Office، وغيرها)
- دعم العلامة التجارية المخصصة، وكل إعدادات وقت البناء ووقت التشغيل

البناء التجاري (`ghcr.io/alam00000/bentopdf:latest`) هو ما يشغّل bentopdf.com نفسه ويستخدمه حاملو الترخيص التجاري الذين يشغّلون عمليات نشر موجهة للجمهور. فهو يضيف القسم الرئيسي والأسئلة الشائعة والشهادات والتذييل التي لا معنى لها في أداة داخلية.

إذا كنت تستضيف BentoPDF ذاتيًا لفريقك أو مؤسستك أو كأداة داخلية، فاستخدم بناء الاستضافة الذاتية:

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

راجع [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md) للتفاصيل الكاملة.

### البناء التجاري (عمليات نشر موجهة للجمهور بعلامتك التجارية)

البناء التجاري (صورة `bentopdf` بدون اللاحقة `-simple`) هو ما يشغّل bentopdf.com نفسه. يتضمن الموقع التسويقي الكامل (القسم الرئيسي، والمزايا، والأسئلة الشائعة، والشهادات، والتذييل) فوق كل أدوات PDF. استخدم هذا البناء عندما تريد **نشر BentoPDF كخدمة PDF موجهة للجمهور تحت علامتك التجارية**، على سبيل المثال:

- تشغّل BentoPDF كخدمة SaaS مستضافة للمستخدمين النهائيين على نطاقك الخاص
- تريد تجربة صفحة الهبوط (أقسام تسويقية مع الأدوات)، وليس واجهة الأدوات المجردة فقط
- أنت حامل ترخيص تجاري تدمج BentoPDF في منتج تجاري

**شغّله كما هو** (بعلامة BentoPDF، مفيد لمعاينة البناء):

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**ابنِ بعلامتك التجارية** (سير العمل التجاري المعتاد):

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

كل خيار آخر من خيارات وقت البناء (`BASE_URL` و`VITE_DEFAULT_LANGUAGE` و`DISABLE_TOOLS` وتجاوزات عناوين WASM وغيرها) يعمل بالطريقة نفسها كما في بناء الاستضافة الذاتية.

::: warning الترخيص
تشغيل البناء التجاري مسموح بموجب أي من خياري ترخيص BentoPDF:

- **AGPL-3.0** (مجاني): مسموح إذا كان نشرك ينشر شيفرته المصدرية كاملة بموجب AGPL، بما في ذلك أي تعديلات على العلامة التجارية ومنطق الأعمال المحيط.
- **الترخيص التجاري** (79 دولارًا مدى الحياة): مطلوب لعمليات النشر مغلقة المصدر أو المملوكة التي لا تفتح فيها مصدر نسخة العلامة التجارية أو شيفرة الأعمال.

راجع [صفحة الترخيص](https://www.bentopdf.com/licensing) للمقارنة الكاملة. تُحمَّل وحدات WASM الخاضعة لـ AGPL (PyMuPDF وGhostscript وCoherentPDF) من CDN وقت التشغيل، لذا لا تدخل في صورتك ولا تغيّر وضعك الترخيصي.
:::

### عنوان URL الأساسي

انشر في مجلد فرعي:

```bash
BASE_URL=/pdf-tools/ npm run build
```

### علامة تجارية مخصصة

استبدل شعار BentoPDF الافتراضي واسمه ونص التذييل بما يخصك وقت البناء:

| المتغير            | الوصف                                  | الافتراضي                               |
| ------------------ | -------------------------------------- | --------------------------------------- |
| `VITE_BRAND_NAME`  | اسم العلامة التجارية في الرأس والتذييل | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | مسار الشعار نسبةً إلى `public/`        | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | نص التذييل/حقوق النشر المخصص           | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

أو عبر Docker:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

تعمل العلامة التجارية في الوضع الكامل والوضع المبسط، ويمكن دمجها مع كل خيارات وقت البناء الأخرى (`BASE_URL` و`SIMPLE_MODE` و`VITE_DEFAULT_LANGUAGE`).

### تعطيل أدوات محددة

أخفِ أدوات بعينها لأغراض الامتثال أو الأمان. تُزال الأدوات المعطلة من الصفحة الرئيسية والبحث والاختصارات ومنشئ سير العمل والوصول المباشر عبر URL.

معرّفات الأدوات هي عنوان URL للصفحة بدون `.html`: افتح أي أداة وانظر إلى العنوان (مثل `edit-pdf` و`sign-pdf` و`encrypt-pdf`).

**وقت البناء** (مضمّن في الحزمة):

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**وقت التشغيل** (بدون إعادة بناء: اربط ملف `config.json`):

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

يمكن الجمع بين الطريقتين: تُدمج القوائم.

يمكنك أيضًا تعطيل ميزات محددة داخل محرر PDF (مثل الحجب) دون تعطيل الأداة بأكملها بإضافة `editorDisabledCategories` إلى `config.json`. راجع [دليل Docker](/ar/self-hosting/docker#تعطيل-ميزات-المحرر) للاطلاع على القائمة الكاملة للفئات.

## أدلة النشر

اختر منصتك:

- [Vercel](/ar/self-hosting/vercel)
- [Netlify](/ar/self-hosting/netlify)
- [Cloudflare Pages](/ar/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/ar/self-hosting/aws)
- [Hostinger](/ar/self-hosting/hostinger)
- [Nginx](/ar/self-hosting/nginx)
- [Apache](/ar/self-hosting/apache)
- [Docker](/ar/self-hosting/docker)
- [Kubernetes](/ar/self-hosting/kubernetes)
- [وكيل CORS](/ar/self-hosting/cors-proxy) - مطلوب للتوقيعات الرقمية

## مشكلات شائعة

### تحويل Word / ODT / Excel / PowerPoint إلى PDF يتوقف (SharedArrayBuffer غير متاح)

**العَرَض**: تتوقف تحويلات المستندات المعتمدة على LibreOffice (Word وODT وExcel وPowerPoint إلى PDF) عند نحو 55% أو تفشل في البدء. قد تعرض وحدة تحكم المتصفح:

> `ReferenceError: SharedArrayBuffer is not defined`

...أو يعرض `window.crossOriginIsolated` القيمة `false`، أو تُبلغ ترجمة WASM عن `expected magic word 00 61 73 6d, found 1f 8b 08 08`.

**السبب**: يتطلب LibreOffice WASM وجود `SharedArrayBuffer`، والمتصفح لا يفعّله إلا عندما تكون الصفحة **معزولة عبر الأصول** و**مقدَّمة من سياق آمن**. أي أن أمرين يجب أن يتحققا:

1. تتضمن كل استجابة الترويستين معًا:
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. تُقدَّم الصفحة من `https://...` أو `http://localhost`. لا يُعد HTTP العادي على عنوان IP محلي (مثل `http://192.168.x.x`) آمنًا: تعطّل المتصفحات `SharedArrayBuffer` هناك.

عدم التطابق `00 61 73 6d / 1f 8b 08 08` عَرَض فرعي منفصل: ملفات `.wasm.gz` / `.data.gz` المضغوطة مسبقًا تفتقر إلى ترويسة الاستجابة `Content-Encoding: gzip`، فيتلقى المتصفح بايتات gzip الخام بدل WASM المفكوك ضغطه.

**الحل**: راجع دليل النشر الخاص بمنصتك للاطلاع على الإعداد الدقيق:

- [Nginx →](/ar/self-hosting/nginx#تحويل-word-odt-excel-إلى-pdf-لا-يعمل)
- [Apache →](/ar/self-hosting/apache#تحويل-word-odt-excel-إلى-pdf-لا-يعمل)
- [AWS S3 + CloudFront →](/ar/self-hosting/aws#الخطوة-3b-سياسة-ترويسات-الاستجابة-مطلوبة-لـ-libreoffice-wasm)
- [Cloudflare Pages →](/ar/self-hosting/cloudflare#ملف-الإعدادات) (ملف `_headers`)
- [Netlify →](/ar/self-hosting/netlify#تحويل-word-odt-excel-إلى-pdf-يتوقف-عند-55) (`netlify.toml`)
- [Vercel →](/ar/self-hosting/vercel#تحويل-word-odt-excel-إلى-pdf-لا-يعمل) (`vercel.json`)
- [Hostinger →](/ar/self-hosting/hostinger#أدوات-libreoffice-لا-تعمل) (`.htaccess`)
- [Kubernetes →](/ar/self-hosting/kubernetes#التأكد-من-استمرار-عمل-ترويسات-sharedarraybuffer-ingress-gateway)
- **Docker**: يُعالَج تلقائيًا بواسطة إعداد nginx المضمّن، ولا حاجة لأي إجراء.

**التحقق**: افتح وحدة تحكم DevTools في أي صفحة BentoPDF ونفّذ:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

إذا كانت الصفحة HTTPS أو `http://localhost` وترويستا COEP/COOP موجودتان في كل استجابة، ينجح الفحصان. وإذا كنت على `http://192.168.x.x` أو أي أصل HTTP آخر غير loopback، فأنهِ الاتصال بـ HTTPS، إذ لا يوجد حل بالترويسات وحدها.

### ملفات `.mjs` تُقدَّم بنوع `application/octet-stream`

**العَرَض**: تعرض أداة توقيع PDF / ملء النماذج / أدوات أخرى عارضًا فارغًا أو تفشل في التحميل. تُبلغ وحدة تحكم المتصفح:

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**السبب**: لا يملك خادم الويب أو الوكيل العكسي لديك تعيين نوع MIME لملفات `.mjs` (يأتي عارض PDF المضمّن بوحدات ES بهذا الامتداد). تستخدم كثير من إعدادات الخوادم الافتراضية `application/octet-stream` للامتدادات غير المعروفة، وترفض المتصفحات تنفيذها كوحدات ES.

**الحل**: راجع دليل النشر الخاص بمنصتك للاطلاع على المقطع الدقيق:

- [Nginx →](/ar/self-hosting/nginx#عارض-توقيع-pdf-أو-ملء-النماذج-فارغ-خطأ-mime-لملفات-mjs)
- [Apache →](/ar/self-hosting/apache#أداة-توقيع-pdf-أو-تعبئة-النماذج-تعرض-عارضًا-فارغًا-خطأ-mime-لملفات-mjs)
- [AWS S3 + CloudFront →](/ar/self-hosting/aws#الخطوة-2-البناء-والرفع) (راجع `aws s3 cp ... --include "*.mjs"`)
- [Kubernetes →](/ar/self-hosting/kubernetes#أخطاء-نوع-mime-لملفات-mjs-عارض-توقيع-pdf-ملء-النماذج-فارغ)
- **Docker وVercel وNetlify وCloudflare Pages وHostinger**: يُعالَج تلقائيًا، ولا حاجة لأي إجراء.

**التحقق**: افتح DevTools ثم تبويب Network، وابحث عن طلب `.mjs` الفاشل، وتحقق من ترويسة الاستجابة `Content-Type`. يجب أن تكون `application/javascript`. وإذا بقيت `application/octet-stream`، فقد يكون وكيل عكسي خارجي أو CDN يعيد استنتاج النوع، فافحص كل طبقة في سلسلة التقديم.

## إعداد WASM (مكونات AGPL)

**لا يضمّن** BentoPDF مكتبات المعالجة الخاضعة لـ AGPL في شيفرته المصدرية، لكنه **يهيّئ مسبقًا عناوين CDN** بحيث تعمل كل الميزات مباشرة، دون إعداد يدوي.

::: tip بدون إعداد افتراضيًا
منذ الإصدار v2.0.0، تُهيَّأ وحدات WASM مسبقًا للتحميل من jsDelivr CDN عبر متغيرات البيئة. تعمل كل الميزات المتقدمة فورًا دون أي إعداد من المستخدم.
:::

| المكوّن         | الترخيص  | الميزات                                                   |
| --------------- | -------- | --------------------------------------------------------- |
| **PyMuPDF**     | AGPL-3.0 | تحويل EPUB/MOBI/FB2/XPS، واستخراج الصور، واستخراج الجداول |
| **Ghostscript** | AGPL-3.0 | تحويل PDF/A، والضغط، وتصحيح الميل، والتحويل إلى صور نقطية |
| **CoherentPDF** | AGPL-3.0 | جدول المحتويات، والمرفقات، ودمج PDF مع الإشارات المرجعية  |

### متغيرات البيئة الافتراضية

تُضبط هذه في `.env.production` وتُضمَّن في البناء:

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

### تجاوز عناوين WASM

يمكنك تجاوز القيم الافتراضية وقت البناء لعمليات النشر المخصصة:

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

لتعطيل وحدة بالكامل (يتطلب إعدادًا يدويًا من المستخدم عبر الإعدادات المتقدمة)، اضبط متغيرها على سلسلة فارغة.

بالنسبة إلى OCR، إما أن تترك كل متغيرات `VITE_TESSERACT_*` فارغة وتبقي الأصول الافتراضية عبر الإنترنت، أو تضبط عناوين worker/core/lang معًا للـ OCR المستضاف ذاتيًا أو دون اتصال. وإذا ضمّنت لغات OCR محددة فقط، فاضبط أيضًا `VITE_TESSERACT_AVAILABLE_LANGUAGES` على الرموز نفسها مفصولة بفواصل، بحيث تعرض الواجهة اللغات المثبتة فقط وتفشل الاختيارات غير المدعومة برسالة خطأ وصفية. وللحصول على ملفات PDF قابلة للبحث دون اتصال بالكامل، اضبط أيضًا `VITE_OCR_FONT_BASE_URL` على المجلد الداخلي الذي يقدّم خطوط OCR المضمّنة.

يمكن للمستخدمين أيضًا تجاوز هذه القيم الافتراضية في أي وقت عبر **الإعدادات المتقدمة** في الواجهة: تتقدم التجاوزات المخزنة في المتصفح على القيم الافتراضية للبيئة.

### نشر معزول عن الإنترنت / دون اتصال

للشبكات التي لا تملك وصولًا إلى الإنترنت (الحكومة والرعاية الصحية والمالية وغيرها). تُضمَّن عناوين WASM في JavaScript **وقت البناء**، بينما **متصفح المستخدم** هو من ينزّل ملفات WASM الفعلية وقت التشغيل. لذلك تحتاج إلى تجهيز كل شيء على جهاز متصل بالإنترنت ثم نقله إلى الشبكة المعزولة.

#### سكربت آلي (موصى به)

يؤتمت السكربت المضمّن `prepare-airgap.sh` العملية كاملة: تنزيل حزم WASM وبناء صورة Docker وإنتاج حزمة مستقلة مع سكربت إعداد.

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

ينتج هذا مجلد الحزمة:

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

انقل الحزمة إلى الشبكة المعزولة عبر USB أو مستودع الأدوات الداخلي أو أي وسيلة معتمدة. ثم شغّل سكربت الإعداد المضمّن:

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

يحمّل سكربت الإعداد صورة Docker ويستخرج ملفات WASM ويشغّل الحاوية اختياريًا.

**خيارات السكربت:**

| الخيار                         | الوصف                                         | الافتراضي                      |
| ------------------------------ | --------------------------------------------- | ------------------------------ |
| `--wasm-base-url <url>`        | المكان الذي ستُستضاف فيه ملفات WASM داخليًا   | _(مطلوب، يُطلب إدخاله إن غاب)_ |
| `--image-name <name>`          | وسم صورة Docker                               | `bentopdf`                     |
| `--output-dir <path>`          | مجلد الحزمة الناتجة                           | `./bentopdf-airgap-bundle`     |
| `--simple-mode`                | تفعيل الوضع المبسط                            | off                            |
| `--base-url <path>`            | عنوان URL الأساسي للمجلد الفرعي (مثل `/pdf/`) | `/`                            |
| `--language <code>`            | لغة الواجهة الافتراضية (مثل `fr` و`de`)       | _(none)_                       |
| `--brand-name <name>`          | اسم العلامة التجارية المخصص                   | _(none)_                       |
| `--brand-logo <path>`          | مسار الشعار نسبةً إلى `public/`               | _(none)_                       |
| `--footer-text <text>`         | نص التذييل المخصص                             | _(none)_                       |
| `--ocr-languages <list>`       | لغات OCR المراد تضمينها مفصولة بفواصل         | `eng`                          |
| `--list-ocr-languages`         | يطبع رموز وأسماء OCR المدعومة ثم يخرج         | off                            |
| `--search-ocr-language <term>` | يبحث في رموز OCR بالاسم أو الاختصار           | off                            |
| `--dockerfile <path>`          | ملف Dockerfile المستخدم                       | `Dockerfile`                   |
| `--skip-docker`                | تخطي بناء Docker وتصديره                      | off                            |
| `--skip-wasm`                  | تخطي تنزيل WASM (إعادة استخدام ملفات `.tgz`)  | off                            |

تقبل المطالبة التفاعلية أيضًا `list` لطباعة القائمة الكاملة لرموز Tesseract المدعومة و`search <term>` للعثور على تطابقات مثل `search german` أو `search chi`.

::: warning شرط الأصل نفسه
يجب تقديم ملفات WASM من **الأصل نفسه** الذي يقدّم تطبيق BentoPDF. تستخدم Web Workers الدالة `importScripts()` التي لا تستطيع تحميل السكربتات عبر الأصول. فمثلًا، إذا كان BentoPDF يعمل على `https://internal.example.com`، فيجب أن يكون عنوان WASM الأساسي أيضًا `https://internal.example.com/wasm`.
:::

#### الخطوات اليدوية

<details>
<summary>إذا كنت تفضّل تنفيذ الخطوات يدويًا دون السكربت</summary>

**الخطوة 1: نزّل حزم WASM وOCR** (على جهاز متصل بالإنترنت)

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

**الخطوة 2: ابنِ صورة Docker بالعناوين الداخلية**

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

**الخطوة 3: صدّر صورة Docker**

```bash
docker save bentopdf -o bentopdf.tar
```

**الخطوة 4: انقل إلى الشبكة المعزولة**

انسخ عبر USB أو مستودع الأدوات الداخلي أو أي وسيلة نقل معتمدة:

- `bentopdf.tar`: صورة Docker
- حزم `.tgz` الخمس لـ WASM/OCR من الخطوة 1
- مجلد `tesseract-langdata/` من الخطوة 1
- مجلد `ocr-fonts/` من الخطوة 1

**الخطوة 5: الإعداد داخل الشبكة المعزولة**

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

تأكد من أن الملفات متاحة على العناوين التي ضبطتها في الخطوة 2، بما فيها `.../ocr/worker.min.js` و`.../ocr/core` و`.../ocr/lang-data` و`.../ocr/fonts`.

</details>

::: info البناء من المصدر بدلًا من Docker؟
اضبط المتغيرات في `.env.production` قبل تشغيل `npm run build`:

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

### استضافة وكيل WASM الخاص بك

إذا احتجت إلى تقديم ملفات WASM الخاضعة لـ AGPL مع ترويسات CORS المناسبة، فيمكنك نشر وكيل بسيط. راجع [دليل Cloudflare WASM Proxy](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md) للاطلاع على مثال للتنفيذ.

::: tip لماذا الفصل؟
يضمن هذا الفصل:

- امتثالًا قانونيًا واضحًا للمستخدمين التجاريين
- بقاء نواة BentoPDF تحت ترخيصها المزدوج (AGPL-3.0 / تجاري)
- تحميل ملفات WASM وقت التشغيل، لا تضمينها في المصدر
  :::

## متطلبات النظام

| المتطلب | الحد الأدنى                      |
| ------- | -------------------------------- |
| التخزين | ~100 MB (النواة بدون وحدات AGPL) |
| الذاكرة | 512 MB                           |
| المعالج | أي معالج حديث                    |

::: tip
BentoPDF موقع ثابت، فلا حاجة إلى قاعدة بيانات أو خادم خلفي!
:::
