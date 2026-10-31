# Mit Nginx bereitstellen

Hosten Sie BentoPDF mit Nginx auf Ihrem eigenen Server.

## Voraussetzungen

- Ubuntu-/Debian-Server
- Installierter Nginx
- SSL-Zertifikat (empfohlen: Let's Encrypt)

## Schritt 1: Das Projekt bauen

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Um das Branding anzupassen, setzen Sie vor dem Build Umgebungsvariablen:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Schritt 2: Dateien kopieren

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Schritt 3: Nginx-Konfiguration

Erstellen Sie `/etc/nginx/sites-available/bentopdf`:

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

## Schritt 4: Die Site aktivieren

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Schritt 5: SSL mit Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Bereitstellung in einem Unterverzeichnis

Um unter `/pdf/` zu hosten:

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

Bauen Sie mit:

```bash
BASE_URL=/pdf/ npm run build
```

## Performance-Tuning

Fügen Sie in `nginx.conf` hinzu:

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

## Fehlerbehebung

### WASM wird nicht geladen

Stellen Sie sicher, dass der MIME-Type gesetzt ist:

```nginx
types {
    application/wasm wasm;
}
```

### Signieren oder Formularausfüllung zeigt einen leeren Viewer (`.mjs`-MIME-Fehler)

Wenn die Browserkonsole Folgendes anzeigt:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…und die fehlgeschlagene Anfrage auf `.mjs` endet, fehlt in Ihrem Nginx die Zuordnung `.mjs → application/javascript`. Der mitgelieferte PDF-Viewer (genutzt von PDF unterschreiben, PDF-Formular ausfüllen und einigen weiteren Werkzeugen) enthält ES-Moduldateien mit der Endung `.mjs`, und die Standard-`mime.types` von Nginx enthält diese nicht.

Beheben Sie es, indem Sie `mjs` in der bestehenden `application/javascript`-Zeile in `/etc/nginx/mime.types` ergänzen:

```nginx
application/javascript    js mjs;
```

> Fügen Sie KEINE _zweite_ `application/javascript`-Zeile hinzu: Nginx liest `mime.types` Zeile für Zeile und nur eine Zuordnung von Typ zu Endung gilt, sodass eine zweite Zeile in manchen Versionen stillschweigend ignoriert wird. Bearbeiten Sie die bestehende Zeile und ergänzen Sie `mjs` neben `js`.

Oder überschreiben Sie es lokal in Ihrem Server-Block (ohne Änderung der globalen Datei):

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

Laden Sie Nginx nach der Änderung neu:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Zur Bestätigung: Suchen Sie in den Browser-DevTools im Tab Network die fehlgeschlagene `.mjs`-Anfrage und prüfen Sie den Response-Header `Content-Type`. Er sollte jetzt `application/javascript` lauten, nicht `application/octet-stream`.

### Word/ODT/Excel zu PDF funktioniert nicht

LibreOffice-WASM benötigt `SharedArrayBuffer`, wofür die Header `Cross-Origin-Embedder-Policy` und `Cross-Origin-Opener-Policy` nötig sind. Außerdem wird ein sicherer Kontext benötigt: `http://localhost` funktioniert für lokale Tests, aber `http://192.168.x.x` oder andere LAN-IPs erfordern in der Regel HTTPS. Beachten Sie, dass `add_header`-Direktiven in einem `location`-Block die `add_header`-Direktiven auf Server-Ebene **überschreiben**, statt sich mit ihnen zu vereinen. Jeder `location`-Block mit eigenem `add_header` muss die COEP/COOP-Header enthalten.

Überprüfen Sie mit:

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

Wenn ein Reverse-Proxy vor Nginx liegt, stellen Sie sicher, dass er diese Header beibehält.

### 502 Bad Gateway

Prüfen Sie die Nginx-Fehlerprotokolle:

```bash
sudo tail -f /var/log/nginx/error.log
```
