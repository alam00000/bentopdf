# Getting Started

Welcome to BentoPDF! This guide will help you get up and running quickly.

## What is BentoPDF?

BentoPDF is a free, open-source, privacy-first PDF toolkit that runs **entirely in your browser**. Your files never leave your device—all processing happens locally using WebAssembly (WASM) technology.

## Quick Start

### Option 1: Use the Hosted Version

Visit [bentopdf.com](https://bentopdf.com) to use BentoPDF instantly—no installation required.

### Option 2: Self-Host with Docker

> [!IMPORTANT]
> Office file conversion requires `SharedArrayBuffer`, which needs both:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - a secure context
>
> `http://localhost` works for local testing because browsers treat loopback as trustworthy. `http://192.168.x.x` or other LAN IPs usually do not, so Word/Excel/PowerPoint conversions will require HTTPS when accessed from other devices on your network.

```bash
# Pull and run the Docker image
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/alam00000/bentopdf/main/docker-compose.yml
docker compose up -d
```

Then open `http://localhost:3000` in your browser.

> [!NOTE]
> If you are preparing an air-gapped OCR deployment, you must host the OCR text-layer fonts internally in addition to the Tesseract worker, core runtime, and traineddata files. The full setup is documented in [Self-Hosting](/self-hosting/), including `VITE_OCR_FONT_BASE_URL` and the bundled `ocr-fonts/` directory.

### Option 3: Build from Source

```bash
# Clone the repository
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Features at a Glance

| Category             | Tools                                                           |
| -------------------- | --------------------------------------------------------------- |
| **Convert to PDF**   | Word, Excel, PowerPoint, Images, Markdown, EPUB, MOBI, and more |
| **Convert from PDF** | JPG, PNG, Text, Excel, SVG, and more                            |
| **Edit & Annotate**  | Sign, Highlight, Redact, Fill Forms, Add Stamps                 |
| **Organize**         | Merge, Split, Rotate, Delete Pages, Reorder                     |
| **Optimize**         | Compress, Repair, Flatten, OCR                                  |
| **Security**         | Encrypt, Decrypt, Remove Restrictions                           |

## Browser Support

BentoPDF works best on modern browsers:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## Next Steps

- [Explore all tools](/tools/)
- [Self-host BentoPDF](/self-hosting/)
- [Contribute to the project](/contributing)
