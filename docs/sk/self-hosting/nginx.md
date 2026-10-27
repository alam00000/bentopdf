# Nasadenie pomocou Nginx

Hostujte BentoPDF na vlastnom serveri pomocou Nginx.

## Predpoklady

- Server Ubuntu/Debian
- Nainštalovaný Nginx
- SSL certifikát (odporúčané: Let's Encrypt)

## Krok 1: Zostavte projekt

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Ak chcete prispôsobiť značku, pred zostavením nastavte premenné prostredia:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Krok 2: Skopírujte súbory

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Krok 3: Konfigurácia Nginx

Vytvorte `/etc/nginx/sites-available/bentopdf`:

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

## Krok 4: Zapnite web

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Krok 5: SSL s Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Nasadenie do podadresára

Hostovanie na `/pdf/`:

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

Zostavte pomocou:

```bash
BASE_URL=/pdf/ npm run build
```

## Ladenie výkonu

Pridajte do `nginx.conf`:

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

## Riešenie problémov

### WASM sa nenačítava

Uistite sa, že je nastavený MIME typ:

```nginx
types {
    application/wasm wasm;
}
```

### Podpísať PDF alebo Vyplňovač formulárov zobrazuje prázdny prehliadač (chyba MIME `.mjs`)

Ak konzola prehliadača zobrazí:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…a zlyhávajúca požiadavka končí na `.mjs`, vášmu nginx chýba mapovanie `.mjs → application/javascript`. Pribalený PDF prehliadač (používaný nástrojmi Podpísať PDF, Vyplňovač formulárov a niekoľkými ďalšími) dodáva súbory ES modulov s príponou `.mjs` a štandardný `mime.types` v nginx ich predvolene neobsahuje.

Opravte to pridaním `mjs` do existujúceho riadka `application/javascript` v `/etc/nginx/mime.types`:

```nginx
application/javascript    js mjs;
```

> NEPRIDÁVAJTE _druhý_ riadok `application/javascript`: nginx spracúva `mime.types` riadok po riadku a vyhrá len jedno mapovanie typu na príponu, takže druhý riadok sa v niektorých verziách potichu ignoruje. Upravte existujúci riadok a pridajte `mjs` vedľa `js`.

Alebo ho prepíšte lokálne vo vašom bloku server (bez úpravy globálneho súboru):

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

Po zmene znova načítajte nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Na overenie: v DevTools prehliadača → karta Network nájdite zlyhávajúcu požiadavku `.mjs` a skontrolujte hlavičku odpovede `Content-Type`. Teraz by mala byť `application/javascript`, nie `application/octet-stream`.

### Konverzia Word/ODT/Excel do PDF nefunguje

LibreOffice WASM vyžaduje `SharedArrayBuffer`, ktorý potrebuje hlavičky `Cross-Origin-Embedder-Policy` a `Cross-Origin-Opener-Policy`. Potrebuje aj zabezpečený kontext, takže `http://localhost` funguje na lokálne testovanie, ale `http://192.168.x.x` alebo iné IP adresy v LAN zvyčajne vyžadujú HTTPS. Pozor: direktívy nginx `add_header` v bloku `location` **prepisujú** direktívy `add_header` na úrovni servera, nezlučujú sa. Každý blok `location` s vlastným `add_header` musí obsahovať hlavičky COEP/COOP.

Overte pomocou:

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

Ak pred nginx používate reverzný proxy, uistite sa, že tieto hlavičky zachováva.

### 502 Bad Gateway

Skontrolujte chybové logy Nginx:

```bash
sudo tail -f /var/log/nginx/error.log
```
