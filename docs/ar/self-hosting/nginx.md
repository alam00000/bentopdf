# النشر باستخدام Nginx

استضف BentoPDF على خادمك الخاص باستخدام Nginx.

## المتطلبات

- خادم Ubuntu/Debian
- Nginx مثبّت
- شهادة SSL (يُنصح بـ Let's Encrypt)

## الخطوة 1: بناء المشروع

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

لتخصيص العلامة التجارية، اضبط متغيرات البيئة قبل البناء:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## الخطوة 2: نسخ الملفات

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## الخطوة 3: إعداد Nginx

أنشئ `/etc/nginx/sites-available/bentopdf`:

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

## الخطوة 4: تفعيل الموقع

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## الخطوة 5: SSL مع Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## النشر في مجلد فرعي

للاستضافة على `/pdf/`:

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

ابنِ باستخدام:

```bash
BASE_URL=/pdf/ npm run build
```

## ضبط الأداء

أضف إلى `nginx.conf`:

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

## استكشاف الأخطاء وإصلاحها

### عدم تحميل WASM

تأكد من ضبط نوع MIME:

```nginx
types {
    application/wasm wasm;
}
```

### عارض توقيع PDF أو ملء النماذج فارغ (خطأ MIME لملفات `.mjs`)

إذا عرضت وحدة تحكم المتصفح:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

...وانتهى الطلب الفاشل بـ `.mjs`، فإن nginx لديك يفتقر إلى التعيين `.mjs → application/javascript`. يأتي عارض PDF المضمّن (الذي تستخدمه أدوات توقيع PDF وملء النماذج وبعض الأدوات الأخرى) بملفات وحدات ES بامتداد `.mjs`، ولا يتضمنها ملف `mime.types` الافتراضي في nginx.

أصلح ذلك بإضافة `mjs` إلى سطر `application/javascript` الموجود في `/etc/nginx/mime.types`:

```nginx
application/javascript    js mjs;
```

> لا تُضف سطرًا _ثانيًا_ لـ `application/javascript`: يحلل nginx الملف `mime.types` سطرًا بسطر ويفوز تعيين واحد فقط من النوع إلى الامتداد، لذا يُتجاهل السطر الثاني بصمت في بعض الإصدارات. عدّل السطر الموجود لإضافة `mjs` بجانب `js`.

أو تجاوزه محليًا داخل كتلة server (دون تعديل الملف العام):

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

أعد تحميل nginx بعد التغيير:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

للتأكد: في DevTools بالمتصفح، افتح تبويب Network، وابحث عن طلب `.mjs` الفاشل وتحقق من ترويسة الاستجابة `Content-Type`. يجب أن تكون الآن `application/javascript` وليس `application/octet-stream`.

### تحويل Word/ODT/Excel إلى PDF لا يعمل

يتطلب LibreOffice WASM وجود `SharedArrayBuffer`، الذي يحتاج إلى ترويستي `Cross-Origin-Embedder-Policy` و`Cross-Origin-Opener-Policy`. كما يحتاج إلى سياق آمن، لذا يعمل `http://localhost` للاختبار المحلي، بينما يتطلب `http://192.168.x.x` أو غيره من عناوين IP المحلية عادةً HTTPS. لاحظ أن توجيهات `add_header` في nginx داخل كتلة `location` **تستبدل** توجيهات `add_header` على مستوى server ولا تُدمج معها. يجب أن تتضمن كل كتلة `location` لها `add_header` خاص بها ترويستي COEP/COOP.

تحقق باستخدام:

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

إذا كنت تستخدم وكيلًا عكسيًا أمام nginx، فتأكد من أنه يحافظ على هذه الترويسات.

### 502 Bad Gateway

افحص سجلات أخطاء Nginx:

```bash
sudo tail -f /var/log/nginx/error.log
```
