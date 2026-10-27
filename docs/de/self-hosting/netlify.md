# Auf Netlify bereitstellen

[Netlify](https://netlify.com) bietet hervorragendes Hosting für statische Websites mit einem großzügigen kostenlosen Kontingent.

## Bereitstellung mit einem Klick

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## Manuelle Bereitstellung

### Schritt 1: Repository verbinden

1. Melden Sie sich bei [Netlify](https://app.netlify.com) an
2. Klicken Sie auf "Add new site" → "Import an existing project"
3. Verbinden Sie Ihr GitHub-Konto
4. Wählen Sie Ihren BentoPDF-Fork aus

### Schritt 2: Build-Einstellungen konfigurieren

| Einstellung       | Wert            |
| ----------------- | --------------- |
| Build command     | `npm run build` |
| Publish directory | `dist`          |
| Node version      | 18+             |

### Schritt 3: Bereitstellen

Klicken Sie auf "Deploy site" und warten Sie auf den Build.

## Konfigurationsdatei

Erstellen Sie `netlify.toml` im Stammverzeichnis Ihres Projekts:

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

::: warning Wichtig
Die Header `Cross-Origin-Embedder-Policy` und `Cross-Origin-Opener-Policy` sind für die Konvertierung von Word/ODT/Excel/PowerPoint in PDF erforderlich. Ohne sie ist `SharedArrayBuffer` nicht verfügbar, und die LibreOffice-WASM-Engine kann nicht initialisiert werden.

Die `Content-Encoding: gzip`-Header für die Dateien `.wasm.gz` und `.data.gz` weisen den Browser an, sie automatisch zu dekomprimieren. Ohne sie erhält der Browser rohe gzip-Bytes, und die WASM-Kompilierung schlägt fehl.
:::

## Umgebungsvariablen

Legen Sie diese unter Site settings → Environment variables fest:

| Variable                | Beschreibung                                               |
| ----------------------- | ---------------------------------------------------------- |
| `SIMPLE_MODE`           | Auf `true` setzen für einen minimalen Build                |
| `VITE_BRAND_NAME`       | Eigener Markenname (ersetzt "BentoPDF")                    |
| `VITE_BRAND_LOGO`       | Logopfad relativ zu `public/` (z. B. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Eigener Footer-/Copyright-Text                             |
| `VITE_DEFAULT_LANGUAGE` | Standardsprache der Oberfläche (z. B. `fr`, `de`, `es`)    |

## Eigene Domain

1. Gehen Sie zu Site settings → Domain management
2. Klicken Sie auf "Add custom domain"
3. Folgen Sie den Anweisungen zur DNS-Konfiguration

## Große Mediendateien

Für große WASM-Dateien können Sie [Netlify Large Media](https://docs.netlify.com/large-media/overview/) aktivieren:

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## Fehlerbehebung

### Word/ODT/Excel zu PDF bleibt bei 55 % hängen

Wenn Dokumentkonvertierungen bei 55 % hängen bleiben, öffnen Sie die DevTools-Konsole und prüfen Sie:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Wenn `crossOriginIsolated` den Wert `false` hat, werden die COEP/COOP-Header aus Ihrer `netlify.toml` nicht angewendet. Stellen Sie sicher, dass sich die Datei im Stammverzeichnis Ihres Projekts befindet, und stellen Sie erneut bereit.

Wenn Sie in der Konsole `expected magic word 00 61 73 6d, found 1f 8b 08 08` sehen, fehlen den `.wasm.gz`-Dateien die `Content-Encoding: gzip`-Header. Stellen Sie sicher, dass die `[[headers]]`-Blöcke für `soffice.wasm.gz` und `soffice.data.gz` in Ihrer `netlify.toml` enthalten sind.

### Build schlägt fehl

Prüfen Sie die Kompatibilität der Node-Version:

```toml
[build.environment]
  NODE_VERSION = "20"
```

### Langsames erstes Laden

Aktivieren Sie die Asset-Optimierung unter Site settings → Build & deploy → Asset optimization.
