# Deploy med Nginx

Host BentoPDF på din egen server med Nginx.

## Forudsætninger

- Ubuntu/Debian-server
- Nginx installeret
- SSL-certifikat (anbefalet: Let's Encrypt)

## Trin 1: Byg projektet

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

For at tilpasse branding skal du sætte miljøvariabler, før du bygger:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Trin 2: Kopiér filer

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Trin 3: Nginx-konfiguration

Opret `/etc/nginx/sites-available/bentopdf`:

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

## Trin 4: Aktivér sitet

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Trin 5: SSL med Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Deployment i undermappe

For at hoste på `/pdf/`:

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

Byg med:

```bash
BASE_URL=/pdf/ npm run build
```

## Ydelsesjustering

Tilføj til `nginx.conf`:

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

## Fejlfinding

### WASM indlæses ikke

Sørg for, at MIME-typen er sat:

```nginx
types {
    application/wasm wasm;
}
```

### Underskriv PDF eller Formularudfylder viser en tom læser (`.mjs` MIME-fejl)

Hvis browserens konsol viser:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…og den mislykkede anmodning ender på `.mjs`, mangler din nginx tilknytningen `.mjs → application/javascript`. Den indbyggede PDF-læser (brugt af Underskriv PDF, Formularudfylder og et par andre værktøjer) leverer ES-modulfiler med filendelsen `.mjs`, og nginx' standardfil `mime.types` indeholder dem ikke som standard.

Ret det ved at tilføje `mjs` til den eksisterende `application/javascript`-linje i `/etc/nginx/mime.types`:

```nginx
application/javascript    js mjs;
```

> Tilføj IKKE en _anden_ `application/javascript`-linje. Nginx læser `mime.types` linje for linje, og kun én tilknytning mellem type og filendelse vinder, så en anden linje ignoreres i stilhed på nogle versioner. Redigér den eksisterende linje, så `mjs` står ved siden af `js`.

Eller overstyr lokalt i din server-blok (uden at redigere den globale fil):

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

Genindlæs nginx efter ændringen:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

For at bekræfte det: Find den mislykkede `.mjs`-anmodning i browserens DevTools → fanen Network, og kontrollér svarheaderen `Content-Type`. Den skulle nu være `application/javascript`, ikke `application/octet-stream`.

### Word/ODT/Excel til PDF virker ikke

LibreOffice WASM kræver `SharedArrayBuffer`, som kræver headerne `Cross-Origin-Embedder-Policy` og `Cross-Origin-Opener-Policy`. Det kræver også en sikker kontekst, så `http://localhost` virker til lokal test, men `http://192.168.x.x` eller andre LAN-IP'er kræver normalt HTTPS. Bemærk, at nginx' `add_header`-direktiver i en `location`-blok **overskriver** `add_header`-direktiver på serverniveau. De bliver ikke slået sammen. Hver `location`-blok med sin egen `add_header` skal indeholde COEP/COOP-headerne.

Kontrollér med:

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

Hvis du bruger en reverse proxy foran nginx, så sørg for, at den bevarer disse headere.

### 502 Bad Gateway

Tjek Nginx' fejllogge:

```bash
sudo tail -f /var/log/nginx/error.log
```
