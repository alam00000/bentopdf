# Déployer sur Netlify

[Netlify](https://netlify.com) propose un excellent hébergement de sites statiques avec une offre gratuite généreuse.

## Déploiement en un clic

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## Déploiement manuel

### Étape 1 : connecter le dépôt

1. Connectez-vous à [Netlify](https://app.netlify.com)
2. Cliquez sur « Add new site » → « Import an existing project »
3. Connectez votre compte GitHub
4. Sélectionnez votre fork de BentoPDF

### Étape 2 : configurer les paramètres de build

| Paramètre                 | Valeur          |
| ------------------------- | --------------- |
| Commande de build         | `npm run build` |
| Répertoire de publication | `dist`          |
| Version de Node           | 18+             |

### Étape 3 : déployer

Cliquez sur « Deploy site » et attendez la fin du build.

## Fichier de configuration

Créez `netlify.toml` à la racine de votre projet :

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

# Required security headers for SharedArrayBuffer (used by LibreOffice WASM)
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Embedder-Policy = "require-corp"
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Resource-Policy = "cross-origin"

# Pre-compressed LibreOffice WASM binary - must be served with Content-Encoding
[[headers]]
  for = "/libreoffice-wasm/soffice.wasm.gz"
  [headers.values]
    Content-Type = "application/wasm"
    Content-Encoding = "gzip"
    Cache-Control = "public, max-age=31536000, immutable"

# Pre-compressed LibreOffice WASM data - must be served with Content-Encoding
[[headers]]
  for = "/libreoffice-wasm/soffice.data.gz"
  [headers.values]
    Content-Type = "application/octet-stream"
    Content-Encoding = "gzip"
    Cache-Control = "public, max-age=31536000, immutable"

# Cache other WASM files
[[headers]]
  for = "*.wasm"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Content-Type = "application/wasm"

# SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

::: warning Important
Les en-têtes `Cross-Origin-Embedder-Policy` et `Cross-Origin-Opener-Policy` sont nécessaires pour les conversions Word/ODT/Excel/PowerPoint vers PDF. Sans eux, `SharedArrayBuffer` n'est pas disponible et le moteur LibreOffice WASM ne parviendra pas à s'initialiser.

Les en-têtes `Content-Encoding: gzip` sur les fichiers `.wasm.gz` et `.data.gz` indiquent au navigateur de les décompresser automatiquement. Sans eux, le navigateur reçoit des octets gzip bruts et la compilation WASM échoue.
:::

## Variables d'environnement

Définissez-les dans Site settings → Environment variables :

| Variable                | Description                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| `SIMPLE_MODE`           | Mettre à `true` pour un build minimal                             |
| `VITE_BRAND_NAME`       | Nom de marque personnalisé (remplace « BentoPDF »)                |
| `VITE_BRAND_LOGO`       | Chemin du logo relatif à `public/` (par ex. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Texte personnalisé du pied de page/copyright                      |
| `VITE_DEFAULT_LANGUAGE` | Langue par défaut de l'interface (par ex. `fr`, `de`, `es`)       |

## Domaine personnalisé

1. Allez dans Site settings → Domain management
2. Cliquez sur « Add custom domain »
3. Suivez les instructions de configuration DNS

## Large Media

Pour les gros fichiers WASM, envisagez d'activer [Netlify Large Media](https://docs.netlify.com/large-media/overview/):

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## Dépannage

### La conversion Word/ODT/Excel vers PDF reste bloquée à 55 %

Si les conversions de documents restent bloquées à 55 %, ouvrez la console des DevTools et vérifiez :

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Si `crossOriginIsolated` vaut `false`, les en-têtes COEP/COOP de votre `netlify.toml` ne sont pas appliqués. Vérifiez que le fichier se trouve à la racine de votre projet et redéployez.

Si vous voyez `expected magic word 00 61 73 6d, found 1f 8b 08 08` dans la console, il manque les en-têtes `Content-Encoding: gzip` sur les fichiers `.wasm.gz`. Assurez-vous que les blocs `[[headers]]` pour `soffice.wasm.gz` et `soffice.data.gz` figurent dans votre `netlify.toml`.

### Échec du build

Vérifiez la compatibilité de la version de Node :

```toml
[build.environment]
  NODE_VERSION = "20"
```

### Chargement initial lent

Activez l'optimisation des ressources dans Site settings → Build & deploy → Asset optimization.
