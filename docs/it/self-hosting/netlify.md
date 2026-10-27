# Deploy su Netlify

[Netlify](https://netlify.com) offre un ottimo hosting per siti statici con un generoso piano gratuito.

## Deploy con un clic

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## Deploy manuale

### Passaggio 1: collega il repository

1. Accedi a [Netlify](https://app.netlify.com)
2. Fai clic su "Add new site" → "Import an existing project"
3. Collega il tuo account GitHub
4. Seleziona il tuo fork di BentoPDF

### Passaggio 2: configura le impostazioni di build

| Impostazione               | Valore          |
| -------------------------- | --------------- |
| Comando di build           | `npm run build` |
| Directory di pubblicazione | `dist`          |
| Versione di Node           | 18+             |

### Passaggio 3: esegui il deploy

Fai clic su "Deploy site" e attendi il completamento della build.

## File di configurazione

Crea `netlify.toml` nella radice del tuo progetto:

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

::: warning Importante
Gli header `Cross-Origin-Embedder-Policy` e `Cross-Origin-Opener-Policy` sono necessari per le conversioni da Word/ODT/Excel/PowerPoint a PDF. Senza di essi, `SharedArrayBuffer` non è disponibile e il motore WASM di LibreOffice non riesce a inizializzarsi.

Gli header `Content-Encoding: gzip` sui file `.wasm.gz` e `.data.gz` indicano al browser di decomprimerli automaticamente. Senza di essi, il browser riceve byte gzip grezzi e la compilazione WASM fallisce.
:::

## Variabili d'ambiente

Impostale in Site settings → Environment variables:

| Variabile               | Descrizione                                                          |
| ----------------------- | -------------------------------------------------------------------- |
| `SIMPLE_MODE`           | Imposta su `true` per una build minimale                             |
| `VITE_BRAND_NAME`       | Nome del brand personalizzato (sostituisce "BentoPDF")               |
| `VITE_BRAND_LOGO`       | Percorso del logo relativo a `public/` (ad es. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Testo personalizzato del footer/copyright                            |
| `VITE_DEFAULT_LANGUAGE` | Lingua predefinita dell'interfaccia (ad es. `fr`, `de`, `es`)        |

## Dominio personalizzato

1. Vai su Site settings → Domain management
2. Fai clic su "Add custom domain"
3. Segui le istruzioni per la configurazione DNS

## Large Media

Per i file WASM di grandi dimensioni, valuta di abilitare [Netlify Large Media](https://docs.netlify.com/large-media/overview/):

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## Risoluzione dei problemi

### Conversione da Word/ODT/Excel a PDF bloccata al 55%

Se le conversioni dei documenti si bloccano al 55%, apri la Console di DevTools e controlla:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Se `crossOriginIsolated` è `false`, gli header COEP/COOP del tuo `netlify.toml` non vengono applicati. Assicurati che il file sia nella radice del progetto e ripeti il deploy.

Se nella console vedi `expected magic word 00 61 73 6d, found 1f 8b 08 08`, ai file `.wasm.gz` mancano gli header `Content-Encoding: gzip`. Assicurati che i blocchi `[[headers]]` per `soffice.wasm.gz` e `soffice.data.gz` siano presenti nel tuo `netlify.toml`.

### La build fallisce

Controlla la compatibilità della versione di Node:

```toml
[build.environment]
  NODE_VERSION = "20"
```

### Caricamento iniziale lento

Abilita l'ottimizzazione degli asset in Site settings → Build & deploy → Asset optimization.
