# Distribuera med Nginx

Hosta BentoPDF på din egen server med Nginx.

## Förutsättningar

- Ubuntu/Debian-server
- Nginx installerat
- SSL-certifikat (rekommenderat: Let's Encrypt)

## Steg 1: Bygg projektet

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

För att anpassa varumärket sätter du miljövariabler före bygget:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Steg 2: Kopiera filer

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Steg 3: Nginx-konfiguration

Skapa `/etc/nginx/sites-available/bentopdf`:

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

## Steg 4: Aktivera webbplatsen

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Steg 5: SSL med Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Distribution i en underkatalog

För att hosta på `/pdf/`:

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

Bygg med:

```bash
BASE_URL=/pdf/ npm run build
```

## Prestandajustering

Lägg till i `nginx.conf`:

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

## Felsökning

### WASM laddas inte

Se till att MIME-typen är angiven:

```nginx
types {
    application/wasm wasm;
}
```

### Signera PDF eller Formulärifyllare visar en tom läsare (MIME-fel för `.mjs`)

Om webbläsarkonsolen visar:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…och den misslyckade begäran slutar på `.mjs` saknar din nginx mappningen `.mjs → application/javascript`. Den medföljande PDF-läsaren (som används av Signera PDF, Formulärifyllare och några andra verktyg) levereras med ES-modulfiler med filändelsen `.mjs`, och nginx standardfil `mime.types` innehåller dem inte som standard.

Åtgärda det genom att lägga till `mjs` på den befintliga raden `application/javascript` i `/etc/nginx/mime.types`:

```nginx
application/javascript    js mjs;
```

> Lägg INTE till en _andra_ rad med `application/javascript`: nginx tolkar `mime.types` rad för rad och bara en mappning från typ till filändelse gäller, så en andra rad ignoreras tyst i vissa versioner. Redigera den befintliga raden så att `mjs` står bredvid `js`.

Eller åsidosätt lokalt i ditt serverblock (ingen global filändring):

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

Ladda om nginx efter ändringen:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

För att bekräfta: leta i webbläsarens DevTools → fliken Network upp den misslyckade `.mjs`-begäran och kontrollera svarshuvudet `Content-Type`. Det ska nu vara `application/javascript`, inte `application/octet-stream`.

### Word/ODT/Excel till PDF fungerar inte

LibreOffice WASM kräver `SharedArrayBuffer`, som kräver huvudena `Cross-Origin-Embedder-Policy` och `Cross-Origin-Opener-Policy`. Det kräver också en säker kontext, så `http://localhost` fungerar för lokal testning men `http://192.168.x.x` eller andra LAN-adresser kräver oftast HTTPS. Observera att nginx-direktiv av typen `add_header` i ett `location`-block **åsidosätter** `add_header`-direktiv på servernivå: de slås inte ihop. Varje `location`-block med egna `add_header` måste innehålla COEP/COOP-huvudena.

Verifiera med:

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

Om du använder en omvänd proxy framför nginx ser du till att den bevarar dessa huvuden.

### 502 Bad Gateway

Kontrollera Nginx felloggar:

```bash
sudo tail -f /var/log/nginx/error.log
```
