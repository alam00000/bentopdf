# Wdrożenie z Nginx

Hostuj BentoPDF na własnym serwerze za pomocą Nginx.

## Wymagania wstępne

- Serwer Ubuntu/Debian
- Zainstalowany Nginx
- Certyfikat SSL (zalecany: Let's Encrypt)

## Krok 1: Zbuduj projekt

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Aby dostosować branding, ustaw zmienne środowiskowe przed budowaniem:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Krok 2: Skopiuj pliki

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Krok 3: Konfiguracja Nginx

Utwórz `/etc/nginx/sites-available/bentopdf`:

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

## Krok 4: Włącz witrynę

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Krok 5: SSL z Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Wdrożenie w podkatalogu

Aby hostować pod `/pdf/`:

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

Zbuduj z:

```bash
BASE_URL=/pdf/ npm run build
```

## Dostrajanie wydajności

Dodaj do `nginx.conf`:

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

## Rozwiązywanie problemów

### WASM się nie ładuje

Upewnij się, że typ MIME jest ustawiony:

```nginx
types {
    application/wasm wasm;
}
```

### Podpisz PDF lub Wypełnianie formularzy PDF pokazuje pusty podgląd (błąd MIME `.mjs`)

Jeśli konsola przeglądarki pokazuje:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…a nieudane żądanie kończy się na `.mjs`, w Twoim nginx brakuje mapowania `.mjs → application/javascript`. Wbudowana przeglądarka PDF (używana przez Podpisz PDF, Wypełnianie formularzy PDF i kilka innych narzędzi) dostarcza moduły ES z rozszerzeniem `.mjs`, a standardowy `mime.types` w nginx domyślnie ich nie zawiera.

Napraw to, dodając `mjs` do istniejącej linii `application/javascript` w `/etc/nginx/mime.types`:

```nginx
application/javascript    js mjs;
```

> NIE dodawaj _drugiej_ linii `application/javascript`. Nginx parsuje `mime.types` linia po linii i działa tylko jedno mapowanie typu na rozszerzenie, więc druga linia jest w niektórych wersjach po cichu ignorowana. Edytuj istniejącą linię, dodając `mjs` obok `js`.

Możesz też nadpisać to lokalnie w bloku server (bez edycji pliku globalnego):

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

Po zmianie przeładuj nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Aby potwierdzić: w DevTools → karta Network znajdź nieudane żądanie `.mjs` i sprawdź nagłówek odpowiedzi `Content-Type`. Powinien mieć teraz wartość `application/javascript`, a nie `application/octet-stream`.

### Konwersja Word/ODT/Excel na PDF nie działa

LibreOffice WASM wymaga `SharedArrayBuffer`, a to wymaga nagłówków `Cross-Origin-Embedder-Policy` i `Cross-Origin-Opener-Policy`. Potrzebny jest też bezpieczny kontekst, więc `http://localhost` działa w lokalnych testach, ale `http://192.168.x.x` i inne adresy IP w sieci LAN zwykle wymagają HTTPS. Pamiętaj, że dyrektywy nginx `add_header` w bloku `location` **nadpisują** dyrektywy `add_header` z poziomu serwera, a nie łączą się z nimi. Każdy blok `location` z własnym `add_header` musi zawierać nagłówki COEP/COOP.

Zweryfikuj poleceniem:

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

Jeśli przed nginx stoi reverse proxy, upewnij się, że zachowuje te nagłówki.

### 502 Bad Gateway

Sprawdź logi błędów Nginx:

```bash
sudo tail -f /var/log/nginx/error.log
```
