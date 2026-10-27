# CORS-proxy voor het ophalen van certificaten

De tool voor digitale handtekeningen gebruikt een CORS-proxy om uitgevers-certificaten op te halen bij externe certificeringsinstanties (CA's). Dat is nodig omdat veel CA-servers geen CORS-headers in hun antwoorden opnemen, waardoor rechtstreeks ophalen vanuit de browser niet lukt.

Bovendien leveren veel CA-servers certificaten via gewoon HTTP. Wanneer je BentoPDF-instantie via HTTPS wordt gehost, blokkeren browsers deze HTTP-verzoeken (mixed content-beleid). De CORS-proxy lost beide problemen op door verzoeken via een HTTPS-eindpunt met de juiste headers te routeren.

## Hoe het werkt

Bij het ondertekenen van een PDF met een certificaat:

1. De bibliotheek `zgapdfsigner` probeert een volledige certificaatketen op te bouwen
2. Ze haalt uitgevers-certificaten op via URL's in de AIA-extensie (Authority Information Access) van je certificaat
3. Deze verzoeken lopen via een CORS-proxy die de benodigde `Access-Control-Allow-Origin`-headers toevoegt
4. De proxy stuurt de certificaatgegevens terug naar de browser

## De CORS-proxy zelf hosten

Host je BentoPDF zelf, dan moet je een eigen CORS-proxy implementeren, zodat digitale handtekeningen werken met certificaten waarvoor de keten moet worden opgehaald.

### Optie 1: Cloudflare Workers (aanbevolen)

1. **Installeer de Wrangler CLI**:

   ```bash
   npm install -g wrangler
   ```

2. **Log in bij Cloudflare**:

   ```bash
   wrangler login
   ```

3. **Clone BentoPDF en pas de toegestane origins aan**:

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   Open `cors-proxy-worker.js` en verander de array `ALLOWED_ORIGINS` naar je eigen domein:

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning Belangrijk
   Zonder deze wijziging weigert de proxy alle verzoeken van je site met een **403 Forbidden**-fout. Standaard worden alleen verzoeken van `bentopdf.com` toegestaan.
   :::

4. **Implementeer de proxy**:

   ```bash
   wrangler deploy
   ```

   Noteer de URL van je worker (bijv. `https://bentopdf-cors-proxy.your-subdomain.workers.dev`).

5. **Bouw BentoPDF opnieuw met de proxy-URL**:

   Met Docker:

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   Bouwen vanuit de broncode:

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### Optie 2: Eigen backendproxy

Je kunt ook je eigen proxy-eindpunt maken. De vereisten zijn:

1. Accepteer GET-verzoeken met een queryparameter `url`
2. Haal de URL op vanaf je server (aan de serverkant gelden geen CORS-beperkingen)
3. Retourneer het antwoord met deze headers:
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

Voorbeeldimplementatie met Express.js:

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

## Beveiligingsoverwegingen

De meegeleverde Cloudflare Worker heeft diverse beveiligingsmaatregelen:

| Functie                     | Beschrijving                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Origin-validatie**        | Staat alleen verzoeken toe van domeinen in `ALLOWED_ORIGINS`                                            |
| **URL-beperkingen**         | Staat alleen certificaat-URL's toe (`.crt`, `.cer`, `.pem`, `/certs/`, `/ocsp`, `/crl`)                 |
| **Blokkering privé-IP's**   | Blokkeert privébereiken van IPv4/IPv6, link-local, loopback, decimale IP's en cloud-metadata            |
| **Content-Type-veiligheid** | Retourneert alleen veilige MIME-typen voor certificaten en blokkeert injectie van upstream content-type |
| **Bestandsgroottelimiet**   | Streamt het antwoord met een limiet van 10MB en breekt halverwege de download af bij overschrijding     |
| **Rate limiting**           | 60 verzoeken per minuut per IP of IPv6 /64 (vereist KV, laat verkeer door bij KV-fouten)                |
| **HMAC-handtekeningen**     | Optionele ondertekening aan de clientzijde (ontmoedigt gelegenheidsmisbruik)                            |

### DNS-rebinding (zelf hosten buiten Cloudflare)

De worker weigert elke URL die naar een privé- of intern IP verwijst. Een vaste allowlist van hosts is niet mogelijk, omdat URL's in certificaatketens verwijzen naar de CA die het certificaat heeft uitgegeven (FNMT, bedrijfs-CA's enzovoort), dus de bestemmingen zijn vooraf niet bekend. Daardoor blijft een klein rebinding-venster over: wie de DNS van een eigen domein beheert, kan de veiligheidscontrole een publiek IP geven en het echte verzoek even later een privé-IP.

Op Cloudflare is dit niet te misbruiken: Workers kunnen geen privé-IP's of het metadata-eindpunt `169.254.169.254` bereiken, dus een rebind komt nergens uit. Geef de worker alleen geen toegang naar binnen: koppel geen Tunnel, Service of privénetwerkbinding (hij heeft alleen `RATE_LIMIT_KV` nodig).

Draai je dit buiten Cloudflare (workerd, Node en dergelijke) in een VPC, dan _kan_ de runtime interne IP's bereiken. Zet er een egress-firewall voor en blokkeer de privébereiken: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16` en hun IPv6-equivalenten. Applicatiecode kan dat niet afdwingen zodra je buiten Cloudflare draait.

## De proxy uitschakelen

Wil je geen CORS-proxy gebruiken, stel de omgevingsvariabele dan in op een lege string:

```
VITE_CORS_PROXY_URL=
```

**Opmerking**: Zonder de proxy mislukt het ondertekenen met certificaten waarvoor de keten extern moet worden opgehaald (zoals FNMT of sommige bedrijfs-CA's) met de foutmelding "Failed to fetch".

## Probleemoplossing

### "Signing error: TypeError: Failed to fetch"

Dit betekent meestal een van deze dingen:

1. **Geen CORS-proxy geconfigureerd**: stel `VITE_CORS_PROXY_URL` in en bouw opnieuw
2. **Mixed content geblokkeerd**: je site is HTTPS, maar de uitgevers-URL van het certificaat is HTTP. De CORS-proxy lost dit op.
3. **CORS-proxy weigert je origin**: controleer of je domein in de array `ALLOWED_ORIGINS` in `cors-proxy-worker.js` staat

### "403 Forbidden" van de proxy

Je domein staat niet in de lijst `ALLOWED_ORIGINS`. Bewerk `cors-proxy-worker.js`:

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

Implementeer daarna opnieuw: `npx wrangler deploy`

### De proxy testen

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### Certificaten die zonder proxy werken

Sommige certificaten bevatten de volledige keten in het P12/PFX-bestand en hoeven niets extern op te halen:

- Zelfondertekende certificaten
- Sommige commerciële CA's die tussencertificaten meeleveren
- Certificaten die je handmatig met de volledige keten hebt samengesteld
