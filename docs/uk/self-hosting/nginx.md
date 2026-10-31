# Розгортання з Nginx

Розмістіть BentoPDF на власному сервері за допомогою Nginx.

## Вимоги

- Сервер Ubuntu/Debian
- Встановлений Nginx
- SSL-сертифікат (рекомендовано: Let's Encrypt)

## Крок 1: Зберіть проєкт

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Щоб налаштувати брендинг, задайте змінні середовища перед збіркою:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Крок 2: Скопіюйте файли

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Крок 3: Конфігурація Nginx

Створіть `/etc/nginx/sites-available/bentopdf`:

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

## Крок 4: Увімкніть сайт

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Крок 5: SSL через Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Розгортання в підкаталозі

Щоб розмістити за адресою `/pdf/`:

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

Зберіть із:

```bash
BASE_URL=/pdf/ npm run build
```

## Налаштування продуктивності

Додайте до `nginx.conf`:

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

## Усунення неполадок

### WASM не завантажується

Переконайтеся, що MIME-тип задано:

```nginx
types {
    application/wasm wasm;
}
```

### Sign PDF або Form Filler показує порожній переглядач (помилка MIME для `.mjs`)

Якщо консоль браузера показує:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

...а запит, що завершується помилкою, закінчується на `.mjs`, то в nginx немає зіставлення `.mjs → application/javascript`. Вбудований PDF-переглядач (його використовують Sign PDF, Form Filler та кілька інших інструментів) постачає файли ES-модулів із розширенням `.mjs`, а стандартний `mime.types` nginx їх за замовчуванням не містить.

Виправте це, додавши `mjs` до наявного рядка `application/javascript` у `/etc/nginx/mime.types`:

```nginx
application/javascript    js mjs;
```

> НЕ додавайте _другий_ рядок `application/javascript`: nginx розбирає `mime.types` рядок за рядком, і діє лише одне зіставлення типу з розширенням, тож другий рядок у деяких версіях мовчки ігнорується. Відредагуйте наявний рядок, додавши `mjs` поруч із `js`.

Або перевизначте локально всередині блоку server (без редагування глобального файлу):

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

Перезавантажте nginx після зміни:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Щоб підтвердити: у DevTools браузера → вкладка Network знайдіть запит `.mjs`, що завершився помилкою, і перевірте заголовок відповіді `Content-Type`. Тепер він має бути `application/javascript`, а не `application/octet-stream`.

### Не працює перетворення Word/ODT/Excel у PDF

LibreOffice WASM потребує `SharedArrayBuffer`, для якого потрібні заголовки `Cross-Origin-Embedder-Policy` і `Cross-Origin-Opener-Policy`. Також потрібен безпечний контекст, тож `http://localhost` підходить для локального тестування, а `http://192.168.x.x` та інші LAN-адреси зазвичай потребують HTTPS. Зверніть увагу, що директиви nginx `add_header` у блоці `location` **перевизначають** директиви `add_header` рівня server, а не поєднуються з ними. Кожен блок `location` із власним `add_header` має містити заголовки COEP/COOP.

Перевірте так:

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

Якщо перед nginx стоїть зворотний проксі, переконайтеся, що він зберігає ці заголовки.

### 502 Bad Gateway

Перевірте журнали помилок Nginx:

```bash
sudo tail -f /var/log/nginx/error.log
```
