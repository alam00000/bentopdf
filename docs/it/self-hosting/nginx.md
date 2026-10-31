# Deploy con Nginx

Ospita BentoPDF sul tuo server usando Nginx.

## Prerequisiti

- Server Ubuntu/Debian
- Nginx installato
- Certificato SSL (consigliato: Let's Encrypt)

## Passaggio 1: compila il progetto

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Per personalizzare il brand, imposta le variabili d'ambiente prima della build:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Passaggio 2: copia i file

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Passaggio 3: configurazione di Nginx

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

## Passaggio 4: abilita il sito

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Passaggio 5: SSL con Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Deploy in una sottodirectory

Per ospitarlo su `/pdf/`:

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

Compila con:

```bash
BASE_URL=/pdf/ npm run build
```

## Ottimizzazione delle prestazioni

Aggiungi a `nginx.conf`:

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

## Risoluzione dei problemi

### WASM non si carica

Assicurati che il tipo MIME sia impostato:

```nginx
types {
    application/wasm wasm;
}
```

### Firma PDF o Compilazione moduli mostra un visualizzatore vuoto (errore MIME `.mjs`)

Se la console del browser mostra:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…e la richiesta che fallisce termina con `.mjs`, al tuo nginx manca la mappatura `.mjs → application/javascript`. Il visualizzatore PDF incluso (usato da Firma PDF, Compilazione moduli e altri strumenti) distribuisce file ES module con estensione `.mjs`, e il `mime.types` predefinito di nginx non li include.

Risolvi aggiungendo `mjs` alla riga `application/javascript` esistente in `/etc/nginx/mime.types`:

```nginx
application/javascript    js mjs;
```

> NON aggiungere una _seconda_ riga `application/javascript`: nginx legge `mime.types` riga per riga e vince una sola mappatura tipo-estensione, quindi una seconda riga viene ignorata in silenzio su alcune versioni. Modifica la riga esistente aggiungendo `mjs` accanto a `js`.

Oppure sovrascrivi localmente nel tuo blocco server (senza modificare il file globale):

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

Ricarica nginx dopo la modifica:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Per confermare: in DevTools del browser → scheda Network, trova la richiesta `.mjs` che falliva e controlla l'header di risposta `Content-Type`. Ora dovrebbe essere `application/javascript`, non `application/octet-stream`.

### Conversione da Word/ODT/Excel a PDF non funzionante

LibreOffice WASM richiede `SharedArrayBuffer`, che necessita degli header `Cross-Origin-Embedder-Policy` e `Cross-Origin-Opener-Policy`. Serve anche un contesto sicuro: `http://localhost` funziona per i test in locale, ma `http://192.168.x.x` o altri IP della LAN di solito richiedono HTTPS. Nota che le direttive `add_header` di nginx in un blocco `location` **sovrascrivono** quelle a livello di server, non si uniscono. Ogni blocco `location` con il proprio `add_header` deve includere gli header COEP/COOP.

Verifica con:

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

Se usi un reverse proxy davanti a nginx, assicurati che preservi questi header.

### 502 Bad Gateway

Controlla i log degli errori di Nginx:

```bash
sudo tail -f /var/log/nginx/error.log
```
