# Despliegue con Nginx

Aloja BentoPDF en tu propio servidor con Nginx.

## Requisitos previos

- Servidor Ubuntu/Debian
- Nginx instalado
- Certificado SSL (recomendado: Let's Encrypt)

## Paso 1: Compilar el proyecto

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Para personalizar la marca, define variables de entorno antes de compilar:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Paso 2: Copiar los archivos

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Paso 3: Configuración de Nginx

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

## Paso 4: Activar el sitio

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Paso 5: SSL con Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Despliegue en un subdirectorio

Para alojarlo en `/pdf/`:

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

## Ajuste del rendimiento

Añade a `nginx.conf`:

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

## Solución de problemas

### WASM no se carga

Asegúrate de que el tipo MIME esté definido:

```nginx
types {
    application/wasm wasm;
}
```

### Firmar PDF o Rellenar formularios muestra un visor en blanco (error MIME de `.mjs`)

Si la consola del navegador muestra:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

...y la petición que falla termina en `.mjs`, a tu nginx le falta la asignación `.mjs → application/javascript`. El visor de PDF incluido (usado por Firmar PDF, Rellenar formularios y algunas otras herramientas) incorpora archivos de módulos ES con extensión `.mjs`, y el `mime.types` por defecto de nginx no los incluye.

Para solucionarlo, añade `mjs` a la línea `application/javascript` existente en `/etc/nginx/mime.types`:

```nginx
application/javascript    js mjs;
```

> NO añadas una _segunda_ línea `application/javascript`: nginx analiza `mime.types` línea por línea y solo prevalece una asignación de tipo a extensión, así que en algunas versiones la segunda línea se ignora sin avisar. Edita la línea existente para añadir `mjs` junto a `js`.

O bien sobrescríbelo localmente dentro de tu bloque server (sin editar el archivo global):

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

Recarga nginx después del cambio:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Para confirmarlo: en DevTools del navegador → pestaña Network, busca la petición `.mjs` que fallaba y revisa la cabecera de respuesta `Content-Type`. Ahora debería ser `application/javascript`, no `application/octet-stream`.

### La conversión de Word/ODT/Excel a PDF no funciona

LibreOffice WASM requiere `SharedArrayBuffer`, que necesita las cabeceras `Cross-Origin-Embedder-Policy` y `Cross-Origin-Opener-Policy`. También necesita un contexto seguro, así que `http://localhost` sirve para pruebas locales, pero `http://192.168.x.x` u otras IP de la red local normalmente requieren HTTPS. Ten en cuenta que las directivas `add_header` de nginx dentro de un bloque `location` **sobrescriben** las directivas `add_header` del nivel de servidor: no se combinan. Todo bloque `location` con sus propios `add_header` debe incluir las cabeceras COEP/COOP.

Verifica con:

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

Si usas un proxy inverso delante de nginx, asegúrate de que conserve estas cabeceras.

### 502 Bad Gateway

Revisa los registros de errores de Nginx:

```bash
sudo tail -f /var/log/nginx/error.log
```
