# 使用 Nginx 部署

使用 Nginx 在您自己的伺服器上架設 BentoPDF。

## 先決條件

- Ubuntu/Debian 伺服器
- 已安裝 Nginx
- SSL 憑證（建議使用 Let's Encrypt）

## 步驟 1：建置專案

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

若要自訂品牌，請在建置前設定環境變數：

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## 步驟 2：複製檔案

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## 步驟 3：Nginx 設定

建立 `/etc/nginx/sites-available/bentopdf`：

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

## 步驟 4：啟用網站

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 步驟 5：使用 Let's Encrypt 設定 SSL

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 子目錄部署

若要架設在 `/pdf/`：

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

建置方式：

```bash
BASE_URL=/pdf/ npm run build
```

## 效能調校

加入 `nginx.conf`：

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

## 疑難排解

### WASM 無法載入

確認已設定 MIME 類型：

```nginx
types {
    application/wasm wasm;
}
```

### 簽署 PDF 或表單填寫器顯示空白檢視器（`.mjs` MIME 錯誤）

如果瀏覽器主控台顯示：

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…且失敗的請求以 `.mjs` 結尾，表示您的 nginx 缺少 `.mjs → application/javascript` 對應。內建的 PDF 檢視器（簽署 PDF、表單填寫器及其他少數工具會使用）以 `.mjs` 副檔名提供 ES 模組檔案，而 nginx 預設的 `mime.types` 並未包含它們。

修正方法是在 `/etc/nginx/mime.types` 中現有的 `application/javascript` 那一行加上 `mjs`：

```nginx
application/javascript    js mjs;
```

> 請勿再新增*第二行* `application/javascript`：nginx 逐行解析 `mime.types`，且只有一個類型與副檔名的對應會生效，因此在某些版本中第二行會被默默忽略。請編輯現有的那一行，在 `js` 旁加上 `mjs`。

或在您的 server 區塊內進行本機覆寫（不需編輯全域檔案）：

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

變更後重新載入 nginx：

```bash
sudo nginx -t && sudo systemctl reload nginx
```

確認方式：在瀏覽器開發者工具 → 網路分頁中，找到失敗的 `.mjs` 請求並檢查 `Content-Type` 回應標頭。現在它應該是 `application/javascript`，而不是 `application/octet-stream`。

### Word/ODT/Excel 轉 PDF 無法運作

LibreOffice WASM 需要 `SharedArrayBuffer`，而這需要 `Cross-Origin-Embedder-Policy` 與 `Cross-Origin-Opener-Policy` 標頭。它也需要安全環境，因此 `http://localhost` 可用於本機測試，但 `http://192.168.x.x` 或其他區域網路 IP 通常需要 HTTPS。請注意，`location` 區塊中的 nginx `add_header` 指令會**覆寫**伺服器層級的 `add_header` 指令，兩者不會合併。每個有自己 `add_header` 的 `location` 區塊都必須包含 COEP/COOP 標頭。

使用以下指令驗證：

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

如果在 nginx 前方使用反向代理，請確保它保留這些標頭。

### 502 Bad Gateway

檢查 Nginx 錯誤記錄：

```bash
sudo tail -f /var/log/nginx/error.log
```
