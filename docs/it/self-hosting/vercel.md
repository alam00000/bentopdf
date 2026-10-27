# Deploy su Vercel

[Vercel](https://vercel.com) offre l'esperienza di deploy più semplice per i siti statici.

## Deploy con un clic

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## Deploy manuale

### Passaggio 1: fai il fork del repository

Fai il fork di [bentopdf/bentopdf](https://github.com/alam00000/bentopdf) sul tuo account GitHub.

### Passaggio 2: importa su Vercel

1. Vai su [vercel.com/new](https://vercel.com/new)
2. Seleziona il tuo repository forkato
3. Configura il progetto:

| Impostazione     | Valore          |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### Passaggio 3: variabili d'ambiente (facoltativo)

Aggiungile se necessario:

| Variabile               | Descrizione                                                          |
| ----------------------- | -------------------------------------------------------------------- |
| `SIMPLE_MODE`           | Imposta su `true` per un'interfaccia minimale                        |
| `VITE_BRAND_NAME`       | Nome del brand personalizzato (sostituisce "BentoPDF")               |
| `VITE_BRAND_LOGO`       | Percorso del logo relativo a `public/` (ad es. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Testo personalizzato del footer/copyright                            |
| `VITE_DEFAULT_LANGUAGE` | Lingua predefinita dell'interfaccia (ad es. `fr`, `de`, `es`)        |

### Passaggio 4: esegui il deploy

Fai clic su "Deploy" e attendi il completamento della build.

## Dominio personalizzato

1. Vai alle impostazioni del progetto
2. Apri "Domains"
3. Aggiungi il tuo dominio personalizzato
4. Configura il DNS come indicato

## Limitazioni

::: warning File di grandi dimensioni
Le funzioni serverless di Vercel hanno un limite di 50MB. Poiché BentoPDF è un sito statico, questo non dovrebbe riguardarti, ma i moduli WASM sono grandi (~100MB in totale). Assicurati che vengano serviti dalla cartella `/public`.
:::

## Risoluzione dei problemi

### Timeout della build

Se le build vanno in timeout, prova:

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### 404 al ricaricamento

Aggiungi un `vercel.json` per il routing SPA:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Conversione da Word/ODT/Excel a PDF non funzionante

Le conversioni WASM di LibreOffice richiedono `SharedArrayBuffer`, che necessita di questi header di risposta su tutte le pagine:

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

Anche i file precompressi `.wasm.gz` e `.data.gz` richiedono `Content-Encoding: gzip`, così il browser li decomprime.

Aggiungili al tuo `vercel.json`:

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

Per verificare, apri la Console di DevTools ed esegui `console.log(window.crossOriginIsolated)`: dovrebbe restituire `true`.
