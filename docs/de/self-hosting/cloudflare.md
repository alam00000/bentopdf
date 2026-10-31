# Auf Cloudflare Pages bereitstellen

[Cloudflare Pages](https://pages.cloudflare.com) bietet schnelles, globales Hosting für statische Websites mit unbegrenzter Bandbreite.

## Schnelle Bereitstellung

1. Gehen Sie zu [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Klicken Sie auf "Create a project"
3. Verbinden Sie Ihr GitHub-Repository

## Build-Konfiguration

| Einstellung            | Wert            |
| ---------------------- | --------------- |
| Framework preset       | None            |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | `/`             |

## Umgebungsvariablen

Fügen Sie diese unter Settings → Environment variables hinzu:

| Variable                | Wert                                               |
| ----------------------- | -------------------------------------------------- |
| `NODE_VERSION`          | `18`                                               |
| `SIMPLE_MODE`           | `false` (optional)                                 |
| `VITE_BRAND_NAME`       | Eigener Markenname (optional)                      |
| `VITE_BRAND_LOGO`       | Logo-Pfad relativ zu `public/` (optional)          |
| `VITE_FOOTER_TEXT`      | Eigener Footer-/Copyright-Text (optional)          |
| `VITE_DEFAULT_LANGUAGE` | Standard-Oberflächensprache, z. B. `fr` (optional) |

## Konfigurationsdatei

Erstellen Sie `_headers` in Ihrem Ordner `public`:

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

::: warning Wichtig
Die Header `Cross-Origin-Embedder-Policy` und `Cross-Origin-Opener-Policy` sind für Konvertierungen von Word/ODT/Excel/PowerPoint zu PDF erforderlich. Ohne sie ist `SharedArrayBuffer` nicht verfügbar, und die LibreOffice-WASM-Engine kann nicht initialisiert werden.
:::

Erstellen Sie `_redirects` für das SPA-Routing:

```
/*    /index.html   200
```

## Eigene Domain

1. Öffnen Sie Ihr Pages-Projekt
2. Klicken Sie auf "Custom domains"
3. Fügen Sie Ihre Domain hinzu
4. Cloudflare konfiguriert das DNS automatisch, wenn die Domain bei Cloudflare liegt

## Vorteile

- **Kostenlose, unbegrenzte Bandbreite**
- **Globales CDN** mit über 300 Edge-Standorten
- **Automatisches HTTPS**
- **Vorschau-Bereitstellungen** für Pull Requests
- **Schnelle Builds**

## Fehlerbehebung

### Upload großer Dateien

Cloudflare Pages unterstützt Dateien bis 25 MB. WASM-Module sollten kein Problem sein, aber wenn Sie an Grenzen stoßen, sollten Sie Folgendes überlegen:

```bash
# Split large files during build
npm run build
```

### Größenlimits für Worker

Wenn Sie Cloudflare Workers für erweitertes Routing nutzen, beachten Sie das Limit von 1 MB in kostenlosen Tarifen.

## CORS-Proxy-Worker (für digitale Signaturen)

Das Werkzeug für digitale Signaturen benötigt einen CORS-Proxy, um Zertifikatsketten abzurufen. Stellen Sie den mitgelieferten Worker bereit:

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### Sicherheitsfunktionen

| Funktion                     | Beschreibung                        |
| ---------------------------- | ----------------------------------- |
| **URL-Beschränkungen**       | Nur Zertifikat-URLs erlaubt         |
| **Dateigrößenlimit**         | Max. 10MB pro Anfrage               |
| **Ratenbegrenzung**          | 60 Anfr./IP/Min. (erfordert KV)     |
| **Blockierung privater IPs** | Blockiert localhost und interne IPs |

### Ratenbegrenzung aktivieren

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### Mit Proxy-URL bauen

```bash
VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
```

Oder mit Docker:

```bash
export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
DOCKER_BUILDKIT=1 docker build \
  --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
  -t your-bentopdf .
```

> **Hinweis:** Die Einrichtung der HMAC-Signatur finden Sie in der [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required).
