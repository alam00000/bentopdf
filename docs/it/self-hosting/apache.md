# Distribuzione con Apache

Ospita BentoPDF usando Apache HTTP Server.

## Prerequisiti

- Apache 2.4+
- mod_rewrite abilitato
- Certificato SSL (consigliato)

## Passaggio 1: compila il progetto

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Per personalizzare il marchio, imposta le variabili d'ambiente prima della build:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Passaggio 2: copia i file

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Passaggio 3: configurazione di Apache

Crea `/etc/apache2/sites-available/bentopdf.conf`:

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

## Passaggio 4: .htaccess per il routing

Crea `/var/www/bentopdf/.htaccess`:

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

## Passaggio 5: abilita i moduli necessari

```bash
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
```

## Passaggio 6: abilita il sito

```bash
sudo a2ensite bentopdf.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## Distribuzione in una sottodirectory

Per ospitarlo in `/pdf/`:

1. Compila con l'URL di base:

```bash
BASE_URL=/pdf/ npm run build
```

2. Aggiorna `.htaccess`:

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

## Risoluzione dei problemi

### Errori 404 sui file WASM

Assicurati che il tipo MIME sia configurato:

```apache
AddType application/wasm .wasm
```

### Firma PDF o Compilazione moduli mostra un visualizzatore vuoto (errore MIME `.mjs`)

Se la console del browser mostra:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…e la richiesta che fallisce termina in `.mjs`, nella tua configurazione di Apache manca la mappatura `.mjs → application/javascript`. Il visualizzatore PDF incluso usa file ES module con estensione `.mjs`, che il `mime.types` predefinito di Apache non contiene.

Aggiungi al tuo VirtualHost o a `.htaccess`:

```apache
AddType application/javascript .mjs
```

Poi ricarica Apache:

```bash
sudo apache2ctl configtest && sudo systemctl reload apache2
```

Per verificare: negli DevTools del browser, scheda Network, trova la richiesta `.mjs` che falliva e controlla l'header di risposta `Content-Type`. Ora dovrebbe essere `application/javascript`, non `application/octet-stream`.

### Le regole di rewrite non funzionano

Verifica che mod_rewrite sia abilitato:

```bash
sudo a2enmod rewrite
```

### La conversione da Word/ODT/Excel a PDF non funziona

LibreOffice WASM richiede `SharedArrayBuffer`, che necessita di questi header:

```apache
Header always set Cross-Origin-Embedder-Policy "require-corp"
Header always set Cross-Origin-Opener-Policy "same-origin"
```

Serve anche un contesto sicuro. `http://localhost` funziona per i test in locale, ma `http://192.168.x.x` o altri IP di rete locale di solito richiedono HTTPS. Se gli header sono presenti ma `window.crossOriginIsolated` è ancora `false`, controlla se la pagina viene aperta tramite HTTP semplice su un'origine diversa dal loopback.

Anche i file precompressi `.wasm.gz` e `.data.gz` richiedono un `Content-Encoding` corretto:

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

Assicurati che `mod_headers` sia abilitato: `sudo a2enmod headers`

### Permesso negato

```bash
sudo chown -R www-data:www-data /var/www/bentopdf
sudo chmod -R 755 /var/www/bentopdf
```
