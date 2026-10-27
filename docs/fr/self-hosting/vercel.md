# Déployer sur Vercel

[Vercel](https://vercel.com) offre l'expérience de déploiement la plus simple pour les sites statiques.

## Déploiement en un clic

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## Déploiement manuel

### Étape 1 : forker le dépôt

Forkez [bentopdf/bentopdf](https://github.com/alam00000/bentopdf) vers votre compte GitHub.

### Étape 2 : importer dans Vercel

1. Rendez-vous sur [vercel.com/new](https://vercel.com/new)
2. Sélectionnez votre dépôt forké
3. Configurez le projet :

| Paramètre               | Valeur          |
| ----------------------- | --------------- |
| Préréglage du framework | Vite            |
| Commande de build       | `npm run build` |
| Répertoire de sortie    | `dist`          |
| Commande d'installation | `npm install`   |

### Étape 3 : variables d'environnement (facultatif)

Ajoutez-les si nécessaire :

| Variable                | Description                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| `SIMPLE_MODE`           | Mettre à `true` pour une interface minimale                       |
| `VITE_BRAND_NAME`       | Nom de marque personnalisé (remplace « BentoPDF »)                |
| `VITE_BRAND_LOGO`       | Chemin du logo relatif à `public/` (par ex. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Texte personnalisé du pied de page/copyright                      |
| `VITE_DEFAULT_LANGUAGE` | Langue par défaut de l'interface (par ex. `fr`, `de`, `es`)       |

### Étape 4 : déployer

Cliquez sur « Deploy » et attendez la fin du build.

## Domaine personnalisé

1. Ouvrez les paramètres de votre projet
2. Allez dans « Domains »
3. Ajoutez votre domaine personnalisé
4. Configurez le DNS comme indiqué

## Limitations

::: warning Fichiers volumineux
Les fonctions serverless de Vercel ont une limite de 50 Mo. BentoPDF étant un site statique, cela ne devrait pas vous concerner, mais les modules WASM sont volumineux (~100 Mo au total). Assurez-vous qu'ils sont servis depuis le dossier `/public`.
:::

## Dépannage

### Délai d'attente du build dépassé

Si les builds dépassent le délai, essayez :

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### Erreur 404 à l'actualisation

Ajoutez un fichier `vercel.json` pour le routage SPA :

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### La conversion Word/ODT/Excel vers PDF ne fonctionne pas

Les conversions LibreOffice WASM nécessitent `SharedArrayBuffer`, qui exige ces en-têtes de réponse sur toutes les pages :

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

Les fichiers précompressés `.wasm.gz` et `.data.gz` ont aussi besoin de `Content-Encoding: gzip` pour que le navigateur les décompresse.

Ajoutez-les à votre `vercel.json` :

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Resource-Policy", "value": "cross-origin" }
      ]
    },
    {
      "source": "/libreoffice-wasm/soffice.wasm.gz",
      "headers": [
        { "key": "Content-Type", "value": "application/wasm" },
        { "key": "Content-Encoding", "value": "gzip" }
      ]
    },
    {
      "source": "/libreoffice-wasm/soffice.data.gz",
      "headers": [
        { "key": "Content-Type", "value": "application/octet-stream" },
        { "key": "Content-Encoding", "value": "gzip" }
      ]
    }
  ]
}
```

Pour vérifier, ouvrez la console des DevTools et exécutez `console.log(window.crossOriginIsolated)` : le résultat doit être `true`.
