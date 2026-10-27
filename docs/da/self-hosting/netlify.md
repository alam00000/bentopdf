# Deploy til Netlify

[Netlify](https://netlify.com) tilbyder fremragende hosting af statiske sites med en generøs gratis plan.

## Deploy med ét klik

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## Manuel deployment

### Trin 1: Forbind repository

1. Log ind på [Netlify](https://app.netlify.com)
2. Klik på "Add new site" → "Import an existing project"
3. Forbind din GitHub-konto
4. Vælg din BentoPDF-fork

### Trin 2: Konfigurér build-indstillinger

| Indstilling       | Værdi           |
| ----------------- | --------------- |
| Build command     | `npm run build` |
| Publish directory | `dist`          |
| Node version      | 18+             |

### Trin 3: Deploy

Klik på "Deploy site", og vent på buildet.

## Konfigurationsfil

Opret `netlify.toml` i dit projekts rodmappe:

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

::: warning Vigtigt
Headerne `Cross-Origin-Embedder-Policy` og `Cross-Origin-Opener-Policy` er påkrævet til konvertering af Word/ODT/Excel/PowerPoint til PDF. Uden dem er `SharedArrayBuffer` utilgængelig, og LibreOffice WASM-motoren kan ikke starte.

Headerne `Content-Encoding: gzip` på filerne `.wasm.gz` og `.data.gz` får browseren til at dekomprimere dem automatisk. Uden dem modtager browseren rå gzip-bytes, og WASM-kompileringen mislykkes.
:::

## Miljøvariabler

Angiv disse under Site settings → Environment variables:

| Variabel                | Beskrivelse                                                  |
| ----------------------- | ------------------------------------------------------------ |
| `SIMPLE_MODE`           | Sæt til `true` for et minimalt build                         |
| `VITE_BRAND_NAME`       | Brugerdefineret brandnavn (erstatter "BentoPDF")             |
| `VITE_BRAND_LOGO`       | Logosti relativt til `public/` (f.eks. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Brugerdefineret sidefods-/ophavsretstekst                    |
| `VITE_DEFAULT_LANGUAGE` | Standardsprog i brugerfladen (f.eks. `fr`, `de`, `es`)       |

## Eget domæne

1. Gå til Site settings → Domain management
2. Klik på "Add custom domain"
3. Følg anvisningerne til DNS-konfiguration

## Store mediefiler

Til store WASM-filer kan du overveje at aktivere [Netlify Large Media](https://docs.netlify.com/large-media/overview/):

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## Fejlfinding

### Word/ODT/Excel til PDF hænger ved 55 %

Hvis dokumentkonverteringer hænger ved 55 %, så åbn DevTools Console og kontrollér:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Hvis `crossOriginIsolated` er `false`, bliver COEP/COOP-headerne fra din `netlify.toml` ikke anvendt. Sørg for, at filen ligger i dit projekts rodmappe, og deploy igen.

Hvis du ser `expected magic word 00 61 73 6d, found 1f 8b 08 08` i konsollen, mangler `.wasm.gz`-filerne headerne `Content-Encoding: gzip`. Sørg for, at blokkene `[[headers]]` til `soffice.wasm.gz` og `soffice.data.gz` findes i din `netlify.toml`.

### Build mislykkes

Kontrollér kompatibiliteten med Node-versionen:

```toml
[build.environment]
  NODE_VERSION = "20"
```

### Langsom første indlæsning

Aktivér asset-optimering under Site settings → Build & deploy → Asset optimization.
