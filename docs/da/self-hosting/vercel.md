# Deploy til Vercel

[Vercel](https://vercel.com) tilbyder den letteste deployment-oplevelse for statiske sites.

## Deploy med ét klik

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## Manuel deployment

### Trin 1: Fork repositoriet

Fork [bentopdf/bentopdf](https://github.com/alam00000/bentopdf) til din GitHub-konto.

### Trin 2: Importér til Vercel

1. Gå til [vercel.com/new](https://vercel.com/new)
2. Vælg dit forkede repository
3. Konfigurér projektet:

| Indstilling      | Værdi           |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### Trin 3: Miljøvariabler (valgfrit)

Tilføj disse, hvis det er nødvendigt:

| Variabel                | Beskrivelse                                                  |
| ----------------------- | ------------------------------------------------------------ |
| `SIMPLE_MODE`           | Sæt til `true` for minimal brugerflade                       |
| `VITE_BRAND_NAME`       | Brugerdefineret brandnavn (erstatter "BentoPDF")             |
| `VITE_BRAND_LOGO`       | Logosti relativt til `public/` (f.eks. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Brugerdefineret sidefods-/ophavsretstekst                    |
| `VITE_DEFAULT_LANGUAGE` | Standardsprog i brugerfladen (f.eks. `fr`, `de`, `es`)       |

### Trin 4: Deploy

Klik på "Deploy", og vent på, at buildet er færdigt.

## Eget domæne

1. Gå til dit projekts indstillinger
2. Naviger til "Domains"
3. Tilføj dit eget domæne
4. Konfigurér DNS som anvist

## Begrænsninger

::: warning Store filer
Vercels serverless-funktioner har en grænse på 50 MB. Da BentoPDF er et statisk site, bør det ikke påvirke dig, men WASM-modulerne er store (ca. 100 MB i alt). Sørg for, at de leveres fra mappen `/public`.
:::

## Fejlfinding

### Build-timeout

Hvis buildet timer ud, så prøv:

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### 404 ved opdatering af siden

Tilføj en `vercel.json` til SPA-routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Word/ODT/Excel til PDF virker ikke

LibreOffice WASM-konverteringer kræver `SharedArrayBuffer`, som kræver disse svarheadere på alle sider:

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

De forkomprimerede `.wasm.gz`- og `.data.gz`-filer skal også have `Content-Encoding: gzip`, så browseren dekomprimerer dem.

Tilføj disse til din `vercel.json`:

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

For at kontrollere det skal du åbne DevTools Console og køre `console.log(window.crossOriginIsolated)`. Den skal returnere `true`.
