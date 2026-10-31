# Mit Apache bereitstellen

Hosten Sie BentoPDF mit dem Apache HTTP Server.

## Voraussetzungen

- Apache 2.4+
- mod_rewrite aktiviert
- SSL-Zertifikat (empfohlen)

## Schritt 1: Projekt bauen

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Um das Branding anzupassen, setzen Sie vor dem Build Umgebungsvariablen:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Schritt 2: Dateien kopieren

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Schritt 3: Apache-Konfiguration

Erstellen Sie `/etc/apache2/sites-available/bentopdf.conf`:

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

## Schritt 4: .htaccess für das Routing

Erstellen Sie `/var/www/bentopdf/.htaccess`:

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

## Schritt 5: Erforderliche Module aktivieren

```bash
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
```

## Schritt 6: Die Site aktivieren

```bash
sudo a2ensite bentopdf.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## Bereitstellung in einem Unterverzeichnis

So hosten Sie unter `/pdf/`:

1. Mit Basis-URL bauen:

```bash
BASE_URL=/pdf/ npm run build
```

2. `.htaccess` anpassen:

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

## Fehlerbehebung

### WASM-404-Fehler

Stellen Sie sicher, dass der MIME-Typ konfiguriert ist:

```apache
AddType application/wasm .wasm
```

### Signieren oder Formularausfüllung zeigt einen leeren Viewer (`.mjs`-MIME-Fehler)

Wenn die Browserkonsole Folgendes anzeigt:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

...und die fehlgeschlagene Anfrage auf `.mjs` endet, fehlt in Ihrer Apache-Konfiguration die Zuordnung `.mjs → application/javascript`. Der mitgelieferte PDF-Viewer enthält ES-Moduldateien mit der Endung `.mjs`, die in der Standard-`mime.types` von Apache nicht enthalten sind.

Fügen Sie Folgendes zu Ihrem VirtualHost oder Ihrer `.htaccess` hinzu:

```apache
AddType application/javascript .mjs
```

Laden Sie Apache anschließend neu:

```bash
sudo apache2ctl configtest && sudo systemctl reload apache2
```

Zur Kontrolle: Suchen Sie in den Browser-DevTools im Tab Netzwerk die fehlgeschlagene `.mjs`-Anfrage und prüfen Sie den Antwort-Header `Content-Type`. Er sollte jetzt `application/javascript` lauten, nicht `application/octet-stream`.

### Rewrite funktioniert nicht

Prüfen Sie, ob mod_rewrite aktiviert ist:

```bash
sudo a2enmod rewrite
```

### Word/ODT/Excel zu PDF funktioniert nicht

LibreOffice WASM benötigt `SharedArrayBuffer`, wofür diese Header erforderlich sind:

```apache
Header always set Cross-Origin-Embedder-Policy "require-corp"
Header always set Cross-Origin-Opener-Policy "same-origin"
```

Außerdem ist ein sicherer Kontext nötig. `http://localhost` funktioniert für lokale Tests, aber `http://192.168.x.x` oder andere LAN-IPs erfordern meist HTTPS. Sind die Header vorhanden und `window.crossOriginIsolated` ist trotzdem `false`, prüfen Sie, ob die Seite über einfaches HTTP von einem Nicht-Loopback-Origin aus geöffnet wird.

Die vorkomprimierten Dateien `.wasm.gz` und `.data.gz` brauchen außerdem das richtige `Content-Encoding`:

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

Stellen Sie sicher, dass `mod_headers` aktiviert ist: `sudo a2enmod headers`

### Zugriff verweigert

```bash
sudo chown -R www-data:www-data /var/www/bentopdf
sudo chmod -R 755 /var/www/bentopdf
```
