# Guía de autoalojamiento

BentoPDF se puede autoalojar en tu propia infraestructura. Esta guía cubre las distintas opciones de despliegue.

## Inicio rápido con Docker / Podman

La forma más rápida de autoalojar BentoPDF:

> [!TIP]
> BentoPDF se distribuye en dos compilaciones:
>
> - **Compilación autoalojada**: `ghcr.io/alam00000/bentopdf-simple:latest`. Todas las herramientas de PDF, **sin** el aparato de marketing (sin hero, preguntas frecuentes, testimonios ni pie de página). Úsala para despliegues internos, de equipo o de organización. **No** es una versión "lite" con menos funciones.
> - **Compilación comercial**: `ghcr.io/alam00000/bentopdf:latest`. El sitio de marketing completo, que usa el propio bentopdf.com y los titulares de licencias comerciales que ejecutan despliegues de cara al público.
>
> Si dudas: descarga la compilación autoalojada.

> [!IMPORTANT]
> La conversión de archivos de Office requiere `SharedArrayBuffer`, lo que significa que la aplicación debe estar aislada entre orígenes (cross-origin isolated) y servirse desde un contexto seguro. La imagen oficial ya envía las cabeceras COOP/COEP necesarias, pero los navegadores siguen desactivando `SharedArrayBuffer` en orígenes HTTP simples de red local, como `http://192.168.x.x`.
>
> Usa `http://localhost` solo para pruebas en el mismo dispositivo. Si los usuarios acceden a BentoPDF mediante una IP o un nombre de host de la red local, termina la conexión con HTTPS.

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

O con Docker Compose / Podman Compose:

```yaml
# docker-compose.yml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    restart: unless-stopped
```

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Podman Quadlet (Linux Systemd)

Ejecuta BentoPDF como un servicio de systemd. Crea `~/.config/containers/systemd/bentopdf.container`:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry

[Service]
Restart=always

[Install]
WantedBy=default.target
```

```bash
systemctl --user daemon-reload
systemctl --user enable --now bentopdf
```

Consulta la [guía de despliegue con Docker](/es/self-hosting/docker) para ver la documentación completa de Quadlet.

## Compilar desde el código fuente

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## Opciones de configuración

### Compilación autoalojada (Modo Simple)

La compilación autoalojada (la imagen `bentopdf-simple`, también llamada Modo Simple) es **funcionalmente idéntica** a la compilación comercial: todas las herramientas de PDF están presentes y se comportan igual. Simplemente oculta el aparato de marketing que solo tiene sentido en el propio bentopdf.com o en un despliegue comercial de cara al público. **No es una versión "lite" ni con menos funciones.**

**Qué oculta la compilación autoalojada** (solo cosmético, no se elimina ninguna función de PDF):

- Barra de navegación, sección hero, sección de características, preguntas frecuentes, testimonios, pie de página
- Cambia el título de la página a "Herramientas PDF"

**Qué conserva la compilación autoalojada** (todo lo que realmente trabaja con PDF):

- Todas las herramientas de PDF (fusionar, dividir, editar, firmar, OCR, conversión de Office, etc.)
- Compatibilidad con marca personalizada y toda la configuración de compilación y de tiempo de ejecución

La compilación comercial (`ghcr.io/alam00000/bentopdf:latest`) es la que impulsa el propio bentopdf.com y la usan los titulares de licencias comerciales que ejecutan despliegues de cara al público. Añade el hero, las preguntas frecuentes, los testimonios y el pie de página, que no tendrían sentido en una herramienta interna.

Si autoalojas BentoPDF para tu equipo, tu organización o como herramienta interna, descarga la compilación autoalojada:

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

Consulta [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md) para ver todos los detalles.

### Compilación comercial (despliegues de cara al público con tu propia marca)

La compilación comercial (la imagen `bentopdf`, sin el sufijo `-simple`) es la que impulsa el propio bentopdf.com. Incluye el sitio de marketing completo (hero, características, preguntas frecuentes, testimonios, pie de página) además de todas las herramientas de PDF. Usa esta compilación cuando quieras **desplegar BentoPDF como un servicio de PDF de cara al público bajo tu propia marca**, por ejemplo:

- Ejecutas BentoPDF como un SaaS alojado para usuarios finales en tu propio dominio
- Quieres la experiencia de la página de inicio (secciones de marketing y herramientas), no solo la superficie básica de herramientas
- Eres titular de una licencia comercial e integras BentoPDF en un producto comercial

**Ejecútala tal cual** (con la marca BentoPDF, útil para previsualizar la compilación):

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**Compila con tu propia marca** (el flujo comercial típico):

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

Todas las demás opciones de compilación (`BASE_URL`, `VITE_DEFAULT_LANGUAGE`, `DISABLE_TOOLS`, sustitución de URL de WASM, etc.) funcionan igual que en la compilación autoalojada.

::: warning Licencias
Ejecutar la compilación comercial está permitido bajo cualquiera de las dos opciones de licencia de BentoPDF:

- **AGPL-3.0** (gratuita): permitida si tu despliegue publica todo su código fuente bajo AGPL, incluidas las modificaciones de marca y la lógica de negocio asociada.
- **Licencia comercial** (79 $ de por vida): necesaria para despliegues de código cerrado o propietarios en los que no publicas tu fork con la marca ni tu código de negocio.

Consulta la [página de licencias](https://www.bentopdf.com/licensing) para ver la comparación completa. Los módulos WASM con licencia AGPL (PyMuPDF, Ghostscript, CoherentPDF) se cargan desde una CDN en tiempo de ejecución, por lo que no entran en tu imagen y no cambian tu situación de licencias.
:::

### URL base

Despliega en un subdirectorio:

```bash
BASE_URL=/pdf-tools/ npm run build
```

### Marca personalizada

Sustituye el logotipo, el nombre y el texto del pie de página de BentoPDF por los tuyos en tiempo de compilación:

| Variable           | Descripción                                                  | Valor por defecto                       |
| ------------------ | ------------------------------------------------------------ | --------------------------------------- |
| `VITE_BRAND_NAME`  | Nombre de marca que se muestra en el encabezado y el pie     | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | Ruta del logotipo relativa a `public/`                       | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | Texto personalizado del pie de página y de derechos de autor | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

O mediante Docker:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

La marca personalizada funciona tanto en el modo completo como en el Modo Simple, y se puede combinar con todas las demás opciones de compilación (`BASE_URL`, `SIMPLE_MODE`, `VITE_DEFAULT_LANGUAGE`).

### Desactivar herramientas específicas

Oculta herramientas concretas por motivos de cumplimiento o seguridad. Las herramientas desactivadas se eliminan de la página de inicio, la búsqueda, los atajos, el generador de flujos de trabajo y el acceso directo por URL.

Los ID de las herramientas son la URL de la página sin `.html`: abre cualquier herramienta y mira la URL (p. ej., `edit-pdf`, `sign-pdf`, `encrypt-pdf`).

**En tiempo de compilación** (incluido en el bundle):

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**En tiempo de ejecución** (sin recompilar: monta un `config.json`):

```json
{
  "disabledTools": ["edit-pdf", "sign-pdf"]
}
```

```bash
docker run -d -p 3000:8080 \
  -v ./config.json:/usr/share/nginx/html/config.json:ro \
  ghcr.io/alam00000/bentopdf-simple:latest
```

Se pueden combinar ambos métodos: las listas se fusionan.

También puedes desactivar funciones específicas dentro del Editor de PDF (p. ej., la redacción) sin desactivar la herramienta completa, añadiendo `editorDisabledCategories` a `config.json`. Consulta la [guía de Docker](/es/self-hosting/docker#desactivar-funciones-del-editor) para ver la lista completa de categorías.

## Guías de despliegue

Elige tu plataforma:

- [Vercel](/es/self-hosting/vercel)
- [Netlify](/es/self-hosting/netlify)
- [Cloudflare Pages](/es/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/es/self-hosting/aws)
- [Hostinger](/es/self-hosting/hostinger)
- [Nginx](/es/self-hosting/nginx)
- [Apache](/es/self-hosting/apache)
- [Docker](/es/self-hosting/docker)
- [Kubernetes](/es/self-hosting/kubernetes)
- [Proxy CORS](/es/self-hosting/cors-proxy): necesario para las firmas digitales

## Problemas comunes

### La conversión de Word / ODT / Excel / PowerPoint a PDF se cuelga (SharedArrayBuffer no disponible)

**Síntoma**: las conversiones de documentos basadas en LibreOffice (Word, ODT, Excel, PowerPoint a PDF) se quedan colgadas en torno al 55% o no llegan a iniciarse. La consola del navegador puede mostrar:

> `ReferenceError: SharedArrayBuffer is not defined`

...o `window.crossOriginIsolated` devuelve `false`, o la compilación de WASM informa `expected magic word 00 61 73 6d, found 1f 8b 08 08`.

**Causa**: LibreOffice WASM requiere `SharedArrayBuffer`, que el navegador solo activa cuando la página está **aislada entre orígenes (cross-origin isolated)** Y se sirve desde un **contexto seguro**. Eso significa que deben cumplirse dos cosas:

1. Todas las respuestas incluyen ambas cabeceras:
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. La página se sirve desde `https://...` o `http://localhost`. HTTP simple sobre una IP de red local (p. ej. `http://192.168.x.x`) NO cuenta como seguro: los navegadores desactivan `SharedArrayBuffer` allí.

La discrepancia `00 61 73 6d / 1f 8b 08 08` es un subsíntoma distinto: a los archivos precomprimidos `.wasm.gz` / `.data.gz` les falta la cabecera de respuesta `Content-Encoding: gzip`, por lo que el navegador recibe bytes gzip sin procesar en lugar de WASM descomprimido.

**Solución**: consulta la guía de despliegue de tu plataforma para ver la configuración exacta:

- [Nginx →](/es/self-hosting/nginx#la-conversion-de-word-odt-excel-a-pdf-no-funciona)
- [Apache →](/es/self-hosting/apache#word-odt-excel-a-pdf-no-funciona)
- [AWS S3 + CloudFront →](/es/self-hosting/aws#paso-3b-politica-de-cabeceras-de-respuesta-necesaria-para-libreoffice-wasm)
- [Cloudflare Pages →](/es/self-hosting/cloudflare#archivo-de-configuracion) (archivo `_headers`)
- [Netlify →](/es/self-hosting/netlify#la-conversion-de-word-odt-excel-a-pdf-se-queda-atascada-en-el-55) (`netlify.toml`)
- [Vercel →](/es/self-hosting/vercel#la-conversion-de-word-odt-excel-a-pdf-no-funciona) (`vercel.json`)
- [Hostinger →](/es/self-hosting/hostinger#las-herramientas-de-libreoffice-no-funcionan) (`.htaccess`)
- [Kubernetes →](/es/self-hosting/kubernetes#como-comprobar-que-las-cabeceras-de-sharedarraybuffer-siguen-funcionando-ingress-gateway)
- **Docker**: lo gestiona automáticamente la configuración de nginx incluida, no hace falta hacer nada.

**Verificación**: abre la consola de DevTools en cualquier página de BentoPDF y ejecuta:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Si la página usa HTTPS o `http://localhost` Y ambas cabeceras COEP/COOP están presentes en todas las respuestas, ambas comprobaciones se superan. Si estás en `http://192.168.x.x` u otro origen HTTP que no sea de loopback, termina la conexión con HTTPS: no hay una solución que dependa solo de cabeceras.

### Archivos `.mjs` servidos como `application/octet-stream`

**Síntoma**: Firmar PDF / Rellenar formularios / otras herramientas muestran un visor en blanco o no se cargan. La consola del navegador informa:

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**Causa**: tu servidor web o proxy inverso no tiene una asignación de tipo MIME para los archivos `.mjs` (el visor de PDF incluido incorpora módulos ES con esa extensión). Muchas configuraciones de servidor por defecto usan `application/octet-stream` para las extensiones desconocidas, y los navegadores se niegan a ejecutarlas como módulos ES.

**Solución**: consulta la guía de despliegue de tu plataforma para ver el fragmento exacto:

- [Nginx →](/es/self-hosting/nginx#firmar-pdf-o-rellenar-formularios-muestra-un-visor-en-blanco-error-mime-de-mjs)
- [Apache →](/es/self-hosting/apache#firmar-pdf-o-el-rellenador-de-formularios-muestra-un-visor-en-blanco-error-mime-de-mjs)
- [AWS S3 + CloudFront →](/es/self-hosting/aws#paso-2-compilar-y-subir) (consulta `aws s3 cp ... --include "*.mjs"`)
- [Kubernetes →](/es/self-hosting/kubernetes#errores-de-tipo-mime-de-mjs-iframe-en-blanco-en-firmar-pdf-rellenar-formularios)
- **Docker, Vercel, Netlify, Cloudflare Pages, Hostinger**: se gestiona automáticamente, no hace falta hacer nada.

**Verificación**: abre DevTools → pestaña Network, busca la petición `.mjs` que falla y revisa la cabecera de respuesta `Content-Type`. Debería ser `application/javascript`. Si sigue siendo `application/octet-stream`, puede que un proxy inverso o una CDN externos estén volviendo a detectar el tipo: revisa cada capa de tu cadena de servicio.

## Configuración de WASM (componentes AGPL)

BentoPDF **no incluye** en su código fuente las bibliotecas de procesamiento con licencia AGPL, pero **preconfigura las URL de CDN** para que todas las funciones funcionen de inmediato, sin configuración manual.

::: tip Cero configuración por defecto
Desde la v2.0.0, los módulos WASM están preconfigurados para cargarse desde la CDN de jsDelivr mediante variables de entorno. Todas las funciones avanzadas funcionan de inmediato sin ninguna configuración del usuario.
:::

| Componente      | Licencia | Funciones                                                                     |
| --------------- | -------- | ----------------------------------------------------------------------------- |
| **PyMuPDF**     | AGPL-3.0 | Conversión de EPUB/MOBI/FB2/XPS, extracción de imágenes, extracción de tablas |
| **Ghostscript** | AGPL-3.0 | Conversión a PDF/A, compresión, corrección de inclinación, rasterización      |
| **CoherentPDF** | AGPL-3.0 | Tabla de contenido, adjuntos, fusión de PDF con marcadores                    |

### Variables de entorno por defecto

Se definen en `.env.production` y se incluyen en la compilación:

```bash
VITE_WASM_PYMUPDF_URL=https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/
VITE_WASM_GS_URL=https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/
VITE_WASM_CPDF_URL=https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/
VITE_TESSERACT_WORKER_URL=
VITE_TESSERACT_CORE_URL=
VITE_TESSERACT_LANG_URL=
VITE_TESSERACT_AVAILABLE_LANGUAGES=
VITE_OCR_FONT_BASE_URL=
```

### Sustituir las URL de WASM

Puedes sustituir los valores por defecto en tiempo de compilación para despliegues personalizados:

```bash
# Via Docker build args
docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://your-server.com/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://your-server.com/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://your-server.com/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://your-server.com/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://your-server.com/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://your-server.com/ocr/lang-data \
  --build-arg VITE_TESSERACT_AVAILABLE_LANGUAGES=eng,deu \
  --build-arg VITE_OCR_FONT_BASE_URL=https://your-server.com/ocr/fonts \
  -t bentopdf .

# Or via .env.production before building from source
VITE_WASM_PYMUPDF_URL=https://your-server.com/pymupdf/ npm run build
```

Para desactivar un módulo por completo (requiere configuración manual del usuario en Ajustes avanzados), asigna una cadena vacía a su variable.

Para OCR, deja vacías todas las variables `VITE_TESSERACT_*` y mantén los recursos en línea por defecto, o define juntas las URL de worker, core e idiomas para un OCR autoalojado o sin conexión. Si incluyes solo idiomas de OCR concretos, define también `VITE_TESSERACT_AVAILABLE_LANGUAGES` con los mismos códigos separados por comas para que la interfaz solo ofrezca los idiomas instalados y las selecciones no admitidas fallen con un error descriptivo. Para obtener PDF con capa de texto totalmente sin conexión, define también `VITE_OCR_FONT_BASE_URL` con el directorio interno que sirve las fuentes de OCR incluidas.

Los usuarios también pueden sustituir estos valores por defecto en cualquier momento mediante **Ajustes avanzados** en la interfaz: las sustituciones del usuario guardadas en el navegador tienen prioridad sobre los valores por defecto del entorno.

### Despliegue aislado de la red / sin conexión

Para redes sin acceso a internet (gobierno, sanidad, finanzas, etc.). Las URL de WASM se incluyen en el JavaScript en **tiempo de compilación**: los archivos WASM reales los descarga el **navegador del usuario** en tiempo de ejecución. Por eso debes preparar todo en una máquina con internet y luego transferirlo a la red aislada.

#### Script automatizado (recomendado)

El script incluido `prepare-airgap.sh` automatiza todo el proceso: descarga los paquetes WASM, compila la imagen de Docker y genera un paquete autocontenido con un script de configuración.

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Show supported OCR language codes (for --ocr-languages)
bash scripts/prepare-airgap.sh --list-ocr-languages

# Search OCR language codes by name or abbreviation
bash scripts/prepare-airgap.sh --search-ocr-language german

# Interactive mode — prompts for all options
bash scripts/prepare-airgap.sh

# Or fully automated
bash scripts/prepare-airgap.sh --wasm-base-url https://internal.example.com/wasm
```

Esto genera un directorio con el paquete:

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

Transfiere el paquete a la red aislada mediante USB, un repositorio interno de artefactos o un método aprobado. Después ejecuta el script de configuración incluido:

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

El script de configuración carga la imagen de Docker, extrae los archivos WASM y, opcionalmente, inicia el contenedor.

**Opciones del script:**

| Opción                         | Descripción                                                 | Valor por defecto                     |
| ------------------------------ | ----------------------------------------------------------- | ------------------------------------- |
| `--wasm-base-url <url>`        | Dónde se alojarán los WASM internamente                     | _(obligatorio, se pregunta si falta)_ |
| `--image-name <name>`          | Etiqueta de la imagen de Docker                             | `bentopdf`                            |
| `--output-dir <path>`          | Directorio de salida del paquete                            | `./bentopdf-airgap-bundle`            |
| `--simple-mode`                | Activa el Modo Simple                                       | desactivado                           |
| `--base-url <path>`            | URL base de subdirectorio (p. ej. `/pdf/`)                  | `/`                                   |
| `--language <code>`            | Idioma predeterminado de la interfaz (p. ej. `fr`, `de`)    | _(ninguno)_                           |
| `--brand-name <name>`          | Nombre de marca personalizado                               | _(ninguno)_                           |
| `--brand-logo <path>`          | Ruta del logotipo relativa a `public/`                      | _(ninguno)_                           |
| `--footer-text <text>`         | Texto personalizado del pie de página                       | _(ninguno)_                           |
| `--ocr-languages <list>`       | Idiomas de OCR separados por comas que se incluirán         | `eng`                                 |
| `--list-ocr-languages`         | Muestra los códigos y nombres de OCR admitidos y sale       | desactivado                           |
| `--search-ocr-language <term>` | Busca códigos de OCR por nombre o abreviatura               | desactivado                           |
| `--dockerfile <path>`          | Dockerfile que se usará                                     | `Dockerfile`                          |
| `--skip-docker`                | Omite la compilación y exportación de Docker                | desactivado                           |
| `--skip-wasm`                  | Omite la descarga de WASM (reutiliza los `.tgz` existentes) | desactivado                           |

El prompt interactivo también acepta `list` para mostrar la lista completa de códigos de Tesseract admitidos y `search <term>` para encontrar coincidencias como `search german` o `search chi`.

::: warning Requisito de mismo origen
Los archivos WASM deben servirse desde el **mismo origen** que la aplicación BentoPDF. Los Web Workers usan `importScripts()`, que no puede cargar scripts de otro origen. Por ejemplo, si BentoPDF se ejecuta en `https://internal.example.com`, la URL base de WASM también debe ser `https://internal.example.com/wasm`.
:::

#### Pasos manuales

<details>
<summary>Si prefieres hacerlo manualmente sin el script</summary>

**Paso 1: Descargar los paquetes de WASM y OCR** (en una máquina con internet)

```bash
npm pack @bentopdf/pymupdf-wasm@0.11.14
npm pack @bentopdf/gs-wasm
npm pack coherentpdf
npm pack tesseract.js@7.0.0
npm pack tesseract.js-core@7.0.0
mkdir -p tesseract-langdata
curl -fsSL https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz -o tesseract-langdata/eng.traineddata.gz
mkdir -p ocr-fonts
curl -fsSL https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf -o ocr-fonts/NotoSans-Regular.ttf
```

**Paso 2: Compilar la imagen de Docker con URL internas**

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data \
  --build-arg VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts \
  -t bentopdf .
```

**Paso 3: Exportar la imagen de Docker**

```bash
docker save bentopdf -o bentopdf.tar
```

**Paso 4: Transferir a la red aislada**

Copia mediante USB, un repositorio interno de artefactos o un método de transferencia aprobado:

- `bentopdf.tar`: la imagen de Docker
- Los cinco paquetes `.tgz` de WASM/OCR del Paso 1
- El directorio `tesseract-langdata/` del Paso 1
- El directorio `ocr-fonts/` del Paso 1

**Paso 5: Configurar dentro de la red aislada**

```bash
# Load the Docker image
docker load -i bentopdf.tar

# Extract WASM packages
mkdir -p ./wasm/pymupdf ./wasm/gs ./wasm/cpdf ./wasm/ocr/core ./wasm/ocr/lang-data ./wasm/ocr/fonts
tar xzf bentopdf-pymupdf-wasm-0.11.14.tgz -C ./wasm/pymupdf --strip-components=1
tar xzf bentopdf-gs-wasm-*.tgz -C ./wasm/gs --strip-components=1
tar xzf coherentpdf-*.tgz -C ./wasm/cpdf --strip-components=1
TEMP_TESS=$(mktemp -d)
tar xzf tesseract.js-7.0.0.tgz -C "$TEMP_TESS"
cp "$TEMP_TESS/package/dist/worker.min.js" ./wasm/ocr/worker.min.js
rm -rf "$TEMP_TESS"
tar xzf tesseract.js-core-7.0.0.tgz -C ./wasm/ocr/core --strip-components=1
cp ./tesseract-langdata/*.traineddata.gz ./wasm/ocr/lang-data/
cp ./ocr-fonts/* ./wasm/ocr/fonts/

# Run BentoPDF
docker run -d -p 3000:8080 --restart unless-stopped bentopdf
```

Asegúrate de que los archivos sean accesibles en las URL que configuraste en el Paso 2, incluidas `.../ocr/worker.min.js`, `.../ocr/core`, `.../ocr/lang-data` y `.../ocr/fonts`.

</details>

::: info ¿Compilas desde el código fuente en lugar de usar Docker?
Define las variables en `.env.production` antes de ejecutar `npm run build`:

```bash
VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/
VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/
VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/
VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js
VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core
VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data
VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts
```

:::

### Alojar tu propio proxy de WASM

Si necesitas servir archivos WASM con licencia AGPL con las cabeceras CORS adecuadas, puedes desplegar un proxy sencillo. Consulta la [guía del proxy de WASM en Cloudflare](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md) para ver una implementación de ejemplo.

::: tip ¿Por qué por separado?
Esta separación garantiza:

- Un cumplimiento legal claro para los usuarios comerciales
- Que el núcleo de BentoPDF siga bajo su doble licencia (AGPL-3.0 / Comercial)
- Que los archivos WASM se carguen en tiempo de ejecución, no incluidos en el código fuente
  :::

## Requisitos del sistema

| Requisito      | Mínimo                            |
| -------------- | --------------------------------- |
| Almacenamiento | ~100 MB (núcleo sin módulos AGPL) |
| RAM            | 512 MB                            |
| CPU            | Cualquier procesador moderno      |

::: tip
BentoPDF es un sitio estático: no se necesita base de datos ni servidor backend.
:::
