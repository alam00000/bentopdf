# Despliegue en Vercel

[Vercel](https://vercel.com) ofrece la experiencia de despliegue más sencilla para sitios estáticos.

## Despliegue con un clic

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## Despliegue manual

### Paso 1: Hacer un fork del repositorio

Haz un fork de [bentopdf/bentopdf](https://github.com/alam00000/bentopdf) en tu cuenta de GitHub.

### Paso 2: Importar en Vercel

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Selecciona tu repositorio con el fork
3. Configura el proyecto:

| Ajuste                 | Valor           |
| ---------------------- | --------------- |
| Framework Preset       | Vite            |
| Comando de compilación | `npm run build` |
| Directorio de salida   | `dist`          |
| Comando de instalación | `npm install`   |

### Paso 3: Variables de entorno (opcional)

Añádelas si las necesitas:

| Variable                | Descripción                                                          |
| ----------------------- | -------------------------------------------------------------------- |
| `SIMPLE_MODE`           | Ponla en `true` para una interfaz mínima                             |
| `VITE_BRAND_NAME`       | Nombre de marca personalizado (reemplaza "BentoPDF")                 |
| `VITE_BRAND_LOGO`       | Ruta del logotipo relativa a `public/` (p. ej. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Texto personalizado del pie de página y de derechos de autor         |
| `VITE_DEFAULT_LANGUAGE` | Idioma predeterminado de la interfaz (p. ej. `fr`, `de`, `es`)       |

### Paso 4: Desplegar

Haz clic en "Deploy" y espera a que termine la compilación.

## Dominio personalizado

1. Ve a los ajustes de tu proyecto
2. Ve a "Domains"
3. Añade tu dominio personalizado
4. Configura el DNS según las instrucciones

## Limitaciones

::: warning Archivos grandes
Las funciones serverless de Vercel tienen un límite de 50 MB. Como BentoPDF es un sitio estático, esto no debería afectarte, pero los módulos WASM son grandes (~100 MB en total). Asegúrate de que se sirvan desde la carpeta `/public`.
:::

## Solución de problemas

### Tiempo de espera agotado en la compilación

Si las compilaciones agotan el tiempo de espera, prueba lo siguiente:

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### Error 404 al recargar

Añade un `vercel.json` para el enrutamiento SPA:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### La conversión de Word/ODT/Excel a PDF no funciona

Las conversiones de LibreOffice WASM requieren `SharedArrayBuffer`, que necesita estas cabeceras de respuesta en todas las páginas:

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

Los archivos precomprimidos `.wasm.gz` y `.data.gz` también necesitan `Content-Encoding: gzip` para que el navegador los descomprima.

Añade esto a tu `vercel.json`:

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

Para verificarlo, abre la consola de DevTools y ejecuta `console.log(window.crossOriginIsolated)`: debería devolver `true`.
