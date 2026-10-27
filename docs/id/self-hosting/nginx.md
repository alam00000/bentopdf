# Deploy dengan Nginx

Host BentoPDF di server Anda sendiri menggunakan Nginx.

## Prasyarat

- Server Ubuntu/Debian
- Nginx terinstal
- Sertifikat SSL (disarankan: Let's Encrypt)

## Langkah 1: Build Proyek

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Untuk menyesuaikan branding, atur variabel lingkungan sebelum build:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Langkah 2: Salin File

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Langkah 3: Konfigurasi Nginx

Buat `/etc/nginx/sites-available/bentopdf`:

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

## Langkah 4: Aktifkan Situs

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Langkah 5: SSL dengan Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Deploy di Subdirektori

Untuk hosting di `/pdf/`:

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

Build dengan:

```bash
BASE_URL=/pdf/ npm run build
```

## Penyetelan Performa

Tambahkan ke `nginx.conf`:

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

## Pemecahan Masalah

### WASM Tidak Dimuat

Pastikan MIME type sudah diatur:

```nginx
types {
    application/wasm wasm;
}
```

### Tanda Tangani PDF atau Form Filler Menampilkan Penampil Kosong (error MIME `.mjs`)

Jika konsol browser menampilkan:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

...dan permintaan yang gagal berakhir dengan `.mjs`, berarti nginx Anda tidak memiliki pemetaan `.mjs → application/javascript`. Penampil PDF bawaan (dipakai oleh Tanda Tangani PDF, Form Filler, dan beberapa alat lain) menyertakan file modul ES berekstensi `.mjs`, dan `mime.types` bawaan nginx tidak memuatnya secara default.

Perbaiki dengan menambahkan `mjs` ke baris `application/javascript` yang sudah ada di `/etc/nginx/mime.types`:

```nginx
application/javascript    js mjs;
```

> JANGAN menambahkan baris `application/javascript` _kedua_: nginx mem-parse `mime.types` baris demi baris dan hanya satu pemetaan tipe ke ekstensi yang berlaku, sehingga baris kedua diabaikan begitu saja pada beberapa versi. Edit baris yang sudah ada untuk menambahkan `mjs` di samping `js`.

Atau timpa secara lokal di dalam blok server Anda (tanpa mengedit file global):

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

Muat ulang nginx setelah perubahan:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Untuk memastikan: di DevTools browser → tab Network, cari permintaan `.mjs` yang gagal dan periksa header respons `Content-Type`. Seharusnya kini `application/javascript`, bukan `application/octet-stream`.

### Word/ODT/Excel ke PDF Tidak Berfungsi

LibreOffice WASM memerlukan `SharedArrayBuffer`, yang membutuhkan header `Cross-Origin-Embedder-Policy` dan `Cross-Origin-Opener-Policy`. Ini juga membutuhkan secure context, sehingga `http://localhost` berfungsi untuk pengujian lokal, tetapi `http://192.168.x.x` atau IP LAN lain biasanya memerlukan HTTPS. Perhatikan bahwa direktif `add_header` nginx dalam blok `location` **menimpa** direktif `add_header` tingkat server, bukan menggabungkannya. Setiap blok `location` yang memiliki `add_header` sendiri harus menyertakan header COEP/COOP.

Verifikasi dengan:

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

Jika memakai reverse proxy di depan nginx, pastikan header ini tetap dipertahankan.

### 502 Bad Gateway

Periksa log error Nginx:

```bash
sudo tail -f /var/log/nginx/error.log
```
