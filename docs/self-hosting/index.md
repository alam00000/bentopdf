# Self-Hosting Guide

BentoPDF can be self-hosted on your own infrastructure. This guide covers various deployment options.

## Quick Start with Docker / Podman

The fastest way to self-host BentoPDF:

> [!IMPORTANT]
> Office file conversion requires `SharedArrayBuffer`, which means the app must be both cross-origin isolated and served from a secure context. The official image already sends the required COOP/COEP headers, but browsers still disable `SharedArrayBuffer` on plain HTTP local-network origins such as `http://192.168.x.x`.
>
> Use `http://localhost` only for same-device testing. If users access BentoPDF through a LAN IP or hostname, terminate it with HTTPS.

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

Or with Docker Compose / Podman Compose:

```yaml
# docker-compose.yml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf:latest
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

Run BentoPDF as a systemd service. Create `~/.config/containers/systemd/bentopdf.container`:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf:latest
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

See [Docker deployment guide](/self-hosting/docker) for full Quadlet documentation.

## Building from Source

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## Configuration Options

### Simple Mode

Simple Mode is designed for internal organizational use where you want to hide all branding and marketing content, showing only the essential PDF tools.

**What Simple Mode hides:**

- Navigation bar
- Hero section with marketing content
- Features, FAQ, testimonials sections
- Footer
- Updates page title to "PDF Tools"

```bash
# Build with Simple Mode
SIMPLE_MODE=true npm run build

# Or use the pre-built Docker image
docker run -p 3000:8080 bentopdfteam/bentopdf-simple:latest
```

See [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md) for full details.

### Base URL

Deploy to a subdirectory:

```bash
BASE_URL=/pdf-tools/ npm run build
```

### Custom Branding

Replace the default BentoPDF logo, name, and footer text with your own at build time:

| Variable           | Description                           | Default                                 |
| ------------------ | ------------------------------------- | --------------------------------------- |
| `VITE_BRAND_NAME`  | Brand name shown in header and footer | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | Logo path relative to `public/`       | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | Custom footer/copyright text          | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

Or via Docker:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Branding works in both full mode and Simple Mode, and can be combined with all other build-time options (`BASE_URL`, `SIMPLE_MODE`, `VITE_DEFAULT_LANGUAGE`).

### Disabling Specific Tools

Hide individual tools for compliance or security. Disabled tools are removed from the homepage, search, shortcuts, workflow builder, and direct URL access.

Tool IDs are the page URL without `.html` — open any tool and look at the URL (e.g., `edit-pdf`, `sign-pdf`, `encrypt-pdf`).

**Build-time** (baked into the bundle):

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**Runtime** (no rebuild needed — mount a `config.json`):

```json
{
  "disabledTools": ["edit-pdf", "sign-pdf"]
}
```

```bash
docker run -d -p 3000:8080 \
  -v ./config.json:/usr/share/nginx/html/config.json:ro \
  ghcr.io/alam00000/bentopdf:latest
```

Both methods can be combined — the lists are merged.

You can also disable specific features inside the PDF Editor (e.g., redaction) without disabling the entire tool by adding `editorDisabledCategories` to `config.json`. See the [Docker guide](/self-hosting/docker#disabling-editor-features) for the full list of categories.

## Deployment Guides

Choose your platform:

- [Vercel](/self-hosting/vercel)
- [Netlify](/self-hosting/netlify)
- [Cloudflare Pages](/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/self-hosting/aws)
- [Hostinger](/self-hosting/hostinger)
- [Nginx](/self-hosting/nginx)
- [Apache](/self-hosting/apache)
- [Docker](/self-hosting/docker)
- [Kubernetes](/self-hosting/kubernetes)
- [CORS Proxy](/self-hosting/cors-proxy) - Required for digital signatures

## WASM Configuration (AGPL Components)

BentoPDF **does not bundle** AGPL-licensed processing libraries in its source code, but **pre-configures CDN URLs** so all features work out of the box — no manual setup needed.

::: tip Zero-Config by Default
As of v2.0.0, WASM modules are pre-configured to load from jsDelivr CDN via environment variables. All advanced features work immediately without any user configuration.
:::

| Component       | License  | Features                                                         |
| --------------- | -------- | ---------------------------------------------------------------- |
| **PyMuPDF**     | AGPL-3.0 | EPUB/MOBI/FB2/XPS conversion, image extraction, table extraction |
| **Ghostscript** | AGPL-3.0 | PDF/A conversion, compression, deskewing, rasterization          |
| **CoherentPDF** | AGPL-3.0 | Table of contents, attachments, PDF merge with bookmarks         |

### Default Environment Variables

These are set in `.env.production` and baked into the build:

```bash
VITE_WASM_PYMUPDF_URL=https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/
VITE_WASM_GS_URL=https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm/assets/
VITE_WASM_CPDF_URL=https://cdn.jsdelivr.net/npm/coherentpdf/dist/
VITE_TESSERACT_WORKER_URL=
VITE_TESSERACT_CORE_URL=
VITE_TESSERACT_LANG_URL=
VITE_TESSERACT_AVAILABLE_LANGUAGES=
VITE_OCR_FONT_BASE_URL=
```

### Overriding WASM URLs

You can override the defaults at build time for custom deployments:

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

To disable a module entirely (require manual user config via Advanced Settings), set its variable to an empty string.

For OCR, either leave all `VITE_TESSERACT_*` variables empty and keep the default online assets, or set the worker/core/lang URLs together for self-hosted/offline OCR. If you bundle only specific OCR languages, also set `VITE_TESSERACT_AVAILABLE_LANGUAGES` to the same comma-separated codes so the UI only offers installed languages and unsupported selections fail with a descriptive error. For fully offline searchable-PDF output, also set `VITE_OCR_FONT_BASE_URL` to the internal directory that serves the bundled OCR fonts.

Users can also override these defaults at any time via **Advanced Settings** in the UI — user overrides stored in the browser take priority over environment defaults.

### Air-Gapped / Offline Deployment

For networks with no internet access (government, healthcare, financial, etc.). The WASM URLs are baked into the JavaScript at **build time** — the actual WASM files are downloaded by the **user's browser** at runtime. So you need to prepare everything on a machine with internet, then transfer it into the isolated network.

#### Automated Script (Recommended)

The included `prepare-airgap.sh` script automates the entire process — downloading WASM packages, building the Docker image, and producing a self-contained bundle with a setup script.

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

This produces a bundle directory:

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

Transfer the bundle into the air-gapped network via USB, internal artifact repo, or approved method. Then run the included setup script:

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

The setup script loads the Docker image, extracts WASM files, and optionally starts the container.

**Script options:**

| Flag                           | Description                                      | Default                           |
| ------------------------------ | ------------------------------------------------ | --------------------------------- |
| `--wasm-base-url <url>`        | Where WASMs will be hosted internally            | _(required, prompted if missing)_ |
| `--image-name <name>`          | Docker image tag                                 | `bentopdf`                        |
| `--output-dir <path>`          | Output bundle directory                          | `./bentopdf-airgap-bundle`        |
| `--simple-mode`                | Enable Simple Mode                               | off                               |
| `--base-url <path>`            | Subdirectory base URL (e.g. `/pdf/`)             | `/`                               |
| `--language <code>`            | Default UI language (e.g. `fr`, `de`)            | _(none)_                          |
| `--brand-name <name>`          | Custom brand name                                | _(none)_                          |
| `--brand-logo <path>`          | Logo path relative to `public/`                  | _(none)_                          |
| `--footer-text <text>`         | Custom footer text                               | _(none)_                          |
| `--ocr-languages <list>`       | Comma-separated OCR languages to bundle          | `eng`                             |
| `--list-ocr-languages`         | Print supported OCR codes and names, then exit   | off                               |
| `--search-ocr-language <term>` | Search OCR codes by name or abbreviation         | off                               |
| `--dockerfile <path>`          | Dockerfile to use                                | `Dockerfile`                      |
| `--skip-docker`                | Skip Docker build and export                     | off                               |
| `--skip-wasm`                  | Skip WASM download (reuse existing `.tgz` files) | off                               |

The interactive prompt also accepts `list` to print the full supported Tesseract code list and `search <term>` to find matches such as `search german` or `search chi`.

::: warning Same-Origin Requirement
WASM files must be served from the **same origin** as the BentoPDF app. Web Workers use `importScripts()` which cannot load scripts cross-origin. For example, if BentoPDF runs at `https://internal.example.com`, the WASM base URL should also be `https://internal.example.com/wasm`.
:::

#### Manual Steps

<details>
<summary>If you prefer to do it manually without the script</summary>

**Step 1: Download the WASM and OCR packages** (on a machine with internet)

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

**Step 2: Build the Docker image with internal URLs**

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

**Step 3: Export the Docker image**

```bash
docker save bentopdf -o bentopdf.tar
```

**Step 4: Transfer into the air-gapped network**

Copy via USB, internal artifact repo, or approved transfer method:

- `bentopdf.tar` — the Docker image
- The five `.tgz` WASM/OCR packages from Step 1
- The `tesseract-langdata/` directory from Step 1
- The `ocr-fonts/` directory from Step 1

**Step 5: Set up inside the air-gapped network**

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

Make sure the files are accessible at the URLs you configured in Step 2, including `.../ocr/worker.min.js`, `.../ocr/core`, `.../ocr/lang-data`, and `.../ocr/fonts`.

</details>

::: info Building from source instead of Docker?
Set the variables in `.env.production` before running `npm run build`:

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

### Hosting Your Own WASM Proxy

If you need to serve AGPL WASM files with proper CORS headers, you can deploy a simple proxy. See the [Cloudflare WASM Proxy guide](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md) for an example implementation.

::: tip Why Separate?
This separation ensures:

- Clear legal compliance for commercial users
- BentoPDF's core remains under its dual-license (AGPL-3.0 / Commercial)
- WASM files are loaded at runtime, not bundled in the source
  :::

## System Requirements

| Requirement | Minimum                             |
| ----------- | ----------------------------------- |
| Storage     | ~100 MB (core without AGPL modules) |
| RAM         | 512 MB                              |
| CPU         | Any modern processor                |

::: tip
BentoPDF is a static site—there's no database or backend server required!
:::
