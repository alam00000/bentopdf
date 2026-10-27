# Nginx でデプロイする

Nginx を使って、BentoPDF を自分のサーバーでホストします。

## 前提条件

- Ubuntu/Debian サーバー
- Nginx がインストール済みであること
- SSL 証明書（推奨: Let's Encrypt）

## ステップ 1: プロジェクトをビルドする

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

ブランディングをカスタマイズするには、ビルド前に環境変数を設定します。

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## ステップ 2: ファイルをコピーする

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## ステップ 3: Nginx の設定

`/etc/nginx/sites-available/bentopdf` を作成します。

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

## ステップ 4: サイトを有効にする

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## ステップ 5: Let's Encrypt による SSL

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## サブディレクトリへのデプロイ

`/pdf/` でホストするには、次のようにします。

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

ビルドは次のコマンドで行います。

```bash
BASE_URL=/pdf/ npm run build
```

## パフォーマンスチューニング

`nginx.conf` に追加します。

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

## トラブルシューティング

### WASM が読み込まれない

MIME タイプが設定されていることを確認します。

```nginx
types {
    application/wasm wasm;
}
```

### PDFへ署名 または Form Filler で空白のビューアが表示される（`.mjs` の MIME エラー）

ブラウザーのコンソールに次のように表示される場合：

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…かつ失敗しているリクエストが `.mjs` で終わっている場合、お使いの nginx に `.mjs → application/javascript` のマッピングがありません。内蔵の PDF ビューア（PDFへ署名、Form Filler、その他いくつかのツールで使用）は `.mjs` 拡張子の ES モジュールファイルを同梱していますが、nginx の標準の `mime.types` にはデフォルトで含まれていません。

`/etc/nginx/mime.types` にある既存の `application/javascript` の行に `mjs` を追加して修正します。

```nginx
application/javascript    js mjs;
```

> `application/javascript` の行を*もう 1 行*追加しないでください。nginx は `mime.types` を 1 行ずつ解析し、拡張子との対応付けは 1 つの型につき 1 つしか有効にならないため、バージョンによっては 2 行目が黙って無視されます。既存の行を編集して、`js` の隣に `mjs` を追加してください。

または、server ブロック内でローカルに上書きします（グローバルなファイルの編集は不要です）。

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

変更後に nginx をリロードします。

```bash
sudo nginx -t && sudo systemctl reload nginx
```

確認するには、ブラウザーの DevTools → Network タブで失敗している `.mjs` リクエストを見つけ、`Content-Type` レスポンスヘッダーを確認します。`application/octet-stream` ではなく `application/javascript` になっているはずです。

### Word/ODT/Excel から PDF への変換が動作しない

LibreOffice WASM には `SharedArrayBuffer` が必要で、そのためには `Cross-Origin-Embedder-Policy` と `Cross-Origin-Opener-Policy` ヘッダーが必要です。セキュアコンテキストも必要なため、`http://localhost` はローカルでのテストには使えますが、`http://192.168.x.x` などの LAN IP では通常 HTTPS が必要です。なお、`location` ブロック内の nginx の `add_header` ディレクティブは、server レベルの `add_header` ディレクティブを**上書き**します。マージはされません。独自の `add_header` を持つすべての `location` ブロックに、COEP/COOP ヘッダーを含める必要があります。

次のコマンドで確認します。

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

nginx の前段にリバースプロキシがある場合は、それらのヘッダーが保持されていることを確認してください。

### 502 Bad Gateway

Nginx のエラーログを確認します。

```bash
sudo tail -f /var/log/nginx/error.log
```
