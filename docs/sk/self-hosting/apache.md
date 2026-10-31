# Nasadenie s Apache

Hosťujte BentoPDF pomocou Apache HTTP Server.

## Predpoklady

- Apache 2.4+
- zapnutý mod_rewrite
- SSL certifikát (odporúčané)

## Krok 1: Zostavenie projektu

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Ak chcete prispôsobiť značku, pred zostavením nastavte premenné prostredia:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Krok 2: Skopírovanie súborov

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Krok 3: Konfigurácia Apache

Vytvorte `/etc/apache2/sites-available/bentopdf.conf`:

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

## Krok 4: .htaccess pre smerovanie

Vytvorte `/var/www/bentopdf/.htaccess`:

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

## Krok 5: Zapnutie potrebných modulov

```bash
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
```

## Krok 6: Zapnutie stránky

```bash
sudo a2ensite bentopdf.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## Nasadenie do podadresára

Hosťovanie na `/pdf/`:

1. Zostavte so základnou URL:

```bash
BASE_URL=/pdf/ npm run build
```

2. Upravte `.htaccess`:

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

## Riešenie problémov

### Chyby 404 pri WASM

Uistite sa, že je nastavený MIME typ:

```apache
AddType application/wasm .wasm
```

### Podpísať PDF alebo Vypĺňanie formulárov zobrazuje prázdny prehliadač (chyba MIME pri `.mjs`)

Ak konzola prehliadača zobrazuje:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…a zlyhávajúca požiadavka končí na `.mjs`, vo vašej konfigurácii Apache chýba mapovanie `.mjs → application/javascript`. Pribalený PDF prehliadač obsahuje súbory ES modulov s príponou `.mjs` a predvolený `mime.types` v Apache ich štandardne nezahŕňa.

Pridajte do VirtualHost alebo `.htaccess`:

```apache
AddType application/javascript .mjs
```

Potom znovu načítajte Apache:

```bash
sudo apache2ctl configtest && sudo systemctl reload apache2
```

Overenie: v DevTools prehliadača → karta Network nájdite zlyhávajúcu požiadavku `.mjs` a skontrolujte hlavičku odpovede `Content-Type`. Teraz by mala byť `application/javascript`, nie `application/octet-stream`.

### Prepisovanie nefunguje

Skontrolujte, či je zapnutý mod_rewrite:

```bash
sudo a2enmod rewrite
```

### Prevod Word/ODT/Excel do PDF nefunguje

LibreOffice WASM vyžaduje `SharedArrayBuffer`, ktorý potrebuje tieto hlavičky:

```apache
Header always set Cross-Origin-Embedder-Policy "require-corp"
Header always set Cross-Origin-Opener-Policy "same-origin"
```

Potrebuje aj zabezpečený kontext. `http://localhost` funguje na lokálne testovanie, ale `http://192.168.x.x` alebo iné IP adresy v LAN zvyčajne vyžadujú HTTPS. Ak sú hlavičky prítomné, no `window.crossOriginIsolated` je stále `false`, skontrolujte, či sa stránka neotvára cez obyčajné HTTP na inom pôvode ako loopback.

Predkomprimované súbory `.wasm.gz` a `.data.gz` tiež potrebujú správne `Content-Encoding`:

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

Uistite sa, že je zapnutý `mod_headers`: `sudo a2enmod headers`

### Prístup zamietnutý

```bash
sudo chown -R www-data:www-data /var/www/bentopdf
sudo chmod -R 755 /var/www/bentopdf
```
