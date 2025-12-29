# Deploy to Vercel

[Vercel](https://vercel.com) offers the easiest deployment experience for static sites.

## One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## Manual Deployment

### Step 1: Fork the Repository

Fork [bentopdf/bentopdf](https://github.com/alam00000/bentopdf) to your GitHub account.

### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select your forked repository
3. Configure the project:

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### Step 3: Environment Variables (Optional)

Add these if needed:

```
SIMPLE_MODE=false
```

### Step 4: Deploy

Click "Deploy" and wait for the build to complete.

## Custom Domain

1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS as instructed

## Limitations

::: warning Large Files
Vercel's serverless functions have a 50MB limit. Since BentoPDF is a static site, this shouldn't affect you, but WASM modules are large (~100MB total). Ensure they're served from the `/public` folder.
:::

## Troubleshooting

### Build Timeout

If builds timeout, try:

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### 404 on Refresh

Add a `vercel.json` for SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
