# Apache ile Dağıtım

BentoPDF'i Apache HTTP Server ile barındırın.

## Gereksinimler

- Apache 2.4+
- mod_rewrite etkin
- SSL sertifikası (önerilir)

## Adım 1: Projeyi Derleyin

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Markayı özelleştirmek için derlemeden önce ortam değişkenlerini ayarlayın:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Adım 2: Dosyaları Kopyalayın

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Adım 3: Apache Yapılandırması

`/etc/apache2/sites-available/bentopdf.conf` dosyasını oluşturun:

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

## Adım 4: Yönlendirme için .htaccess

`/var/www/bentopdf/.htaccess` dosyasını oluşturun:

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

## Adım 5: Gerekli Modülleri Etkinleştirin

```bash
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
```

## Adım 6: Siteyi Etkinleştirin

```bash
sudo a2ensite bentopdf.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## Alt Dizinde Dağıtım

`/pdf/` altında barındırmak için:

1. Temel URL ile derleyin:

```bash
BASE_URL=/pdf/ npm run build
```

2. `.htaccess` dosyasını güncelleyin:

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

## Sorun Giderme

### WASM 404 Hataları

MIME türünün yapılandırıldığından emin olun:

```apache
AddType application/wasm .wasm
```

### PDF İmzala veya Form Doldurucu Boş Görüntüleyici Gösteriyor (`.mjs` MIME hatası)

Tarayıcı konsolunda şu görünüyorsa:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

...ve başarısız olan istek `.mjs` ile bitiyorsa, Apache yapılandırmanızda `.mjs → application/javascript` eşlemesi eksik demektir. Paketle gelen PDF görüntüleyici ES modül dosyalarını `.mjs` uzantısıyla sunar ve Apache'nin varsayılan `mime.types` dosyası bunları içermez.

VirtualHost veya `.htaccess` dosyanıza ekleyin:

```apache
AddType application/javascript .mjs
```

Ardından Apache'yi yeniden yükleyin:

```bash
sudo apache2ctl configtest && sudo systemctl reload apache2
```

Doğrulamak için: tarayıcı DevTools → Network sekmesinde başarısız olan `.mjs` isteğini bulun ve `Content-Type` yanıt başlığına bakın. Artık `application/octet-stream` değil, `application/javascript` olmalıdır.

### Rewrite Çalışmıyor

mod_rewrite'ın etkin olduğunu kontrol edin:

```bash
sudo a2enmod rewrite
```

### Word/ODT/Excel'den PDF'e Dönüştürme Çalışmıyor

LibreOffice WASM, `SharedArrayBuffer` gerektirir ve bunun için şu başlıklar gerekir:

```apache
Header always set Cross-Origin-Embedder-Policy "require-corp"
Header always set Cross-Origin-Opener-Policy "same-origin"
```

Ayrıca güvenli bir bağlam da gerekir. `http://localhost` yerel testler için çalışır, ancak `http://192.168.x.x` gibi yerel ağ IP'leri genellikle HTTPS gerektirir. Başlıklar mevcut olduğu halde `window.crossOriginIsolated` hâlâ `false` ise, sayfanın geri döngü olmayan bir kaynakta düz HTTP üzerinden açılıp açılmadığını kontrol edin.

Önceden sıkıştırılmış `.wasm.gz` ve `.data.gz` dosyaları da doğru `Content-Encoding` gerektirir:

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

`mod_headers`'ın etkin olduğundan emin olun: `sudo a2enmod headers`

### İzin Reddedildi

```bash
sudo chown -R www-data:www-data /var/www/bentopdf
sudo chmod -R 755 /var/www/bentopdf
```
