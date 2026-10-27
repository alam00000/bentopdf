# 使用 Nginx 部署

使用 Nginx 在您自己的服务器上托管 BentoPDF。

## 前置条件

- Ubuntu/Debian 服务器
- 已安装 Nginx
- SSL 证书（推荐：Let's Encrypt）

## 步骤 1：构建项目

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

如需自定义品牌，请在构建前设置环境变量：

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## 步骤 2：复制文件

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## 步骤 3：Nginx 配置

创建 `/etc/nginx/sites-available/bentopdf`：

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

## 步骤 4：启用站点

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 步骤 5：使用 Let's Encrypt 配置 SSL

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 子目录部署

要托管在 `/pdf/`：

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

构建命令：

```bash
BASE_URL=/pdf/ npm run build
```

## 性能调优

添加到 `nginx.conf`：

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

## 故障排除

### WASM 无法加载

确保已设置 MIME 类型：

```nginx
types {
    application/wasm wasm;
}
```

### 签署 PDF 或 Form Filler 显示空白查看器（`.mjs` MIME 错误）

如果浏览器控制台显示：

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

……并且失败的请求以 `.mjs` 结尾，说明您的 nginx 缺少 `.mjs → application/javascript` 的映射。内置的 PDF 查看器（签署 PDF、Form Filler 和其他一些工具使用）附带扩展名为 `.mjs` 的 ES 模块文件，而 nginx 默认的 `mime.types` 不包含它们。

解决方法：在 `/etc/nginx/mime.types` 中，将 `mjs` 加到现有的 `application/javascript` 行：

```nginx
application/javascript    js mjs;
```

> 请勿再追加*第二行* `application/javascript`。nginx 逐行解析 `mime.types`，每种类型只有一个扩展名映射生效，因此在某些版本中第二行会被静默忽略。请编辑现有的行，把 `mjs` 与 `js` 放在一起。

或者在您的 server 块内局部覆盖（无需修改全局文件）：

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

修改后重新加载 nginx：

```bash
sudo nginx -t && sudo systemctl reload nginx
```

确认方法：在浏览器开发者工具的 Network 标签中，找到失败的 `.mjs` 请求并检查 `Content-Type` 响应标头。它现在应为 `application/javascript`，而不是 `application/octet-stream`。

### Word/ODT/Excel 转 PDF 无法使用

LibreOffice WASM 需要 `SharedArrayBuffer`，而这需要 `Cross-Origin-Embedder-Policy` 和 `Cross-Origin-Opener-Policy` 标头。它还需要安全上下文，因此 `http://localhost` 可用于本地测试，但 `http://192.168.x.x` 或其他局域网 IP 通常需要 HTTPS。请注意，`location` 块中的 nginx `add_header` 指令会**覆盖**server 级别的 `add_header` 指令，而不是合并。每个带有自己 `add_header` 的 `location` 块都必须包含 COEP/COOP 标头。

验证方法：

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

如果 nginx 前面有反向代理，请确保它保留这些标头。

### 502 Bad Gateway

查看 Nginx 错误日志：

```bash
sudo tail -f /var/log/nginx/error.log
```
