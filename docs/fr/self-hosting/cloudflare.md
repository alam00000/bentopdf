# Déployer sur Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) propose un hébergement de sites statiques rapide et mondial, avec une bande passante illimitée.

## Déploiement rapide

1. Allez sur [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Cliquez sur « Create a project »
3. Connectez votre dépôt GitHub

## Configuration du build

| Paramètre              | Valeur          |
| ---------------------- | --------------- |
| Framework preset       | None            |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | `/`             |

## Variables d'environnement

Ajoutez-les dans Settings → Environment variables :

| Variable                | Valeur                                                     |
| ----------------------- | ---------------------------------------------------------- |
| `NODE_VERSION`          | `18`                                                       |
| `SIMPLE_MODE`           | `false` (facultatif)                                       |
| `VITE_BRAND_NAME`       | Nom de marque personnalisé (facultatif)                    |
| `VITE_BRAND_LOGO`       | Chemin du logo relatif à `public/` (facultatif)            |
| `VITE_FOOTER_TEXT`      | Texte de pied de page/copyright personnalisé (facultatif)  |
| `VITE_DEFAULT_LANGUAGE` | Langue par défaut de l'interface, p. ex. `fr` (facultatif) |

## Fichier de configuration

Créez `_headers` dans votre dossier `public` :

```
# Required security headers for SharedArrayBuffer (used by LibreOffice WASM)
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: cross-origin

# Pre-compressed LibreOffice WASM binary
/libreoffice-wasm/soffice.wasm.gz
  Content-Type: application/wasm
  Content-Encoding: gzip
  Cache-Control: public, max-age=31536000, immutable

# Pre-compressed LibreOffice WASM data
/libreoffice-wasm/soffice.data.gz
  Content-Type: application/octet-stream
  Content-Encoding: gzip
  Cache-Control: public, max-age=31536000, immutable

# Cache WASM files aggressively
/*.wasm
  Cache-Control: public, max-age=31536000, immutable
  Content-Type: application/wasm

# Service worker
/sw.js
  Cache-Control: no-cache
```

::: warning Important
Les en-têtes `Cross-Origin-Embedder-Policy` et `Cross-Origin-Opener-Policy` sont requis pour les conversions Word/ODT/Excel/PowerPoint vers PDF. Sans eux, `SharedArrayBuffer` n'est pas disponible et le moteur LibreOffice WASM ne parviendra pas à s'initialiser.
:::

Créez `_redirects` pour le routage SPA :

```
/*    /index.html   200
```

## Domaine personnalisé

1. Ouvrez votre projet Pages
2. Cliquez sur « Custom domains »
3. Ajoutez votre domaine
4. Cloudflare configurera automatiquement le DNS si le domaine est chez Cloudflare

## Avantages

- **Bande passante illimitée et gratuite**
- **CDN mondial** avec plus de 300 points de présence
- **HTTPS automatique**
- **Déploiements de prévisualisation** pour les pull requests
- **Builds rapides**

## Dépannage

### Téléversement de gros fichiers

Cloudflare Pages prend en charge les fichiers jusqu'à 25 Mo. Les modules WASM ne devraient pas poser de problème, mais si vous atteignez les limites, envisagez :

```bash
# Split large files during build
npm run build
```

### Limites de taille des Workers

Si vous utilisez Cloudflare Workers pour un routage avancé, notez la limite de 1 Mo des offres gratuites.

## Worker proxy CORS (pour les signatures numériques)

L'outil de signature numérique nécessite un proxy CORS pour récupérer les chaînes de certificats. Déployez le worker fourni :

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### Fonctionnalités de sécurité

| Fonctionnalité             | Description                                   |
| -------------------------- | --------------------------------------------- |
| **Restrictions d'URL**     | Seules les URL de certificats sont autorisées |
| **Limite de taille**       | 10 Mo max par requête                         |
| **Limitation de débit**    | 60 req/IP/min (nécessite KV)                  |
| **Blocage des IP privées** | Bloque localhost et les IP internes           |

### Activer la limitation de débit

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### Compiler avec l'URL du proxy

```bash
VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
```

Ou avec Docker :

```bash
export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
DOCKER_BUILDKIT=1 docker build \
  --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
  -t your-bentopdf .
```

> **Remarque :** Consultez le [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required) pour la configuration de la signature HMAC.
