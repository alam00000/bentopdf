# Desplegar con Docker / Podman

La forma más sencilla de autoalojar BentoPDF en un entorno de producción.

> [!IMPORTANT]
> **Cabeceras necesarias para la conversión de archivos de Office**
>
> Las herramientas basadas en LibreOffice (conversión de Word, Excel y PowerPoint) requieren estas cabeceras HTTP para admitir `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> La página también debe servirse desde un contexto seguro. `http://localhost` funciona para pruebas locales, pero `http://192.168.x.x` u otras IP de red local normalmente no cumplen el requisito, así que la conversión de Office por HTTP simple fallará aunque las cabeceras estén presentes.
>
> Las imágenes de contenedor oficiales incluyen estas cabeceras. Si usas un proxy inverso (Traefik, Caddy, etc.), asegúrate de que estas cabeceras se conserven o se añadan, y usa HTTPS para el acceso que no sea loopback.

> [!TIP]
> **Usuarios de Podman:** todos los comandos `docker` funcionan con Podman sustituyendo `docker` por `podman` y `docker-compose` por `podman-compose`.

## Inicio rápido

> [!TIP]
> BentoPDF se distribuye en dos versiones:
>
> - **Versión autoalojada**: `ghcr.io/alam00000/bentopdf-simple:latest`. Todas las herramientas PDF, **sin** el aparato de marketing (sin hero, preguntas frecuentes, testimonios ni pie de página). Úsala para despliegues internos, de equipo u organización. **No** es una versión "lite" con menos funciones.
> - **Versión comercial**: `ghcr.io/alam00000/bentopdf:latest`. El sitio de marketing completo, usado por el propio bentopdf.com y por los titulares de licencia comercial con despliegues públicos.
>
> Si tienes dudas: descarga la versión autoalojada.

```bash
# Docker
docker run -d \
  --name bentopdf \
  -p 3000:8080 \
  --restart unless-stopped \
  ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d \
  --name bentopdf \
  -p 3000:8080 \
  ghcr.io/alam00000/bentopdf-simple:latest
```

## Docker Compose / Podman Compose

Crea `docker-compose.yml`:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    container_name: bentopdf
    ports:
      - '3000:8080'
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:8080']
      interval: 30s
      timeout: 10s
      retries: 3
```

Ejecuta:

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Crear tu propia imagen

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

Compila y ejecuta:

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## Variables de entorno

| Variable                             | Descripción                                                                                                                                                                                                  | Predeterminado                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | Compila la variante autoalojada (oculta el aparato de marketing de bentopdf.com: hero, preguntas frecuentes, testimonios y pie de página). Se mantienen todas las herramientas PDF.                          | `false`                                                        |
| `BASE_URL`                           | Desplegar en un subdirectorio                                                                                                                                                                                | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | URL del módulo WASM de PyMuPDF                                                                                                                                                                               | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | URL del módulo WASM de Ghostscript                                                                                                                                                                           | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | URL del módulo WASM de CoherentPDF                                                                                                                                                                           | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | URL del script del worker de OCR                                                                                                                                                                             | _(vacío; usa la CDN predeterminada de Tesseract.js)_           |
| `VITE_TESSERACT_CORE_URL`            | Directorio del runtime principal de OCR                                                                                                                                                                      | _(empty; use Tesseract.js default CDN)_                        |
| `VITE_TESSERACT_LANG_URL`            | Directorio de traineddata de OCR                                                                                                                                                                             | _(empty; use Tesseract.js default CDN)_                        |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | Idiomas de OCR separados por comas que se muestran en la interfaz                                                                                                                                            | _(vacío; muestra el catálogo completo)_                        |
| `VITE_OCR_FONT_BASE_URL`             | Directorio de fuentes de la capa de texto del OCR                                                                                                                                                            | _(vacío; usa las URL remotas de las fuentes Noto)_             |
| `VITE_DEFAULT_LANGUAGE`              | Idioma predeterminado de la interfaz                                                                                                                                                                         | `en`                                                           |
| `VITE_BRAND_NAME`                    | Nombre de marca personalizado                                                                                                                                                                                | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | Ruta del logo relativa a `public/`                                                                                                                                                                           | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | Texto personalizado de pie/copyright                                                                                                                                                                         | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | IDs de herramientas separados por comas para ocultar                                                                                                                                                         | _(vacío; todas las herramientas activadas)_                    |
| `DISABLE_GITHUB_STARS`               | Omite la obtención del contador de estrellas de GitHub al cargar la página y elimina `api.github.com` de la CSP. Las compilaciones en Simple Mode siempre la omiten.                                         | `false`                                                        |
| `SITE_URL`                           | URL pública escrita en los enlaces canonical, hreflang y de sitemap. Déjala por defecto salvo que quieras que los buscadores traten tu despliegue como un sitio propio.                                      | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | Con un `SITE_URL` personalizado, todas las páginas se marcan como `noindex` para que tu copia no compita con bentopdf.com en los resultados de búsqueda. Ponlo en `true` para que los buscadores la indexen. | `false`                                                        |

Las URL de los módulos WASM vienen preconfiguradas con valores predeterminados de CDN, así que todas las funciones avanzadas funcionan desde el primer momento. Sobrescríbelas para despliegues aislados de la red o autoalojados.

### Buscadores

Por defecto, todas las páginas indican a los buscadores que el original es bentopdf.com, de modo que tu despliegue no aparece como duplicado. No necesitas cambiar nada para una instancia privada o interna.

- **Mantener tu instancia fuera de los resultados de búsqueda por completo:** ejecuta el contenedor con `-e ROBOTS_NOINDEX=true`. Solo requiere un reinicio, no una nueva compilación.
- **Hacer que tu instancia sea un sitio propio en los resultados de búsqueda:** compila con `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true`. Sin `ALLOW_INDEXING=true`, un `SITE_URL` personalizado marca todas las páginas como `noindex`.

### Content-Security-Policy

La imagen de nginx incluye una cabecera `Content-Security-Policy` en modo de aplicación. Las directivas `script-src`, `connect-src` y `font-src` de la CSP se **generan en tiempo de compilación** a partir de las variables de URL `VITE_*` anteriores: los hosts que pases mediante `--build-arg` se añaden automáticamente a la política.

Como resultado:

- Si sobrescribes `VITE_CORS_PROXY_URL` o `VITE_WASM_*_URL` al compilar, la CSP permite esos orígenes automáticamente, sin configuración adicional.
- Para las URL en `cdn.jsdelivr.net`, `script-src` solo permite la carpeta exacta del paquete con su versión, por ejemplo `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`, no toda la CDN. jsDelivr sirve cualquier paquete público de npm o repositorio de GitHub, así que permitir todo el host dejaría que cualquiera de ellos se ejecutara en tu instancia. Las URL de cualquier otro host se permiten por origen.
- Si configuras URL de WASM personalizadas en _tiempo de ejecución_ desde la página de Ajustes avanzados de la aplicación, esos orígenes **no** están en la CSP y el navegador bloqueará las solicitudes a ellos. Esto también se aplica a una versión distinta del mismo paquete en `cdn.jsdelivr.net`, porque solo se permite la versión definida al compilar. La configuración en tiempo de ejecución está pensada para experimentar; para URL personalizadas permanentes, define el build arg `VITE_*` correspondiente.
- Los despliegues aislados de la red que sobrescriben los tres valores `VITE_WASM_*_URL` también eliminan de la CSP esas carpetas de paquete de `cdn.jsdelivr.net` (cada valor predeterminado se sustituye, no se añade). Los valores predeterminados de Tesseract OCR en `cdn.jsdelivr.net` permanecen en la política hasta que también definas los tres valores `VITE_TESSERACT_*`. Del mismo modo, definir `VITE_CORS_PROXY_URL` sustituye el valor público predeterminado `bentopdf-cors-proxy.bentopdf.workers.dev`.

La CSP incluye `'unsafe-eval'` en `script-src` porque el runtime WASM de LibreOffice (usado por las herramientas de conversión de Word/Excel/PowerPoint) y la biblioteca de imágenes wasm-vips (usada por PDF a TIFF) compilan código de despacho interno mediante `new Function()`. Quitarlo rompería esas herramientas. Si compilas en `SIMPLE_MODE` (sin LibreOffice) y no necesitas PDF a TIFF, puedes editar manualmente el `security-headers.conf` generado para eliminar `'unsafe-eval'` y obtener una política más estricta.

Para el OCR, deja vacías las variables `VITE_TESSERACT_*` para usar los recursos en línea predeterminados, o define las tres juntas para un OCR autoalojado o sin conexión. Las sobrescrituras parciales de OCR se rechazan porque el worker, el runtime principal y el directorio de traineddata deben coincidir. Para una salida de PDF con texto buscable totalmente sin conexión, define también `VITE_OCR_FONT_BASE_URL` para que las fuentes de la capa de texto del OCR se carguen desde tu servidor interno en lugar de las URL públicas de las fuentes Noto.

`VITE_DEFAULT_LANGUAGE` define el idioma de la interfaz para quienes visitan por primera vez. Valores admitidos: `en`, `ar`, `be`, `fr`, `de`, `es`, `zh`, `zh-TW`, `vi`, `tr`, `id`, `it`, `pt`, `nl`, `da`. Los usuarios pueden seguir cambiando de idioma: esto solo cambia el valor predeterminado.

Ejemplo:

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### Marca personalizada

Sustituye el logo, el nombre y el texto de pie de BentoPDF por los tuyos. Coloca tu archivo de logo en la carpeta `public/` (o usa una imagen existente) y pasa las variables de marca al compilar:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

La marca personalizada funciona tanto en el modo completo como en Simple Mode, y se puede combinar con todas las demás opciones de tiempo de compilación.

### Desactivar herramientas concretas

Oculta herramientas de la interfaz por requisitos de cumplimiento o seguridad. Las herramientas desactivadas desaparecen de la página de inicio, los resultados de búsqueda, los atajos de teclado y el constructor de flujos de trabajo. Si se accede directamente por URL, se muestra una página de "herramienta no disponible".

Los ID de herramienta son la URL de la página sin `.html`. Por ejemplo, si la herramienta está en `bentopdf.com/edit-pdf.html`, el ID es `edit-pdf`.

#### Encontrar los ID de herramienta

La forma más fácil: abre cualquier herramienta en BentoPDF y mira la URL. La última parte de la ruta (sin `.html`) es el ID de la herramienta.

<details>
<summary>Lista completa de ID de herramientas</summary>

**Editar y anotar:** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**Convertir a PDF:** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**Convertir desde PDF:** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**Organizar y gestionar:** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**Optimizar y reparar:** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**Seguridad:** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### Opción 1: En tiempo de compilación (build arg de Docker)

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

Esto incorpora la lista de herramientas desactivadas en el bundle de JavaScript. Para cambiarla hay que volver a compilar.

#### Opción 2: En tiempo de ejecución (config.json)

Monta un archivo `config.json` en el directorio servido, sin necesidad de recompilar:

```json
{
  "disabledTools": ["edit-pdf", "sign-pdf", "encrypt-pdf"]
}
```

```bash
docker run -d \
  -p 3000:8080 \
  -v ./config.json:/usr/share/nginx/html/config.json:ro \
  ghcr.io/alam00000/bentopdf-simple:latest
```

O con Docker Compose:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

Ambos métodos se pueden combinar: las listas se fusionan. Si una herramienta aparece en cualquiera de ellas, se desactiva.

#### Desactivar funciones del editor

También puedes desactivar funciones concretas dentro del editor de PDF (p. ej., censura, anotaciones, formularios) sin desactivar toda la herramienta del editor. Añade `editorDisabledCategories` a tu `config.json`:

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>Lista completa de categorías del editor</summary>

**Zoom:** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**Anotación:** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**Formas:** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**Formulario:** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**Censura:** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**Documento:** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**Página:** `page`, `spread`, `rotate`, `scroll`, `navigation`

**Panel:** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**Herramientas:** `tools`, `pan`, `pointer`, `capture`

**Selección:** `selection`, `selection-copy`

**Historial:** `history`, `history-undo`, `history-redo`

</details>

Las categorías son jerárquicas: al desactivar una categoría padre (p. ej., `annotation`) se desactivan todas sus hijas.

### Desactivar el contador de estrellas de GitHub

La barra de navegación muestra un contador de estrellas de GitHub en vivo, obtenido de `api.github.com` al cargar la página. Es la única solicitud externa que no sirve a una función de PDF. Desactívalo al compilar para eliminar el código de obtención del bundle y quitar `api.github.com` de la Content-Security-Policy:

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

Las compilaciones en Simple Mode (`bentopdf-simple`) siempre omiten el contador de estrellas: este indicador solo hace falta en la versión comercial o en compilaciones completas personalizadas.

### URL de WASM personalizadas (aisladas de la red / autoalojadas)

> [!IMPORTANT]
> Las URL de WASM se incorporan al JavaScript en **tiempo de compilación**. Los archivos WASM los descarga el **navegador del usuario** en tiempo de ejecución: Docker no los descarga durante la compilación. Para redes aisladas, debes alojar los archivos WASM en un servidor interno al que lleguen los navegadores.

**Flujo de trabajo completo para redes aisladas:**

```bash
# 1. On a machine WITH internet — download WASM packages
bash scripts/prepare-airgap.sh --list-ocr-languages
bash scripts/prepare-airgap.sh --search-ocr-language german

# 2. Download WASM/OCR packages
npm pack @bentopdf/pymupdf-wasm@0.11.14
npm pack @bentopdf/gs-wasm
npm pack coherentpdf
npm pack tesseract.js@7.0.0
npm pack tesseract.js-core@7.0.0
mkdir -p tesseract-langdata
curl -fsSL https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz -o tesseract-langdata/eng.traineddata.gz
mkdir -p ocr-fonts
curl -fsSL https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf -o ocr-fonts/NotoSans-Regular.ttf

# 3. Build the image with your internal server URLs
docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data \
  --build-arg VITE_TESSERACT_AVAILABLE_LANGUAGES=eng,deu \
  --build-arg VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts \
  -t bentopdf .

# 4. Export the image
docker save bentopdf -o bentopdf.tar

# 5. Transfer bentopdf.tar + the .tgz packages + tesseract-langdata/ + ocr-fonts/ into the air-gapped network

# 6. Inside the air-gapped network — load and run
docker load -i bentopdf.tar

# Extract WASM packages to your internal web server
mkdir -p /var/www/wasm/pymupdf /var/www/wasm/gs /var/www/wasm/cpdf /var/www/wasm/ocr/core /var/www/wasm/ocr/lang-data /var/www/wasm/ocr/fonts
tar xzf bentopdf-pymupdf-wasm-0.11.14.tgz -C /var/www/wasm/pymupdf --strip-components=1
tar xzf bentopdf-gs-wasm-*.tgz -C /var/www/wasm/gs --strip-components=1
tar xzf coherentpdf-*.tgz -C /var/www/wasm/cpdf --strip-components=1
TEMP_TESS=$(mktemp -d)
tar xzf tesseract.js-7.0.0.tgz -C "$TEMP_TESS"
cp "$TEMP_TESS/package/dist/worker.min.js" /var/www/wasm/ocr/worker.min.js
rm -rf "$TEMP_TESS"
tar xzf tesseract.js-core-7.0.0.tgz -C /var/www/wasm/ocr/core --strip-components=1
cp ./tesseract-langdata/*.traineddata.gz /var/www/wasm/ocr/lang-data/
cp ./ocr-fonts/* /var/www/wasm/ocr/fonts/

# Run BentoPDF
docker run -d -p 3000:8080 --restart unless-stopped bentopdf
```

Usa los códigos que muestra `bash scripts/prepare-airgap.sh --list-ocr-languages`, o busca por nombre con `bash scripts/prepare-airgap.sh --search-ocr-language <term>`, para `--ocr-languages`. Si compilas con un subconjunto restringido de OCR, pasa los mismos códigos a `VITE_TESSERACT_AVAILABLE_LANGUAGES` para que la aplicación solo muestre los idiomas incluidos. Para una salida de OCR totalmente sin conexión, aloja también el directorio incluido `ocr-fonts/` y apunta `VITE_OCR_FONT_BASE_URL` hacia él.

Define una variable como cadena vacía para desactivar ese módulo (los usuarios deberán configurarlo manualmente en Ajustes avanzados).

## Puerto personalizado

Por defecto, BentoPDF escucha en el puerto `8080` dentro del contenedor. Para cambiarlo, define la variable de entorno `PORT` en tiempo de ejecución:

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| Variable | Descripción                                 | Predeterminado |
| -------- | ------------------------------------------- | -------------- |
| `PORT`   | Puerto de escucha de Nginx en el contenedor | `8080`         |

Funciona tanto con el Dockerfile estándar como con el nonroot.

## ID de usuario personalizado (PUID/PGID)

Para entornos que requieren ejecutarse como un usuario concreto que no sea root (dispositivos NAS, Kubernetes con contextos de seguridad, políticas de la organización), BentoPDF ofrece un Dockerfile aparte con compatibilidad PUID/PGID al estilo LSIO.

### Compilar y ejecutar

```bash
# Build the non-root image
docker build -f Dockerfile.nonroot -t bentopdf-nonroot .

# Run with custom UID/GID
docker run -d \
  --name bentopdf \
  -p 3000:8080 \
  -e PUID=1000 \
  -e PGID=1000 \
  --restart unless-stopped \
  bentopdf-nonroot
```

### Variables de entorno

| Variable       | Descripción                       | Predeterminado |
| -------------- | --------------------------------- | -------------- |
| `PUID`         | ID de usuario con el que ejecutar | `1000`         |
| `PGID`         | ID de grupo con el que ejecutar   | `1000`         |
| `PORT`         | Puerto de escucha de Nginx        | `8080`         |
| `DISABLE_IPV6` | Desactivar el listener IPv6       | `false`        |

### Docker Compose

```yaml
services:
  bentopdf:
    build:
      context: .
      dockerfile: Dockerfile.nonroot
    container_name: bentopdf
    ports:
      - '3000:8080'
    environment:
      - PUID=1000
      - PGID=1000
    restart: unless-stopped
```

### Cómo funciona

El contenedor se inicia como root, crea un usuario con el PUID/PGID indicado, ajusta la propiedad de todos los directorios con permiso de escritura y después reduce privilegios con `su-exec`. El proceso de nginx se ejecuta íntegramente como el usuario que indiques.

> [!NOTE]
> El `Dockerfile` estándar usa `nginx-unprivileged` (UID 101) y es el recomendado para la mayoría de los despliegues. Usa `Dockerfile.nonroot` solo cuando necesites un UID/GID concreto.

> [!WARNING]
> PUID/PGID no pueden ser `0` (root). El entrypoint valida los valores y terminará con un error si son inválidos.

## Con Traefik (proxy inverso)

```yaml
services:
  traefik:
    image: traefik:v2.10
    command:
      - '--providers.docker=true'
      - '--entrypoints.web.address=:80'
      - '--entrypoints.websecure.address=:443'
      - '--certificatesresolvers.letsencrypt.acme.email=you@example.com'
      - '--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json'
      - '--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web'
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt

  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.bentopdf.rule=Host(`pdf.example.com`)'
      - 'traefik.http.routers.bentopdf.entrypoints=websecure'
      - 'traefik.http.routers.bentopdf.tls.certresolver=letsencrypt'
      - 'traefik.http.services.bentopdf.loadbalancer.server.port=8080'
      # Required headers for SharedArrayBuffer (LibreOffice WASM)
      - 'traefik.http.routers.bentopdf.middlewares=bentopdf-headers'
      - 'traefik.http.middlewares.bentopdf-headers.headers.customresponseheaders.Cross-Origin-Opener-Policy=same-origin'
      - 'traefik.http.middlewares.bentopdf-headers.headers.customresponseheaders.Cross-Origin-Embedder-Policy=require-corp'
    restart: unless-stopped
```

## Con Caddy (proxy inverso)

```yaml
services:
  caddy:
    image: caddy:2
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data

  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    restart: unless-stopped

volumes:
  caddy_data:
```

Caddyfile:

```
pdf.example.com {
    reverse_proxy bentopdf:8080
    header Cross-Origin-Opener-Policy "same-origin"
    header Cross-Origin-Embedder-Policy "require-corp"
}
```

## Límites de recursos

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M
```

## Podman Quadlet (integración con systemd)

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) te permite ejecutar contenedores de Podman como servicios de systemd. Es ideal para despliegues de producción en sistemas Linux.

### Configuración básica de Quadlet

Crea un archivo de unidad de contenedor en `~/.config/containers/systemd/bentopdf.container` (usuario) o `/etc/containers/systemd/bentopdf.container` (sistema):

```ini
[Unit]
Description=BentoPDF - Privacy-first PDF toolkit
After=network-online.target
Wants=network-online.target

[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry

[Service]
Restart=always
TimeoutStartSec=300

[Install]
WantedBy=default.target
```

### Habilitar e iniciar

```bash
# Reload systemd to detect new unit
systemctl --user daemon-reload

# Start the service
systemctl --user start bentopdf

# Enable on boot
systemctl --user enable bentopdf

# Check status
systemctl --user status bentopdf

# View logs
journalctl --user -u bentopdf -f
```

> [!TIP]
> Para un despliegue a nivel de sistema, usa `systemctl` sin la opción `--user` y coloca el archivo en `/etc/containers/systemd/`.

### Quadlet con comprobación de estado

```ini
[Unit]
Description=BentoPDF with health monitoring
After=network-online.target
Wants=network-online.target

[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry
HealthCmd=wget --spider -q http://localhost:8080 || exit 1
HealthInterval=30s
HealthTimeout=10s
HealthRetries=3

[Service]
Restart=always
TimeoutStartSec=300

[Install]
WantedBy=default.target
```

### Actualización automática con Quadlet

Podman puede actualizar los contenedores automáticamente cuando hay imágenes nuevas disponibles:

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Configuración de red de Quadlet

Para una configuración de red personalizada, crea un archivo de red `bentopdf.network`:

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

Después haz referencia a él en tu archivo de contenedor:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## Actualización

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
