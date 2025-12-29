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

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | 18+ |

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

# SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Cache WASM files
[[headers]]
  for = "*.wasm"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Content-Type = "application/wasm"
```

## Environment Variables

Set these in Site settings → Environment variables:

| Variable | Description |
|----------|-------------|
| `SIMPLE_MODE` | Set to `true` for minimal build |

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

### Build Fails

Check Node version compatibility:

```toml
[build.environment]
  NODE_VERSION = "20"
```

### Slow Initial Load

Enable asset optimization in Site settings → Build & deploy → Asset optimization.
