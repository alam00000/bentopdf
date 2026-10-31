# Triển khai với Nginx

Lưu trữ BentoPDF trên máy chủ của riêng bạn bằng Nginx.

## Điều kiện tiên quyết

- Máy chủ Ubuntu/Debian
- Đã cài Nginx
- Chứng chỉ SSL (khuyến nghị: Let's Encrypt)

## Bước 1: Dựng dự án

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Để tùy chỉnh thương hiệu, hãy đặt biến môi trường trước khi dựng:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Bước 2: Sao chép tệp

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Bước 3: Cấu hình Nginx

Tạo `/etc/nginx/sites-available/bentopdf`:

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

## Bước 4: Bật trang web

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Bước 5: SSL với Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Triển khai vào thư mục con

Để lưu trữ tại `/pdf/`:

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

Dựng với:

```bash
BASE_URL=/pdf/ npm run build
```

## Tinh chỉnh hiệu năng

Thêm vào `nginx.conf`:

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

## Khắc phục sự cố

### WASM không tải được

Đảm bảo đã đặt kiểu MIME:

```nginx
types {
    application/wasm wasm;
}
```

### Ký PDF hoặc Form Filler hiển thị trình xem trống (lỗi MIME `.mjs`)

Nếu bảng điều khiển trình duyệt hiển thị:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

...và yêu cầu bị lỗi có đuôi `.mjs`, nginx của bạn đang thiếu ánh xạ `.mjs → application/javascript`. Trình xem PDF đi kèm (được dùng bởi Ký PDF, Form Filler và một vài công cụ khác) có các tệp module ES với phần mở rộng `.mjs`, và `mime.types` mặc định của nginx không bao gồm chúng.

Hãy khắc phục bằng cách thêm `mjs` vào dòng `application/javascript` hiện có trong `/etc/nginx/mime.types`:

```nginx
application/javascript    js mjs;
```

> KHÔNG thêm dòng `application/javascript` _thứ hai_: nginx phân tích `mime.types` theo từng dòng và chỉ một ánh xạ kiểu sang phần mở rộng có hiệu lực, nên dòng thứ hai bị bỏ qua âm thầm trên một số phiên bản. Hãy sửa dòng hiện có để thêm `mjs` cạnh `js`.

Hoặc ghi đè cục bộ trong khối server của bạn (không sửa tệp toàn cục):

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

Tải lại nginx sau khi thay đổi:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Để xác nhận: trong DevTools của trình duyệt → tab Network, tìm yêu cầu `.mjs` bị lỗi và kiểm tra header phản hồi `Content-Type`. Giờ nó phải là `application/javascript`, không phải `application/octet-stream`.

### Chuyển Word/ODT/Excel sang PDF không hoạt động

LibreOffice WASM cần `SharedArrayBuffer`, thứ đòi hỏi các header `Cross-Origin-Embedder-Policy` và `Cross-Origin-Opener-Policy`. Nó cũng cần ngữ cảnh bảo mật, nên `http://localhost` dùng được để thử cục bộ nhưng `http://192.168.x.x` hay các IP LAN khác thường cần HTTPS. Lưu ý rằng các chỉ thị nginx `add_header` trong khối `location` **ghi đè** các chỉ thị `add_header` ở cấp server, chúng không được gộp lại. Mỗi khối `location` có `add_header` riêng phải bao gồm các header COEP/COOP.

Kiểm tra bằng:

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

Nếu dùng reverse proxy đặt trước nginx, hãy đảm bảo nó giữ nguyên các header này.

### 502 Bad Gateway

Kiểm tra nhật ký lỗi của Nginx:

```bash
sudo tail -f /var/log/nginx/error.log
```
