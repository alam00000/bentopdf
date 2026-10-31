# النشر باستخدام Apache

استضف BentoPDF باستخدام خادم Apache HTTP.

## المتطلبات

- Apache 2.4+
- تفعيل mod_rewrite
- شهادة SSL (موصى بها)

## الخطوة 1: بناء المشروع

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

لتخصيص العلامة التجارية، عيّن متغيرات البيئة قبل البناء:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## الخطوة 2: نسخ الملفات

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## الخطوة 3: إعداد Apache

أنشئ `/etc/apache2/sites-available/bentopdf.conf`:

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

## الخطوة 4: ملف .htaccess للتوجيه

أنشئ `/var/www/bentopdf/.htaccess`:

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

## الخطوة 5: تفعيل الوحدات المطلوبة

```bash
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
```

## الخطوة 6: تفعيل الموقع

```bash
sudo a2ensite bentopdf.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## النشر في مجلد فرعي

للاستضافة على المسار `/pdf/`:

1. ابنِ المشروع مع عنوان أساسي (base URL):

```bash
BASE_URL=/pdf/ npm run build
```

2. حدّث `.htaccess`:

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

## استكشاف الأخطاء وإصلاحها

### أخطاء WASM 404

تأكد من ضبط نوع MIME:

```apache
AddType application/wasm .wasm
```

### أداة توقيع PDF أو تعبئة النماذج تعرض عارضًا فارغًا (خطأ MIME لملفات `.mjs`)

إذا ظهر في وحدة تحكم المتصفح:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

...وكان الطلب الفاشل ينتهي بـ `.mjs`، فإن إعداد Apache لديك يفتقد الربط `.mjs → application/javascript`. يتضمن عارض PDF المدمج ملفات وحدات ES بامتداد `.mjs`، ولا يشملها ملف `mime.types` الافتراضي في Apache.

أضف التالي إلى VirtualHost أو إلى `.htaccess`:

```apache
AddType application/javascript .mjs
```

ثم أعد تحميل Apache:

```bash
sudo apache2ctl configtest && sudo systemctl reload apache2
```

للتأكد: في أدوات المطوّر بالمتصفح (DevTools) ← تبويب Network، ابحث عن طلب `.mjs` الفاشل وافحص ترويسة الاستجابة `Content-Type`. يجب أن تكون الآن `application/javascript` وليست `application/octet-stream`.

### إعادة الكتابة لا تعمل

تأكد من تفعيل mod_rewrite:

```bash
sudo a2enmod rewrite
```

### تحويل Word/ODT/Excel إلى PDF لا يعمل

يتطلب LibreOffice WASM وجود `SharedArrayBuffer`، وهذا يحتاج إلى هذه الترويسات:

```apache
Header always set Cross-Origin-Embedder-Policy "require-corp"
Header always set Cross-Origin-Opener-Policy "same-origin"
```

ويحتاج أيضًا إلى سياق آمن. يعمل `http://localhost` للاختبار المحلي، لكن `http://192.168.x.x` أو غيره من عناوين الشبكة المحلية يتطلب عادةً HTTPS. إذا كانت الترويسات موجودة لكن `window.crossOriginIsolated` ما زالت `false`، فتحقق مما إذا كانت الصفحة تُفتح عبر HTTP عادي من مصدر ليس عنوان الحلقة المحلية.

كما تحتاج ملفات `.wasm.gz` و`.data.gz` المضغوطة مسبقًا إلى `Content-Encoding` صحيح:

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

تأكد من تفعيل `mod_headers`: `sudo a2enmod headers`

### تم رفض الإذن

```bash
sudo chown -R www-data:www-data /var/www/bentopdf
sudo chmod -R 755 /var/www/bentopdf
```
