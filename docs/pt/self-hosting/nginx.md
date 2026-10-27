# Implantar com Nginx

Hospede o BentoPDF no seu próprio servidor usando o Nginx.

## Pré-requisitos

- Servidor Ubuntu/Debian
- Nginx instalado
- Certificado SSL (recomendado: Let's Encrypt)

## Passo 1: Compile o Projeto

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Para personalizar a marca, defina variáveis de ambiente antes de compilar:

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Passo 2: Copie os Arquivos

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Passo 3: Configuração do Nginx

Crie o arquivo `/etc/nginx/sites-available/bentopdf`:

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

## Passo 4: Ative o Site

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Passo 5: SSL com Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Implantação em Subdiretório

Para hospedar em `/pdf/`:

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

Compile com:

```bash
BASE_URL=/pdf/ npm run build
```

## Ajuste de Desempenho

Adicione ao `nginx.conf`:

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

## Solução de Problemas

### O WASM Não Carrega

Confirme que o tipo MIME está definido:

```nginx
types {
    application/wasm wasm;
}
```

### Sign PDF ou Form Filler Mostra um Visualizador em Branco (erro de MIME de `.mjs`)

Se o console do navegador mostrar:

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…e a requisição com falha terminar em `.mjs`, falta ao seu nginx o mapeamento `.mjs → application/javascript`. O visualizador de PDF incluído (usado por Sign PDF, Form Filler e algumas outras ferramentas) traz arquivos de módulo ES com extensão `.mjs`, e o `mime.types` padrão do nginx não os inclui por padrão.

Corrija adicionando `mjs` à linha `application/javascript` existente em `/etc/nginx/mime.types`:

```nginx
application/javascript    js mjs;
```

> NÃO acrescente uma _segunda_ linha `application/javascript`. O nginx lê o `mime.types` linha por linha e só um mapeamento de tipo para extensão vale, então uma segunda linha é ignorada silenciosamente em algumas versões. Edite a linha existente para adicionar `mjs` junto com `js`.

Ou sobrescreva localmente dentro do seu bloco server (sem editar o arquivo global):

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

Recarregue o nginx após a alteração:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Para confirmar: no DevTools do navegador → aba Network, encontre a requisição `.mjs` com falha e verifique o cabeçalho de resposta `Content-Type`. Agora ele deve ser `application/javascript`, e não `application/octet-stream`.

### Conversão de Word/ODT/Excel para PDF Não Funciona

O LibreOffice WASM exige `SharedArrayBuffer`, que precisa dos cabeçalhos `Cross-Origin-Embedder-Policy` e `Cross-Origin-Opener-Policy`. Ele também precisa de um contexto seguro, então `http://localhost` funciona para testes locais, mas `http://192.168.x.x` ou outros IPs de rede local geralmente exigem HTTPS. Observe que as diretivas `add_header` de um bloco `location` **substituem** as diretivas `add_header` do nível do servidor, e não se combinam. Todo bloco `location` com seu próprio `add_header` deve incluir os cabeçalhos COEP/COOP.

Verifique com:

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

Se você usa um proxy reverso na frente do nginx, garanta que ele preserve esses cabeçalhos.

### 502 Bad Gateway

Verifique os logs de erro do Nginx:

```bash
sudo tail -f /var/log/nginx/error.log
```
