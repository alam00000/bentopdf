# Installer på Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) tilbyder hurtig, global hosting af statiske sites med ubegrænset båndbredde.

## Hurtig installation

1. Gå til [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Klik på "Create a project"
3. Forbind dit GitHub-repository

## Build-konfiguration

| Indstilling            | Værdi           |
| ---------------------- | --------------- |
| Framework preset       | None            |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | `/`             |

## Miljøvariabler

Tilføj disse under Settings → Environment variables:

| Variabel                | Værdi                                                |
| ----------------------- | ---------------------------------------------------- |
| `NODE_VERSION`          | `18`                                                 |
| `SIMPLE_MODE`           | `false` (valgfrit)                                   |
| `VITE_BRAND_NAME`       | Brugerdefineret brandnavn (valgfrit)                 |
| `VITE_BRAND_LOGO`       | Logosti relativt til `public/` (valgfrit)            |
| `VITE_FOOTER_TEXT`      | Brugerdefineret footer-/copyrighttekst (valgfrit)    |
| `VITE_DEFAULT_LANGUAGE` | Standardsprog i brugerfladen, f.eks. `fr` (valgfrit) |

## Konfigurationsfil

Opret `_headers` i din `public`-mappe:

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

::: warning Vigtigt
Headerne `Cross-Origin-Embedder-Policy` og `Cross-Origin-Opener-Policy` er påkrævet til konvertering af Word/ODT/Excel/PowerPoint til PDF. Uden dem er `SharedArrayBuffer` ikke tilgængelig, og LibreOffice WASM-motoren kan ikke starte.
:::

Opret `_redirects` til SPA-routing:

```
/*    /index.html   200
```

## Eget domæne

1. Gå til dit Pages-projekt
2. Klik på "Custom domains"
3. Tilføj dit domæne
4. Cloudflare konfigurerer automatisk DNS, hvis domænet ligger hos Cloudflare

## Fordele

- **Gratis, ubegrænset båndbredde**
- **Globalt CDN** med 300+ edge-lokationer
- **Automatisk HTTPS**
- **Preview-installationer** til pull requests
- **Hurtige builds**

## Fejlfinding

### Upload af store filer

Cloudflare Pages understøtter filer op til 25 MB. WASM-moduler bør være fine, men hvis du rammer grænser, kan du overveje:

```bash
# Split large files during build
npm run build
```

### Størrelsesgrænser for Workers

Hvis du bruger Cloudflare Workers til avanceret routing, skal du være opmærksom på grænsen på 1 MB for gratis planer.

## CORS-proxy-worker (til digitale signaturer)

Værktøjet til digital signatur kræver en CORS-proxy for at hente certifikatkæder. Installer den medfølgende worker:

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### Sikkerhedsfunktioner

| Funktion                       | Beskrivelse                         |
| ------------------------------ | ----------------------------------- |
| **URL-begrænsninger**          | Kun certifikat-URL'er tilladt       |
| **Filstørrelsesgrænse**        | Maks. 10MB pr. forespørgsel         |
| **Rate limiting**              | 60 forespørgsler/IP/min (kræver KV) |
| **Blokering af private IP'er** | Blokerer localhost og interne IP'er |

### Aktivér rate limiting

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### Byg med proxy-URL

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

> **Bemærk:** Se [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required) for opsætning af HMAC-signatur.
