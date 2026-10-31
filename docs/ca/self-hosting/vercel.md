# Desplega a Vercel

[Vercel](https://vercel.com) ofereix l'experiència de desplegament més senzilla per a llocs estàtics.

## Desplegament amb un clic

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## Desplegament manual

### Pas 1: fes un fork del repositori

Fes un fork de [bentopdf/bentopdf](https://github.com/alam00000/bentopdf) al teu compte de GitHub.

### Pas 2: importa'l a Vercel

1. Ves a [vercel.com/new](https://vercel.com/new)
2. Selecciona el repositori del teu fork
3. Configura el projecte:

| Paràmetre        | Valor           |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### Pas 3: variables d'entorn (opcional)

Afegeix-les si cal:

| Variable                | Descripció                                                          |
| ----------------------- | ------------------------------------------------------------------- |
| `SIMPLE_MODE`           | Posa-ho a `true` per a una interfície mínima                        |
| `VITE_BRAND_NAME`       | Nom de marca personalitzat (substitueix "BentoPDF")                 |
| `VITE_BRAND_LOGO`       | Ruta del logotip relativa a `public/` (p. ex. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Text personalitzat del peu de pàgina o dels drets d'autor           |
| `VITE_DEFAULT_LANGUAGE` | Idioma per defecte de la interfície (p. ex. `fr`, `de`, `es`)       |

### Pas 4: desplega

Fes clic a "Deploy" i espera que s'acabi la compilació.

## Domini personalitzat

1. Ves a la configuració del projecte
2. Navega a "Domains"
3. Afegeix el teu domini personalitzat
4. Configura el DNS segons les instruccions

## Limitacions

::: warning Fitxers grans
Les funcions serverless de Vercel tenen un límit de 50 MB. Com que BentoPDF és un lloc estàtic, això no hauria d'afectar-te, però els mòduls WASM són grans (~100 MB en total). Assegura't que es serveixin des de la carpeta `/public`.
:::

## Resolució de problemes

### Temps d'espera de la compilació esgotat

Si les compilacions s'esgoten, prova això:

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### 404 en actualitzar la pàgina

Afegeix un `vercel.json` per a l'encaminament SPA:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### La conversió de Word/ODT/Excel a PDF no funciona

Les conversions de LibreOffice WASM requereixen `SharedArrayBuffer`, que necessita aquestes capçaleres de resposta a totes les pàgines:

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

Els fitxers precomprimits `.wasm.gz` i `.data.gz` també necessiten `Content-Encoding: gzip` perquè el navegador els descomprimeixi.

Afegeix-ho al teu `vercel.json`:

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

Per verificar-ho, obre la consola de DevTools i executa `console.log(window.crossOriginIsolated)`: hauria de retornar `true`.
