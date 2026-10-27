# النشر على Vercel

توفّر [Vercel](https://vercel.com) أسهل تجربة نشر للمواقع الثابتة.

## النشر بنقرة واحدة

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## النشر اليدوي

### الخطوة 1: عمل Fork للمستودع

اعمل Fork لـ [bentopdf/bentopdf](https://github.com/alam00000/bentopdf) إلى حسابك على GitHub.

### الخطوة 2: الاستيراد إلى Vercel

1. انتقل إلى [vercel.com/new](https://vercel.com/new)
2. اختر المستودع المتفرع الخاص بك
3. اضبط المشروع:

| الإعداد          | القيمة          |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### الخطوة 3: متغيرات البيئة (اختياري)

أضف هذه عند الحاجة:

| المتغير                 | الوصف                                                      |
| ----------------------- | ---------------------------------------------------------- |
| `SIMPLE_MODE`           | اضبطه على `true` لواجهة مبسطة                              |
| `VITE_BRAND_NAME`       | اسم العلامة التجارية المخصص (يحل محل "BentoPDF")           |
| `VITE_BRAND_LOGO`       | مسار الشعار نسبةً إلى `public/` (مثل `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | نص التذييل/حقوق النشر المخصص                               |
| `VITE_DEFAULT_LANGUAGE` | لغة الواجهة الافتراضية (مثل `fr` و`de` و`es`)              |

### الخطوة 4: النشر

انقر على "Deploy" وانتظر اكتمال البناء.

## نطاق مخصص

1. انتقل إلى إعدادات مشروعك
2. افتح "Domains"
3. أضف نطاقك المخصص
4. اضبط DNS كما هو موضح

## القيود

::: warning الملفات الكبيرة
للدوال عديمة الخادم (serverless) في Vercel حد قدره 50MB. بما أن BentoPDF موقع ثابت، فلا ينبغي أن يؤثر ذلك عليك، لكن وحدات WASM كبيرة (~100MB إجمالًا). تأكد من تقديمها من مجلد `/public`.
:::

## استكشاف الأخطاء وإصلاحها

### انتهاء مهلة البناء

إذا انتهت مهلة البناء، فجرّب:

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### خطأ 404 عند التحديث

أضف ملف `vercel.json` لتوجيه SPA:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### تحويل Word/ODT/Excel إلى PDF لا يعمل

تتطلب تحويلات LibreOffice WASM وجود `SharedArrayBuffer`، الذي يحتاج إلى ترويسات الاستجابة هذه على جميع الصفحات:

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

كما تحتاج ملفات `.wasm.gz` و`.data.gz` المضغوطة مسبقًا إلى `Content-Encoding: gzip` ليفك المتصفح ضغطها.

أضف هذه إلى `vercel.json`:

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

للتحقق، افتح وحدة تحكم DevTools ونفّذ `console.log(window.crossOriginIsolated)`، ويجب أن تعيد `true`.
