# Distribuera till Netlify

[Netlify](https://netlify.com) erbjuder utmärkt hosting av statiska webbplatser med en generös gratisnivå.

## Distribuera med ett klick

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## Manuell distribution

### Steg 1: Anslut repositoryt

1. Logga in på [Netlify](https://app.netlify.com)
2. Klicka på "Add new site" → "Import an existing project"
3. Anslut ditt GitHub-konto
4. Välj din BentoPDF-fork

### Steg 2: Konfigurera bygginställningar

| Inställning       | Värde           |
| ----------------- | --------------- |
| Build command     | `npm run build` |
| Publish directory | `dist`          |
| Node version      | 18+             |

### Steg 3: Distribuera

Klicka på "Deploy site" och vänta tills bygget är klart.

## Konfigurationsfil

Skapa `netlify.toml` i projektets rotmapp:

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

::: warning Viktigt
Huvudena `Cross-Origin-Embedder-Policy` och `Cross-Origin-Opener-Policy` krävs för konvertering av Word/ODT/Excel/PowerPoint till PDF. Utan dem är `SharedArrayBuffer` otillgängligt och LibreOffice WASM-motorn kan inte initieras.

Huvudena `Content-Encoding: gzip` på filerna `.wasm.gz` och `.data.gz` får webbläsaren att packa upp dem automatiskt. Utan dem får webbläsaren rå gzip-data och WASM-kompileringen misslyckas.
:::

## Miljövariabler

Ange dessa under Site settings → Environment variables:

| Variabel                | Beskrivning                                                   |
| ----------------------- | ------------------------------------------------------------- |
| `SIMPLE_MODE`           | Sätt till `true` för ett minimalt bygge                       |
| `VITE_BRAND_NAME`       | Eget varumärkesnamn (ersätter "BentoPDF")                     |
| `VITE_BRAND_LOGO`       | Logotypsökväg relativt `public/` (t.ex. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Egen sidfots-/upphovsrättstext                                |
| `VITE_DEFAULT_LANGUAGE` | Standardspråk för gränssnittet (t.ex. `fr`, `de`, `es`)       |

## Egen domän

1. Gå till Site settings → Domain management
2. Klicka på "Add custom domain"
3. Följ anvisningarna för DNS-konfiguration

## Stora mediefiler

För stora WASM-filer kan du överväga att aktivera [Netlify Large Media](https://docs.netlify.com/large-media/overview/):

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## Felsökning

### Word/ODT/Excel till PDF fastnar på 55 %

Om dokumentkonverteringar hänger sig på 55 % öppnar du DevTools Console och kontrollerar:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Om `crossOriginIsolated` är `false` tillämpas inte COEP/COOP-huvudena från din `netlify.toml`. Se till att filen ligger i projektets rotmapp och distribuera om.

Om du ser `expected magic word 00 61 73 6d, found 1f 8b 08 08` i konsolen saknar filerna `.wasm.gz` huvudet `Content-Encoding: gzip`. Kontrollera att blocken `[[headers]]` för `soffice.wasm.gz` och `soffice.data.gz` finns i din `netlify.toml`.

### Bygget misslyckas

Kontrollera att Node-versionen är kompatibel:

```toml
[build.environment]
  NODE_VERSION = "20"
```

### Långsam första laddning

Aktivera tillgångsoptimering under Site settings → Build & deploy → Asset optimization.
