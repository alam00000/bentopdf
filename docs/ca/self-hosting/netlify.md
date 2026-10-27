# Desplega a Netlify

[Netlify](https://netlify.com) ofereix un excel·lent allotjament de llocs estàtics amb un nivell gratuït generós.

## Desplegament amb un clic

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## Desplegament manual

### Pas 1: connecta el repositori

1. Inicia sessió a [Netlify](https://app.netlify.com)
2. Fes clic a "Add new site" → "Import an existing project"
3. Connecta el teu compte de GitHub
4. Selecciona el teu fork de BentoPDF

### Pas 2: configura la compilació

| Paràmetre               | Valor           |
| ----------------------- | --------------- |
| Ordre de compilació     | `npm run build` |
| Directori de publicació | `dist`          |
| Versió de Node          | 18+             |

### Pas 3: desplega

Fes clic a "Deploy site" i espera que acabi la compilació.

## Fitxer de configuració

Crea `netlify.toml` a l'arrel del projecte:

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
Les capçaleres `Cross-Origin-Embedder-Policy` i `Cross-Origin-Opener-Policy` són necessàries per a les conversions de Word/ODT/Excel/PowerPoint a PDF. Sense elles, `SharedArrayBuffer` no està disponible i el motor WASM de LibreOffice no es podrà inicialitzar.

Les capçaleres `Content-Encoding: gzip` als fitxers `.wasm.gz` i `.data.gz` indiquen al navegador que els descomprimeixi automàticament. Sense elles, el navegador rep bytes gzip en brut i la compilació de WASM falla.
:::

## Variables d'entorn

Defineix-les a Site settings → Environment variables:

| Variable                | Descripció                                                          |
| ----------------------- | ------------------------------------------------------------------- |
| `SIMPLE_MODE`           | Posa-ho a `true` per a una compilació mínima                        |
| `VITE_BRAND_NAME`       | Nom de marca personalitzat (substitueix "BentoPDF")                 |
| `VITE_BRAND_LOGO`       | Ruta del logotip relativa a `public/` (p. ex. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Text personalitzat del peu de pàgina o dels drets d'autor           |
| `VITE_DEFAULT_LANGUAGE` | Idioma per defecte de la interfície (p. ex. `fr`, `de`, `es`)       |

## Domini personalitzat

1. Ves a Site settings → Domain management
2. Fes clic a "Add custom domain"
3. Segueix les instruccions de configuració del DNS

## Fitxers multimèdia grans

Per als fitxers WASM grans, considera activar [Netlify Large Media](https://docs.netlify.com/large-media/overview/):

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## Resolució de problemes

### La conversió de Word/ODT/Excel a PDF es queda al 55 %

Si les conversions de documents es queden penjades al 55 %, obre la consola de DevTools i comprova:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Si `crossOriginIsolated` és `false`, les capçaleres COEP/COOP del teu `netlify.toml` no s'estan aplicant. Assegura't que el fitxer és a l'arrel del projecte i torna a desplegar.

Si veus `expected magic word 00 61 73 6d, found 1f 8b 08 08` a la consola, als fitxers `.wasm.gz` els falten les capçaleres `Content-Encoding: gzip`. Assegura't que els blocs `[[headers]]` de `soffice.wasm.gz` i `soffice.data.gz` són al teu `netlify.toml`.

### La compilació falla

Comprova la compatibilitat de la versió de Node:

```toml
[build.environment]
  NODE_VERSION = "20"
```

### Càrrega inicial lenta

Activa l'optimització d'actius a Site settings → Build & deploy → Asset optimization.
