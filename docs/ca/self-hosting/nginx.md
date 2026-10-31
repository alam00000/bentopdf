# Desplega amb Nginx

Allotja BentoPDF al teu propi servidor amb Nginx.

## Requisits previs

- Servidor Ubuntu/Debian
- Nginx instal·lat
- Certificat SSL (recomanat: Let's Encrypt)

## Pas 1: compila el projecte

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Per personalitzar la marca, defineix variables d'entorn abans de compilar:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Pas 2: copia els fitxers

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Pas 3: configuració de Nginx

Crea `/etc/nginx/sites-available/bentopdf`:

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

## Pas 4: activa el lloc

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Pas 5: SSL amb Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Desplegament en un subdirectori

Per allotjar-lo a `/pdf/`:

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

Compila amb:

```bash
BASE_URL=/pdf/ npm run build
```

## Ajust del rendiment

Afegeix a `nginx.conf`:

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

## Resolució de problemes

### WASM no es carrega

Assegura't que el tipus MIME està definit:

```nginx
types {
    application/wasm wasm;
}
```

### Signa PDF o l'Emplenador de formularis mostra un visualitzador en blanc (error MIME de `.mjs`)

Si la consola del navegador mostra:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

...i la petició que falla acaba en `.mjs`, al teu nginx li falta l'assignació `.mjs → application/javascript`. El visualitzador de PDF incorporat (que fan servir Signa PDF, l'Emplenador de formularis i algunes altres eines) inclou fitxers de mòdul ES amb extensió `.mjs`, i el `mime.types` estàndard de nginx no els inclou per defecte.

Per solucionar-ho, afegeix `mjs` a la línia existent d'`application/javascript` de `/etc/nginx/mime.types`:

```nginx
application/javascript    js mjs;
```

> NO afegeixis una _segona_ línia `application/javascript`: nginx analitza `mime.types` línia per línia i només guanya una assignació de tipus a extensió, així que una segona línia s'ignora en silenci en algunes versions. Edita la línia existent per afegir `mjs` al costat de `js`.

O sobreescriu-ho localment dins del bloc server (sense editar el fitxer global):

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

Torna a carregar nginx després del canvi:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Per confirmar-ho: a DevTools del navegador → pestanya Network, troba la petició `.mjs` que fallava i comprova la capçalera de resposta `Content-Type`. Ara hauria de ser `application/javascript`, no `application/octet-stream`.

### La conversió de Word/ODT/Excel a PDF no funciona

LibreOffice WASM requereix `SharedArrayBuffer`, que necessita les capçaleres `Cross-Origin-Embedder-Policy` i `Cross-Origin-Opener-Policy`. També necessita un context segur, així que `http://localhost` funciona per a proves locals, però `http://192.168.x.x` o altres IP de la xarxa local normalment requereixen HTTPS. Tingues en compte que les directives `add_header` de nginx dins d'un bloc `location` **sobreescriuen** les directives `add_header` del nivell de servidor: no es combinen. Cada bloc `location` amb el seu propi `add_header` ha d'incloure les capçaleres COEP/COOP.

Verifica-ho amb:

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

Si fas servir un servidor intermediari invers davant de nginx, assegura't que conservi aquestes capçaleres.

### 502 Bad Gateway

Comprova els registres d'errors de Nginx:

```bash
sudo tail -f /var/log/nginx/error.log
```
