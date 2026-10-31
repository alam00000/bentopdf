# Разгортванне з Apache

Размясціце BentoPDF з дапамогай Apache HTTP Server.

## Патрабаванні

- Apache 2.4+
- уключаны mod_rewrite
- SSL-сертыфікат (рэкамендуецца)

## Крок 1: Збярыце праект

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Каб змяніць брэндынг, задайце зменныя асяроддзя перад зборкай:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Крок 2: Скапіруйце файлы

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Крок 3: Канфігурацыя Apache

Стварыце `/etc/apache2/sites-available/bentopdf.conf`:

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

## Крок 4: .htaccess для маршрутызацыі

Стварыце `/var/www/bentopdf/.htaccess`:

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

## Крок 5: Уключыце неабходныя модулі

```bash
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
```

## Крок 6: Уключыце сайт

```bash
sudo a2ensite bentopdf.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## Разгортванне ў падкаталогу

Каб размясціць па адрасе `/pdf/`:

1. Збярыце з базавым URL:

```bash
BASE_URL=/pdf/ npm run build
```

2. Абнавіце `.htaccess`:

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

## Вырашэнне праблем

### Памылкі 404 для WASM

Пераканайцеся, што MIME-тып настроены:

```apache
AddType application/wasm .wasm
```

### Падпісаць PDF або Запоўніць форму PDF паказвае пусты прагляднік (памылка MIME `.mjs`)

Калі ў кансолі браўзера з'яўляецца:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…і запыт з памылкай заканчваецца на `.mjs`, у вашай канфігурацыі Apache адсутнічае адпаведнасць `.mjs → application/javascript`. Убудаваны прагляднік PDF пастаўляецца з файламі ES-модуляў з пашырэннем `.mjs`, а стандартны `mime.types` Apache па змаўчанні іх не ўключае.

Дадайце ў VirtualHost або `.htaccess`:

```apache
AddType application/javascript .mjs
```

Затым перазагрузіце Apache:

```bash
sudo apache2ctl configtest && sudo systemctl reload apache2
```

Каб праверыць: у DevTools браўзера → укладка Network знайдзіце запыт `.mjs` з памылкай і праверце загаловак адказу `Content-Type`. Цяпер ён павінен быць `application/javascript`, а не `application/octet-stream`.

### Rewrite не працуе

Праверце, што mod_rewrite уключаны:

```bash
sudo a2enmod rewrite
```

### Word/ODT/Excel у PDF не працуе

LibreOffice WASM патрабуе `SharedArrayBuffer`, для якога патрэбныя гэтыя загалоўкі:

```apache
Header always set Cross-Origin-Embedder-Policy "require-corp"
Header always set Cross-Origin-Opener-Policy "same-origin"
```

Таксама патрэбны бяспечны кантэкст. `http://localhost` падыходзіць для лакальнага тэсціравання, але `http://192.168.x.x` і іншыя IP-адрасы лакальнай сеткі звычайна патрабуюць HTTPS. Калі загалоўкі ёсць, але `window.crossOriginIsolated` усё яшчэ `false`, праверце, ці не адкрываецца старонка праз звычайны HTTP з адраса, які не з'яўляецца loopback.

Папярэдне сціснутым файлам `.wasm.gz` і `.data.gz` таксама патрэбны правільны `Content-Encoding`:

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

Пераканайцеся, што `mod_headers` уключаны: `sudo a2enmod headers`

### Адмоўлена ў доступе

```bash
sudo chown -R www-data:www-data /var/www/bentopdf
sudo chmod -R 755 /var/www/bentopdf
```
