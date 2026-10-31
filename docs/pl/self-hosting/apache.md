# Wdrożenie z Apache

Hostuj BentoPDF za pomocą serwera Apache HTTP Server.

## Wymagania wstępne

- Apache 2.4+
- Włączony mod_rewrite
- Certyfikat SSL (zalecany)

## Krok 1: Zbuduj projekt

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Aby dostosować branding, ustaw zmienne środowiskowe przed budowaniem:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Krok 2: Skopiuj pliki

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Krok 3: Konfiguracja Apache

Utwórz `/etc/apache2/sites-available/bentopdf.conf`:

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

## Krok 4: .htaccess do routingu

Utwórz `/var/www/bentopdf/.htaccess`:

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

## Krok 5: Włącz wymagane moduły

```bash
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
```

## Krok 6: Włącz witrynę

```bash
sudo a2ensite bentopdf.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## Wdrożenie w podkatalogu

Aby hostować pod adresem `/pdf/`:

1. Zbuduj z bazowym adresem URL:

```bash
BASE_URL=/pdf/ npm run build
```

2. Zaktualizuj `.htaccess`:

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

## Rozwiązywanie problemów

### Błędy 404 dla WASM

Upewnij się, że typ MIME jest skonfigurowany:

```apache
AddType application/wasm .wasm
```

### Podpisywanie PDF lub wypełnianie formularzy pokazuje pustą przeglądarkę (błąd MIME `.mjs`)

Jeśli konsola przeglądarki pokazuje:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…a żądanie, które się nie powiodło, kończy się na `.mjs`, w konfiguracji Apache brakuje mapowania `.mjs → application/javascript`. Dołączona przeglądarka PDF zawiera moduły ES z rozszerzeniem `.mjs`, a standardowy plik `mime.types` w Apache domyślnie ich nie obejmuje.

Dodaj do VirtualHost lub `.htaccess`:

```apache
AddType application/javascript .mjs
```

Następnie przeładuj Apache:

```bash
sudo apache2ctl configtest && sudo systemctl reload apache2
```

Aby to potwierdzić: w narzędziach deweloperskich przeglądarki → karta Network znajdź nieudane żądanie `.mjs` i sprawdź nagłówek odpowiedzi `Content-Type`. Powinien mieć wartość `application/javascript`, a nie `application/octet-stream`.

### Rewrite nie działa

Sprawdź, czy mod_rewrite jest włączony:

```bash
sudo a2enmod rewrite
```

### Konwersja Word/ODT/Excel do PDF nie działa

LibreOffice WASM wymaga `SharedArrayBuffer`, a do tego potrzebne są te nagłówki:

```apache
Header always set Cross-Origin-Embedder-Policy "require-corp"
Header always set Cross-Origin-Opener-Policy "same-origin"
```

Potrzebny jest też bezpieczny kontekst. `http://localhost` działa do testów lokalnych, ale `http://192.168.x.x` i inne adresy LAN zwykle wymagają HTTPS. Jeśli nagłówki są obecne, a `window.crossOriginIsolated` nadal ma wartość `false`, sprawdź, czy strona nie jest otwierana przez zwykłe HTTP z adresu innego niż pętla zwrotna.

Wstępnie skompresowane pliki `.wasm.gz` i `.data.gz` wymagają też poprawnego `Content-Encoding`:

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

Upewnij się, że `mod_headers` jest włączony: `sudo a2enmod headers`

### Odmowa dostępu

```bash
sudo chown -R www-data:www-data /var/www/bentopdf
sudo chmod -R 755 /var/www/bentopdf
```
