# CORS-proxy för hämtning av certifikat

Verktyget för digitala signaturer använder en CORS-proxy för att hämta utfärdarcertifikat från externa certifikatutfärdare (CA). Det behövs eftersom många CA-servrar inte inkluderar CORS-rubriker i sina svar, vilket hindrar direkt hämtning från webbläsaren.

Dessutom serverar många CA-servrar certifikat över vanlig HTTP. När din BentoPDF-instans hostas över HTTPS blockerar webbläsare dessa HTTP-förfrågningar (policy för blandat innehåll). CORS-proxyn löser båda problemen genom att dirigera förfrågningar via en HTTPS-ändpunkt med rätt rubriker.

## Så fungerar det

När du signerar en PDF med ett certifikat:

1. Biblioteket `zgapdfsigner` försöker bygga en komplett certifikatkedja
2. Det hämtar utfärdarcertifikat från URL:er som finns i ditt certifikats AIA-tillägg (Authority Information Access)
3. Förfrågningarna dirigeras via en CORS-proxy som lägger till de nödvändiga `Access-Control-Allow-Origin`-rubrikerna
4. Proxyn returnerar certifikatdata till webbläsaren

## Självhosta CORS-proxyn

Om du självhostar BentoPDF måste du driftsätta din egen CORS-proxy för att digitala signaturer ska fungera med certifikat som kräver hämtning av kedjan.

### Alternativ 1: Cloudflare Workers (rekommenderas)

1. **Installera Wrangler CLI**:

   ```bash
   npm install -g wrangler
   ```

2. **Logga in på Cloudflare**:

   ```bash
   wrangler login
   ```

3. **Klona BentoPDF och uppdatera tillåtna ursprung**:

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   Öppna `cors-proxy-worker.js` och ändra arrayen `ALLOWED_ORIGINS` till din domän:

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning Viktigt
   Utan den här ändringen avvisar proxyn alla förfrågningar från din webbplats med felet **403 Forbidden**. Standardinställningen tillåter bara förfrågningar från `bentopdf.com`.
   :::

4. **Driftsätt proxyn**:

   ```bash
   wrangler deploy
   ```

   Anteckna din worker-URL (t.ex. `https://bentopdf-cors-proxy.your-subdomain.workers.dev`).

5. **Bygg om BentoPDF med proxy-URL:en**:

   Om du använder Docker:

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   Om du bygger från källkod:

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### Alternativ 2: Egen backend-proxy

Du kan också skapa din egen proxy-ändpunkt. Kraven är:

1. Ta emot GET-förfrågningar med en frågeparameter `url`
2. Hämta URL:en från din server (inga CORS-begränsningar på serversidan)
3. Returnera svaret med dessa rubriker:
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

Exempel på en implementation i Express.js:

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

## Säkerhetsaspekter

Den medföljande Cloudflare Worker har flera säkerhetsåtgärder:

| Funktion                     | Beskrivning                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Ursprungsvalidering**      | Tillåter bara förfrågningar från domäner i `ALLOWED_ORIGINS`                                           |
| **URL-begränsningar**        | Tillåter bara certifikat-URL:er (`.crt`, `.cer`, `.pem`, `/certs/`, `/ocsp`, `/crl`)                   |
| **Blockering av privata IP** | Blockerar privata IPv4/IPv6-intervall, link-local, loopback, decimala IP-adresser och moln-metadata    |
| **Content-Type-säkerhet**    | Returnerar bara säkra MIME-typer för certifikat och blockerar injektion av content-type från uppströms |
| **Filstorleksgräns**         | Strömmar svaret med 10MB-gräns och avbryter nedladdningen om den överskrids                            |
| **Hastighetsbegränsning**    | 60 förfrågningar per minut per IP eller IPv6 /64 (kräver KV, tillåter vid KV-fel)                      |
| **HMAC-signaturer**          | Valfri signering på klientsidan (avskräcker enkelt missbruk)                                           |

### DNS rebinding (självhosting utanför Cloudflare)

Workern avvisar alla URL:er som löser till en privat eller intern IP. Den kan inte använda en fast tillåtelselista med värdar, eftersom URL:erna i certifikatkedjor pekar på den CA som utfärdade certifikatet (FNMT, företags-CA:er och så vidare), så destinationerna är inte kända i förväg. Det lämnar ett litet rebinding-fönster: den som kör DNS för sin egen domän kan ge en publik IP till säkerhetskontrollen och en privat IP till den riktiga förfrågan ett ögonblick senare.

På Cloudflare går detta inte att utnyttja: Workers kan inte nå privata IP-adresser eller metadata-ändpunkten `169.254.169.254`, så en rebind leder ingenstans. Ge bara inte workern en väg in: koppla inte på en Tunnel, Service eller privat nätverksbindning (den behöver bara `RATE_LIMIT_KV`).

Om du kör detta utanför Cloudflare (workerd, Node och liknande) inuti ett VPC _kan_ körmiljön nå interna IP-adresser. Sätt en egress-brandvägg framför och blockera de privata intervallen: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16` och deras IPv6-motsvarigheter. Appkod kan inte upprätthålla det när du inte längre är på Cloudflare.

## Inaktivera proxyn

Om du inte vill använda en CORS-proxy, sätt miljövariabeln till en tom sträng:

```
VITE_CORS_PROXY_URL=
```

**Obs**: Utan proxyn misslyckas signering med certifikat som kräver extern hämtning av kedjan (som FNMT eller vissa företags-CA:er) med felet "Failed to fetch".

## Felsökning

### "Signing error: TypeError: Failed to fetch"

Det betyder oftast något av följande:

1. **Ingen CORS-proxy konfigurerad**: ange `VITE_CORS_PROXY_URL` och bygg om
2. **Blandat innehåll blockerat**: din webbplats använder HTTPS men certifikatets utfärdar-URL använder HTTP. CORS-proxyn löser detta.
3. **CORS-proxyn avvisar ditt ursprung**: kontrollera att din domän finns i arrayen `ALLOWED_ORIGINS` i `cors-proxy-worker.js`

### "403 Forbidden" från proxyn

Din domän finns inte i listan `ALLOWED_ORIGINS`. Redigera `cors-proxy-worker.js`:

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

Driftsätt sedan igen: `npx wrangler deploy`

### Testa proxyn

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### Certifikat som fungerar utan proxy

Vissa certifikat innehåller hela kedjan i P12/PFX-filen och kräver ingen extern hämtning:

- Självsignerade certifikat
- Vissa kommersiella CA:er som paketerar mellancertifikat
- Certifikat som du själv har satt ihop med hela kedjan
