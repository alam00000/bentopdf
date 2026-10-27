# Nasadenie na Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) ponúka rýchly globálny hosting statických stránok s neobmedzeným prenosom dát.

## Rýchle nasadenie

1. Prejdite na [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Kliknite na „Create a project“
3. Pripojte svoj GitHub repozitár

## Konfigurácia zostavenia

| Nastavenie             | Hodnota         |
| ---------------------- | --------------- |
| Framework preset       | None            |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | `/`             |

## Premenné prostredia

Pridajte ich v Settings → Environment variables:

| Premenná                | Hodnota                                            |
| ----------------------- | -------------------------------------------------- |
| `NODE_VERSION`          | `18`                                               |
| `SIMPLE_MODE`           | `false` (voliteľné)                                |
| `VITE_BRAND_NAME`       | Vlastný názov značky (voliteľné)                   |
| `VITE_BRAND_LOGO`       | Cesta k logu relatívne k `public/` (voliteľné)     |
| `VITE_FOOTER_TEXT`      | Vlastný text päty/copyrightu (voliteľné)           |
| `VITE_DEFAULT_LANGUAGE` | Predvolený jazyk rozhrania, napr. `fr` (voliteľné) |

## Konfiguračný súbor

Vytvorte `_headers` v priečinku `public`:

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

::: warning Dôležité
Hlavičky `Cross-Origin-Embedder-Policy` a `Cross-Origin-Opener-Policy` sú potrebné na prevody Word/ODT/Excel/PowerPoint do PDF. Bez nich nie je `SharedArrayBuffer` dostupný a engine LibreOffice WASM sa nepodarí inicializovať.
:::

Vytvorte `_redirects` pre smerovanie SPA:

```
/*    /index.html   200
```

## Vlastná doména

1. Prejdite do svojho projektu Pages
2. Kliknite na „Custom domains“
3. Pridajte svoju doménu
4. Ak je doména na Cloudflare, Cloudflare automaticky nastaví DNS

## Výhody

- **Neobmedzený prenos dát zadarmo**
- **Globálne CDN** s viac ako 300 okrajovými lokalitami
- **Automatické HTTPS**
- **Náhľadové nasadenia** pre pull requesty
- **Rýchle zostavenia**

## Riešenie problémov

### Nahrávanie veľkých súborov

Cloudflare Pages podporuje súbory do 25 MB. WASM moduly by mali byť v poriadku, no ak narazíte na limity, zvážte:

```bash
# Split large files during build
npm run build
```

### Limity veľkosti Workera

Ak používate Cloudflare Workers na pokročilé smerovanie, myslite na limit 1 MB v bezplatných plánoch.

## CORS proxy Worker (pre digitálne podpisy)

Nástroj Digitálny podpis potrebuje CORS proxy na získanie reťazcov certifikátov. Nasaďte priložený worker:

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### Bezpečnostné funkcie

| Funkcia                      | Popis                            |
| ---------------------------- | -------------------------------- |
| **Obmedzenia URL**           | Povolené sú len URL certifikátov |
| **Limit veľkosti súboru**    | Max. 10MB na požiadavku          |
| **Obmedzenie frekvencie**    | 60 pož./IP/min (vyžaduje KV)     |
| **Blokovanie súkromných IP** | Blokuje localhost a interné IP   |

### Zapnutie obmedzenia frekvencie

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### Zostavenie s URL proxy

```bash
VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
```

Alebo s Docker:

```bash
export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
DOCKER_BUILDKIT=1 docker build \
  --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
  -t your-bentopdf .
```

> **Poznámka:** Nastavenie HMAC podpisu nájdete v [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required).
