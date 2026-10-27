# Auf Vercel bereitstellen

[Vercel](https://vercel.com) bietet die einfachste Bereitstellung für statische Websites.

## Bereitstellung mit einem Klick

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## Manuelle Bereitstellung

### Schritt 1: Repository forken

Forken Sie [bentopdf/bentopdf](https://github.com/alam00000/bentopdf) in Ihr GitHub-Konto.

### Schritt 2: In Vercel importieren

1. Gehen Sie zu [vercel.com/new](https://vercel.com/new)
2. Wählen Sie Ihr geforktes Repository aus
3. Konfigurieren Sie das Projekt:

| Einstellung      | Wert            |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### Schritt 3: Umgebungsvariablen (optional)

Fügen Sie diese bei Bedarf hinzu:

| Variable                | Beschreibung                                               |
| ----------------------- | ---------------------------------------------------------- |
| `SIMPLE_MODE`           | Auf `true` setzen für eine minimale Oberfläche             |
| `VITE_BRAND_NAME`       | Eigener Markenname (ersetzt "BentoPDF")                    |
| `VITE_BRAND_LOGO`       | Logopfad relativ zu `public/` (z. B. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Eigener Footer-/Copyright-Text                             |
| `VITE_DEFAULT_LANGUAGE` | Standardsprache der Oberfläche (z. B. `fr`, `de`, `es`)    |

### Schritt 4: Bereitstellen

Klicken Sie auf "Deploy" und warten Sie, bis der Build abgeschlossen ist.

## Eigene Domain

1. Öffnen Sie die Einstellungen Ihres Projekts
2. Navigieren Sie zu "Domains"
3. Fügen Sie Ihre eigene Domain hinzu
4. Konfigurieren Sie das DNS wie angegeben

## Einschränkungen

::: warning Große Dateien
Die Serverless Functions von Vercel haben ein Limit von 50 MB. Da BentoPDF eine statische Website ist, sollte Sie das nicht betreffen, aber die WASM-Module sind groß (insgesamt ca. 100 MB). Stellen Sie sicher, dass sie aus dem Ordner `/public` ausgeliefert werden.
:::

## Fehlerbehebung

### Build-Timeout

Wenn Builds in ein Timeout laufen, versuchen Sie Folgendes:

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### 404 beim Neuladen

Fügen Sie eine `vercel.json` für das SPA-Routing hinzu:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Word/ODT/Excel zu PDF funktioniert nicht

Die LibreOffice-WASM-Konvertierungen erfordern `SharedArrayBuffer`, wofür diese Response-Header auf allen Seiten nötig sind:

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

Die vorkomprimierten Dateien `.wasm.gz` und `.data.gz` benötigen außerdem `Content-Encoding: gzip`, damit der Browser sie dekomprimiert.

Fügen Sie diese zu Ihrer `vercel.json` hinzu:

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

Zur Überprüfung öffnen Sie die DevTools-Konsole und führen Sie `console.log(window.crossOriginIsolated)` aus. Es sollte `true` zurückgeben.
