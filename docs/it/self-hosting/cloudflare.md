# Distribuzione su Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) offre hosting di siti statici veloce e globale con banda illimitata.

## Distribuzione rapida

1. Vai su [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Clicca su "Create a project"
3. Collega il tuo repository GitHub

## Configurazione della build

| Impostazione           | Valore          |
| ---------------------- | --------------- |
| Framework preset       | None            |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | `/`             |

## Variabili d'ambiente

Aggiungile in Settings → Environment variables:

| Variabile               | Valore                                                      |
| ----------------------- | ----------------------------------------------------------- |
| `NODE_VERSION`          | `18`                                                        |
| `SIMPLE_MODE`           | `false` (facoltativo)                                       |
| `VITE_BRAND_NAME`       | Nome del marchio personalizzato (facoltativo)               |
| `VITE_BRAND_LOGO`       | Percorso del logo relativo a `public/` (facoltativo)        |
| `VITE_FOOTER_TEXT`      | Testo personalizzato del footer/copyright (facoltativo)     |
| `VITE_DEFAULT_LANGUAGE` | Lingua predefinita dell'interfaccia, es. `fr` (facoltativo) |

## File di configurazione

Crea `_headers` nella tua cartella `public`:

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

::: warning Importante
Gli header `Cross-Origin-Embedder-Policy` e `Cross-Origin-Opener-Policy` sono necessari per le conversioni da Word/ODT/Excel/PowerPoint a PDF. Senza di essi, `SharedArrayBuffer` non è disponibile e il motore LibreOffice WASM non riesce a inizializzarsi.
:::

Crea `_redirects` per il routing SPA:

```
/*    /index.html   200
```

## Dominio personalizzato

1. Vai al tuo progetto Pages
2. Clicca su "Custom domains"
3. Aggiungi il tuo dominio
4. Cloudflare configurerà automaticamente il DNS se il dominio è su Cloudflare

## Vantaggi

- **Banda illimitata gratuita**
- **CDN globale** con oltre 300 sedi edge
- **HTTPS automatico**
- **Anteprime di distribuzione** per le pull request
- **Build veloci**

## Risoluzione dei problemi

### Caricamento di file di grandi dimensioni

Cloudflare Pages supporta file fino a 25 MB. I moduli WASM dovrebbero andare bene, ma se raggiungi i limiti, valuta:

```bash
# Split large files during build
npm run build
```

### Limiti di dimensione dei Worker

Se usi Cloudflare Workers per un routing avanzato, tieni presente il limite di 1 MB dei piani gratuiti.

## Worker proxy CORS (per le firme digitali)

Lo strumento di firma digitale richiede un proxy CORS per recuperare le catene di certificati. Distribuisci il worker incluso:

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### Funzionalità di sicurezza

| Funzionalità                 | Descrizione                        |
| ---------------------------- | ---------------------------------- |
| **Restrizioni sugli URL**    | Consentiti solo URL di certificati |
| **Limite di dimensione**     | Max 10MB per richiesta             |
| **Limitazione di frequenza** | 60 richieste/IP/min (richiede KV)  |
| **Blocco degli IP privati**  | Blocca localhost e IP interni      |

### Abilitare la limitazione di frequenza

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### Compilare con l'URL del proxy

```bash
VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
```

Oppure con Docker:

```bash
export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
DOCKER_BUILDKIT=1 docker build \
  --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
  -t your-bentopdf .
```

> **Nota:** consulta il [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required) per la configurazione della firma HMAC.
