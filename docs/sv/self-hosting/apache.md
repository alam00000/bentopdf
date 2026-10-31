# Driftsätt med Apache

Hosta BentoPDF med Apache HTTP Server.

## Förutsättningar

- Apache 2.4+
- mod_rewrite aktiverat
- SSL-certifikat (rekommenderas)

## Steg 1: Bygg projektet

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

För att anpassa varumärket, ange miljövariabler innan bygget:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Steg 2: Kopiera filer

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Steg 3: Apache-konfiguration

Skapa `/etc/apache2/sites-available/bentopdf.conf`:

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

## Steg 4: .htaccess för routing

Skapa `/var/www/bentopdf/.htaccess`:

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

## Steg 5: Aktivera nödvändiga moduler

```bash
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
```

## Steg 6: Aktivera webbplatsen

```bash
sudo a2ensite bentopdf.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## Driftsättning i en underkatalog

För att hosta på `/pdf/`:

1. Bygg med bas-URL:

```bash
BASE_URL=/pdf/ npm run build
```

2. Uppdatera `.htaccess`:

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

## Felsökning

### WASM 404-fel

Kontrollera att MIME-typen är konfigurerad:

```apache
AddType application/wasm .wasm
```

### Signera PDF eller Formulärifyllare visar en tom visare (`.mjs` MIME-fel)

Om webbläsarens konsol visar:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…och den misslyckade förfrågan slutar på `.mjs`, saknar din Apache-konfiguration mappningen `.mjs → application/javascript`. Den medföljande PDF-visaren levereras med ES-modulfiler med filändelsen `.mjs`, och Apaches standardfil `mime.types` innehåller dem inte som standard.

Lägg till i din VirtualHost eller `.htaccess`:

```apache
AddType application/javascript .mjs
```

Ladda sedan om Apache:

```bash
sudo apache2ctl configtest && sudo systemctl reload apache2
```

För att bekräfta: leta i webbläsarens DevTools → fliken Nätverk upp den misslyckade `.mjs`-förfrågan och kontrollera svarshuvudet `Content-Type`. Det ska nu vara `application/javascript`, inte `application/octet-stream`.

### Rewrite fungerar inte

Kontrollera att mod_rewrite är aktiverat:

```bash
sudo a2enmod rewrite
```

### Word/ODT/Excel till PDF fungerar inte

LibreOffice WASM kräver `SharedArrayBuffer`, vilket kräver dessa rubriker:

```apache
Header always set Cross-Origin-Embedder-Policy "require-corp"
Header always set Cross-Origin-Opener-Policy "same-origin"
```

Det kräver också en säker kontext. `http://localhost` fungerar för lokal testning, men `http://192.168.x.x` och andra LAN-adresser kräver oftast HTTPS. Om rubrikerna finns men `window.crossOriginIsolated` fortfarande är `false`, kontrollera om sidan öppnas över vanlig HTTP på ett ursprung som inte är loopback.

De förkomprimerade filerna `.wasm.gz` och `.data.gz` behöver också rätt `Content-Encoding`:

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

Kontrollera att `mod_headers` är aktiverat: `sudo a2enmod headers`

### Åtkomst nekad

```bash
sudo chown -R www-data:www-data /var/www/bentopdf
sudo chmod -R 755 /var/www/bentopdf
```
