# Deploying BentoPDF to Cloudflare Workers

This guide will walk you through deploying BentoPDF to Cloudflare Workers with static assets support.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com) (free tier works)
2. **Node.js**: Version 18 or higher
3. **Wrangler CLI**: Cloudflare's command-line tool

## Quick Start

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

This will open a browser window for you to log in to your Cloudflare account.

### 3. Configure Your Account ID

1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Copy your Account ID from the right sidebar
3. Edit `wrangler.toml` and uncomment the `account_id` line:

```toml
account_id = "your-account-id-here"
```

### 4. Deploy to Cloudflare Workers

```bash
npm run deploy
```

That's it! Your BentoPDF instance will be deployed to Cloudflare Workers.

## Available Deployment Commands

- **`npm run deploy`** - Build and deploy to production
- **`npm run deploy:dev`** - Deploy to development environment
- **`npm run deploy:prod`** - Deploy to production environment
- **`npm run cf:dev`** - Run local development server with Wrangler
- **`npm run cf:tail`** - View live logs from your deployed Worker

## Configuration

### wrangler.toml

The `wrangler.toml` file contains your Cloudflare Workers configuration:

- **`name`**: Your Worker name (appears in Cloudflare dashboard)
- **`main`**: Entry point for your Worker (`src/worker.js`)
- **`compatibility_date`**: Cloudflare Workers compatibility date
- **`[site]`**: Static assets configuration pointing to `dist` folder

### src/worker.js

The Worker entry point handles:
- Serving static assets from the `dist` folder
- Adding required CORS headers for SharedArrayBuffer support
- Setting security headers
- Configuring cache headers for optimal performance

### public/_headers

Fallback header configuration for static assets (used as backup).

## Custom Domain Setup

After deployment, you can add a custom domain:

1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → Your Worker
3. Click **Settings** → **Domains & Routes**
4. Add your custom domain

Or edit `wrangler.toml`:

```toml
routes = [
  { pattern = "yourdomain.com", zone_name = "yourdomain.com" }
]
```

## Environment Variables

To add environment variables, edit `wrangler.toml`:

```toml
[vars]
ENVIRONMENT = "production"
YOUR_VARIABLE = "value"
```

## Monitoring and Logs

View real-time logs from your deployed Worker:

```bash
npm run cf:tail
```

Or view logs in the Cloudflare Dashboard:
1. Go to **Workers & Pages**
2. Click on your Worker
3. Navigate to **Logs** tab

## Local Development with Wrangler

> **Note**: For BentoPDF development, we recommend using the standard Vite dev server:
> ```bash
> npm run dev
> ```

The `npm run cf:dev` command is primarily useful for testing Worker-specific logic (like custom routing or edge functions). Since BentoPDF is a static site, the Vite dev server provides a better development experience with:
- Hot Module Replacement (HMR)
- Faster rebuild times
- Better debugging tools

If you need to test the Worker locally:

```bash
npm run cf:dev
```

**Note**: This will show a message directing you to use `npm run dev` for actual development, as the ASSETS binding is not available in local Wrangler dev mode.

## Troubleshooting

### Build Errors

If you encounter build errors:

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### CORS Issues

The Worker automatically sets required CORS headers:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

These are essential for SharedArrayBuffer support in BentoPDF.

### Account ID Not Found

Make sure you've:
1. Logged in with `wrangler login`
2. Added your Account ID to `wrangler.toml`
3. Have the correct permissions in your Cloudflare account

## Cost

Cloudflare Workers free tier includes:
- **100,000 requests per day**
- **10ms CPU time per request**

Static asset requests are **free and unlimited**.

For most use cases, BentoPDF will run entirely on the free tier.

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Static Assets Guide](https://developers.cloudflare.com/workers/static-assets/)

## Support

If you encounter any issues:
1. Check the [BentoPDF GitHub Issues](https://github.com/alam00000/bentopdf/issues)
2. Review [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
3. Join the [BentoPDF Discord](https://discord.gg/AP2Y97juZT)
