# CORS Proxy for Certificate Fetching and Timestamping

The digital signature tool uses a CORS proxy to fetch issuer certificates from external Certificate Authorities (CAs). This is necessary because many CA servers don't include CORS headers in their responses, which prevents direct browser-based fetching.

Additionally, many CA servers serve certificates over plain HTTP. When your BentoPDF instance is hosted over HTTPS, browsers block these HTTP requests (mixed content policy). The CORS proxy resolves both issues by routing requests through an HTTPS endpoint with proper headers.

::: warning The Timestamp PDF tool needs this too
None of the five built-in timestamp authorities answers a CORS preflight. The RFC 3161 request is a `POST` with `Content-Type: application/timestamp-query`, which is not a CORS-simple content type, so the browser always sends an `OPTIONS` preflight first — and none of the providers replies with `Access-Control-Allow-Origin`.

On a self-hosted deployment that means **every built-in provider fails** until you either deploy a proxy (below) or point [`VITE_TSA_ENDPOINTS`](#timestamping-without-a-proxy) at a timestamp authority that allows cross-origin requests. `https://www.bentopdf.com` works because it falls back to the project-operated proxy, which only accepts the official origins.
:::

## How It Works

When signing a PDF with a certificate:

1. The `zgapdfsigner` library tries to build a complete certificate chain
2. It fetches issuer certificates from URLs embedded in your certificate's AIA (Authority Information Access) extension
3. These requests are routed through a CORS proxy that adds the necessary `Access-Control-Allow-Origin` headers
4. The proxy returns the certificate data to the browser

When timestamping a PDF, the same proxy relays the RFC 3161 `POST` to the selected timestamp authority. The proxy only accepts destinations on its own TSA allow-list (`ALLOWED_TSA_HOSTS`), so it cannot be used as an open relay.

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

3. **Clone BentoPDF and declare your origins**:

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   Open `wrangler.toml` and set `ALLOWED_ORIGINS` to the origin(s) your instance is served from:

   ```toml
   [vars]
   ALLOWED_ORIGINS = "https://your-domain.com,https://www.your-domain.com"
   ```

   ::: warning Important
   Without this, the proxy will reject all requests from your site with a **403 Forbidden** error. The default only allows requests from `bentopdf.com`.
   :::

   If you also point `VITE_TSA_ENDPOINTS` at a timestamp authority that is not one of the built-in providers, add its hostname so the proxy is allowed to relay to it:

   ```toml
   [vars]
   ALLOWED_ORIGINS = "https://your-domain.com"
   ALLOWED_TSA_HOSTS = "timestamp.digicert.com,timestamp.sectigo.com,ts.ssl.com,freetsa.org,tsa.mesign.com,tsa.example.org"
   ```

   Both variables are comma-separated. A blank value keeps the built-in defaults rather than allowing everything, so a typo fails closed.

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

You can also create your own proxy endpoint. The example below covers **certificate fetching only**; the Timestamp PDF tool needs the additional `POST` route described after it.

For certificates, the requirements are:

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

To support the **Timestamp PDF** tool as well, the same endpoint (or a second route) must also:

1. Answer the `OPTIONS` preflight with `Access-Control-Allow-Methods: GET, POST, OPTIONS` and `Access-Control-Allow-Headers: Content-Type`
2. Accept `POST` requests with a `url` query parameter and a body of type `application/timestamp-query`
3. Only forward to timestamp authorities on an allow-list of your own (the Cloudflare worker uses `ALLOWED_TSA_HOSTS`), so it cannot serve as an open relay
4. Forward the body unchanged with the same `Content-Type`, and return the upstream `application/timestamp-reply` with the same CORS headers as above

Without that route, the built-in providers keep failing on the Timestamp PDF tool even though certificate fetching works.

## Security Considerations

The included Cloudflare Worker has several security measures:

| Feature                 | Description                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------- |
| **Origin Validation**   | Only allows requests from origins listed in the `ALLOWED_ORIGINS` variable             |
| **URL Restrictions**    | Only allows certificate URLs (`.crt`, `.cer`, `.pem`, `/certs/`, `/ocsp`, `/crl`)      |
| **TSA Allow-List**      | RFC 3161 `POST`s only reach hosts listed in the `ALLOWED_TSA_HOSTS` variable           |
| **Private IP Blocking** | Blocks IPv4/IPv6 private ranges, link-local, loopback, decimal IPs, and cloud metadata |
| **Content-Type Safety** | Only returns safe certificate MIME types, blocks upstream content-type injection       |
| **File Size Limit**     | Streams response with 10MB limit, aborts mid-download if exceeded                      |
| **Rate Limiting**       | 60 requests per IP per minute (requires KV)                                            |
| **HMAC Signatures**     | Optional client-side signing (deters casual abuse)                                     |

## Timestamping Without a Proxy

If you only need the **Timestamp PDF** tool and would rather not run a relay, replace the provider list at build time with `VITE_TSA_ENDPOINTS` and point it at a timestamp authority that sends CORS headers. Entries are comma-separated and each one is either a bare URL or a `Label=URL` pair:

```bash
VITE_TSA_ENDPOINTS="My TSA=https://tsa.example.org/tsr" npm run build
```

Or with Docker:

```bash
DOCKER_BUILDKIT=1 docker build \
  --build-arg VITE_TSA_ENDPOINTS="My TSA=https://tsa.example.org/tsr" \
  -t your-bentopdf .
```

The configured list replaces the built-in providers everywhere: the Timestamp PDF dropdown, the workflow node's default, and the allow-list that sanitizes imported workflows. A malformed entry is skipped with a console warning, and if nothing usable is left the built-in providers are used instead.

::: tip The CSP is generated from this variable
`connect-src` in the generated `security-headers.conf` is built from the `VITE_*` URLs at build time, so a configured TSA origin is added to it automatically. Setting the variable at runtime has no effect — an origin missing from `connect-src` fails with the same opaque `TypeError: Failed to fetch` as a CORS rejection.
:::

To check whether a candidate authority is usable from a browser:

```bash
curl -s -i -X OPTIONS https://tsa.example.org/tsr \
  -H 'Origin: https://your-domain.com' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type' \
  | grep -iE 'access-control-allow-(origin|methods|headers)'
```

The authority is usable only if all three headers come back: `Access-Control-Allow-Origin` matching your origin (or `*`), `Access-Control-Allow-Methods` including `POST`, and `Access-Control-Allow-Headers` including `content-type`. If any of them is missing, the browser rejects the preflight and the authority needs the proxy.

### DNS rebinding (self-hosting off Cloudflare)

The worker rejects any URL that resolves to a private or internal IP. It can't use a fixed allowlist of hosts, since certificate-chain URLs point to whatever CA issued the cert (FNMT, corporate CAs, and so on), so the destinations aren't known up front. That leaves a small rebinding window: someone running the DNS for their own domain could hand a public IP to the safety check and a private one to the real request a moment later.

On Cloudflare this isn't exploitable — Workers can't reach private IPs or the `169.254.169.254` metadata endpoint, so a rebind lands on nothing. Just don't give the worker a way in: don't attach a Tunnel, Service, or private-network binding (it only needs `RATE_LIMIT_KV`).

If you run this off Cloudflare (workerd, Node, and the like) inside a VPC, the runtime _can_ reach internal IPs. Put an egress firewall in front of it and block the private ranges — `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`, and their IPv6 equivalents. App code can't enforce that once you're off Cloudflare.

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
3. **CORS proxy rejecting your origin** — Check that your origin is in the proxy's `ALLOWED_ORIGINS` variable
4. **CSP blocking the origin** — `connect-src` is generated at build time from the `VITE_*` URLs, so the proxy or TSA origin must have been set when the instance was built

### "403 Forbidden" from the proxy

Your origin is not in the `ALLOWED_ORIGINS` list. Set it in `cloudflare/wrangler.toml`:

```toml
[vars]
ALLOWED_ORIGINS = "https://your-domain.com"
```

Then redeploy: `npx wrangler deploy`

A `"Disallowed TSA host"` response instead means the destination is missing from `ALLOWED_TSA_HOSTS`.

### "Timestamping needs a relay on this deployment"

The Timestamp PDF tool shows this when the browser refused the request and the build has no relay configured. Changing provider will not help — none of the built-in providers allows cross-origin requests. Rebuild with either `VITE_CORS_PROXY_URL` (proxy) or `VITE_TSA_ENDPOINTS` (a CORS-capable authority).

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
