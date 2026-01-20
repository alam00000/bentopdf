# Deploy with Apache

Host BentoPDF using Apache HTTP Server.

## Prerequisites

- Apache 2.4+
- mod_rewrite enabled
- SSL certificate (recommended)

## Step 1: Build the Project

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

## Step 2: Copy Files

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Step 3: Apache Configuration

Create `/etc/apache2/sites-available/bentopdf.conf`:

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

    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
</VirtualHost>
```

## Step 4: .htaccess for Routing

Create `/var/www/bentopdf/.htaccess`:

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

## Step 5: Enable Required Modules

```bash
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
```

## Step 6: Enable the Site

```bash
sudo a2ensite bentopdf.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## Subdirectory Deployment

To host at `/pdf/`:

1. Build with base URL:

```bash
BASE_URL=/pdf/ npm run build
```

2. Update `.htaccess`:

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

## Troubleshooting

### WASM 404 Errors

Ensure MIME type is configured:

```apache
AddType application/wasm .wasm
```

### Rewrite Not Working

Check that mod_rewrite is enabled:

```bash
sudo a2enmod rewrite
```

### Permission Denied

```bash
sudo chown -R www-data:www-data /var/www/bentopdf
sudo chmod -R 755 /var/www/bentopdf
```
