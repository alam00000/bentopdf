---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'BentoPDF'
  text: 'أدوات PDF مجانية ومفتوحة المصدر'
  tagline: عالج ملفات PDF بالكامل داخل متصفحك. بدون رفع ملفات. بدون خوادم. خصوصية كاملة.
  actions:
    - theme: brand
      text: ابدأ الآن
      link: /ar/getting-started
    - theme: alt
      text: عرض الأدوات
      link: /ar/tools/
    - theme: alt
      text: الاستضافة الذاتية
      link: /ar/self-hosting/
    - theme: alt
      text: الترخيص التجاري
      link: /ar/licensing

features:
  - icon: 🔒
    title: خصوصية 100%
    details: ملفاتك لا تغادر جهازك أبدًا. تتم كل المعالجة محليًا في متصفحك باستخدام WebAssembly.
  - icon: ⚡
    title: سريع ومجاني
    details: بدون تسجيل، بدون حدود، بدون علامات مائية. عالج عددًا غير محدود من ملفات PDF مجانًا، إلى الأبد.
  - icon: 🛠️
    title: أكثر من 50 أداة
    details: حوّل وحرّر وادمج وقسّم وضغط ووقّع وطبّق OCR، والمزيد. كل ما تحتاجه في مكان واحد.

  - icon: 🌐
    title: قابل للاستضافة الذاتية
    details: انشره على بنيتك التحتية الخاصة. Docker أو Vercel أو Netlify أو AWS، أو بيئات معزولة تمامًا عن الإنترنت مع عمال OCR وبيانات لغات وخطوط طبقة نصية مستضافة ذاتيًا.
---

## OCR بدون اتصال

إذا استضفت BentoPDF ذاتيًا في بيئة معزولة عن الإنترنت أو بدون اتصال، فإن OCR يحتاج إلى أكثر من عامل Tesseract وملفات traineddata. فإخراج PDF القابل للبحث يتطلب أيضًا تقديم خطوط الطبقة النصية الخاصة بـ OCR من الداخل.
راجع [الاستضافة الذاتية](/ar/self-hosting/) للإعداد الكامل، بما في ذلك `VITE_OCR_FONT_BASE_URL` والمجلد المضمّن `ocr-fonts/` وسير العمل المحدّث للبيئات المعزولة.
