# Развёртывание на Apache

Размещение BentoPDF на Apache HTTP Server.

## Требования

- Apache 2.4+
- Включённый mod_rewrite
- SSL-сертификат (рекомендуется)

## Шаг 1: соберите проект

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Чтобы настроить брендинг, задайте переменные окружения перед сборкой:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Шаг 2: скопируйте файлы

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Шаг 3: конфигурация Apache

Создайте `/etc/apache2/sites-available/bentopdf.conf`:

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

## Шаг 4: .htaccess для маршрутизации

Создайте `/var/www/bentopdf/.htaccess`:

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

## Шаг 5: включите нужные модули

```bash
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
```

## Шаг 6: включите сайт

```bash
sudo a2ensite bentopdf.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## Развёртывание в подкаталоге

Чтобы разместить по адресу `/pdf/`:

1. Соберите проект с базовым URL:

```bash
BASE_URL=/pdf/ npm run build
```

2. Обновите `.htaccess`:

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

## Устранение неполадок

### Ошибки 404 для WASM

Убедитесь, что настроен MIME-тип:

```apache
AddType application/wasm .wasm
```

### Sign PDF или Form Filler показывают пустой просмотрщик (ошибка MIME для `.mjs`)

Если в консоли браузера видно:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…и неудачный запрос заканчивается на `.mjs`, в конфигурации Apache нет сопоставления `.mjs → application/javascript`. Встроенный PDF-просмотрщик поставляется с ES-модулями с расширением `.mjs`, а стандартный `mime.types` Apache их по умолчанию не содержит.

Добавьте в VirtualHost или `.htaccess`:

```apache
AddType application/javascript .mjs
```

Затем перезагрузите Apache:

```bash
sudo apache2ctl configtest && sudo systemctl reload apache2
```

Для проверки откройте DevTools браузера → вкладка Network, найдите неудачный запрос `.mjs` и посмотрите заголовок ответа `Content-Type`. Теперь он должен быть `application/javascript`, а не `application/octet-stream`.

### Rewrite не работает

Проверьте, что mod_rewrite включён:

```bash
sudo a2enmod rewrite
```

### Конвертация Word/ODT/Excel в PDF не работает

LibreOffice WASM требует `SharedArrayBuffer`, для которого нужны такие заголовки:

```apache
Header always set Cross-Origin-Embedder-Policy "require-corp"
Header always set Cross-Origin-Opener-Policy "same-origin"
```

Также нужен безопасный контекст. `http://localhost` подходит для локального тестирования, а для `http://192.168.x.x` и других адресов локальной сети обычно требуется HTTPS. Если заголовки есть, но `window.crossOriginIsolated` по-прежнему `false`, проверьте, не открывается ли страница по обычному HTTP с адреса, отличного от loopback.

Предварительно сжатым файлам `.wasm.gz` и `.data.gz` также нужен правильный `Content-Encoding`:

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

Убедитесь, что `mod_headers` включён: `sudo a2enmod headers`

### Отказано в доступе

```bash
sudo chown -R www-data:www-data /var/www/bentopdf
sudo chmod -R 755 /var/www/bentopdf
```
