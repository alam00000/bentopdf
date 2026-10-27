# استقرار با Apache

BentoPDF را با Apache HTTP Server میزبانی کنید.

## پیش‌نیازها

- Apache 2.4+
- فعال بودن mod_rewrite
- گواهی SSL (توصیه‌شده)

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

## گام ۳: پیکربندی Apache

فایل `/etc/apache2/sites-available/bentopdf.conf` را بسازید:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    Redirect permanent / https://your-domain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName your-domain.com
    DocumentRoot /var/www/bentopdf

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/your-domain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/your-domain.com/privkey.pem

    <Directory /var/www/bentopdf>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # WASM MIME type
    AddType application/wasm .wasm

    # Prevent double-compression of pre-compressed files
    SetEnvIfNoCase Request_URI "\.gz$" no-gzip

    # Compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript application/json application/wasm
    </IfModule>

    # Cache headers
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType application/javascript "access plus 1 year"
        ExpiresByType text/css "access plus 1 year"
        ExpiresByType application/wasm "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType image/svg+xml "access plus 1 year"
    </IfModule>

    # Required headers for SharedArrayBuffer (LibreOffice WASM)
    Header always set Cross-Origin-Embedder-Policy "require-corp"
    Header always set Cross-Origin-Opener-Policy "same-origin"
    Header always set Cross-Origin-Resource-Policy "cross-origin"

    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"

    # Pre-compressed LibreOffice WASM files
    <FilesMatch "soffice\.wasm\.gz$">
        ForceType application/wasm
        Header set Content-Encoding "gzip"
    </FilesMatch>
    <FilesMatch "soffice\.data\.gz$">
        ForceType application/octet-stream
        Header set Content-Encoding "gzip"
    </FilesMatch>
</VirtualHost>
```

## گام ۴: فایل .htaccess برای مسیریابی

فایل `/var/www/bentopdf/.htaccess` را بسازید:

```apache
RewriteEngine On
RewriteBase /

# Existing files/dirs - serve directly
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# ============================================
# LANGUAGE ROUTES
# ============================================
# Supported languages: de, es, zh, zh-TW, vi, it, id, tr, fr, pt
# English has no prefix - served from root

# English prefix redirects to root
RewriteRule ^en/?$ / [R=301,L]
RewriteRule ^en/(.+)$ /$1 [R=301,L]

# Language prefix root (e.g., /de/ -> /de/index.html)
RewriteCond %{DOCUMENT_ROOT}/$1/index.html -f
RewriteRule ^(de|es|zh|zh-TW|vi|it|id|tr|fr|pt)/?$ /$1/index.html [L]

# Language prefix with path (e.g., /de/merge-pdf -> /de/merge-pdf.html)
RewriteCond %{DOCUMENT_ROOT}/$1/$2.html -f
RewriteRule ^(de|es|zh|zh-TW|vi|it|id|tr|fr|pt)/([^/]+)/?$ /$1/$2.html [L]

# ============================================
# ADD .HTML EXTENSION (ROOT LEVEL)
# ============================================
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^([^/]+)$ $1.html [L]

ErrorDocument 404 /404.html
```

## گام ۵: فعال‌سازی ماژول‌های لازم

```bash
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
```

## گام ۶: فعال‌سازی سایت

```bash
sudo a2ensite bentopdf.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## استقرار در زیرپوشه

برای میزبانی در `/pdf/`:

1. با URL پایه بسازید:

```bash
BASE_URL=/pdf/ npm run build
```

2. فایل `.htaccess` را به‌روز کنید:

```apache
RewriteEngine On
RewriteBase /pdf/

# Existing files/dirs - serve directly
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Language routes
RewriteRule ^en/?$ /pdf/ [R=301,L]
RewriteRule ^en/(.+)$ /pdf/$1 [R=301,L]

RewriteCond %{DOCUMENT_ROOT}/pdf/$1/index.html -f
RewriteRule ^(de|es|zh|zh-TW|vi|it|id|tr|fr|pt)/?$ /pdf/$1/index.html [L]

RewriteCond %{DOCUMENT_ROOT}/pdf/$1/$2.html -f
RewriteRule ^(de|es|zh|zh-TW|vi|it|id|tr|fr|pt)/([^/]+)/?$ /pdf/$1/$2.html [L]

# Root level .html extension
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^([^/]+)$ $1.html [L]

ErrorDocument 404 /pdf/404.html
```

## عیب‌یابی

### خطاهای 404 برای WASM

مطمئن شوید نوع MIME پیکربندی شده است:

```apache
AddType application/wasm .wasm
```

### امضای PDF یا پرکنندهٔ فرم نمایشگر خالی نشان می‌دهد (خطای MIME برای `.mjs`)

اگر کنسول مرورگر این را نشان می‌دهد:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…و درخواست ناموفق به `.mjs` ختم می‌شود، پیکربندی Apache شما نگاشت `.mjs → application/javascript` را ندارد. نمایشگر PDF همراه، فایل‌های ماژول ES با پسوند `.mjs` دارد و `mime.types` پیش‌فرض Apache به‌طور پیش‌فرض آن‌ها را شامل نمی‌شود.

به VirtualHost یا `.htaccess` خود اضافه کنید:

```apache
AddType application/javascript .mjs
```

سپس Apache را دوباره بارگذاری کنید:

```bash
sudo apache2ctl configtest && sudo systemctl reload apache2
```

برای تأیید: در DevTools مرورگر ← زبانهٔ Network، درخواست ناموفق `.mjs` را پیدا کنید و سرآیند پاسخ `Content-Type` را بررسی کنید. اکنون باید `application/javascript` باشد، نه `application/octet-stream`.

### بازنویسی کار نمی‌کند

بررسی کنید که mod_rewrite فعال باشد:

```bash
sudo a2enmod rewrite
```

### تبدیل Word/ODT/Excel به PDF کار نمی‌کند

LibreOffice WASM به `SharedArrayBuffer` نیاز دارد که این سرآیندها را لازم دارد:

```apache
Header always set Cross-Origin-Embedder-Policy "require-corp"
Header always set Cross-Origin-Opener-Policy "same-origin"
```

همچنین به یک بستر امن (secure context) نیاز دارد. `http://localhost` برای آزمایش محلی کار می‌کند، اما `http://192.168.x.x` یا دیگر IPهای شبکهٔ محلی معمولاً به HTTPS نیاز دارند. اگر سرآیندها وجود دارند اما `window.crossOriginIsolated` همچنان `false` است، بررسی کنید که آیا صفحه با HTTP ساده روی مبدأیی غیر از loopback باز می‌شود.

فایل‌های از پیش فشرده‌شدهٔ `.wasm.gz` و `.data.gz` نیز به `Content-Encoding` درست نیاز دارند:

```apache
<FilesMatch "soffice\.wasm\.gz$">
    ForceType application/wasm
    Header set Content-Encoding "gzip"
</FilesMatch>
<FilesMatch "soffice\.data\.gz$">
    ForceType application/octet-stream
    Header set Content-Encoding "gzip"
</FilesMatch>
```

مطمئن شوید `mod_headers` فعال است: `sudo a2enmod headers`

### دسترسی رد شد (Permission Denied)

```bash
sudo chown -R www-data:www-data /var/www/bentopdf
sudo chmod -R 755 /var/www/bentopdf
```
