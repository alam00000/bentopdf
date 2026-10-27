# Driftsätt på Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) erbjuder snabb, global hosting av statiska webbplatser med obegränsad bandbredd.

## Snabb driftsättning

1. Gå till [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Klicka på "Create a project"
3. Anslut ditt GitHub-repository

## Byggkonfiguration

| Inställning            | Värde           |
| ---------------------- | --------------- |
| Framework preset       | None            |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | `/`             |

## Miljövariabler

Lägg till dessa under Settings → Environment variables:

| Variabel                | Värde                                                 |
| ----------------------- | ----------------------------------------------------- |
| `NODE_VERSION`          | `18`                                                  |
| `SIMPLE_MODE`           | `false` (valfritt)                                    |
| `VITE_BRAND_NAME`       | Eget varumärkesnamn (valfritt)                        |
| `VITE_BRAND_LOGO`       | Logotypens sökväg relativt `public/` (valfritt)       |
| `VITE_FOOTER_TEXT`      | Egen sidfots-/upphovsrättstext (valfritt)             |
| `VITE_DEFAULT_LANGUAGE` | Standardspråk för gränssnittet, t.ex. `fr` (valfritt) |

## Konfigurationsfil

Skapa `_headers` i din `public`-mapp:

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

::: warning Viktigt
Rubrikerna `Cross-Origin-Embedder-Policy` och `Cross-Origin-Opener-Policy` krävs för konvertering av Word/ODT/Excel/PowerPoint till PDF. Utan dem är `SharedArrayBuffer` inte tillgängligt och LibreOffice WASM-motorn kan inte initieras.
:::

Skapa `_redirects` för SPA-routing:

```
/*    /index.html   200
```

## Egen domän

1. Gå till ditt Pages-projekt
2. Klicka på "Custom domains"
3. Lägg till din domän
4. Cloudflare konfigurerar DNS automatiskt om domänen finns hos Cloudflare

## Fördelar

- **Gratis obegränsad bandbredd**
- **Globalt CDN** med över 300 edge-platser
- **Automatisk HTTPS**
- **Förhandsdriftsättningar** för pull requests
- **Snabba byggen**

## Felsökning

### Uppladdning av stora filer

Cloudflare Pages stöder filer upp till 25 MB. WASM-moduler bör fungera bra, men om du når gränserna kan du överväga:

```bash
# Split large files during build
npm run build
```

### Storleksgränser för Workers

Om du använder Cloudflare Workers för avancerad routing, notera gränsen på 1 MB för gratisplaner.

## CORS-proxy-Worker (för digitala signaturer)

Verktyget för digitala signaturer kräver en CORS-proxy för att hämta certifikatkedjor. Driftsätt den medföljande workern:

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### Säkerhetsfunktioner

| Funktion                     | Beskrivning                                 |
| ---------------------------- | ------------------------------------------- |
| **URL-begränsningar**        | Endast certifikat-URL:er tillåts            |
| **Filstorleksgräns**         | Max 10MB per förfrågan                      |
| **Hastighetsbegränsning**    | 60 förfr./IP/min (kräver KV)                |
| **Blockering av privata IP** | Blockerar localhost och interna IP-adresser |

### Aktivera hastighetsbegränsning

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### Bygg med proxy-URL

```bash
VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
```

Eller med Docker:

```bash
export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
DOCKER_BUILDKIT=1 docker build \
  --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
  -t your-bentopdf .
```

> **Obs:** Se [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required) för hur du ställer in HMAC-signaturer.
