# Deploy to Netlify

[Netlify](https://netlify.com) provides excellent static site hosting with a generous free tier.

## One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## Manual Deployment

### Step 1: Connect Repository

1. Log in to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub account
4. Select your BentoPDF fork

### Step 2: Configure Build Settings

| Setting           | Value           |
| ----------------- | --------------- |
| Build command     | `npm run build` |
| Publish directory | `dist`          |
| Node version      | 18+             |

### Step 3: Deploy

Click "Deploy site" and wait for the build.

## Configuration File

Create `netlify.toml` in your project root:

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

::: warning Important
The `Cross-Origin-Embedder-Policy` and `Cross-Origin-Opener-Policy` headers are required for Word/ODT/Excel/PowerPoint to PDF conversions. Without them, `SharedArrayBuffer` is unavailable and the LibreOffice WASM engine will fail to initialize.

The `Content-Encoding: gzip` headers on the `.wasm.gz` and `.data.gz` files tell the browser to decompress them automatically. Without these, the browser receives raw gzip bytes and WASM compilation fails.
:::

## Environment Variables

Set these in Site settings → Environment variables:

| Variable                | Description                                                 |
| ----------------------- | ----------------------------------------------------------- |
| `SIMPLE_MODE`           | Set to `true` for minimal build                             |
| `VITE_BRAND_NAME`       | Custom brand name (replaces "BentoPDF")                     |
| `VITE_BRAND_LOGO`       | Logo path relative to `public/` (e.g. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Custom footer/copyright text                                |
| `VITE_DEFAULT_LANGUAGE` | Default UI language (e.g. `fr`, `de`, `es`)                 |

## Custom Domain

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow DNS configuration instructions

## Large Media

For large WASM files, consider enabling [Netlify Large Media](https://docs.netlify.com/large-media/overview/):

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## Troubleshooting

### Word/ODT/Excel to PDF Stuck at 55%

If document conversions hang at 55%, open DevTools Console and check:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

If `crossOriginIsolated` is `false`, the COEP/COOP headers from your `netlify.toml` are not being applied. Make sure the file is in your project root and redeploy.

If you see `expected magic word 00 61 73 6d, found 1f 8b 08 08` in the console, the `.wasm.gz` files are missing `Content-Encoding: gzip` headers. Ensure the `[[headers]]` blocks for `soffice.wasm.gz` and `soffice.data.gz` are in your `netlify.toml`.

### Build Fails

Check Node version compatibility:

```toml
[build.environment]
  NODE_VERSION = "20"
```

### Slow Initial Load

Enable asset optimization in Site settings → Build & deploy → Asset optimization.
