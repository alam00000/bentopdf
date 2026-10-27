# المساهمة

شكرًا لاهتمامك بالمساهمة في BentoPDF! سيساعدك هذا الدليل على البدء.

## البدء

### المتطلبات

- Node.js 18+
- npm 9+
- Git

### الإعداد

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## بنية المشروع

```
bentopdf/
├── src/
│   ├── js/
│   │   ├── config/       # Tool definitions
│   │   ├── logic/        # Tool page logic
│   │   ├── utils/        # Shared utilities
│   │   └── ui.ts         # UI helpers
│   ├── pages/            # Tool HTML pages
│   └── css/              # Styles
├── public/
│   ├── locales/          # Translations
│   └── pymupdf-wasm/     # WASM modules
├── docs/                 # Documentation (VitePress)
└── scripts/              # Build scripts
```

## إضافة أداة جديدة

### الخطوة 1: إنشاء ملف المنطق

أنشئ `src/js/logic/your-tool-page.ts`:

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### الخطوة 2: إنشاء صفحة HTML

أنشئ `src/pages/your-tool.html` باتباع قوالب الأدوات الموجودة.

### الخطوة 3: تسجيل الأداة

أضف إلى `src/js/config/tools.ts`:

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### الخطوة 4: الإضافة إلى إعدادات البناء

أضف الصفحة إلى `vite.config.ts`:

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### الخطوة 5: إضافة الترجمات

أضف مدخلات إلى جميع ملفات اللغات في `public/locales/`:

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## نمط الكود

- استخدم TypeScript لكل الكود الجديد
- اتبع الأنماط الموجودة للحفاظ على الاتساق
- شغّل `npm run format` قبل الإيداع
- لا تضف تعليقات في كود الإنتاج (تُزال التعليقات أثناء البناء)

## عملية طلب السحب

1. أنشئ فرعًا للميزة: `git checkout -b feature/your-feature`
2. أجرِ تعديلاتك
3. اختبر جيدًا: `npm run build`
4. أرسل طلب سحب (PR) مع وصف واضح

## الترجمة

راجع [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md) لإضافة لغات جديدة.

## اتفاقية ترخيص المساهم

قبل دمج طلب السحب، ستحتاج إلى توقيع اتفاقية CLA الخاصة بنا:

- [اتفاقية المساهم الفرد (ICLA)](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [اتفاقية المساهم المؤسسي (CCLA)](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## الحصول على المساعدة

- [مشكلات GitHub](https://github.com/alam00000/bentopdf/issues)
- [مجتمع Discord](https://discord.gg/Bgq3Ay3f2w)

## الترخيص

BentoPDF مرخّص بترخيص مزدوج:

- **AGPL-3.0** للمشاريع مفتوحة المصدر التي تشارك كامل شيفرتها المصدرية علنًا
- **ترخيص تجاري** للتطبيقات الخاصة/مغلقة المصدر - [احصل على ترخيص مدى الحياة مقابل 79$](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

بمساهمتك، فإنك توافق على ترخيص مساهماتك بموجب هذه الشروط.
