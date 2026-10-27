# مشارکت

از علاقهٔ شما به مشارکت در BentoPDF سپاسگزاریم! این راهنما به شما کمک می‌کند شروع کنید.

## شروع کار

### پیش‌نیازها

- Node.js 18+
- npm 9+
- Git

### راه‌اندازی

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## ساختار پروژه

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

## افزودن ابزار جدید

### گام ۱: ساخت فایل منطق

فایل `src/js/logic/your-tool-page.ts` را بسازید:

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### گام ۲: ساخت صفحهٔ HTML

فایل `src/pages/your-tool.html` را مطابق قالب‌های ابزارهای موجود بسازید.

### گام ۳: ثبت ابزار

به `src/js/config/tools.ts` اضافه کنید:

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### گام ۴: افزودن به پیکربندی ساخت

صفحه را به `vite.config.ts` اضافه کنید:

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### گام ۵: افزودن ترجمه‌ها

ورودی‌ها را به همهٔ فایل‌های زبان در `public/locales/` اضافه کنید:

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## سبک کدنویسی

- برای همهٔ کدهای جدید از TypeScript استفاده کنید
- برای یکدستی، از الگوهای موجود پیروی کنید
- پیش از commit، دستور `npm run format` را اجرا کنید
- بدون توضیح (comment) در کد production (توضیحات هنگام ساخت حذف می‌شوند)

## فرایند Pull Request

1. یک شاخهٔ ویژگی بسازید: `git checkout -b feature/your-feature`
2. تغییرات خود را اعمال کنید
3. به‌طور کامل آزمایش کنید: `npm run build`
4. یک PR با توضیح روشن ارسال کنید

## ترجمه

برای افزودن زبان‌های جدید، [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md) را ببینید.

## توافق‌نامهٔ مجوز مشارکت‌کننده

پیش از ادغام PR شما، باید CLA ما را امضا کنید:

- [CLA فردی (ICLA)](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [CLA شرکتی (CCLA)](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## دریافت کمک

- [Issues در GitHub](https://github.com/alam00000/bentopdf/issues)
- [انجمن Discord](https://discord.gg/Bgq3Ay3f2w)

## مجوز

BentoPDF دارای مجوز دوگانه است:

- **AGPL-3.0** برای پروژه‌های متن‌باز که کد منبع کامل خود را به‌صورت عمومی منتشر می‌کنند
- **مجوز تجاری** برای برنامه‌های اختصاصی یا بسته‌منبع: [دریافت مجوز مادام‌العمر با ۷۹ دلار](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

با مشارکت، می‌پذیرید که مشارکت‌های شما تحت این شرایط مجوزدهی شوند.
