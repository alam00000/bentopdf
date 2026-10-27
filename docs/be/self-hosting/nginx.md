# Разгортванне з Nginx

Размясціце BentoPDF на ўласным серверы з дапамогай Nginx.

## Патрабаванні

- Сервер Ubuntu/Debian
- Усталяваны Nginx
- SSL-сертыфікат (рэкамендуецца Let's Encrypt)

## Крок 1: Зборка праекта

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Каб змяніць брэндынг, задайце зменныя асяроддзя перад зборкай:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Крок 2: Капіраванне файлаў

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Крок 3: Канфігурацыя Nginx

Стварыце `/etc/nginx/sites-available/bentopdf`:

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

## Крок 4: Уключэнне сайта

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Крок 5: SSL з Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Разгортванне ў падкаталогу

Каб размясціць па шляху `/pdf/`:

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

Збярыце з:

```bash
BASE_URL=/pdf/ npm run build
```

## Налада прадукцыйнасці

Дадайце ў `nginx.conf`:

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

## Выпраўленне непаладак

### WASM не загружаецца

Пераканайцеся, што MIME-тып зададзены:

```nginx
types {
    application/wasm wasm;
}
```

### Падпісаць PDF або Запаўненне форм паказвае пусты праглядальнік (памылка MIME `.mjs`)

Калі ў кансолі браўзера бачна:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…і няўдалы запыт заканчваецца на `.mjs`, у вашым nginx няма адпаведнасці `.mjs → application/javascript`. Убудаваны праглядальнік PDF (выкарыстоўваецца ў Падпісаць PDF, Запаўненні форм і некалькіх іншых інструментах) пастаўляецца з файламі ES-модуляў з пашырэннем `.mjs`, а стандартны `mime.types` у nginx па змаўчанні іх не ўключае.

Выправіце гэта, дадаўшы `mjs` у існуючы радок `application/javascript` у `/etc/nginx/mime.types`:

```nginx
application/javascript    js mjs;
```

> НЕ дадавайце _другі_ радок `application/javascript`: nginx разбірае `mime.types` радок за радком, і перамагае толькі адна адпаведнасць тыпу і пашырэння, таму ў некаторых версіях другі радок моўчкі ігнаруецца. Адрэдагуйце існуючы радок, дадаўшы `mjs` побач з `js`.

Або перавызначце лакальна ўнутры блока server (без рэдагавання глабальнага файла):

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

Перазагрузіце nginx пасля змены:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Каб пераканацца: у DevTools браўзера → укладка Network знайдзіце няўдалы запыт `.mjs` і праверце загаловак адказу `Content-Type`. Цяпер ён павінен быць `application/javascript`, а не `application/octet-stream`.

### Word/ODT/Excel у PDF не працуе

LibreOffice WASM патрабуе `SharedArrayBuffer`, для чаго патрэбныя загалоўкі `Cross-Origin-Embedder-Policy` і `Cross-Origin-Opener-Policy`. Таксама патрэбны бяспечны кантэкст, таму `http://localhost` працуе для лакальнай праверкі, а `http://192.168.x.x` ці іншыя IP лакальнай сеткі звычайна патрабуюць HTTPS. Звярніце ўвагу: дырэктывы nginx `add_header` у блоку `location` **перавызначаюць** дырэктывы `add_header` узроўню server, а не аб'ядноўваюцца з імі. Кожны блок `location` з уласным `add_header` павінен уключаць загалоўкі COEP/COOP.

Праверце з дапамогай:

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

Калі перад nginx стаіць зваротны проксі, пераканайцеся, што ён захоўвае гэтыя загалоўкі.

### 502 Bad Gateway

Праверце журналы памылак Nginx:

```bash
sudo tail -f /var/log/nginx/error.log
```
