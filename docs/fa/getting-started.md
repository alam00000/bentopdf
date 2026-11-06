# شروع به کار

به Pixel PDF خوش آمدید! این راهنما به شما کمک می‌کند سریع شروع کنید.

## Pixel PDF چیست؟

Pixel PDF مجموعه‌ابزار PDF رایگان، متن‌باز و حریم‌خصوصی‌محور است که **کاملاً در مرورگر شما** اجرا می‌شود. فایل‌های شما هرگز از دستگاهتان خارج نمی‌شوند؛ همهٔ پردازش‌ها به‌صورت محلی با فناوری WebAssembly (WASM) انجام می‌شود.

## شروع سریع

### گزینهٔ ۱: استفاده از نسخهٔ میزبانی‌شده

به [pixelpdf.com](https://www.pixelpdf.com) بروید تا بی‌درنگ از Pixel PDF استفاده کنید؛ نیازی به نصب نیست.

### گزینهٔ ۲: میزبانی شخصی با Docker

> [!IMPORTANT]
> تبدیل فایل‌های Office به `SharedArrayBuffer` نیاز دارد که این موارد را لازم دارد:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - یک بستر امن (secure context)
>
> `http://localhost` برای آزمایش محلی کار می‌کند، چون مرورگرها loopback را قابل‌اعتماد می‌دانند. `http://192.168.x.x` یا دیگر IPهای شبکهٔ محلی معمولاً این‌گونه نیستند، بنابراین تبدیل‌های Word/Excel/PowerPoint هنگام دسترسی از دستگاه‌های دیگر شبکه به HTTPS نیاز دارند.

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/mohammedalhinaki-cloud/pixel-pdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/mohammedalhinaki-cloud/Pixel-PDF/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> Pixel PDF در دو نسخهٔ ساخت عرضه می‌شود: **نسخهٔ میزبانی شخصی** (`pixelpdf-simple`، که در بالا استفاده شد) برای استقرارهای داخلی، تیمی و سازمانی، و **نسخهٔ تجاری** (`pixelpdf:latest`) که خود pixelpdf.com و دارندگان مجوز تجاری برای استقرارهای عمومی از آن استفاده می‌کنند. هر دو ابزارهای PDF یکسانی دارند؛ نسخهٔ تجاری بخش hero، پرسش‌های متداول، نظرات کاربران و پاصفحهٔ pixelpdf.com را اضافه می‌کند. اگر مطمئن نیستید، از نسخهٔ میزبانی شخصی استفاده کنید.

سپس `http://localhost:3000` را در مرورگر خود باز کنید.

> [!NOTE]
> اگر در حال آماده‌سازی استقرار OCR در محیط ایزوله (air-gapped) هستید، باید علاوه بر worker، هستهٔ اجرایی و فایل‌های traineddata مربوط به Tesseract، فونت‌های لایهٔ متنی OCR را نیز به‌صورت داخلی میزبانی کنید. راه‌اندازی کامل در [میزبانی شخصی](/fa/self-hosting/) مستند شده است، از جمله `VITE_OCR_FONT_BASE_URL` و پوشهٔ همراه `ocr-fonts/`.

### گزینهٔ ۳: ساخت از کد منبع

```bash
# Clone the repository
git clone https://github.com/mohammedalhinaki-cloud/Pixel-PDF.git
cd pixelpdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## نگاهی به قابلیت‌ها

| دسته                     | ابزارها                                                            |
| ------------------------ | ------------------------------------------------------------------ |
| **تبدیل به PDF**         | Word، Excel، PowerPoint، تصاویر، Markdown، EPUB، MOBI و موارد دیگر |
| **تبدیل از PDF**         | JPG، PNG، متن، Excel، SVG و موارد دیگر                             |
| **ویرایش و حاشیه‌نویسی** | امضا، هایلایت، حذف محتوای حساس، پر کردن فرم‌ها، افزودن مهر         |
| **سازماندهی**            | ادغام، تقسیم، چرخش، حذف صفحات، تغییر ترتیب                         |
| **بهینه‌سازی**           | فشرده‌سازی، تعمیر، مسطح‌سازی، OCR                                  |
| **امنیت**                | رمزگذاری، رمزگشایی، حذف محدودیت‌ها                                 |

## پشتیبانی مرورگرها

Pixel PDF در مرورگرهای مدرن بهترین عملکرد را دارد:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## گام‌های بعدی

- [مشاهدهٔ همهٔ ابزارها](/fa/tools/)
- [میزبانی شخصی Pixel PDF](/fa/self-hosting/)
- [مشارکت در پروژه](/fa/contributing)
