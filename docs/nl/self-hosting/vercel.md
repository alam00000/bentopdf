# Implementeren op Vercel

[Vercel](https://vercel.com) biedt de eenvoudigste implementatie-ervaring voor statische sites.

## Implementeren met één klik

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## Handmatig implementeren

### Stap 1: Fork de repository

Fork [bentopdf/bentopdf](https://github.com/alam00000/bentopdf) naar je GitHub-account.

### Stap 2: Importeren in Vercel

1. Ga naar [vercel.com/new](https://vercel.com/new)
2. Selecteer je geforkte repository
3. Configureer het project:

| Instelling       | Waarde          |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### Stap 3: Omgevingsvariabelen (optioneel)

Voeg deze toe indien nodig:

| Variabele               | Beschrijving                                                             |
| ----------------------- | ------------------------------------------------------------------------ |
| `SIMPLE_MODE`           | Stel in op `true` voor een minimale interface                            |
| `VITE_BRAND_NAME`       | Eigen merknaam (vervangt "BentoPDF")                                     |
| `VITE_BRAND_LOGO`       | Logopad relatief ten opzichte van `public/` (bijv. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Eigen footer-/copyrighttekst                                             |
| `VITE_DEFAULT_LANGUAGE` | Standaardtaal van de interface (bijv. `fr`, `de`, `es`)                  |

### Stap 4: Implementeren

Klik op "Deploy" en wacht tot de build klaar is.

## Eigen domein

1. Ga naar de projectinstellingen
2. Ga naar "Domains"
3. Voeg je eigen domein toe
4. Configureer DNS zoals aangegeven

## Beperkingen

::: warning Grote bestanden
De serverless functions van Vercel hebben een limiet van 50 MB. Omdat BentoPDF een statische site is, zou dit je niet moeten raken, maar WASM-modules zijn groot (~100 MB in totaal). Zorg dat ze worden aangeboden vanuit de map `/public`.
:::

## Probleemoplossing

### Build-timeout

Als builds een timeout geven, probeer dan:

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### 404 bij vernieuwen

Voeg een `vercel.json` toe voor SPA-routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Word/ODT/Excel naar PDF werkt niet

LibreOffice WASM-conversies vereisen `SharedArrayBuffer`, waarvoor deze responsheaders op alle pagina's nodig zijn:

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

De vooraf gecomprimeerde bestanden `.wasm.gz` en `.data.gz` hebben ook `Content-Encoding: gzip` nodig, zodat de browser ze decomprimeert.

Voeg deze toe aan je `vercel.json`:

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

Controleer dit door de DevTools-console te openen en `console.log(window.crossOriginIsolated)` uit te voeren: het moet `true` teruggeven.
