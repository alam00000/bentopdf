# النشر على Hostinger

[Hostinger](https://hostinger.com) مزوّد استضافة مشتركة شهير. يشرح هذا الدليل نشر BentoPDF على الاستضافة المشتركة في Hostinger.

## المتطلبات

- خطة استضافة Hostinger مع إمكانية الوصول إلى مدير الملفات
- تثبيت Node.js محليًا للبناء

## الخطوة 1: بناء المشروع

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

ستكون الملفات المبنية في مجلد `dist`.

## الخطوة 2: الرفع إلى Hostinger

### النشر على النطاق الرئيسي

1. سجّل الدخول إلى حسابك في Hostinger
2. انتقل إلى **File Manager** ← **public_html**
3. **احذف** أي ملفات موجودة (خذ نسخة احتياطية عند الحاجة)
4. **ارفع** كل محتويات مجلد `dist` المحلي إلى `public_html`

### النشر في مجلد فرعي

إذا كنت تنشر في مجلد فرعي (مثل `yourdomain.com/pdf-tools/`):

1. ابنِ المشروع بعنوان أساسي (base URL) صحيح:

```bash
BASE_URL=/pdf-tools/ npm run build
```

2. أنشئ المجلد في Hostinger:
   - انتقل إلى **File Manager** ← **public_html**
   - أنشئ مجلدًا جديدًا: `pdf-tools`
3. ارفع كل محتويات `dist` إلى `public_html/pdf-tools/`

## الخطوة 3: إنشاء ملف .htaccess

أنشئ ملف `.htaccess` في جذر مجلد النشر (`public_html` أو `public_html/pdf-tools/`):

::: warning مهم
عند النشر في مجلد فرعي، غيّر `RewriteBase /` إلى `RewriteBase /pdf-tools/` (أو اسم مجلدك).
:::

```apache
RewriteEngine On
RewriteBase /

# ============================================
# 1. SECURITY HEADERS (CRITICAL FOR WASM)
# ============================================
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"

    # REQUIRED for soffice.js (SharedArrayBuffer)
    Header always set Cross-Origin-Opener-Policy "same-origin"
    Header always set Cross-Origin-Embedder-Policy "require-corp"
</IfModule>

# ============================================
# 2. BROWSER CACHING
# ============================================
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/x-icon "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/ttf "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/wasm "access plus 1 year"
    ExpiresByType application/gzip "access plus 1 year"
    ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# ============================================
# 3. COMPRESSION (STANDARD)
# ============================================
# Prevent server from double-compressing files
SetEnvIfNoCase Request_URI "\.gz$" no-gzip
SetEnvIfNoCase Request_URI "\.br$" no-gzip
SetEnvIfNoCase Request_URI "\.wasm$" no-gzip

<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
    AddOutputFilterByType DEFLATE image/svg+xml
    AddOutputFilterByType DEFLATE font/woff
    AddOutputFilterByType DEFLATE font/ttf
</IfModule>

# ============================================
# 4. MIME TYPES & SPECIAL FILE HANDLING
# ============================================
AddType application/javascript .js .mjs
AddType application/wasm .wasm
AddType font/woff2 .woff2
AddType font/woff .woff
AddType image/webp .webp

# Handle soffice.wasm.gz correctly
<FilesMatch "soffice\.wasm\.gz$">
    ForceType application/wasm
    Header set Content-Encoding "gzip"
    Header set Cross-Origin-Resource-Policy "cross-origin"
    Header append Vary Accept-Encoding
</FilesMatch>

# Handle data.gz
<FilesMatch "soffice\.data\.gz$">
    ForceType application/octet-stream
    Header set Content-Encoding "gzip"
    Header append Vary Accept-Encoding
</FilesMatch>

# ============================================
# 5. REDIRECTS & ROUTING
# ============================================
# Canonical WWW (update domain as needed)
RewriteCond %{HTTP_HOST} ^bentopdf\.com [NC]
RewriteRule ^(.*)$ https://www.bentopdf.com/$1 [L,R=301]

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Remove trailing slash (except for language root directories)
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/(de|es|zh|zh-TW|vi|it|id|tr|fr|pt)/$
RewriteCond %{REQUEST_URI} (.+)/$
RewriteRule ^ %1 [R=301,L]

# Existing files/dirs - serve directly
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# ============================================
# 5.1. LANGUAGE ROUTES
# ============================================
# Supported languages: de, es, zh, zh-TW, vi, it, id, tr, fr, pt
# English has no prefix - served from root

# English prefix redirects to root (for SEO consistency)
RewriteRule ^en/?$ / [R=301,L]
RewriteRule ^en/(.+)$ /$1 [R=301,L]

# Language prefix root (e.g., /de/ -> /de/index.html)
RewriteCond %{DOCUMENT_ROOT}/$1/index.html -f
RewriteRule ^(de|es|zh|zh-TW|vi|it|id|tr|fr|pt)/?$ /$1/index.html [L]

# Language prefix with path (e.g., /de/merge-pdf -> /de/merge-pdf.html)
RewriteCond %{DOCUMENT_ROOT}/$1/$2.html -f
RewriteRule ^(de|es|zh|zh-TW|vi|it|id|tr|fr|pt)/([^/]+)/?$ /$1/$2.html [L]

# ============================================
# 5.5. DOCS ROUTING (VitePress)
# ============================================
RewriteCond %{REQUEST_URI} ^/docs
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME}\.html -f
RewriteRule ^(.*)$ $1.html [L]

# ============================================
# 6. ADD .HTML EXTENSION IF FILE EXISTS (ROOT LEVEL ONLY)
# ============================================
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^([^/]+)$ $1.html [L]

# ============================================
# 7. ERROR PAGES
# ============================================
ErrorDocument 404 /404.html
```

## مثال على .htaccess للمجلد الفرعي

للنطاق `yourdomain.com/pdf-tools/`، حدّث هذه الأسطر:

```apache
RewriteBase /pdf-tools/

# ... (same content as above, but update paths) ...

# Language prefix root
RewriteCond %{DOCUMENT_ROOT}/pdf-tools/$1/index.html -f
RewriteRule ^(de|es|zh|zh-TW|vi|it|id|tr|fr|pt)/?$ /pdf-tools/$1/index.html [L]

# Language prefix with path
RewriteCond %{DOCUMENT_ROOT}/pdf-tools/$1/$2.html -f
RewriteRule ^(de|es|zh|zh-TW|vi|it|id|tr|fr|pt)/([^/]+)/?$ /pdf-tools/$1/$2.html [L]

# Root level .html extension
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^([^/]+)$ $1.html [L]

ErrorDocument 404 /pdf-tools/404.html
```

## استكشاف الأخطاء وإصلاحها

### ملفات WASM لا تُحمَّل

تأكد من ضبط أنواع MIME بشكل صحيح في `.htaccess`:

```apache
AddType application/wasm .wasm
```

### أدوات LibreOffice لا تعمل

ترويسات الأمان حاسمة لعمل SharedArrayBuffer:

```apache
Header always set Cross-Origin-Opener-Policy "same-origin"
Header always set Cross-Origin-Embedder-Policy "require-corp"
```

إذا لم تُطبَّق الترويسات، فتواصل مع دعم Hostinger لتفعيل `mod_headers`.

### أخطاء 404 عند تحديث الصفحة

تأكد من ضبط قاعدة امتداد `.html` ومسارات اللغات بشكل صحيح. يستخدم BentoPDF ملفات HTML ثابتة وليس توجيه SPA:

```apache
# Language routes serve actual files from language directories
RewriteCond %{DOCUMENT_ROOT}/$1/$2.html -f
RewriteRule ^(de|es|zh|zh-TW|vi|it|id|tr|fr|pt)/([^/]+)/?$ /$1/$2.html [L]

# Root level pages
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^([^/]+)$ $1.html [L]
```

### حدود رفع الملفات

قد تفرض Hostinger حدودًا على حجم الملفات. ارفع ملفات WASM بشكل منفصل إذا فشل الرفع الجماعي.
