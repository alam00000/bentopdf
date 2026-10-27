# Apache로 배포하기

Apache HTTP Server로 BentoPDF를 호스팅하세요.

## 사전 요구 사항

- Apache 2.4+
- mod_rewrite 활성화
- SSL 인증서 (권장)

## 1단계: 프로젝트 빌드

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

브랜딩을 변경하려면 빌드하기 전에 환경 변수를 설정하세요:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## 2단계: 파일 복사

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## 3단계: Apache 설정

`/etc/apache2/sites-available/bentopdf.conf`를 만드세요:

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

## 4단계: 라우팅용 .htaccess

`/var/www/bentopdf/.htaccess`를 만드세요:

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

## 5단계: 필요한 모듈 활성화

```bash
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
```

## 6단계: 사이트 활성화

```bash
sudo a2ensite bentopdf.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## 하위 디렉터리 배포

`/pdf/`에 호스팅하려면:

1. 기본 URL을 지정하여 빌드하세요:

```bash
BASE_URL=/pdf/ npm run build
```

2. `.htaccess`를 업데이트하세요:

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

## 문제 해결

### WASM 404 오류

MIME 타입이 설정되어 있는지 확인하세요:

```apache
AddType application/wasm .wasm
```

### PDF 서명 또는 Form Filler에 빈 뷰어가 표시됨 (`.mjs` MIME 오류)

브라우저 콘솔에 다음과 같은 메시지가 표시되는 경우:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…그리고 실패한 요청이 `.mjs`로 끝난다면, Apache 설정에 `.mjs → application/javascript` 매핑이 없는 것입니다. 번들된 PDF 뷰어는 `.mjs` 확장자의 ES 모듈 파일을 포함하며, Apache 기본 `mime.types`에는 이 확장자가 들어 있지 않습니다.

VirtualHost 또는 `.htaccess`에 다음을 추가하세요:

```apache
AddType application/javascript .mjs
```

그런 다음 Apache를 다시 로드하세요:

```bash
sudo apache2ctl configtest && sudo systemctl reload apache2
```

확인하려면 브라우저 DevTools의 Network 탭에서 실패한 `.mjs` 요청을 찾아 `Content-Type` 응답 헤더를 확인하세요. 이제 `application/octet-stream`이 아니라 `application/javascript`여야 합니다.

### Rewrite가 작동하지 않음

mod_rewrite가 활성화되어 있는지 확인하세요:

```bash
sudo a2enmod rewrite
```

### Word/ODT/Excel을 PDF로 변환이 작동하지 않음

LibreOffice WASM에는 `SharedArrayBuffer`가 필요하며, 이를 위해 다음 헤더가 필요합니다:

```apache
Header always set Cross-Origin-Embedder-Policy "require-corp"
Header always set Cross-Origin-Opener-Policy "same-origin"
```

보안 컨텍스트도 필요합니다. `http://localhost`는 로컬 테스트에서 작동하지만, `http://192.168.x.x` 같은 LAN IP는 대체로 HTTPS가 필요합니다. 헤더가 있는데도 `window.crossOriginIsolated`가 계속 `false`라면, 페이지가 루프백이 아닌 origin에서 일반 HTTP로 열려 있는지 확인하세요.

미리 압축된 `.wasm.gz` 및 `.data.gz` 파일에도 올바른 `Content-Encoding`이 필요합니다:

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

`mod_headers`가 활성화되어 있는지 확인하세요: `sudo a2enmod headers`

### 권한 거부

```bash
sudo chown -R www-data:www-data /var/www/bentopdf
sudo chmod -R 755 /var/www/bentopdf
```
