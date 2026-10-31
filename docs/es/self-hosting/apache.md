# Desplegar con Apache

Aloja BentoPDF con Apache HTTP Server.

## Requisitos previos

- Apache 2.4+
- mod_rewrite habilitado
- Certificado SSL (recomendado)

## Paso 1: Compilar el proyecto

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Para personalizar la marca, define variables de entorno antes de compilar:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Paso 2: Copiar los archivos

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Paso 3: Configuración de Apache

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

## Paso 4: .htaccess para el enrutamiento

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

## Paso 5: Habilitar los módulos necesarios

```bash
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
```

## Paso 6: Habilitar el sitio

```bash
sudo a2ensite bentopdf.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## Despliegue en un subdirectorio

Para alojarlo en `/pdf/`:

1. Compila con la URL base:

```bash
BASE_URL=/pdf/ npm run build
```

2. Actualiza `.htaccess`:

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

## Solución de problemas

### Errores 404 de WASM

Asegúrate de que el tipo MIME esté configurado:

```apache
AddType application/wasm .wasm
```

### Firmar PDF o el rellenador de formularios muestra un visor en blanco (error MIME de `.mjs`)

Si la consola del navegador muestra:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

...y la solicitud que falla termina en `.mjs`, a tu configuración de Apache le falta la asignación `.mjs → application/javascript`. El visor de PDF incluido usa módulos ES con extensión `.mjs`, y el `mime.types` de serie de Apache no los incluye por defecto.

Añade esto a tu VirtualHost o a `.htaccess`:

```apache
AddType application/javascript .mjs
```

Después recarga Apache:

```bash
sudo apache2ctl configtest && sudo systemctl reload apache2
```

Para confirmarlo: en las DevTools del navegador, pestaña Network, busca la solicitud `.mjs` que falla y revisa la cabecera de respuesta `Content-Type`. Ahora debería ser `application/javascript`, no `application/octet-stream`.

### La reescritura no funciona

Comprueba que mod_rewrite esté habilitado:

```bash
sudo a2enmod rewrite
```

### Word/ODT/Excel a PDF no funciona

LibreOffice WASM requiere `SharedArrayBuffer`, que necesita estas cabeceras:

```apache
Header always set Cross-Origin-Embedder-Policy "require-corp"
Header always set Cross-Origin-Opener-Policy "same-origin"
```

También necesita un contexto seguro. `http://localhost` funciona para pruebas locales, pero `http://192.168.x.x` u otras IP de red local normalmente requieren HTTPS. Si las cabeceras están presentes pero `window.crossOriginIsolated` sigue siendo `false`, comprueba si la página se abre por HTTP simple desde un origen que no es de loopback.

Los archivos precomprimidos `.wasm.gz` y `.data.gz` también necesitan el `Content-Encoding` correcto:

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

Asegúrate de que `mod_headers` esté habilitado: `sudo a2enmod headers`

### Permiso denegado

```bash
sudo chown -R www-data:www-data /var/www/bentopdf
sudo chmod -R 755 /var/www/bentopdf
```
