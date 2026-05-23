# Self-Hosting Guide

hiiirePDF can be self-hosted on your own infrastructure. This guide covers various deployment options.

## Quick Start with Docker / Podman

The fastest way to self-host hiiirePDF:

> [!TIP]
> hiiirePDF ships in two builds:
>
> - **Self-Hosted build** — `ghcr.io/alam00000/hiiirepdf-simple:latest`. Every PDF tool, **without** the marketing chrome (no hero, FAQ, testimonials, footer). Use this for internal/team/organization deployments. It is **not** a feature-reduced "lite" version.
> - **Commercial build** — `ghcr.io/alam00000/hiiirepdf:latest`. The full marketing site, used by pdf.hiiire.com itself and by commercial license holders running public-facing deployments.
>
> If in doubt: pull the Self-Hosted build.

> [!IMPORTANT]
> Office file conversion requires `SharedArrayBuffer`, which means the app must be both cross-origin isolated and served from a secure context. The official image already sends the required COOP/COEP headers, but browsers still disable `SharedArrayBuffer` on plain HTTP local-network origins such as `http://192.168.x.x`.
>
> Use `http://localhost` only for same-device testing. If users access hiiirePDF through a LAN IP or hostname, terminate it with HTTPS.

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/hiiirepdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/hiiirepdf-simple:latest
```

Or with Docker Compose / Podman Compose:

```yaml
# docker-compose.yml
services:
  hiiirepdf:
    image: ghcr.io/alam00000/hiiirepdf-simple:latest
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

Run hiiirePDF as a systemd service. Create `~/.config/containers/systemd/hiiirepdf.container`:

```ini
[Container]
Image=ghcr.io/alam00000/hiiirepdf-simple:latest
ContainerName=hiiirepdf
PublishPort=3000:8080
AutoUpdate=registry

[Service]
Restart=always

[Install]
WantedBy=default.target
```

```bash
systemctl --user daemon-reload
systemctl --user enable --now hiiirepdf
```

See [Docker deployment guide](/self-hosting/docker) for full Quadlet documentation.

## Building from Source

```bash
# Clone and build
git clone https://github.com/alam00000/hiiirepdf.git
cd hiiirepdf
npm install
npm run build

# The built files are in the `dist` folder
```

## Configuration Options

### Self-Hosted build (Simple Mode)

The Self-Hosted build (the `hiiirepdf-simple` image, also called Simple Mode) is **functionally identical** to the Commercial build — every PDF tool is present and behaves the same. It just hides the marketing chrome that only makes sense on pdf.hiiire.com itself or on a commercial public-facing deployment. **It is not a feature-reduced or "lite" version.**

**What the Self-Hosted build hides** (cosmetic only — no PDF features are removed):

- Navigation bar, hero section, features section, FAQ, testimonials, footer
- Updates page title to "PDF Tools"

**What the Self-Hosted build keeps** (everything that actually does PDF work):

- Every PDF tool (merge, split, edit, sign, OCR, Office conversion, etc.)
- Custom branding support, all build-time and runtime config

The Commercial build (`ghcr.io/alam00000/hiiirepdf:latest`) is what powers pdf.hiiire.com itself and is used by commercial license holders running public-facing deployments — it adds the hero, FAQ, testimonials, and footer that wouldn't make sense on an internal tool.

If you're self-hosting hiiirePDF for your team, organization, or as an internal tool, pull the Self-Hosted build:

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/hiiirepdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

See [SIMPLE_MODE.md](https://github.com/alam00000/hiiirepdf/blob/main/SIMPLE_MODE.md) for full details.

### Commercial build (public-facing deployments with your own brand)

The Commercial build (the `hiiirepdf` image — no `-simple` suffix) is what powers pdf.hiiire.com itself. It includes the full marketing site (hero, features, FAQ, testimonials, footer) on top of every PDF tool. Use this build when you want to **deploy hiiirePDF as a public-facing PDF service under your own brand** — for example:

- You're running hiiirePDF as a hosted SaaS for end-users on your own domain
- You want the landing-page experience (marketing sections + tools), not just the bare tool surface
- You're a commercial license holder embedding hiiirePDF into a commercial product

**Run it as-is** (hiiirePDF branding — useful to preview the build):

```bash
docker run -p 3000:8080 ghcr.io/alam00000/hiiirepdf:latest
```

**Build with your own brand** (the typical commercial workflow):

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

Every other build-time option (`BASE_URL`, `VITE_DEFAULT_LANGUAGE`, `DISABLE_TOOLS`, WASM URL overrides, etc.) works the same way it does on the Self-Hosted build.

::: warning Licensing
Running the Commercial build is allowed under either of hiiirePDF's two license options:

- **AGPL-3.0** (free) — allowed if your deployment publishes its full source code under AGPL, including any branding modifications and surrounding business logic.
- **Commercial license** ($79 lifetime) — required for closed-source / proprietary deployments where you don't open-source your branding fork or business code.

See the [Licensing page](https://pdf.hiiire.com/licensing.html) for the full comparison. AGPL-licensed WASM modules (PyMuPDF, Ghostscript, CoherentPDF) load from a CDN at runtime, so they don't enter your image and don't change your licensing posture.
:::

### Base URL

Deploy to a subdirectory:

```bash
BASE_URL=/pdf-tools/ npm run build
```

### Custom Branding

Replace the default hiiirePDF logo, name, and footer text with your own at build time:

| Variable           | Description                           | Default                                  |
| ------------------ | ------------------------------------- | ---------------------------------------- |
| `VITE_BRAND_NAME`  | Brand name shown in header and footer | `hiiirePDF`                              |
| `VITE_BRAND_LOGO`  | Logo path relative to `public/`       | `images/favicon-no-bg.svg`               |
| `VITE_FOOTER_TEXT` | Custom footer/copyright text          | `© 2026 hiiirePDF. All rights reserved.` |

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
  ghcr.io/alam00000/hiiirepdf-simple:latest
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

## Common Issues

### Word / ODT / Excel / PowerPoint to PDF Hangs (SharedArrayBuffer Unavailable)

**Symptom**: LibreOffice-based document conversions (Word, ODT, Excel, PowerPoint to PDF) hang at ~55% or fail to start. The browser console may show:

> `ReferenceError: SharedArrayBuffer is not defined`

…or `window.crossOriginIsolated` reports `false`, or the WASM compilation reports `expected magic word 00 61 73 6d, found 1f 8b 08 08`.

**Cause**: LibreOffice WASM requires `SharedArrayBuffer`, which the browser only enables when the page is **cross-origin isolated** AND served from a **secure context**. That means two things must be true:

1. Every response includes both headers:
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. The page is served from `https://...` or `http://localhost`. Plain HTTP on a LAN IP (e.g. `http://192.168.x.x`) does NOT count as secure — browsers disable `SharedArrayBuffer` there.

The `00 61 73 6d / 1f 8b 08 08` mismatch is a separate sub-symptom: the pre-compressed `.wasm.gz` / `.data.gz` files are missing the `Content-Encoding: gzip` response header, so the browser receives raw gzip bytes instead of decompressed WASM.

**Fix**: see your platform-specific deployment guide for the exact configuration:

- [Nginx →](/self-hosting/nginx#word-odt-excel-to-pdf-not-working)
- [Apache →](/self-hosting/apache#word-odt-excel-to-pdf-not-working)
- [AWS S3 + CloudFront →](/self-hosting/aws#step-3b-response-headers-policy-required-for-libreoffice-wasm)
- [Cloudflare Pages →](/self-hosting/cloudflare#configuration-file) (`_headers` file)
- [Netlify →](/self-hosting/netlify#word-odt-excel-to-pdf-stuck-at-55) (`netlify.toml`)
- [Vercel →](/self-hosting/vercel#word-odt-excel-to-pdf-not-working) (`vercel.json`)
- [Hostinger →](/self-hosting/hostinger#libreoffice-tools-not-working) (`.htaccess`)
- [Kubernetes →](/self-hosting/kubernetes#ensuring-the-sharedarraybuffer-headers-still-work-ingress-gateway)
- **Docker**: handled automatically by the bundled nginx config — no action needed.

**Verify**: open DevTools Console on any hiiirePDF page and run:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

If the page is HTTPS or `http://localhost` AND both COEP/COOP headers are present on every response, both checks pass. If you're on `http://192.168.x.x` or another non-loopback HTTP origin, terminate it with HTTPS — there is no header-only fix.

### `.mjs` Files Served as `application/octet-stream`

**Symptom**: Sign PDF / Form Filler / certain other tools show a blank viewer or fail to load. The browser console reports:

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**Cause**: Your web server or reverse proxy doesn't have a MIME-type mapping for `.mjs` files (the bundled PDF viewer ships ES modules with that extension). Many stock server configs default to `application/octet-stream` for unrecognized extensions, which browsers refuse to execute as ES modules.

**Fix**: see your platform-specific deployment guide for the exact snippet:

- [Nginx →](/self-hosting/nginx#sign-pdf-or-form-filler-shows-a-blank-viewer-mjs-mime-error)
- [Apache →](/self-hosting/apache#sign-pdf-or-form-filler-shows-a-blank-viewer-mjs-mime-error)
- [AWS S3 + CloudFront →](/self-hosting/aws#step-2-build-and-upload) (see `aws s3 cp ... --include "*.mjs"`)
- [Kubernetes →](/self-hosting/kubernetes#mjs-mime-type-errors-sign-pdf-form-filler-iframe-blank)
- **Docker, Vercel, Netlify, Cloudflare Pages, Hostinger**: handled automatically — no action needed.

**Verify**: open DevTools → Network tab, find the failing `.mjs` request, check the `Content-Type` response header. It should be `application/javascript`. If it's still `application/octet-stream`, an outer reverse proxy or CDN may be re-sniffing the type — check each layer in your serving chain.

## WASM Configuration (AGPL Components)

hiiirePDF **does not bundle** AGPL-licensed processing libraries in its source code, but **pre-configures CDN URLs** so all features work out of the box — no manual setup needed.

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
VITE_WASM_PYMUPDF_URL=/wasm/pymupdf/
VITE_WASM_GS_URL=/wasm/gs/
VITE_WASM_CPDF_URL=https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/
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
  -t hiiirepdf .

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
git clone https://github.com/alam00000/hiiirepdf.git
cd hiiirepdf

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
hiiirepdf-airgap-bundle/
  hiiirepdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

Transfer the bundle into the air-gapped network via USB, internal artifact repo, or approved method. Then run the included setup script:

```bash
cd hiiirepdf-airgap-bundle
bash setup.sh
```

The setup script loads the Docker image, extracts WASM files, and optionally starts the container.

**Script options:**

| Flag                           | Description                                      | Default                           |
| ------------------------------ | ------------------------------------------------ | --------------------------------- |
| `--wasm-base-url <url>`        | Where WASMs will be hosted internally            | _(required, prompted if missing)_ |
| `--image-name <name>`          | Docker image tag                                 | `hiiirepdf`                       |
| `--output-dir <path>`          | Output bundle directory                          | `./hiiirepdf-airgap-bundle`       |
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
WASM files must be served from the **same origin** as the hiiirePDF app. Web Workers use `importScripts()` which cannot load scripts cross-origin. For example, if hiiirePDF runs at `https://internal.example.com`, the WASM base URL should also be `https://internal.example.com/wasm`.
:::

#### Manual Steps

<details>
<summary>If you prefer to do it manually without the script</summary>

**Step 1: Download the WASM and OCR packages** (on a machine with internet)

```bash
npm pack pymupdf-wasm@0.11.14
npm pack gs-wasm
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
git clone https://github.com/alam00000/hiiirepdf.git
cd hiiirepdf

docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data \
  --build-arg VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts \
  -t hiiirepdf .
```

**Step 3: Export the Docker image**

```bash
docker save hiiirepdf -o hiiirepdf.tar
```

**Step 4: Transfer into the air-gapped network**

Copy via USB, internal artifact repo, or approved transfer method:

- `hiiirepdf.tar` — the Docker image
- The five `.tgz` WASM/OCR packages from Step 1
- The `tesseract-langdata/` directory from Step 1
- The `ocr-fonts/` directory from Step 1

**Step 5: Set up inside the air-gapped network**

```bash
# Load the Docker image
docker load -i hiiirepdf.tar

# Extract WASM packages
mkdir -p ./wasm/pymupdf ./wasm/gs ./wasm/cpdf ./wasm/ocr/core ./wasm/ocr/lang-data ./wasm/ocr/fonts
tar xzf pymupdf-wasm-0.11.14.tgz -C ./wasm/pymupdf --strip-components=1
tar xzf gs-wasm-*.tgz -C ./wasm/gs --strip-components=1
tar xzf coherentpdf-*.tgz -C ./wasm/cpdf --strip-components=1
TEMP_TESS=$(mktemp -d)
tar xzf tesseract.js-7.0.0.tgz -C "$TEMP_TESS"
cp "$TEMP_TESS/package/dist/worker.min.js" ./wasm/ocr/worker.min.js
rm -rf "$TEMP_TESS"
tar xzf tesseract.js-core-7.0.0.tgz -C ./wasm/ocr/core --strip-components=1
cp ./tesseract-langdata/*.traineddata.gz ./wasm/ocr/lang-data/
cp ./ocr-fonts/* ./wasm/ocr/fonts/

# Run hiiirePDF
docker run -d -p 3000:8080 --restart unless-stopped hiiirepdf
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

If you need to serve AGPL WASM files with proper CORS headers, you can deploy a simple proxy. See the [Cloudflare WASM Proxy guide](https://github.com/alam00000/hiiirepdf/blob/main/cloudflare/WASM-PROXY.md) for an example implementation.

::: tip Why Separate?
This separation ensures:

- Clear legal compliance for commercial users
- hiiirePDF's core remains under its dual-license (AGPL-3.0 / Commercial)
- WASM files are loaded at runtime, not bundled in the source
  :::

## System Requirements

| Requirement | Minimum                             |
| ----------- | ----------------------------------- |
| Storage     | ~100 MB (core without AGPL modules) |
| RAM         | 512 MB                              |
| CPU         | Any modern processor                |

::: tip
hiiirePDF is a static site—there's no database or backend server required!
:::
