# البدء

مرحبًا بك في Pixel PDF! سيساعدك هذا الدليل على الانطلاق بسرعة.

## ما هو Pixel PDF؟

Pixel PDF مجموعة أدوات PDF مجانية ومفتوحة المصدر تضع الخصوصية أولًا، وتعمل **بالكامل داخل متصفحك**. ملفاتك لا تغادر جهازك أبدًا، فكل المعالجة تتم محليًا باستخدام تقنية WebAssembly (WASM).

## بداية سريعة

### الخيار 1: استخدام النسخة المستضافة

زر [pixelpdf.com](https://www.pixelpdf.com) لاستخدام Pixel PDF فورًا، بدون أي تثبيت.

### الخيار 2: الاستضافة الذاتية باستخدام Docker

> [!IMPORTANT]
> يتطلب تحويل ملفات Office وجود `SharedArrayBuffer`، وهذا يحتاج إلى كل مما يلي:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - سياق آمن
>
> يعمل `http://localhost` للاختبار المحلي لأن المتصفحات تعتبر عنوان الحلقة المحلية موثوقًا. أما `http://192.168.x.x` أو غيره من عناوين الشبكة المحلية فعادةً لا يُعتبر كذلك، لذا تتطلب تحويلات Word/Excel/PowerPoint اتصال HTTPS عند الوصول من أجهزة أخرى على شبكتك.

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/mohammedalhinaki-cloud/pixel-pdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/mohammedalhinaki-cloud/Pixel-PDF/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> يتوفر Pixel PDF بنسختين: **نسخة الاستضافة الذاتية** (`pixelpdf-simple`، المستخدمة أعلاه) لعمليات النشر الداخلية وللفرق والمؤسسات، و**النسخة التجارية** (`pixelpdf:latest`) التي يستخدمها pixelpdf.com نفسه وأصحاب التراخيص التجارية الذين ينشرون خدمات موجهة للعامة. كلتا النسختين تتضمنان أدوات PDF نفسها، وتضيف النسخة التجارية الواجهة الرئيسية لـ pixelpdf.com والأسئلة الشائعة وآراء المستخدمين والتذييل. إذا كنت غير متأكد، فاستخدم نسخة الاستضافة الذاتية.

ثم افتح `http://localhost:3000` في متصفحك.

> [!NOTE]
> إذا كنت تجهّز نشرًا معزولًا عن الإنترنت لميزة OCR، فعليك استضافة خطوط الطبقة النصية الخاصة بـ OCR داخليًا، إضافة إلى عامل Tesseract وبيئة التشغيل الأساسية وملفات traineddata. الإعداد الكامل موثّق في [الاستضافة الذاتية](/ar/self-hosting/)، بما في ذلك `VITE_OCR_FONT_BASE_URL` والمجلد المضمّن `ocr-fonts/`.

### الخيار 3: البناء من المصدر

```bash
# Clone the repository
git clone https://github.com/mohammedalhinaki-cloud/Pixel-PDF.git
cd pixelpdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## نظرة سريعة على الميزات

| الفئة                | الأدوات                                                     |
| -------------------- | ----------------------------------------------------------- |
| **التحويل إلى PDF**  | Word وExcel وPowerPoint والصور وMarkdown وEPUB وMOBI وغيرها |
| **التحويل من PDF**   | JPG وPNG ونص وExcel وSVG وغيرها                             |
| **التحرير والتعليق** | التوقيع، التمييز، التنقيح، تعبئة النماذج، إضافة الأختام     |
| **التنظيم**          | دمج، تقسيم، تدوير، حذف الصفحات، إعادة الترتيب               |
| **التحسين**          | ضغط، إصلاح، تسطيح، OCR                                      |
| **الأمان**           | تشفير، فك التشفير، إزالة القيود                             |

## دعم المتصفحات

يعمل Pixel PDF بأفضل شكل على المتصفحات الحديثة:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## الخطوات التالية

- [استكشف جميع الأدوات](/ar/tools/)
- [استضف Pixel PDF بنفسك](/ar/self-hosting/)
- [ساهم في المشروع](/ar/contributing)
