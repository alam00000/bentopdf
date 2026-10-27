# CORS-Proxy zum Abrufen von Zertifikaten

Das Werkzeug für digitale Signaturen nutzt einen CORS-Proxy, um Aussteller-Zertifikate von externen Zertifizierungsstellen (CAs) abzurufen. Das ist nötig, weil viele CA-Server keine CORS-Header in ihren Antworten mitsenden, wodurch ein direkter Abruf aus dem Browser verhindert wird.

Außerdem liefern viele CA-Server Zertifikate über einfaches HTTP aus. Wird Ihre BentoPDF-Instanz über HTTPS gehostet, blockieren Browser diese HTTP-Anfragen (Mixed-Content-Richtlinie). Der CORS-Proxy löst beide Probleme, indem er Anfragen über einen HTTPS-Endpunkt mit den passenden Headern leitet.

## So funktioniert es

Beim Signieren einer PDF mit einem Zertifikat:

1. Die Bibliothek `zgapdfsigner` versucht, eine vollständige Zertifikatskette aufzubauen
2. Sie ruft Aussteller-Zertifikate von URLs ab, die in der AIA-Erweiterung (Authority Information Access) Ihres Zertifikats eingebettet sind
3. Diese Anfragen laufen über einen CORS-Proxy, der die nötigen `Access-Control-Allow-Origin`-Header ergänzt
4. Der Proxy liefert die Zertifikatsdaten an den Browser zurück

## Den CORS-Proxy selbst hosten

Wenn Sie BentoPDF selbst hosten, müssen Sie einen eigenen CORS-Proxy bereitstellen, damit digitale Signaturen mit Zertifikaten funktionieren, die einen Abruf der Kette erfordern.

### Option 1: Cloudflare Workers (empfohlen)

1. **Wrangler CLI installieren**:

   ```bash
   npm install -g wrangler
   ```

2. **Bei Cloudflare anmelden**:

   ```bash
   wrangler login
   ```

3. **BentoPDF klonen und erlaubte Origins anpassen**:

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   Öffnen Sie `cors-proxy-worker.js` und änderen Sie das Array `ALLOWED_ORIGINS` auf Ihre Domain:

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning Wichtig
   Ohne diese Änderung lehnt der Proxy alle Anfragen von Ihrer Website mit dem Fehler **403 Forbidden** ab. Standardmäßig sind nur Anfragen von `bentopdf.com` erlaubt.
   :::

4. **Den Proxy bereitstellen**:

   ```bash
   wrangler deploy
   ```

   Notieren Sie sich die URL Ihres Workers (z. B. `https://bentopdf-cors-proxy.your-subdomain.workers.dev`).

5. **BentoPDF mit der Proxy-URL neu bauen**:

   Bei Verwendung von Docker:

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   Beim Bauen aus dem Quellcode:

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### Option 2: Eigener Backend-Proxy

Sie können auch einen eigenen Proxy-Endpunkt erstellen. Die Anforderungen sind:

1. GET-Anfragen mit einem Query-Parameter `url` annehmen
2. Die URL von Ihrem Server aus abrufen (serverseitig gibt es keine CORS-Beschränkungen)
3. Die Antwort mit diesen Headern zurückgeben:
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

Beispielimplementierung mit Express.js:

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

## Sicherheitshinweise

Der mitgelieferte Cloudflare Worker hat mehrere Sicherheitsmaßnahmen:

| Funktion                     | Beschreibung                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------- |
| **Origin-Prüfung**           | Erlaubt nur Anfragen von Domains aus `ALLOWED_ORIGINS`                                          |
| **URL-Beschränkungen**       | Erlaubt nur Zertifikat-URLs (`.crt`, `.cer`, `.pem`, `/certs/`, `/ocsp`, `/crl`)                |
| **Blockierung privater IPs** | Blockiert private IPv4-/IPv6-Bereiche, Link-Local, Loopback, dezimale IPs und Cloud-Metadaten   |
| **Content-Type-Sicherheit**  | Liefert nur sicheren Sie Zertifikat-MIME-Typen, blockiert Content-Type-Injection vom Upstream   |
| **Dateigrößenlimit**         | Streamt die Antwort mit 10MB-Limit und bricht den Download bei Überschreitung ab                |
| **Ratenbegrenzung**          | 60 Anfragen pro Minute pro IP oder IPv6 /64 (erfordert KV, bei KV-Fehlern wird nicht blockiert) |
| **HMAC-Signaturen**          | Optionale clientseitige Signierung (schreckt gelegentlichen Missbrauch ab)                      |

### DNS-Rebinding (Selbst-Hosting außerhalb von Cloudflare)

Der Worker lehnt jede URL ab, die auf eine private oder interne IP aufgelöst wird. Eine feste Allowlist von Hosts ist nicht möglich, da Zertifikatsketten-URLs auf die jeweilige CA verweisen, die das Zertifikat ausgestellt hat (FNMT, Unternehmens-CAs usw.), die Ziele also nicht im Voraus bekannt sind. Dadurch bleibt ein kleines Rebinding-Fenster: Wer das DNS für seine eigene Domain betreibt, könnte der Sicherheitsprüfung eine öffentliche IP liefern und der eigentlichen Anfrage einen Moment später eine private.

Auf Cloudflare ist das nicht ausnutzbar: Workers können weder private IPs noch den Metadaten-Endpunkt `169.254.169.254` erreichen, ein Rebind läuft also ins Leere. Geben Sie dem Worker nur keinen Zugang: Hängen Sie keinen Tunnel, Service oder kein Private-Network-Binding an (er braucht nur `RATE_LIMIT_KV`).

Betreiben Sie ihn außerhalb von Cloudflare (workerd, Node und Ähnliches) in einer VPC, _kann_ die Runtime interne IPs erreichen. Setzen Sie eine Egress-Firewall davor und blockieren Sie die privaten Bereiche: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16` sowie die IPv6-Entsprechungen. Anwendungscode kann das außerhalb von Cloudflare nicht durchsetzen.

## Den Proxy deaktivieren

Wenn Sie keinen CORS-Proxy nutzen möchten, setzen Sie die Umgebungsvariable auf einen leeren String:

```
VITE_CORS_PROXY_URL=
```

**Hinweis**: Ohne den Proxy schlägt das Signieren mit Zertifikaten, die einen externen Abruf der Kette erfordern (wie FNMT oder einige Unternehmens-CAs), mit dem Fehler "Failed to fetch" fehl.

## Fehlerbehebung

### "Signing error: TypeError: Failed to fetch"

Das bedeutet meist eines von beidem:

1. **Kein CORS-Proxy konfiguriert**: Setzen Sie `VITE_CORS_PROXY_URL` und bauen Sie neu
2. **Mixed Content blockiert**: Ihre Website nutzt HTTPS, aber die Aussteller-URL des Zertifikats ist HTTP. Der CORS-Proxy löst das.
3. **CORS-Proxy lehnt Ihren Origin ab**: Prüfen Sie, ob Ihre Domain im Array `ALLOWED_ORIGINS` in `cors-proxy-worker.js` steht

### "403 Forbidden" vom Proxy

Ihre Domain steht nicht in der Liste `ALLOWED_ORIGINS`. Bearbeiten Sie `cors-proxy-worker.js`:

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

Stellen Sie danach erneut bereit: `npx wrangler deploy`

### Den Proxy testen

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### Zertifikate, die ohne Proxy funktionieren

Manche Zertifikate enthalten die vollständige Kette in der P12/PFX-Datei und benötigen keinen externen Abruf:

- Selbstsignierte Zertifikate
- Einige kommerzielle CAs, die Zwischenzertifikate mitliefern
- Zertifikate, die Sie manuell mit der vollständigen Kette zusammengestellt haben
