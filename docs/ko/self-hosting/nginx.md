# Nginx로 배포하기

Nginx를 사용해 자체 서버에서 BentoPDF를 호스팅합니다.

## 사전 요구 사항

- Ubuntu/Debian 서버
- Nginx 설치
- SSL 인증서 (권장: Let's Encrypt)

## 1단계: 프로젝트 빌드

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

브랜딩을 사용자 지정하려면 빌드하기 전에 환경 변수를 설정합니다.

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## 2단계: 파일 복사

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## 3단계: Nginx 설정

`/etc/nginx/sites-available/bentopdf`를 만듭니다.

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    root /var/www/bentopdf;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/wasm;
    gzip_min_length 1000;

    # WASM MIME type
    types {
        application/wasm wasm;
    }

    # Required headers for SharedArrayBuffer (LibreOffice WASM)
    # These must be on every response - especially HTML pages
    add_header Cross-Origin-Embedder-Policy "require-corp" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    add_header Cross-Origin-Resource-Policy "cross-origin" always;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Pre-compressed LibreOffice WASM binary
    location ~* /libreoffice-wasm/soffice\.wasm\.gz$ {
        gzip off;
        types {} default_type application/wasm;
        add_header Content-Encoding gzip;
        add_header Cache-Control "public, immutable";
        add_header Cross-Origin-Embedder-Policy "require-corp" always;
        add_header Cross-Origin-Opener-Policy "same-origin" always;
    }

    # Pre-compressed LibreOffice WASM data
    location ~* /libreoffice-wasm/soffice\.data\.gz$ {
        gzip off;
        types {} default_type application/octet-stream;
        add_header Content-Encoding gzip;
        add_header Cache-Control "public, immutable";
        add_header Cross-Origin-Embedder-Policy "require-corp" always;
        add_header Cross-Origin-Opener-Policy "same-origin" always;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|wasm)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Cross-Origin-Embedder-Policy "require-corp" always;
        add_header Cross-Origin-Opener-Policy "same-origin" always;
    }

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cross-Origin-Embedder-Policy "require-corp" always;
        add_header Cross-Origin-Opener-Policy "same-origin" always;
    }
}
```

## 4단계: 사이트 활성화

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5단계: Let's Encrypt로 SSL 설정

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 하위 디렉터리 배포

`/pdf/`에 호스팅하려면:

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

다음과 같이 빌드합니다.

```bash
BASE_URL=/pdf/ npm run build
```

## 성능 튜닝

`nginx.conf`에 추가합니다.

```nginx
http {
    # Enable sendfile
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;

    # Increase buffer sizes
    client_max_body_size 100M;

    # Worker connections
    worker_connections 2048;
}
```

## 문제 해결

### WASM이 로드되지 않음

MIME 타입이 설정되어 있는지 확인합니다.

```nginx
types {
    application/wasm wasm;
}
```

### PDF 서명 또는 양식 작성기에 빈 뷰어가 표시됨 (`.mjs` MIME 오류)

브라우저 콘솔에 다음이 표시되는 경우:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

...그리고 실패한 요청이 `.mjs`로 끝난다면, nginx에 `.mjs → application/javascript` 매핑이 빠져 있는 것입니다. 내장 PDF 뷰어(PDF 서명, 양식 작성기 및 일부 다른 도구에서 사용)는 `.mjs` 확장자의 ES 모듈 파일을 포함하는데, nginx의 기본 `mime.types`에는 이 확장자가 들어 있지 않습니다.

`/etc/nginx/mime.types`의 기존 `application/javascript` 줄에 `mjs`를 추가해 해결합니다.

```nginx
application/javascript    js mjs;
```

> `application/javascript` 줄을 _두 번째로_ 추가하지 마세요. nginx는 `mime.types`를 한 줄씩 파싱하며 타입과 확장자의 매핑은 하나만 적용되므로, 일부 버전에서는 두 번째 줄이 조용히 무시됩니다. 기존 줄을 수정해 `js` 옆에 `mjs`를 추가하세요.

또는 server 블록 안에서 로컬로 재정의할 수 있습니다(전역 파일 수정 불필요).

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

변경 후 nginx를 다시 로드합니다.

```bash
sudo nginx -t && sudo systemctl reload nginx
```

확인하려면 브라우저 DevTools → Network 탭에서 실패했던 `.mjs` 요청을 찾아 `Content-Type` 응답 헤더를 확인하세요. 이제 `application/octet-stream`이 아니라 `application/javascript`여야 합니다.

### Word/ODT/Excel을 PDF로 변환이 작동하지 않음

LibreOffice WASM에는 `SharedArrayBuffer`가 필요하며, 이를 위해 `Cross-Origin-Embedder-Policy` 및 `Cross-Origin-Opener-Policy` 헤더가 필요합니다. 보안 컨텍스트도 필요하므로 `http://localhost`는 로컬 테스트에서 작동하지만 `http://192.168.x.x` 같은 LAN IP는 보통 HTTPS가 필요합니다. `location` 블록의 nginx `add_header` 지시문은 server 수준 `add_header` 지시문을 병합하지 않고 **덮어씁니다**. 자체 `add_header`가 있는 모든 `location` 블록에는 COEP/COOP 헤더가 포함되어야 합니다.

다음으로 확인합니다.

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

nginx 앞에 리버스 프록시를 사용하는 경우 이 헤더가 유지되는지 확인하세요.

### 502 Bad Gateway

Nginx 오류 로그를 확인합니다.

```bash
sudo tail -f /var/log/nginx/error.log
```
