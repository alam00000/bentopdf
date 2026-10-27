# Implementeren met Nginx

Host BentoPDF op je eigen server met Nginx.

## Vereisten

- Ubuntu/Debian-server
- Nginx geïnstalleerd
- SSL-certificaat (aanbevolen: Let's Encrypt)

## Stap 1: Bouw het project

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Om de huisstijl aan te passen, stel je omgevingsvariabelen in vóór het bouwen:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Stap 2: Bestanden kopiëren

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Stap 3: Nginx-configuratie

Maak `/etc/nginx/sites-available/bentopdf` aan:

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

## Stap 4: De site inschakelen

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Stap 5: SSL met Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Implementatie in een submap

Om te hosten op `/pdf/`:

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

Bouw met:

```bash
BASE_URL=/pdf/ npm run build
```

## Prestaties afstellen

Voeg toe aan `nginx.conf`:

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

## Probleemoplossing

### WASM wordt niet geladen

Zorg dat het MIME-type is ingesteld:

```nginx
types {
    application/wasm wasm;
}
```

### PDF ondertekenen of formulierinvuller toont een lege viewer (`.mjs` MIME-fout)

Als de browserconsole het volgende toont:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

...en het mislukte verzoek eindigt op `.mjs`, dan mist in je nginx de koppeling `.mjs → application/javascript`. De meegeleverde PDF-viewer (gebruikt door PDF ondertekenen, PDF-formulier invullen en een paar andere tools) levert ES-modulebestanden met de extensie `.mjs`, en de standaard `mime.types` van nginx bevat die niet.

Los dit op door `mjs` toe te voegen aan de bestaande regel `application/javascript` in `/etc/nginx/mime.types`:

```nginx
application/javascript    js mjs;
```

> Voeg GEEN _tweede_ regel `application/javascript` toe: nginx leest `mime.types` regel voor regel en slechts één koppeling van type naar extensie wint, dus een tweede regel wordt op sommige versies stilzwijgend genegeerd. Pas de bestaande regel aan door `mjs` naast `js` toe te voegen.

Of overschrijf het lokaal in je serverblok (geen globale bestandswijziging):

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

Laad nginx opnieuw na de wijziging:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Om te bevestigen: zoek in browser DevTools → tabblad Netwerk het mislukte `.mjs`-verzoek en controleer de responsheader `Content-Type`. Die moet nu `application/javascript` zijn, niet `application/octet-stream`.

### Word/ODT/Excel naar PDF werkt niet

LibreOffice WASM vereist `SharedArrayBuffer`, waarvoor de headers `Cross-Origin-Embedder-Policy` en `Cross-Origin-Opener-Policy` nodig zijn. Ook is een veilige context nodig, dus `http://localhost` werkt voor lokaal testen, maar `http://192.168.x.x` of andere LAN-IP's vereisen meestal HTTPS. Let op: nginx `add_header`-directives in een `location`-blok **overschrijven** `add_header`-directives op serverniveau, ze worden niet samengevoegd. Elk `location`-blok met eigen `add_header` moet de COEP/COOP-headers bevatten.

Controleren met:

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

Gebruik je een reverse proxy vóór nginx, zorg dan dat die deze headers behoudt.

### 502 Bad Gateway

Controleer de Nginx-foutlogboeken:

```bash
sudo tail -f /var/log/nginx/error.log
```
