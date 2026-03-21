# CORS Proxy for Certificate Fetching

The digital signature tool uses a CORS proxy to fetch issuer certificates from external Certificate Authorities (CAs). This is necessary because many CA servers don't include CORS headers in their responses, which prevents direct browser-based fetching.

Additionally, many CA servers serve certificates over plain HTTP. When your BentoPDF instance is hosted over HTTPS, browsers block these HTTP requests (mixed content policy). The CORS proxy resolves both issues by routing requests through an HTTPS endpoint with proper headers.

## How It Works

When signing a PDF with a certificate:

1. The `zgapdfsigner` library tries to build a complete certificate chain
2. It fetches issuer certificates from URLs embedded in your certificate's AIA (Authority Information Access) extension
3. These requests are routed through a CORS proxy that adds the necessary `Access-Control-Allow-Origin` headers
4. The proxy returns the certificate data to the browser

## Self-Hosting the CORS Proxy

If you're self-hosting BentoPDF, you'll need to deploy your own CORS proxy for digital signatures to work with certificates that require chain fetching.

### Option 1: Cloudflare Workers (Recommended)

1. **Install Wrangler CLI**:

   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:

   ```bash
   wrangler login
   ```

3. **Clone BentoPDF and update allowed origins**:

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   Open `cors-proxy-worker.js` and change the `ALLOWED_ORIGINS` array to your domain:

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning Important
   Without this change, the proxy will reject all requests from your site with a **403 Forbidden** error. The default only allows requests from `bentopdf.com`.
   :::

4. **Deploy the proxy**:

   ```bash
   wrangler deploy
   ```

   Note your worker URL (e.g., `https://bentopdf-cors-proxy.your-subdomain.workers.dev`).

5. **Rebuild BentoPDF with the proxy URL**:

   If using Docker:

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   If building from source:

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### Option 2: Custom Backend Proxy

You can also create your own proxy endpoint. The requirements are:

1. Accept GET requests with a `url` query parameter
2. Fetch the URL from your server (no CORS restrictions server-side)
3. Return the response with these headers:
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

Example Express.js implementation:

```javascript
app.get('/api/cert-proxy', async (req, res) => {
  const targetUrl = req.query.url;

  // Validate it's a certificate URL
  if (!isValidCertUrl(targetUrl)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const response = await fetch(targetUrl);
    const data = await response.arrayBuffer();

    res.set('Access-Control-Allow-Origin', 'https://your-domain.com');
    res.set('Content-Type', 'application/octet-stream');
    res.set('X-Content-Type-Options', 'nosniff');
    res.send(Buffer.from(data));
  } catch (error) {
    res.status(500).json({ error: 'Proxy error' });
  }
});
```

## Security Considerations

The included Cloudflare Worker has several security measures:

| Feature                 | Description                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------- |
| **Origin Validation**   | Only allows requests from domains listed in `ALLOWED_ORIGINS`                          |
| **URL Restrictions**    | Only allows certificate URLs (`.crt`, `.cer`, `.pem`, `/certs/`, `/ocsp`, `/crl`)      |
| **Private IP Blocking** | Blocks IPv4/IPv6 private ranges, link-local, loopback, decimal IPs, and cloud metadata |
| **Content-Type Safety** | Only returns safe certificate MIME types, blocks upstream content-type injection       |
| **File Size Limit**     | Streams response with 10MB limit, aborts mid-download if exceeded                      |
| **Rate Limiting**       | 60 requests per IP per minute (requires KV)                                            |
| **HMAC Signatures**     | Optional client-side signing (deters casual abuse)                                     |

## Disabling the Proxy

If you don't want to use a CORS proxy, set the environment variable to an empty string:

```
VITE_CORS_PROXY_URL=
```

**Note**: Without the proxy, signing with certificates that require external chain fetching (like FNMT or some corporate CAs) will fail with a "Failed to fetch" error.

## Troubleshooting

### "Signing error: TypeError: Failed to fetch"

This usually means either:

1. **No CORS proxy configured** — Set `VITE_CORS_PROXY_URL` and rebuild
2. **Mixed content blocked** — Your site is HTTPS but the certificate's issuer URL is HTTP. The CORS proxy resolves this.
3. **CORS proxy rejecting your origin** — Check that your domain is in the `ALLOWED_ORIGINS` array in `cors-proxy-worker.js`

### "403 Forbidden" from the proxy

Your domain is not in the `ALLOWED_ORIGINS` list. Edit `cors-proxy-worker.js`:

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

Then redeploy: `npx wrangler deploy`

### Testing the proxy

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### Certificates That Work Without Proxy

Some certificates include the full chain in the P12/PFX file and don't require external fetching:

- Self-signed certificates
- Some commercial CAs that bundle intermediate certificates
- Certificates you've manually assembled with the full chain
