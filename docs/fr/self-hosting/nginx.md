# Déployer avec Nginx

Hébergez BentoPDF sur votre propre serveur avec Nginx.

## Prérequis

- Serveur Ubuntu/Debian
- Nginx installé
- Certificat SSL (recommandé : Let's Encrypt)

## Étape 1 : construire le projet

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build
```

Pour personnaliser l'image de marque, définissez des variables d'environnement avant le build :

```bash
VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
```

## Étape 2 : copier les fichiers

```bash
sudo mkdir -p /var/www/bentopdf
sudo cp -r dist/* /var/www/bentopdf/
sudo chown -R www-data:www-data /var/www/bentopdf
```

## Étape 3 : configuration de Nginx

Créez `/etc/nginx/sites-available/bentopdf` :

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

## Étape 4 : activer le site

```bash
sudo ln -s /etc/nginx/sites-available/bentopdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Étape 5 : SSL avec Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Déploiement dans un sous-répertoire

Pour héberger sous `/pdf/` :

```nginx
location /pdf/ {
    alias /var/www/bentopdf/;
    try_files $uri $uri/ /pdf/index.html;
}
```

Construisez avec :

```bash
BASE_URL=/pdf/ npm run build
```

## Optimisation des performances

Ajoutez à `nginx.conf` :

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

## Dépannage

### Le WASM ne se charge pas

Vérifiez que le type MIME est défini :

```nginx
types {
    application/wasm wasm;
}
```

### Signer un PDF ou le remplissage de formulaire affiche un lecteur vide (erreur MIME `.mjs`)

Si la console du navigateur affiche :

```
Failed to load module script: The server responded with a non-JavaScript
MIME type of "application/octet-stream". Strict MIME type checking is
enforced for module scripts per HTML spec.
```

…et que la requête en échec se termine par `.mjs`, il manque à votre nginx la correspondance `.mjs → application/javascript`. Le lecteur PDF intégré (utilisé par Signer un PDF, le remplissage de formulaire et quelques autres outils) fournit des modules ES avec l'extension `.mjs`, et le fichier `mime.types` par défaut de nginx ne les inclut pas.

Corrigez-le en ajoutant `mjs` à la ligne `application/javascript` existante dans `/etc/nginx/mime.types` :

```nginx
application/javascript    js mjs;
```

> N'ajoutez PAS une _seconde_ ligne `application/javascript` : nginx analyse `mime.types` ligne par ligne et une seule correspondance type-extension l'emporte, donc une seconde ligne est ignorée silencieusement sur certaines versions. Modifiez la ligne existante pour ajouter `mjs` à côté de `js`.

Ou redéfinissez-le localement dans votre bloc server (sans modifier le fichier global) :

```nginx
types {
    application/javascript js mjs;
    application/wasm wasm;
}
```

Rechargez nginx après la modification :

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Pour confirmer : dans les DevTools du navigateur, onglet Network, repérez la requête `.mjs` en échec et vérifiez l'en-tête de réponse `Content-Type`. Il doit maintenant valoir `application/javascript` et non `application/octet-stream`.

### La conversion Word/ODT/Excel vers PDF ne fonctionne pas

LibreOffice WASM nécessite `SharedArrayBuffer`, qui exige les en-têtes `Cross-Origin-Embedder-Policy` et `Cross-Origin-Opener-Policy`. Il faut aussi un contexte sécurisé : `http://localhost` fonctionne pour les tests locaux, mais `http://192.168.x.x` ou d'autres IP du réseau local nécessitent généralement HTTPS. Notez que les directives `add_header` d'un bloc `location` **remplacent** celles du niveau server, elles ne fusionnent pas. Chaque bloc `location` ayant son propre `add_header` doit inclure les en-têtes COEP/COOP.

Vérifiez avec :

```bash
curl -I https://your-domain.com/ | grep -i cross-origin
```

Si vous utilisez un reverse proxy devant nginx, assurez-vous qu'il conserve ces en-têtes.

### 502 Bad Gateway

Consultez les journaux d'erreurs de Nginx :

```bash
sudo tail -f /var/log/nginx/error.log
```
