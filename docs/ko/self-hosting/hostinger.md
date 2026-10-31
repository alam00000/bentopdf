# Hostinger에 배포하기

[Hostinger](https://hostinger.com)는 인기 있는 공유 호스팅 제공업체입니다. 이 가이드는 Hostinger 공유 호스팅에 BentoPDF를 배포하는 방법을 다룹니다.

## 사전 요구 사항

- 파일 관리자에 접근할 수 있는 Hostinger 호스팅 플랜
- 빌드를 위해 로컬에 설치된 Node.js

## 1단계: 프로젝트 빌드

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

빌드된 파일은 `dist` 폴더에 있습니다.

## 2단계: Hostinger에 업로드

### 루트 도메인 배포

1. Hostinger 계정에 로그인합니다
2. **File Manager** → **public_html**로 이동합니다
3. 기존 파일을 모두 **삭제**합니다 (필요하면 백업하세요)
4. 로컬 `dist` 폴더의 모든 내용을 `public_html`에 **업로드**합니다

### 하위 디렉터리 배포

하위 디렉터리(예: `yourdomain.com/pdf-tools/`)에 배포하는 경우:

1. 올바른 기본 URL로 빌드합니다:

```bash
BASE_URL=/pdf-tools/ npm run build
```

2. Hostinger에서 폴더를 만듭니다:
   - **File Manager** → **public_html**로 이동합니다
   - 새 폴더를 만듭니다: `pdf-tools`
3. `dist`의 모든 내용을 `public_html/pdf-tools/`에 업로드합니다

## 3단계: .htaccess 파일 만들기

배포 폴더의 루트(`public_html` 또는 `public_html/pdf-tools/`)에 `.htaccess` 파일을 만드세요:

::: warning 중요
하위 디렉터리에 배포하는 경우 `RewriteBase /`를 `RewriteBase /pdf-tools/`(또는 사용하는 폴더 이름)로 변경하세요.
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
# Canonical WWW (update domain as needed)
RewriteCond %{HTTP_HOST} ^bentopdf\.com [NC]
RewriteRule ^(.*)$ https://www.bentopdf.com/$1 [L,R=301]

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Remove trailing slash (except for language root directories)
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/(de|es|zh|zh-TW|vi|it|id|tr|fr|pt)/$
RewriteCond %{REQUEST_URI} (.+)/$
RewriteRule ^ %1 [R=301,L]

# Existing files/dirs - serve directly
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# ============================================
# 5.1. LANGUAGE ROUTES
# ============================================
# Supported languages: de, es, zh, zh-TW, vi, it, id, tr, fr, pt
# English has no prefix - served from root

# English prefix redirects to root (for SEO consistency)
RewriteRule ^en/?$ / [R=301,L]
RewriteRule ^en/(.+)$ /$1 [R=301,L]

# Language prefix root (e.g., /de/ -> /de/index.html)
RewriteCond %{DOCUMENT_ROOT}/$1/index.html -f
RewriteRule ^(de|es|zh|zh-TW|vi|it|id|tr|fr|pt)/?$ /$1/index.html [L]

# Language prefix with path (e.g., /de/merge-pdf -> /de/merge-pdf.html)
RewriteCond %{DOCUMENT_ROOT}/$1/$2.html -f
RewriteRule ^(de|es|zh|zh-TW|vi|it|id|tr|fr|pt)/([^/]+)/?$ /$1/$2.html [L]

# ============================================
# 5.5. DOCS ROUTING (VitePress)
# ============================================
RewriteCond %{REQUEST_URI} ^/docs
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME}\.html -f
RewriteRule ^(.*)$ $1.html [L]

# ============================================
# 6. ADD .HTML EXTENSION IF FILE EXISTS (ROOT LEVEL ONLY)
# ============================================
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^([^/]+)$ $1.html [L]

# ============================================
# 7. ERROR PAGES
# ============================================
ErrorDocument 404 /404.html
```

## 하위 디렉터리 .htaccess 예시

`yourdomain.com/pdf-tools/`의 경우 다음 줄을 업데이트하세요:

```apache
RewriteBase /pdf-tools/

# ... (same content as above, but update paths) ...

# Language prefix root
RewriteCond %{DOCUMENT_ROOT}/pdf-tools/$1/index.html -f
RewriteRule ^(de|es|zh|zh-TW|vi|it|id|tr|fr|pt)/?$ /pdf-tools/$1/index.html [L]

# Language prefix with path
RewriteCond %{DOCUMENT_ROOT}/pdf-tools/$1/$2.html -f
RewriteRule ^(de|es|zh|zh-TW|vi|it|id|tr|fr|pt)/([^/]+)/?$ /pdf-tools/$1/$2.html [L]

# Root level .html extension
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^([^/]+)$ $1.html [L]

ErrorDocument 404 /pdf-tools/404.html
```

## 문제 해결

### WASM 파일이 로드되지 않음

`.htaccess`에 MIME 타입이 올바르게 설정되어 있는지 확인하세요:

```apache
AddType application/wasm .wasm
```

### LibreOffice 도구가 작동하지 않음

보안 헤더는 SharedArrayBuffer에 필수입니다:

```apache
Header always set Cross-Origin-Opener-Policy "same-origin"
Header always set Cross-Origin-Embedder-Policy "require-corp"
```

헤더가 적용되지 않으면 Hostinger 지원팀에 `mod_headers` 활성화를 요청하세요.

### 페이지 새로고침 시 404 오류

`.html` 확장자 규칙과 언어 라우트가 올바르게 설정되어 있는지 확인하세요. BentoPDF는 SPA 라우팅이 아니라 정적 HTML 파일을 사용합니다:

```apache
# Language routes serve actual files from language directories
RewriteCond %{DOCUMENT_ROOT}/$1/$2.html -f
RewriteRule ^(de|es|zh|zh-TW|vi|it|id|tr|fr|pt)/([^/]+)/?$ /$1/$2.html [L]

# Root level pages
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^([^/]+)$ $1.html [L]
```

### 파일 업로드 제한

Hostinger에는 파일 크기 제한이 있을 수 있습니다. 일괄 업로드가 실패하면 WASM 파일을 따로 업로드하세요.
