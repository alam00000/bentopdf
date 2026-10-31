# Desplega a Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) ofereix allotjament estàtic ràpid i global amb amplada de banda il·limitada.

## Desplegament ràpid

1. Ves a [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Fes clic a "Create a project"
3. Connecta el teu repositori de GitHub

## Configuració de la compilació

| Paràmetre              | Valor           |
| ---------------------- | --------------- |
| Framework preset       | None            |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | `/`             |

## Variables d'entorn

Afegeix-les a Settings → Environment variables:

| Variable                | Valor                                                       |
| ----------------------- | ----------------------------------------------------------- |
| `NODE_VERSION`          | `18`                                                        |
| `SIMPLE_MODE`           | `false` (opcional)                                          |
| `VITE_BRAND_NAME`       | Nom de marca personalitzat (opcional)                       |
| `VITE_BRAND_LOGO`       | Ruta del logotip relativa a `public/` (opcional)            |
| `VITE_FOOTER_TEXT`      | Text personalitzat del peu de pàgina/copyright (opcional)   |
| `VITE_DEFAULT_LANGUAGE` | Idioma per defecte de la interfície, p. ex. `fr` (opcional) |

## Fitxer de configuració

Crea `_headers` a la carpeta `public`:

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

::: warning Important
Les capçaleres `Cross-Origin-Embedder-Policy` i `Cross-Origin-Opener-Policy` són obligatòries per a les conversions de Word/ODT/Excel/PowerPoint a PDF. Sense elles, `SharedArrayBuffer` no està disponible i el motor LibreOffice WASM no s'inicialitzarà.
:::

Crea `_redirects` per a l'encaminament SPA:

```
/*    /index.html   200
```

## Domini personalitzat

1. Ves al teu projecte de Pages
2. Fes clic a "Custom domains"
3. Afegeix el teu domini
4. Cloudflare configurarà el DNS automàticament si el domini és a Cloudflare

## Avantatges

- **Amplada de banda il·limitada i gratuïta**
- **CDN global** amb més de 300 ubicacions de xarxa
- **HTTPS automàtic**
- **Desplegaments de previsualització** per a les pull requests
- **Compilacions ràpides**

## Resolució de problemes

### Càrrega de fitxers grans

Cloudflare Pages admet fitxers de fins a 25 MB. Els mòduls WASM haurien d'anar bé, però si arribes als límits, considera:

```bash
# Split large files during build
npm run build
```

### Límits de mida dels Workers

Si utilitzes Cloudflare Workers per a un encaminament avançat, tingues en compte el límit d'1 MB dels plans gratuïts.

## Worker de proxy CORS (per a signatures digitals)

L'eina de signatura digital requereix un proxy CORS per obtenir les cadenes de certificats. Desplega el worker inclòs:

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### Funcions de seguretat

| Funció                     | Descripció                           |
| -------------------------- | ------------------------------------ |
| **Restriccions d'URL**     | Només es permeten URL de certificats |
| **Límit de mida**          | Màx. 10MB per petició                |
| **Límit de freqüència**    | 60 peticions/IP/min (requereix KV)   |
| **Bloqueig d'IP privades** | Bloqueja localhost i IP internes     |

### Activa el límit de freqüència

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### Compila amb la URL del proxy

```bash
VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
```

O amb Docker:

```bash
export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
DOCKER_BUILDKIT=1 docker build \
  --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
  -t your-bentopdf .
```

> **Nota:** Consulta el [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required) per a la configuració de la signatura HMAC.
