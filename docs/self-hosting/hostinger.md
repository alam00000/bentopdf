# Deploy to Hostinger

[Hostinger](https://hostinger.com) is a popular shared hosting provider. This guide covers deploying BentoPDF to Hostinger's shared hosting.

## Prerequisites

- Hostinger hosting plan with file manager access
- Node.js installed locally for building

## Step 1: Build the Project

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

The built files will be in the `dist` folder.

## Step 2: Upload to Hostinger

### Root Domain Deployment

1. Log in to your Hostinger account
2. Go to **File Manager** → **public_html**
3. **Delete** any existing files (backup if needed)
4. **Upload** all contents of your local `dist` folder to `public_html`

### Subdirectory Deployment

If deploying to a subdirectory (e.g., `yourdomain.com/pdf-tools/`):

1. Build with the correct base URL:

```bash
BASE_URL=/pdf-tools/ npm run build
```

2. Create the folder in Hostinger:
   - Go to **File Manager** → **public_html**
   - Create a new folder: `pdf-tools`
   
3. Upload all contents of `dist` to `public_html/pdf-tools/`

## Step 3: Create .htaccess File

Create a `.htaccess` file in the root of your deployment folder (`public_html` or `public_html/pdf-tools/`):

::: warning Important
For subdirectory deployment, change `RewriteBase /` to `RewriteBase /pdf-tools/` (or your folder name).
:::

```apache
RewriteEngine On
RewriteBase /

# ============================================
# 1. SECURITY HEADERS (CRITICAL FOR WASM)
# ============================================
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
    
    # REQUIRED for soffice.js (SharedArrayBuffer)
    Header always set Cross-Origin-Opener-Policy "same-origin"
    Header always set Cross-Origin-Embedder-Policy "require-corp"
</IfModule>

# ============================================
# 2. BROWSER CACHING
# ============================================
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/x-icon "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/ttf "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/wasm "access plus 1 year"
    ExpiresByType application/gzip "access plus 1 year"
    ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# ============================================
# 3. COMPRESSION (STANDARD)
# ============================================
# Prevent server from double-compressing files
SetEnvIfNoCase Request_URI "\.gz$" no-gzip
SetEnvIfNoCase Request_URI "\.br$" no-gzip
SetEnvIfNoCase Request_URI "\.wasm$" no-gzip

<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
    AddOutputFilterByType DEFLATE image/svg+xml
    AddOutputFilterByType DEFLATE font/woff
    AddOutputFilterByType DEFLATE font/ttf
</IfModule>

# ============================================
# 4. MIME TYPES & SPECIAL FILE HANDLING
# ============================================
AddType application/javascript .js .mjs
AddType application/wasm .wasm
AddType font/woff2 .woff2
AddType font/woff .woff
AddType image/webp .webp

# Handle soffice.wasm.gz correctly
<FilesMatch "soffice\.wasm\.gz$">
    ForceType application/wasm
    Header set Content-Encoding "gzip"
    Header set Cross-Origin-Resource-Policy "cross-origin"
    Header append Vary Accept-Encoding
</FilesMatch>

# Handle data.gz
<FilesMatch "soffice\.data\.gz$">
    ForceType application/octet-stream
    Header set Content-Encoding "gzip"
    Header append Vary Accept-Encoding
</FilesMatch>

# ============================================
# 5. REDIRECTS & ROUTING
# ============================================
# Canonical WWW
RewriteCond %{HTTP_HOST} ^bentopdf\.com [NC]
RewriteRule ^(.*)$ https://www.bentopdf.com/$1 [L,R=301]

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Remove trailing slash
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} (.+)/$
RewriteRule ^ %1 [R=301,L]

# Existing files/dirs
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Language routes
RewriteRule ^(de|en|zh|vi)/(.*)$ /$2 [L]
RewriteRule ^(de|en|zh|vi)/?$ / [L]

# ============================================
# 5.5. DOCS ROUTING (VitePress)
# ============================================
RewriteCond %{REQUEST_URI} ^/docs
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME}\.html -f
RewriteRule ^(.*)$ $1.html [L]

# ============================================
# 6. SPA FALLBACK
# ============================================
# SPA Fallback (exclude /docs)
RewriteCond %{REQUEST_URI} !^/docs
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /index.html [L]

ErrorDocument 404 /index.html 
```

## Subdirectory .htaccess Example

For `yourdomain.com/pdf-tools/`, update these lines:

```apache
RewriteBase /pdf-tools/

# ... (same content) ...

# SPA Fallback - update path
RewriteRule ^ /pdf-tools/index.html [L]

ErrorDocument 404 /pdf-tools/index.html
```

## Troubleshooting

### WASM Files Not Loading

Ensure the MIME types are correctly set in `.htaccess`:

```apache
AddType application/wasm .wasm
```

### LibreOffice Tools Not Working

The security headers are critical for SharedArrayBuffer:

```apache
Header always set Cross-Origin-Opener-Policy "same-origin"
Header always set Cross-Origin-Embedder-Policy "require-corp"
```

If headers aren't being applied, contact Hostinger support to enable `mod_headers`.

### 404 Errors on Page Refresh

Make sure the SPA fallback rule is at the end of your `.htaccess`:

```apache
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /index.html [L]
```

### File Upload Limits

Hostinger may have file size limits. Upload WASM files separately if bulk upload fails.
