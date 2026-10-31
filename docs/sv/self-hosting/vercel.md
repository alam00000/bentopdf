# Distribuera till Vercel

[Vercel](https://vercel.com) erbjuder den enklaste distributionsupplevelsen för statiska webbplatser.

## Distribuera med ett klick

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## Manuell distribution

### Steg 1: Forka repositoryt

Forka [bentopdf/bentopdf](https://github.com/alam00000/bentopdf) till ditt GitHub-konto.

### Steg 2: Importera till Vercel

1. Gå till [vercel.com/new](https://vercel.com/new)
2. Välj ditt forkade repository
3. Konfigurera projektet:

| Inställning      | Värde           |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### Steg 3: Miljövariabler (valfritt)

Lägg till dessa vid behov:

| Variabel                | Beskrivning                                                   |
| ----------------------- | ------------------------------------------------------------- |
| `SIMPLE_MODE`           | Sätt till `true` för minimalt gränssnitt                      |
| `VITE_BRAND_NAME`       | Eget varumärkesnamn (ersätter "BentoPDF")                     |
| `VITE_BRAND_LOGO`       | Logotypsökväg relativt `public/` (t.ex. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Egen sidfots-/upphovsrättstext                                |
| `VITE_DEFAULT_LANGUAGE` | Standardspråk för gränssnittet (t.ex. `fr`, `de`, `es`)       |

### Steg 4: Distribuera

Klicka på "Deploy" och vänta tills bygget är klart.

## Egen domän

1. Gå till projektinställningarna
2. Navigera till "Domains"
3. Lägg till din egen domän
4. Konfigurera DNS enligt anvisningarna

## Begränsningar

::: warning Stora filer
Vercels serverlösa funktioner har en gräns på 50 MB. Eftersom BentoPDF är en statisk webbplats ska detta inte påverka dig, men WASM-modulerna är stora (cirka 100 MB totalt). Se till att de levereras från mappen `/public`.
:::

## Felsökning

### Tidsgräns för bygget överskrids

Om bygget överskrider tidsgränsen, prova:

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### 404 vid omladdning

Lägg till en `vercel.json` för SPA-routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Word/ODT/Excel till PDF fungerar inte

LibreOffice WASM-konverteringar kräver `SharedArrayBuffer`, som kräver dessa svarshuvuden på alla sidor:

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

De förkomprimerade filerna `.wasm.gz` och `.data.gz` behöver också `Content-Encoding: gzip` så att webbläsaren packar upp dem.

Lägg till dessa i din `vercel.json`:

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

För att verifiera öppnar du DevTools Console och kör `console.log(window.crossOriginIsolated)`. Det ska returnera `true`.
