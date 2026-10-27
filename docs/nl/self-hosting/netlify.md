# Implementeren op Netlify

[Netlify](https://netlify.com) biedt uitstekende hosting voor statische sites met een royale gratis laag.

## Implementeren met één klik

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## Handmatig implementeren

### Stap 1: Repository koppelen

1. Log in bij [Netlify](https://app.netlify.com)
2. Klik op "Add new site" → "Import an existing project"
3. Koppel je GitHub-account
4. Selecteer je BentoPDF-fork

### Stap 2: Buildinstellingen configureren

| Instelling        | Waarde          |
| ----------------- | --------------- |
| Build command     | `npm run build` |
| Publish directory | `dist`          |
| Node version      | 18+             |

### Stap 3: Implementeren

Klik op "Deploy site" en wacht tot de build klaar is.

## Configuratiebestand

Maak `netlify.toml` aan in de hoofdmap van je project:

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

::: warning Belangrijk
De headers `Cross-Origin-Embedder-Policy` en `Cross-Origin-Opener-Policy` zijn vereist voor conversies van Word/ODT/Excel/PowerPoint naar PDF. Zonder deze headers is `SharedArrayBuffer` niet beschikbaar en kan de LibreOffice WASM-engine niet worden geïnitialiseerd.

De `Content-Encoding: gzip`-headers op de bestanden `.wasm.gz` en `.data.gz` zorgen ervoor dat de browser ze automatisch decomprimeert. Zonder deze headers ontvangt de browser ruwe gzip-bytes en mislukt de WASM-compilatie.
:::

## Omgevingsvariabelen

Stel deze in via Site settings → Environment variables:

| Variabele               | Beschrijving                                                             |
| ----------------------- | ------------------------------------------------------------------------ |
| `SIMPLE_MODE`           | Stel in op `true` voor een minimale build                                |
| `VITE_BRAND_NAME`       | Eigen merknaam (vervangt "BentoPDF")                                     |
| `VITE_BRAND_LOGO`       | Logopad relatief ten opzichte van `public/` (bijv. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Eigen footer-/copyrighttekst                                             |
| `VITE_DEFAULT_LANGUAGE` | Standaardtaal van de interface (bijv. `fr`, `de`, `es`)                  |

## Eigen domein

1. Ga naar Site settings → Domain management
2. Klik op "Add custom domain"
3. Volg de DNS-configuratie-instructies

## Grote media

Overweeg voor grote WASM-bestanden [Netlify Large Media](https://docs.netlify.com/large-media/overview/) in te schakelen:

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## Probleemoplossing

### Word/ODT/Excel naar PDF blijft hangen op 55%

Als documentconversies blijven hangen op 55%, open dan de DevTools-console en controleer:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Als `crossOriginIsolated` `false` is, worden de COEP/COOP-headers uit je `netlify.toml` niet toegepast. Zorg dat het bestand in de hoofdmap van je project staat en implementeer opnieuw.

Als je `expected magic word 00 61 73 6d, found 1f 8b 08 08` in de console ziet, ontbreken bij de `.wasm.gz`-bestanden de `Content-Encoding: gzip`-headers. Zorg dat de `[[headers]]`-blokken voor `soffice.wasm.gz` en `soffice.data.gz` in je `netlify.toml` staan.

### Build mislukt

Controleer de compatibiliteit van de Node-versie:

```toml
[build.environment]
  NODE_VERSION = "20"
```

### Trage eerste lading

Schakel assetoptimalisatie in via Site settings → Build & deploy → Asset optimization.
