# CORS Proxy for Certificate Fetching

The digital signature tool uses a CORS proxy to fetch issuer certificates from external Certificate Authorities (CAs). This is necessary because many CA servers don't include CORS headers in their responses, which prevents direct browser-based fetching.

## How It Works

When signing a PDF with a certificate:

1. The `zgapdfsigner` library tries to build a complete certificate chain
2. It fetches issuer certificates from URLs embedded in your certificate's AIA (Authority Information Access) extension
3. These requests are routed through a CORS proxy that adds the necessary `Access-Control-Allow-Origin` headers
4. The proxy returns the certificate data to the browser

## Self-Hosting the CORS Proxy

If you're self-hosting BentoPDF, you'll need to deploy your own CORS proxy.

### Option 1: Cloudflare Workers (Recommended)

1. **Install Wrangler CLI**:
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Deploy the proxy**:
   ```bash
   cd cloudflare
   wrangler deploy
   ```

4. **Update your environment**:
   Create a `.env` or set in your hosting platform:
   ```
   VITE_CORS_PROXY_URL=https://your-worker-name.your-subdomain.workers.dev
   ```

5. **Rebuild BentoPDF**:
   ```bash
   npm run build
   ```

### Option 2: Custom Backend Proxy

You can also create your own proxy endpoint. The requirements are:

1. Accept GET requests with a `url` query parameter
2. Fetch the URL from your server (no CORS restrictions server-side)
3. Return the response with these headers:
   - `Access-Control-Allow-Origin: *` (or your specific origin)
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `Content-Type: application/x-x509-ca-cert`

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
    
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', 'application/x-x509-ca-cert');
    res.send(Buffer.from(data));
  } catch (error) {
    res.status(500).json({ error: 'Proxy error' });
  }
});
```

## Security Considerations

The included Cloudflare Worker has several security measures:

- **URL Validation**: Only allows certificate-related URLs (`.crt`, `.cer`, `.pem`, `/certs/`, `/ocsp`, `/crl`)
- **Blocked Domains**: Prevents access to localhost and private IP ranges
- **HTTP Methods**: Only allows GET requests

## Disabling the Proxy

If you don't want to use a CORS proxy, set the environment variable to an empty string:

```
VITE_CORS_PROXY_URL=
```

**Note**: Without the proxy, signing with certificates that require external chain fetching (like FNMT or some corporate CAs) will fail.

## Troubleshooting

### "Failed to fetch certificate chain" Error

1. Check that your CORS proxy is deployed and accessible
2. Verify the `VITE_CORS_PROXY_URL` is correctly set
3. Test the proxy directly:
   ```bash
   curl "https://your-proxy.workers.dev?url=https://www.cert.fnmt.es/certs/ACUSU.crt"
   ```

### Certificates That Work Without Proxy

Some certificates include the full chain in the P12/PFX file and don't require external fetching:
- Self-signed certificates
- Some commercial CAs that bundle intermediate certificates
- Certificates you've manually assembled with the full chain
