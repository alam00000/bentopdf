# پراکسی CORS برای دریافت گواهی‌ها

ابزار امضای دیجیتال از یک پراکسی CORS برای دریافت گواهی‌های صادرکننده از مراجع صدور گواهی (CA) خارجی استفاده می‌کند. این کار لازم است، چون بسیاری از سرورهای CA سرآیندهای CORS را در پاسخ‌های خود قرار نمی‌دهند و این مانع دریافت مستقیم از مرورگر می‌شود.

علاوه بر این، بسیاری از سرورهای CA گواهی‌ها را روی HTTP ساده ارائه می‌کنند. وقتی نمونهٔ BentoPDF شما روی HTTPS میزبانی می‌شود، مرورگرها این درخواست‌های HTTP را مسدود می‌کنند (سیاست محتوای ترکیبی). پراکسی CORS هر دو مشکل را با هدایت درخواست‌ها از طریق یک endpoint با HTTPS و سرآیندهای مناسب حل می‌کند.

## نحوهٔ کار

هنگام امضای PDF با یک گواهی:

1. کتابخانهٔ `zgapdfsigner` تلاش می‌کند یک زنجیرهٔ کامل گواهی بسازد
2. گواهی‌های صادرکننده را از URLهایی که در افزونهٔ AIA (Authority Information Access) گواهی شما قرار دارند دریافت می‌کند
3. این درخواست‌ها از طریق یک پراکسی CORS هدایت می‌شوند که سرآیندهای لازم `Access-Control-Allow-Origin` را اضافه می‌کند
4. پراکسی دادهٔ گواهی را به مرورگر برمی‌گرداند

## میزبانی شخصی پراکسی CORS

اگر BentoPDF را خودتان میزبانی می‌کنید، باید پراکسی CORS خود را مستقر کنید تا امضای دیجیتال با گواهی‌هایی که به دریافت زنجیره نیاز دارند کار کند.

### گزینهٔ ۱: Cloudflare Workers (توصیه‌شده)

1. **نصب Wrangler CLI**:

   ```bash
   npm install -g wrangler
   ```

2. **ورود به Cloudflare**:

   ```bash
   wrangler login
   ```

3. **کلون کردن BentoPDF و به‌روزرسانی مبدأهای مجاز**:

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   فایل `cors-proxy-worker.js` را باز کنید و آرایهٔ `ALLOWED_ORIGINS` را به دامنهٔ خود تغییر دهید:

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning مهم
   بدون این تغییر، پراکسی همهٔ درخواست‌های سایت شما را با خطای **403 Forbidden** رد می‌کند. پیش‌فرض فقط درخواست‌های `bentopdf.com` را مجاز می‌کند.
   :::

4. **استقرار پراکسی**:

   ```bash
   wrangler deploy
   ```

   URL worker خود را یادداشت کنید (مثلاً `https://bentopdf-cors-proxy.your-subdomain.workers.dev`).

5. **ساخت دوبارهٔ BentoPDF با URL پراکسی**:

   اگر از Docker استفاده می‌کنید:

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   اگر از کد منبع می‌سازید:

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### گزینهٔ ۲: پراکسی بک‌اند سفارشی

همچنین می‌توانید endpoint پراکسی خود را بسازید. الزامات عبارت‌اند از:

1. پذیرش درخواست‌های GET با پارامتر پرس‌وجوی `url`
2. دریافت URL از سرور شما (در سمت سرور محدودیت CORS وجود ندارد)
3. بازگرداندن پاسخ با این سرآیندها:
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

نمونهٔ پیاده‌سازی با Express.js:

```javascript
app.get('/api/cert-proxy', async (req, res) => {
  const targetUrl = req.query.url;

  // Validate it's a certificate URL
  if (!isValidCertUrl(targetUrl)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const response = await fetch(targetUrl);
    const data = await response.arrayBuffer();

    res.set('Access-Control-Allow-Origin', 'https://your-domain.com');
    res.set('Content-Type', 'application/octet-stream');
    res.set('X-Content-Type-Options', 'nosniff');
    res.send(Buffer.from(data));
  } catch (error) {
    res.status(500).json({ error: 'Proxy error' });
  }
});
```

## ملاحظات امنیتی

Cloudflare Worker همراه چندین تدبیر امنیتی دارد:

| ویژگی                    | توضیح                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| **اعتبارسنجی مبدأ**      | فقط درخواست‌های دامنه‌های فهرست‌شده در `ALLOWED_ORIGINS` را مجاز می‌کند                                   |
| **محدودیت URL**          | فقط URLهای گواهی را مجاز می‌کند (`.crt`، `.cer`، `.pem`، `/certs/`، `/ocsp`، `/crl`)                      |
| **مسدودسازی IP خصوصی**   | محدوده‌های خصوصی IPv4/IPv6، link-local، loopback، IPهای دهدهی و فرادادهٔ ابری را مسدود می‌کند             |
| **ایمنی Content-Type**   | فقط انواع MIME امن گواهی را برمی‌گرداند و تزریق content-type از بالادست را مسدود می‌کند                   |
| **محدودیت اندازهٔ فایل** | پاسخ را با محدودیت 10MB به‌صورت جریانی ارسال می‌کند و در صورت عبور از آن، دانلود را در میانه متوقف می‌کند |
| **محدودسازی نرخ**        | ۶۰ درخواست در دقیقه برای هر IP یا IPv6 /64 (نیازمند KV، در خطاهای KV باز می‌ماند)                         |
| **امضاهای HMAC**         | امضای اختیاری سمت کاربر (بازدارندهٔ سوءاستفادهٔ معمولی)                                                   |

### DNS rebinding (میزبانی شخصی خارج از Cloudflare)

worker هر URL را که به یک IP خصوصی یا داخلی resolve شود رد می‌کند. نمی‌تواند از فهرست ثابتی از میزبان‌های مجاز استفاده کند، چون URLهای زنجیرهٔ گواهی به هر CA که گواهی را صادر کرده اشاره می‌کنند (FNMT، CAهای سازمانی و غیره)، پس مقصدها از پیش معلوم نیستند. این یک پنجرهٔ کوچک rebinding باقی می‌گذارد: کسی که DNS دامنهٔ خودش را اداره می‌کند می‌تواند یک IP عمومی به بررسی ایمنی و لحظه‌ای بعد یک IP خصوصی به درخواست واقعی بدهد.

روی Cloudflare این قابل بهره‌برداری نیست: Workers نمی‌توانند به IPهای خصوصی یا endpoint فرادادهٔ `169.254.169.254` دسترسی پیدا کنند، پس rebind به جایی نمی‌رسد. فقط راه ورودی به worker ندهید: Tunnel، Service یا binding شبکهٔ خصوصی متصل نکنید (فقط به `RATE_LIMIT_KV` نیاز دارد).

اگر این را خارج از Cloudflare (workerd، Node و مانند آن‌ها) درون یک VPC اجرا می‌کنید، محیط اجرا _می‌تواند_ به IPهای داخلی دسترسی پیدا کند. یک فایروال خروجی جلوی آن قرار دهید و محدوده‌های خصوصی را مسدود کنید: `10.0.0.0/8`، `172.16.0.0/12`، `192.168.0.0/16`، `127.0.0.0/8`، `169.254.0.0/16` و معادل‌های IPv6 آن‌ها. وقتی خارج از Cloudflare هستید، کد برنامه نمی‌تواند این را اعمال کند.

## غیرفعال کردن پراکسی

اگر نمی‌خواهید از پراکسی CORS استفاده کنید، متغیر محیطی را با رشتهٔ خالی تنظیم کنید:

```
VITE_CORS_PROXY_URL=
```

**نکته**: بدون پراکسی، امضا با گواهی‌هایی که به دریافت خارجی زنجیره نیاز دارند (مانند FNMT یا برخی CAهای سازمانی) با خطای "Failed to fetch" شکست می‌خورد.

## عیب‌یابی

### "Signing error: TypeError: Failed to fetch"

این معمولاً یعنی یکی از این موارد:

1. **پراکسی CORS پیکربندی نشده است**: `VITE_CORS_PROXY_URL` را تنظیم کنید و دوباره بسازید
2. **محتوای ترکیبی مسدود شده است**: سایت شما HTTPS است، اما URL صادرکنندهٔ گواهی HTTP است. پراکسی CORS این را حل می‌کند.
3. **پراکسی CORS مبدأ شما را رد می‌کند**: بررسی کنید دامنهٔ شما در آرایهٔ `ALLOWED_ORIGINS` در `cors-proxy-worker.js` باشد

### خطای "403 Forbidden" از پراکسی

دامنهٔ شما در فهرست `ALLOWED_ORIGINS` نیست. `cors-proxy-worker.js` را ویرایش کنید:

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

سپس دوباره مستقر کنید: `npx wrangler deploy`

### آزمایش پراکسی

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### گواهی‌هایی که بدون پراکسی کار می‌کنند

برخی گواهی‌ها زنجیرهٔ کامل را در فایل P12/PFX دارند و به دریافت خارجی نیاز ندارند:

- گواهی‌های خودامضا
- برخی CAهای تجاری که گواهی‌های میانی را همراه می‌کنند
- گواهی‌هایی که خودتان دستی با زنجیرهٔ کامل سرهم کرده‌اید
