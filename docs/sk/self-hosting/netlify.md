# Nasadenie na Netlify

[Netlify](https://netlify.com) ponúka výborný hosting statických webov so štedrým bezplatným plánom.

## Nasadenie jedným kliknutím

[![Nasadiť na Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## Ručné nasadenie

### Krok 1: Pripojte repozitár

1. Prihláste sa do [Netlify](https://app.netlify.com)
2. Kliknite na „Add new site“ → „Import an existing project“
3. Pripojte svoj účet GitHub
4. Vyberte svoj fork BentoPDF

### Krok 2: Nakonfigurujte nastavenia zostavenia

| Nastavenie         | Hodnota         |
| ------------------ | --------------- |
| Príkaz zostavenia  | `npm run build` |
| Publikačný adresár | `dist`          |
| Verzia Node        | 18+             |

### Krok 3: Nasaďte

Kliknite na „Deploy site“ a počkajte na zostavenie.

## Konfiguračný súbor

V koreňovom adresári projektu vytvorte `netlify.toml`:

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

::: warning Dôležité
Hlavičky `Cross-Origin-Embedder-Policy` a `Cross-Origin-Opener-Policy` sú potrebné pre konverzie Word/ODT/Excel/PowerPoint do PDF. Bez nich nie je `SharedArrayBuffer` dostupný a engine LibreOffice WASM sa nepodarí inicializovať.

Hlavičky `Content-Encoding: gzip` pri súboroch `.wasm.gz` a `.data.gz` hovoria prehliadaču, aby ich automaticky dekomprimoval. Bez nich prehliadač dostane surové gzip bajty a kompilácia WASM zlyhá.
:::

## Premenné prostredia

Nastavte ich v Site settings → Environment variables:

| Premenná                | Popis                                                           |
| ----------------------- | --------------------------------------------------------------- |
| `SIMPLE_MODE`           | Nastavte na `true` pre minimálne zostavenie                     |
| `VITE_BRAND_NAME`       | Vlastný názov značky (nahrádza „BentoPDF“)                      |
| `VITE_BRAND_LOGO`       | Cesta k logu relatívne k `public/` (napr. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Vlastný text päty / autorských práv                             |
| `VITE_DEFAULT_LANGUAGE` | Predvolený jazyk rozhrania (napr. `fr`, `de`, `es`)             |

## Vlastná doména

1. Prejdite do Site settings → Domain management
2. Kliknite na „Add custom domain“
3. Postupujte podľa pokynov na konfiguráciu DNS

## Veľké médiá

Pre veľké WASM súbory zvážte zapnutie [Netlify Large Media](https://docs.netlify.com/large-media/overview/):

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## Riešenie problémov

### Konverzia Word/ODT/Excel do PDF sa zasekne na 55 %

Ak sa konverzie dokumentov zaseknú na 55 %, otvorte konzolu DevTools a skontrolujte:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Ak je `crossOriginIsolated` `false`, hlavičky COEP/COOP z vášho `netlify.toml` sa neuplatňujú. Uistite sa, že súbor je v koreňovom adresári projektu, a nasaďte znova.

Ak v konzole vidíte `expected magic word 00 61 73 6d, found 1f 8b 08 08`, súborom `.wasm.gz` chýbajú hlavičky `Content-Encoding: gzip`. Uistite sa, že bloky `[[headers]]` pre `soffice.wasm.gz` a `soffice.data.gz` sú vo vašom `netlify.toml`.

### Zostavenie zlyhá

Skontrolujte kompatibilitu verzie Node:

```toml
[build.environment]
  NODE_VERSION = "20"
```

### Pomalé prvé načítanie

Zapnite optimalizáciu zdrojov v Site settings → Build & deploy → Asset optimization.
