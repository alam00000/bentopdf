# Развертывание с Nginx

Разместите BentoPDF на собственном сервере с помощью Nginx.

## Требования

- Сервер Ubuntu/Debian
- Установленный Nginx
- SSL-сертификат (рекомендуется Let's Encrypt)

## Шаг 1: Соберите проект

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Чтобы настроить брендинг, задайте переменные окружения перед сборкой:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Шаг 2: Скопируйте файлы

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Шаг 3: Конфигурация Nginx

Создайте `/etc/nginx/sites-available/bentopdf`:

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

## Шаг 4: Включите сайт

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Шаг 5: SSL с Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Развертывание в подкаталоге

Чтобы разместить сайт по адресу `/pdf/`:

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

Соберите проект так:

```bash
BASE_URL=/pdf/ npm run build
```

## Настройка производительности

Добавьте в `nginx.conf`:

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

## Устранение неполадок

### WASM не загружается

Убедитесь, что задан MIME-тип:

```nginx
types {
    application/wasm wasm;
}
```

### Sign PDF или Form Filler показывает пустой просмотрщик (ошибка MIME для `.mjs`)

Если в консоли браузера появляется:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…и неудавшийся запрос оканчивается на `.mjs`, значит в вашем nginx нет соответствия `.mjs → application/javascript`. Встроенный просмотрщик PDF (его используют Sign PDF, Form Filler и несколько других инструментов) содержит файлы ES-модулей с расширением `.mjs`, а стандартный `mime.types` в nginx их по умолчанию не включает.

Исправьте это, добавив `mjs` в существующую строку `application/javascript` в `/etc/nginx/mime.types`:

```nginx
application/javascript    js mjs;
```

> НЕ добавляйте _вторую_ строку `application/javascript`: nginx разбирает `mime.types` построчно, и в некоторых версиях вторая строка для того же типа молча игнорируется. Отредактируйте существующую строку, добавив `mjs` рядом с `js`.

Или переопределите это локально в блоке server (без правки глобального файла):

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

После изменения перезагрузите nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Для проверки найдите в DevTools на вкладке Network неудавшийся запрос `.mjs` и посмотрите заголовок ответа `Content-Type`. Теперь там должно быть `application/javascript`, а не `application/octet-stream`.

### Конвертация Word/ODT/Excel в PDF не работает

LibreOffice WASM требует `SharedArrayBuffer`, а для него нужны заголовки `Cross-Origin-Embedder-Policy` и `Cross-Origin-Opener-Policy`. Также нужен защищенный контекст: `http://localhost` подходит для локальной проверки, но для `http://192.168.x.x` и других адресов в локальной сети обычно требуется HTTPS. Учтите, что директивы `add_header` в блоке `location` **переопределяют** директивы `add_header` уровня server, а не объединяются с ними. Каждый блок `location` со своими `add_header` должен включать заголовки COEP/COOP.

Проверьте так:

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

Если перед nginx стоит обратный прокси, убедитесь, что он сохраняет эти заголовки.

### 502 Bad Gateway

Проверьте журнал ошибок Nginx:

```bash
sudo tail -f /var/log/nginx/error.log
```
