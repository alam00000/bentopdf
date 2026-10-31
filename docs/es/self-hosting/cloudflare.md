# Desplegar en Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) ofrece alojamiento estático global y rápido con ancho de banda ilimitado.

## Despliegue rápido

1. Ve a [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Haz clic en "Create a project"
3. Conecta tu repositorio de GitHub

## Configuración de compilación

| Ajuste                 | Valor           |
| ---------------------- | --------------- |
| Framework preset       | None            |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | `/`             |

## Variables de entorno

Añádelas en Settings → Environment variables:

| Variable                | Value                                                        |
| ----------------------- | ------------------------------------------------------------ |
| `NODE_VERSION`          | `18`                                                         |
| `SIMPLE_MODE`           | `false` (opcional)                                           |
| `VITE_BRAND_NAME`       | Nombre de marca personalizado (opcional)                     |
| `VITE_BRAND_LOGO`       | Ruta del logo relativa a `public/` (opcional)                |
| `VITE_FOOTER_TEXT`      | Texto personalizado de pie/copyright (opcional)              |
| `VITE_DEFAULT_LANGUAGE` | Idioma predeterminado de la interfaz, p. ej. `fr` (opcional) |

## Archivo de configuración

Crea `_headers` en tu carpeta `public`:

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
Las cabeceras `Cross-Origin-Embedder-Policy` y `Cross-Origin-Opener-Policy` son necesarias para las conversiones de Word/ODT/Excel/PowerPoint a PDF. Sin ellas, `SharedArrayBuffer` no está disponible y el motor LibreOffice WASM no se podrá inicializar.
:::

Crea `_redirects` para el enrutamiento SPA:

```
/*    /index.html   200
```

## Dominio personalizado

1. Ve a tu proyecto de Pages
2. Haz clic en "Custom domains"
3. Añade tu dominio
4. Cloudflare configurará el DNS automáticamente si el dominio está en Cloudflare

## Ventajas

- **Ancho de banda ilimitado y gratuito**
- **CDN global** con más de 300 ubicaciones edge
- **HTTPS automático**
- **Despliegues de vista previa** para pull requests
- **Compilaciones rápidas**

## Solución de problemas

### Subida de archivos grandes

Cloudflare Pages admite archivos de hasta 25 MB. Los módulos WASM deberían caber, pero si llegas a los límites, considera:

```bash
# Split large files during build
npm run build
```

### Límites de tamaño del Worker

Si usas Cloudflare Workers para un enrutamiento avanzado, ten en cuenta el límite de 1 MB de los planes gratuitos.

## Worker de proxy CORS (para firmas digitales)

La herramienta de firma digital necesita un proxy CORS para obtener las cadenas de certificados. Despliega el worker incluido:

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### Funciones de seguridad

| Función                     | Descripción                          |
| --------------------------- | ------------------------------------ |
| **Restricciones de URL**    | Solo se permiten URL de certificados |
| **Límite de tamaño**        | Máx. 10MB por solicitud              |
| **Limitación de velocidad** | 60 solicitudes/IP/min (requiere KV)  |
| **Bloqueo de IP privadas**  | Bloquea localhost e IP internas      |

### Activar la limitación de velocidad

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### Compilar con la URL del proxy

```bash
VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
```

O con Docker:

```bash
export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
DOCKER_BUILDKIT=1 docker build \
  --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
  -t your-bentopdf .
```

> **Nota:** Consulta el [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required) para configurar la firma HMAC.
