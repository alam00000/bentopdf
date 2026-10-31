# استقرار با Nginx

BentoPDF را با Nginx روی سرور خودتان میزبانی کنید.

## پیش‌نیازها

- سرور Ubuntu/Debian
- Nginx نصب‌شده
- گواهی SSL (پیشنهادی: Let's Encrypt)

## گام ۱: ساخت پروژه

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

برای سفارشی‌سازی برند، پیش از ساخت متغیرهای محیطی را تنظیم کنید:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## گام ۲: کپی فایل‌ها

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## گام ۳: پیکربندی Nginx

فایل `/etc/nginx/sites-available/bentopdf` را بسازید:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    root /var/www/bentopdf;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/wasm;
    gzip_min_length 1000;

    # WASM MIME type
    types {
        application/wasm wasm;
    }

    # Required headers for SharedArrayBuffer (LibreOffice WASM)
    # These must be on every response - especially HTML pages
    add_header Cross-Origin-Embedder-Policy "require-corp" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    add_header Cross-Origin-Resource-Policy "cross-origin" always;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Pre-compressed LibreOffice WASM binary
    location ~* /libreoffice-wasm/soffice\.wasm\.gz$ {
        gzip off;
        types {} default_type application/wasm;
        add_header Content-Encoding gzip;
        add_header Cache-Control "public, immutable";
        add_header Cross-Origin-Embedder-Policy "require-corp" always;
        add_header Cross-Origin-Opener-Policy "same-origin" always;
    }

    # Pre-compressed LibreOffice WASM data
    location ~* /libreoffice-wasm/soffice\.data\.gz$ {
        gzip off;
        types {} default_type application/octet-stream;
        add_header Content-Encoding gzip;
        add_header Cache-Control "public, immutable";
        add_header Cross-Origin-Embedder-Policy "require-corp" always;
        add_header Cross-Origin-Opener-Policy "same-origin" always;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|wasm)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Cross-Origin-Embedder-Policy "require-corp" always;
        add_header Cross-Origin-Opener-Policy "same-origin" always;
    }

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cross-Origin-Embedder-Policy "require-corp" always;
        add_header Cross-Origin-Opener-Policy "same-origin" always;
    }
}
```

## گام ۴: فعال کردن سایت

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## گام ۵: SSL با Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## استقرار در زیرپوشه

برای میزبانی در `/pdf/`:

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

با این دستور بسازید:

```bash
BASE_URL=/pdf/ npm run build
```

## بهینه‌سازی کارایی

به `nginx.conf` اضافه کنید:

```nginx
http {
    # Enable sendfile
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;

    # Increase buffer sizes
    client_max_body_size 100M;

    # Worker connections
    worker_connections 2048;
}
```

## عیب‌یابی

### WASM بارگذاری نمی‌شود

مطمئن شوید نوع MIME تنظیم شده است:

```nginx
types {
    application/wasm wasm;
}
```

### امضای PDF یا پرکنندهٔ فرم نمایشگر خالی نشان می‌دهد (خطای MIME برای `.mjs`)

اگر کنسول مرورگر این را نشان می‌دهد:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…و درخواست ناموفق به `.mjs` ختم می‌شود، nginx شما نگاشت `.mjs → application/javascript` را ندارد. نمایشگر PDF همراه (که امضای PDF، پرکنندهٔ فرم و چند ابزار دیگر از آن استفاده می‌کنند) فایل‌های ماژول ES با پسوند `.mjs` دارد و `mime.types` پیش‌فرض nginx به‌طور پیش‌فرض آن‌ها را شامل نمی‌شود.

برای رفع آن، `mjs` را به خط موجود `application/javascript` در `/etc/nginx/mime.types` اضافه کنید:

```nginx
application/javascript    js mjs;
```

> خط _دومی_ برای `application/javascript` اضافه نکنید؛ nginx فایل `mime.types` را خط به خط تجزیه می‌کند و فقط یک نگاشت نوع به پسوند اعمال می‌شود، پس در برخی نسخه‌ها خط دوم بی‌صدا نادیده گرفته می‌شود. خط موجود را ویرایش کنید و `mjs` را کنار `js` اضافه کنید.

یا به‌صورت محلی درون بلوک server بازنویسی کنید (بدون ویرایش فایل سراسری):

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

پس از تغییر، nginx را دوباره بارگذاری کنید:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

برای تأیید: در DevTools مرورگر ← زبانهٔ Network، درخواست ناموفق `.mjs` را پیدا کنید و هدر پاسخ `Content-Type` را بررسی کنید. اکنون باید `application/javascript` باشد، نه `application/octet-stream`.

### تبدیل Word/ODT/Excel به PDF کار نمی‌کند

LibreOffice WASM به `SharedArrayBuffer` نیاز دارد که آن هم به هدرهای `Cross-Origin-Embedder-Policy` و `Cross-Origin-Opener-Policy` نیاز دارد. همچنین به یک بستر امن نیاز دارد، بنابراین `http://localhost` برای آزمایش محلی کار می‌کند اما `http://192.168.x.x` یا دیگر IPهای شبکهٔ محلی معمولاً به HTTPS نیاز دارند. توجه کنید که دستورهای `add_header` در nginx درون یک بلوک `location` دستورهای `add_header` سطح server را **بازنویسی** می‌کنند و با آن‌ها ادغام نمی‌شوند. هر بلوک `location` که `add_header` خودش را دارد باید هدرهای COEP/COOP را نیز شامل شود.

با این دستور بررسی کنید:

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

اگر جلوی nginx از پراکسی معکوس استفاده می‌کنید، مطمئن شوید این هدرها را حفظ می‌کند.

### 502 Bad Gateway

لاگ‌های خطای Nginx را بررسی کنید:

```bash
sudo tail -f /var/log/nginx/error.log
```
