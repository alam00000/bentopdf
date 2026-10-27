# Nasadenie na Vercel

[Vercel](https://vercel.com) ponúka najjednoduchšie nasadenie statických webov.

## Nasadenie jedným kliknutím

[![Nasadiť cez Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## Ručné nasadenie

### Krok 1: Vytvorte fork repozitára

Vytvorte fork [bentopdf/bentopdf](https://github.com/alam00000/bentopdf) do svojho účtu GitHub.

### Krok 2: Importujte do Vercel

1. Prejdite na [vercel.com/new](https://vercel.com/new)
2. Vyberte svoj fork repozitára
3. Nakonfigurujte projekt:

| Nastavenie       | Hodnota         |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### Krok 3: Premenné prostredia (voliteľné)

V prípade potreby pridajte:

| Premenná                | Popis                                                           |
| ----------------------- | --------------------------------------------------------------- |
| `SIMPLE_MODE`           | Nastavte na `true` pre minimálne rozhranie                      |
| `VITE_BRAND_NAME`       | Vlastný názov značky (nahrádza „BentoPDF“)                      |
| `VITE_BRAND_LOGO`       | Cesta k logu relatívne k `public/` (napr. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Vlastný text päty / autorských práv                             |
| `VITE_DEFAULT_LANGUAGE` | Predvolený jazyk rozhrania (napr. `fr`, `de`, `es`)             |

### Krok 4: Nasaďte

Kliknite na „Deploy“ a počkajte na dokončenie zostavenia.

## Vlastná doména

1. Prejdite do nastavení projektu
2. Otvorte „Domains“
3. Pridajte svoju vlastnú doménu
4. Nakonfigurujte DNS podľa pokynov

## Obmedzenia

::: warning Veľké súbory
Serverless funkcie Vercel majú limit 50 MB. Keďže BentoPDF je statický web, nemalo by vás to ovplyvniť, ale WASM moduly sú veľké (spolu ~100 MB). Uistite sa, že sa poskytujú z priečinka `/public`.
:::

## Riešenie problémov

### Časový limit zostavenia

Ak zostavenia prekračujú časový limit, skúste:

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### 404 po obnovení stránky

Pridajte `vercel.json` pre SPA smerovanie:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Konverzia Word/ODT/Excel do PDF nefunguje

Konverzie LibreOffice WASM vyžadujú `SharedArrayBuffer`, ktorý potrebuje na všetkých stránkach tieto hlavičky odpovede:

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

Vopred skomprimované súbory `.wasm.gz` a `.data.gz` tiež potrebujú `Content-Encoding: gzip`, aby ich prehliadač dekomprimoval.

Pridajte toto do svojho `vercel.json`:

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

Na overenie otvorte konzolu DevTools a spustite `console.log(window.crossOriginIsolated)`: mal by vrátiť `true`.
