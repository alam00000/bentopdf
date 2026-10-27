# Despliegue en Netlify

[Netlify](https://netlify.com) ofrece un excelente alojamiento de sitios estáticos con un generoso plan gratuito.

## Despliegue con un clic

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## Despliegue manual

### Paso 1: Conectar el repositorio

1. Inicia sesión en [Netlify](https://app.netlify.com)
2. Haz clic en "Add new site" → "Import an existing project"
3. Conecta tu cuenta de GitHub
4. Selecciona tu fork de BentoPDF

### Paso 2: Configurar los ajustes de compilación

| Ajuste                    | Valor           |
| ------------------------- | --------------- |
| Comando de compilación    | `npm run build` |
| Directorio de publicación | `dist`          |
| Versión de Node           | 18+             |

### Paso 3: Desplegar

Haz clic en "Deploy site" y espera a que termine la compilación.

## Archivo de configuración

Crea `netlify.toml` en la raíz de tu proyecto:

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

::: warning Importante
Las cabeceras `Cross-Origin-Embedder-Policy` y `Cross-Origin-Opener-Policy` son necesarias para las conversiones de Word/ODT/Excel/PowerPoint a PDF. Sin ellas, `SharedArrayBuffer` no está disponible y el motor LibreOffice WASM no podrá inicializarse.

Las cabeceras `Content-Encoding: gzip` en los archivos `.wasm.gz` y `.data.gz` indican al navegador que los descomprima automáticamente. Sin ellas, el navegador recibe bytes gzip sin procesar y la compilación de WASM falla.
:::

## Variables de entorno

Configúralas en Site settings → Environment variables:

| Variable                | Descripción                                                          |
| ----------------------- | -------------------------------------------------------------------- |
| `SIMPLE_MODE`           | Ponla en `true` para una compilación mínima                          |
| `VITE_BRAND_NAME`       | Nombre de marca personalizado (reemplaza "BentoPDF")                 |
| `VITE_BRAND_LOGO`       | Ruta del logotipo relativa a `public/` (p. ej. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Texto personalizado del pie de página y de derechos de autor         |
| `VITE_DEFAULT_LANGUAGE` | Idioma predeterminado de la interfaz (p. ej. `fr`, `de`, `es`)       |

## Dominio personalizado

1. Ve a Site settings → Domain management
2. Haz clic en "Add custom domain"
3. Sigue las instrucciones de configuración de DNS

## Archivos multimedia grandes

Para archivos WASM grandes, considera activar [Netlify Large Media](https://docs.netlify.com/large-media/overview/):

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## Solución de problemas

### La conversión de Word/ODT/Excel a PDF se queda atascada en el 55%

Si las conversiones de documentos se quedan colgadas en el 55%, abre la consola de DevTools y comprueba:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Si `crossOriginIsolated` es `false`, las cabeceras COEP/COOP de tu `netlify.toml` no se están aplicando. Asegúrate de que el archivo esté en la raíz de tu proyecto y vuelve a desplegar.

Si ves `expected magic word 00 61 73 6d, found 1f 8b 08 08` en la consola, a los archivos `.wasm.gz` les faltan las cabeceras `Content-Encoding: gzip`. Asegúrate de que los bloques `[[headers]]` de `soffice.wasm.gz` y `soffice.data.gz` estén en tu `netlify.toml`.

### Falla la compilación

Comprueba la compatibilidad de la versión de Node:

```toml
[build.environment]
  NODE_VERSION = "20"
```

### Carga inicial lenta

Activa la optimización de recursos en Site settings → Build & deploy → Asset optimization.
