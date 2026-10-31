# Déployer avec Apache

Hébergez BentoPDF avec Apache HTTP Server.

## Prérequis

- Apache 2.4+
- mod_rewrite activé
- Certificat SSL (recommandé)

## Étape 1 : compiler le projet

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Pour personnaliser l'image de marque, définissez des variables d'environnement avant la compilation :

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Étape 2 : copier les fichiers

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Étape 3 : configuration d'Apache

Créez `/etc/apache2/sites-available/bentopdf.conf` :

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

## Étape 4 : .htaccess pour le routage

Créez `/var/www/bentopdf/.htaccess` :

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

## Étape 5 : activer les modules requis

```bash
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
```

## Étape 6 : activer le site

```bash
sudo a2ensite bentopdf.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## Déploiement dans un sous-répertoire

Pour héberger sous `/pdf/` :

1. Compilez avec l'URL de base :

```bash
BASE_URL=/pdf/ npm run build
```

2. Mettez à jour `.htaccess` :

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

## Dépannage

### Erreurs 404 sur les fichiers WASM

Vérifiez que le type MIME est configuré :

```apache
AddType application/wasm .wasm
```

### Signer un PDF ou le remplissage de formulaires affiche un visualiseur vide (erreur MIME `.mjs`)

Si la console du navigateur affiche :

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…et que la requête en échec se termine par `.mjs`, il manque à votre configuration Apache l'association `.mjs → application/javascript`. Le visualiseur PDF fourni livre des modules ES avec l'extension `.mjs`, et le fichier `mime.types` standard d'Apache ne les inclut pas par défaut.

Ajoutez à votre VirtualHost ou à `.htaccess` :

```apache
AddType application/javascript .mjs
```

Rechargez ensuite Apache :

```bash
sudo apache2ctl configtest && sudo systemctl reload apache2
```

Pour vérifier : dans les DevTools du navigateur → onglet Réseau, trouvez la requête `.mjs` en échec et consultez l'en-tête de réponse `Content-Type`. Il doit maintenant valoir `application/javascript`, et non `application/octet-stream`.

### La réécriture ne fonctionne pas

Vérifiez que mod_rewrite est activé :

```bash
sudo a2enmod rewrite
```

### La conversion Word/ODT/Excel vers PDF ne fonctionne pas

LibreOffice WASM nécessite `SharedArrayBuffer`, qui exige ces en-têtes :

```apache
Header always set Cross-Origin-Embedder-Policy "require-corp"
Header always set Cross-Origin-Opener-Policy "same-origin"
```

Un contexte sécurisé est également nécessaire. `http://localhost` fonctionne pour les tests locaux, mais `http://192.168.x.x` ou d'autres adresses IP du réseau local nécessitent généralement HTTPS. Si les en-têtes sont présents mais que `window.crossOriginIsolated` vaut toujours `false`, vérifiez si la page est ouverte en HTTP simple sur une origine autre que le bouclage local.

Les fichiers précompressés `.wasm.gz` et `.data.gz` ont aussi besoin du bon `Content-Encoding` :

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

Vérifiez que `mod_headers` est activé : `sudo a2enmod headers`

### Permission refusée

```bash
sudo chown -R www-data:www-data /var/www/bentopdf
sudo chmod -R 755 /var/www/bentopdf
```
