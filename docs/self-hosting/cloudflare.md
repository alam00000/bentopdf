# Deploy to Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) offers fast, global static site hosting with unlimited bandwidth.

## Quick Deploy

1. Go to [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Click "Create a project"
3. Connect your GitHub repository

## Build Configuration

| Setting | Value |
|---------|-------|
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

## Environment Variables

Add these in Settings → Environment variables:

| Variable | Value |
|----------|-------|
| `NODE_VERSION` | `18` |
| `SIMPLE_MODE` | `false` (optional) |

## Configuration File

Create `_headers` in your `public` folder:

```
# Cache WASM files aggressively
/*.wasm
  Cache-Control: public, max-age=31536000, immutable
  Content-Type: application/wasm

# Service worker
/sw.js
  Cache-Control: no-cache
```

Create `_redirects` for SPA routing:

```
/*    /index.html   200
```

## Custom Domain

1. Go to your Pages project
2. Click "Custom domains"
3. Add your domain
4. Cloudflare will auto-configure DNS if the domain is on Cloudflare

## Advantages

- **Free unlimited bandwidth**
- **Global CDN** with 300+ edge locations
- **Automatic HTTPS**
- **Preview deployments** for pull requests
- **Fast builds**

## Troubleshooting

### Large File Uploads

Cloudflare Pages supports files up to 25 MB. WASM modules should be fine, but if you hit limits, consider:

```bash
# Split large files during build
npm run build
```

### Worker Size Limits

If using Cloudflare Workers for advanced routing, note the 1 MB limit for free plans.
