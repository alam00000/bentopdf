# Implementeren op Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) biedt snelle, wereldwijde hosting van statische sites met onbeperkte bandbreedte.

## Snel implementeren

1. Ga naar [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Klik op "Create a project"
3. Koppel je GitHub-repository

## Buildconfiguratie

| Instelling             | Waarde          |
| ---------------------- | --------------- |
| Framework preset       | None            |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | `/`             |

## Omgevingsvariabelen

Voeg deze toe onder Settings → Environment variables:

| Variabele               | Waarde                                                 |
| ----------------------- | ------------------------------------------------------ |
| `NODE_VERSION`          | `18`                                                   |
| `SIMPLE_MODE`           | `false` (optioneel)                                    |
| `VITE_BRAND_NAME`       | Aangepaste merknaam (optioneel)                        |
| `VITE_BRAND_LOGO`       | Logopad relatief aan `public/` (optioneel)             |
| `VITE_FOOTER_TEXT`      | Aangepaste footer-/copyrighttekst (optioneel)          |
| `VITE_DEFAULT_LANGUAGE` | Standaardtaal van de interface, bijv. `fr` (optioneel) |

## Configuratiebestand

Maak `_headers` aan in je map `public`:

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

::: warning Belangrijk
De headers `Cross-Origin-Embedder-Policy` en `Cross-Origin-Opener-Policy` zijn vereist voor conversies van Word/ODT/Excel/PowerPoint naar PDF. Zonder deze headers is `SharedArrayBuffer` niet beschikbaar en kan de LibreOffice WASM-engine niet starten.
:::

Maak `_redirects` aan voor SPA-routing:

```
/*    /index.html   200
```

## Eigen domein

1. Ga naar je Pages-project
2. Klik op "Custom domains"
3. Voeg je domein toe
4. Cloudflare configureert DNS automatisch als het domein bij Cloudflare staat

## Voordelen

- **Gratis onbeperkte bandbreedte**
- **Wereldwijd CDN** met 300+ edge-locaties
- **Automatische HTTPS**
- **Previewimplementaties** voor pull requests
- **Snelle builds**

## Probleemoplossing

### Uploads van grote bestanden

Cloudflare Pages ondersteunt bestanden tot 25 MB. WASM-modules zouden geen probleem moeten zijn, maar als je tegen limieten aanloopt, overweeg dan:

```bash
# Split large files during build
npm run build
```

### Groottelimieten van Workers

Gebruik je Cloudflare Workers voor geavanceerde routing, let dan op de limiet van 1 MB voor gratis abonnementen.

## CORS-proxyworker (voor digitale handtekeningen)

De tool voor digitale handtekeningen vereist een CORS-proxy om certificaatketens op te halen. Implementeer de meegeleverde worker:

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### Beveiligingsfuncties

| Functie                   | Beschrijving                        |
| ------------------------- | ----------------------------------- |
| **URL-beperkingen**       | Alleen certificaat-URL's toegestaan |
| **Bestandsgroottelimiet** | Max 10MB per verzoek                |
| **Rate limiting**         | 60 verzoeken/IP/min (vereist KV)    |
| **Blokkering privé-IP's** | Blokkeert localhost en interne IP's |

### Rate limiting inschakelen

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### Bouwen met proxy-URL

```bash
VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
```

Of met Docker:

```bash
export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
DOCKER_BUILDKIT=1 docker build \
  --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
  -t your-bentopdf .
```

> **Opmerking:** Zie de [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required) voor de installatie van de HMAC-handtekening.
