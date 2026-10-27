---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'BentoPDF'
  text: 'ابزارهای PDF رایگان و متن‌باز'
  tagline: PDFها را کاملاً در مرورگر خود پردازش کنید. بدون بارگذاری. بدون سرور. حریم خصوصی کامل.
  actions:
    - theme: brand
      text: شروع کنید
      link: /fa/getting-started
    - theme: alt
      text: مشاهدهٔ ابزارها
      link: /fa/tools/
    - theme: alt
      text: میزبانی شخصی
      link: /fa/self-hosting/
    - theme: alt
      text: مجوز تجاری
      link: /fa/licensing

features:
  - icon: 🔒
    title: ۱۰۰٪ خصوصی
    details: فایل‌های شما هرگز از دستگاهتان خارج نمی‌شوند. همهٔ پردازش‌ها به‌صورت محلی در مرورگر شما با WebAssembly انجام می‌شود.
  - icon: ⚡
    title: سریع و رایگان
    details: بدون ثبت‌نام، بدون محدودیت، بدون واترمارک. PDFهای نامحدود را برای همیشه رایگان پردازش کنید.
  - icon: 🛠️
    title: بیش از ۵۰ ابزار
    details: تبدیل، ویرایش، ادغام، تقسیم، فشرده‌سازی، امضا، OCR و موارد دیگر. هر آنچه نیاز دارید در یک جا.

  - icon: 🌐
    title: قابل میزبانی شخصی
    details: روی زیرساخت خودتان مستقر کنید. Docker، Vercel، Netlify، AWS یا محیط‌های کاملاً ایزوله با workerهای OCR، داده‌های زبانی و فونت‌های لایهٔ متنی میزبانی‌شده به‌صورت شخصی.
---

## OCR آفلاین

اگر BentoPDF را در محیطی ایزوله یا آفلاین میزبانی می‌کنید، OCR به چیزی بیش از worker و فایل‌های traineddata مربوط به Tesseract نیاز دارد. خروجی PDF قابل‌جستجو همچنین نیاز دارد فونت‌های لایهٔ متنی OCR به‌صورت داخلی ارائه شوند.
برای راه‌اندازی کامل، از جمله `VITE_OCR_FONT_BASE_URL`، پوشهٔ همراه `ocr-fonts/` و روند به‌روزشدهٔ air-gap، [میزبانی شخصی](/fa/self-hosting/) را ببینید.
