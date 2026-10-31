# Nginx ile Dağıtım

BentoPDF'i Nginx kullanarak kendi sunucunuzda barındırın.

## Ön Koşullar

- Ubuntu/Debian sunucu
- Kurulu Nginx
- SSL sertifikası (önerilen: Let's Encrypt)

## Adım 1: Projeyi Derleyin

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Markayı özelleştirmek için derlemeden önce ortam değişkenlerini ayarlayın:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Adım 2: Dosyaları Kopyalayın

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Adım 3: Nginx Yapılandırması

`/etc/nginx/sites-available/bentopdf` dosyasını oluşturun:

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

## Adım 4: Siteyi Etkinleştirin

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Adım 5: Let's Encrypt ile SSL

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Alt Dizinde Dağıtım

`/pdf/` altında barındırmak için:

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

Şununla derleyin:

```bash
BASE_URL=/pdf/ npm run build
```

## Performans İyileştirme

`nginx.conf` dosyasına ekleyin:

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

## Sorun Giderme

### WASM Yüklenmiyor

MIME türünün ayarlandığından emin olun:

```nginx
types {
    application/wasm wasm;
}
```

### PDF İmzala veya Form Doldurucu Boş Görüntüleyici Gösteriyor (`.mjs` MIME hatası)

Tarayıcı konsolunda şunu görüyorsanız:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

...ve başarısız olan istek `.mjs` ile bitiyorsa, nginx'inizde `.mjs → application/javascript` eşlemesi eksiktir. Gömülü PDF görüntüleyici (PDF İmzala, Form Doldurucu ve birkaç başka araç tarafından kullanılır) `.mjs` uzantılı ES modül dosyaları içerir ve nginx'in standart `mime.types` dosyası bunları varsayılan olarak içermez.

Çözmek için `/etc/nginx/mime.types` içindeki mevcut `application/javascript` satırına `mjs` ekleyin:

```nginx
application/javascript    js mjs;
```

> İkinci bir `application/javascript` satırı EKLEMEYİN: nginx `mime.types` dosyasını satır satır ayrıştırır ve yalnızca bir tür-uzantı eşlemesi geçerli olur, bu nedenle ikinci satır bazı sürümlerde sessizce yok sayılır. Mevcut satırı düzenleyip `js` yanına `mjs` ekleyin.

Veya server bloğunuzun içinde yerel olarak geçersiz kılın (genel dosyayı düzenlemeden):

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

Değişiklikten sonra nginx'i yeniden yükleyin:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Doğrulamak için tarayıcı DevTools → Network sekmesinde başarısız olan `.mjs` isteğini bulun ve `Content-Type` yanıt başlığını kontrol edin. Artık `application/octet-stream` değil, `application/javascript` olmalıdır.

### Word/ODT/Excel'den PDF'ye Dönüştürme Çalışmıyor

LibreOffice WASM, `Cross-Origin-Embedder-Policy` ve `Cross-Origin-Opener-Policy` başlıklarını gerektiren `SharedArrayBuffer`'a ihtiyaç duyar. Ayrıca güvenli bir bağlam gerekir; bu nedenle `http://localhost` yerel testlerde çalışır, ancak `http://192.168.x.x` gibi yerel ağ IP'leri genellikle HTTPS gerektirir. Bir `location` bloğundaki nginx `add_header` yönergelerinin, sunucu düzeyindeki `add_header` yönergelerini **geçersiz kıldığını**, birleştirmediğini unutmayın. Kendi `add_header` yönergesi olan her `location` bloğu COEP/COOP başlıklarını içermelidir.

Şununla doğrulayın:

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

Nginx'in önünde bir ters proxy kullanıyorsanız, bu başlıkları korumasından emin olun.

### 502 Bad Gateway

Nginx hata günlüklerini kontrol edin:

```bash
sudo tail -f /var/log/nginx/error.log
```
