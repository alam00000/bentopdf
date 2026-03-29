# Deploy with Docker / Podman

The easiest way to self-host BentoPDF in a production environment.

> [!IMPORTANT]
> **Required Headers for Office File Conversion**
>
> LibreOffice-based tools (Word, Excel, PowerPoint conversion) require these HTTP headers for `SharedArrayBuffer` support:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> The page must also be served from a secure context. `http://localhost` works for local testing, but `http://192.168.x.x` or other LAN IPs usually do not qualify, so Office conversion over plain HTTP will fail even if the headers are present.
>
> The official container images include these headers. If using a reverse proxy (Traefik, Caddy, etc.), ensure these headers are preserved or added, and use HTTPS for non-loopback access.

> [!TIP]
> **Podman Users:** All `docker` commands work with Podman by replacing `docker` with `podman` and `docker-compose` with `podman-compose`.

## Quick Start

```bash
# Docker
docker run -d \
  --name bentopdf \
  -p 3000:8080 \
  --restart unless-stopped \
  ghcr.io/alam00000/bentopdf:latest

# Podman
podman run -d \
  --name bentopdf \
  -p 3000:8080 \
  ghcr.io/alam00000/bentopdf:latest
```

## Docker Compose / Podman Compose

Create `docker-compose.yml`:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf:latest
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

Run:

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Build Your Own Image

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

Build and run:

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## Environment Variables

| Variable                             | Description                                 | Default                                                        |
| ------------------------------------ | ------------------------------------------- | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | Build without LibreOffice tools             | `false`                                                        |
| `BASE_URL`                           | Deploy to subdirectory                      | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | PyMuPDF WASM module URL                     | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | Ghostscript WASM module URL                 | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm/assets/`       |
| `VITE_WASM_CPDF_URL`                 | CoherentPDF WASM module URL                 | `https://cdn.jsdelivr.net/npm/coherentpdf/dist/`               |
| `VITE_TESSERACT_WORKER_URL`          | OCR worker script URL                       | _(empty; use Tesseract.js default CDN)_                        |
| `VITE_TESSERACT_CORE_URL`            | OCR core runtime directory                  | _(empty; use Tesseract.js default CDN)_                        |
| `VITE_TESSERACT_LANG_URL`            | OCR traineddata directory                   | _(empty; use Tesseract.js default CDN)_                        |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | Comma-separated OCR languages exposed in UI | _(empty; show full catalog)_                                   |
| `VITE_OCR_FONT_BASE_URL`             | OCR text-layer font directory               | _(empty; use remote Noto font URLs)_                           |
| `VITE_DEFAULT_LANGUAGE`              | Default UI language                         | `en`                                                           |
| `VITE_BRAND_NAME`                    | Custom brand name                           | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | Logo path relative to `public/`             | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | Custom footer/copyright text                | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | Comma-separated tool IDs to hide            | _(empty; all tools enabled)_                                   |

WASM module URLs are pre-configured with CDN defaults — all advanced features work out of the box. Override these for air-gapped or self-hosted deployments.

For OCR, leave the `VITE_TESSERACT_*` variables empty to use the default online assets, or set all three together for self-hosted/offline OCR. Partial OCR overrides are rejected because the worker, core runtime, and traineddata directory must match. For fully offline searchable PDF output, also set `VITE_OCR_FONT_BASE_URL` so the OCR text-layer fonts are loaded from your internal server instead of the public Noto font URLs.

`VITE_DEFAULT_LANGUAGE` sets the UI language for first-time visitors. Supported values: `en`, `ar`, `be`, `fr`, `de`, `es`, `zh`, `zh-TW`, `vi`, `tr`, `id`, `it`, `pt`, `nl`, `da`. Users can still switch languages — this only changes the default.

Example:

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### Custom Branding

Replace the default BentoPDF logo, name, and footer text with your own. Place your logo file in the `public/` folder (or use an existing image), then pass the branding variables at build time:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Branding works in both full mode and Simple Mode, and can be combined with all other build-time options.

### Disabling Specific Tools

Hide tools from the UI for compliance or security requirements. Disabled tools are removed from the homepage, search results, keyboard shortcuts, and the workflow builder. Direct URL access shows a "tool unavailable" page.

Tool IDs are the page URL without `.html`. For example, if the tool lives at `bentopdf.com/edit-pdf.html`, the ID is `edit-pdf`.

#### Finding Tool IDs

The easiest way: open any tool in BentoPDF and look at the URL. The last part of the path (without `.html`) is the tool ID.

<details>
<summary>Full list of tool IDs</summary>

**Edit & Annotate:** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**Convert to PDF:** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**Convert from PDF:** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**Organize & Manage:** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**Optimize & Repair:** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**Security:** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### Option 1: Build-time (Docker build arg)

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

This bakes the disabled list into the JavaScript bundle. Requires a rebuild to change.

#### Option 2: Runtime (config.json)

Mount a `config.json` file into the served directory — no rebuild needed:

```json
{
  "disabledTools": ["edit-pdf", "sign-pdf", "encrypt-pdf"]
}
```

```bash
docker run -d \
  -p 3000:8080 \
  -v ./config.json:/usr/share/nginx/html/config.json:ro \
  ghcr.io/alam00000/bentopdf:latest
```

Or with Docker Compose:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

Both methods can be combined — the lists are merged. If a tool appears in either, it is disabled.

#### Disabling Editor Features

You can also disable specific features inside the PDF Editor (e.g., redaction, annotations, forms) without disabling the entire editor tool. Add `editorDisabledCategories` to your `config.json`:

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>Full list of editor categories</summary>

**Zoom:** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**Annotation:** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**Shapes:** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**Form:** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**Redaction:** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**Document:** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**Page:** `page`, `spread`, `rotate`, `scroll`, `navigation`

**Panel:** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**Tools:** `tools`, `pan`, `pointer`, `capture`

**Selection:** `selection`, `selection-copy`

**History:** `history`, `history-undo`, `history-redo`

</details>

Categories are hierarchical — disabling a parent (e.g., `annotation`) disables all its children.

### Custom WASM URLs (Air-Gapped / Self-Hosted)

> [!IMPORTANT]
> WASM URLs are baked into the JavaScript at **build time**. The WASM files are downloaded by the **user's browser** at runtime — Docker does not download them during the build. For air-gapped networks, you must host the WASM files on an internal server that browsers can reach.

**Full air-gapped workflow:**

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

Use the codes printed by `bash scripts/prepare-airgap.sh --list-ocr-languages`, or search by name with `bash scripts/prepare-airgap.sh --search-ocr-language <term>`, for `--ocr-languages`. When you build with a restricted OCR subset, pass the same codes to `VITE_TESSERACT_AVAILABLE_LANGUAGES` so the app only shows bundled languages. For full offline OCR output, also host the bundled `ocr-fonts/` directory and point `VITE_OCR_FONT_BASE_URL` at it.

Set a variable to empty string to disable that module (users must configure manually via Advanced Settings).

## Custom User ID (PUID/PGID)

For environments that require running as a specific non-root user (NAS devices, Kubernetes with security contexts, organizational policies), BentoPDF provides a separate Dockerfile with LSIO-style PUID/PGID support.

### Build and Run

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

### Environment Variables

| Variable       | Description           | Default |
| -------------- | --------------------- | ------- |
| `PUID`         | User ID to run as     | `1000`  |
| `PGID`         | Group ID to run as    | `1000`  |
| `DISABLE_IPV6` | Disable IPv6 listener | `false` |

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

### How It Works

The container starts as root, creates a user with the specified PUID/PGID, adjusts ownership on all writable directories, then drops privileges using `su-exec`. The nginx process runs entirely as your specified user.

> [!NOTE]
> The standard `Dockerfile` uses `nginx-unprivileged` (UID 101) and is recommended for most deployments. Use `Dockerfile.nonroot` only when you need a specific UID/GID.

> [!WARNING]
> PUID/PGID cannot be `0` (root). The entrypoint validates inputs and will exit with an error for invalid values.

## With Traefik (Reverse Proxy)

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
    image: ghcr.io/alam00000/bentopdf:latest
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

## With Caddy (Reverse Proxy)

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
    image: ghcr.io/alam00000/bentopdf:latest
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

## Resource Limits

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf:latest
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M
```

## Podman Quadlet (Systemd Integration)

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) allows you to run Podman containers as systemd services. This is ideal for production deployments on Linux systems.

### Basic Quadlet Setup

Create a container unit file at `~/.config/containers/systemd/bentopdf.container` (user) or `/etc/containers/systemd/bentopdf.container` (system):

```ini
[Unit]
Description=BentoPDF - Privacy-first PDF toolkit
After=network-online.target
Wants=network-online.target

[Container]
Image=ghcr.io/alam00000/bentopdf:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry

[Service]
Restart=always
TimeoutStartSec=300

[Install]
WantedBy=default.target
```

### Enable and Start

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
> For system-wide deployment, use `systemctl` without `--user` flag and place the file in `/etc/containers/systemd/`.

### Simple Mode Quadlet

For Simple Mode deployment, create `bentopdf-simple.container`:

```ini
[Unit]
Description=BentoPDF Simple Mode - Clean PDF toolkit
After=network-online.target
Wants=network-online.target

[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf-simple
PublishPort=3000:8080
AutoUpdate=registry

[Service]
Restart=always
TimeoutStartSec=300

[Install]
WantedBy=default.target
```

### Quadlet with Health Check

```ini
[Unit]
Description=BentoPDF with health monitoring
After=network-online.target
Wants=network-online.target

[Container]
Image=ghcr.io/alam00000/bentopdf:latest
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

### Auto-Update with Quadlet

Podman can automatically update containers when new images are available:

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Quadlet Network Configuration

For custom network configuration, create a network file `bentopdf.network`:

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

Then reference it in your container file:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## Updating

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
