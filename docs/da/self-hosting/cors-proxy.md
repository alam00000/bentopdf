# CORS-proxy til hentning af certifikater

Værktøjet til digital signatur bruger en CORS-proxy til at hente udstedercertifikater fra eksterne certifikatudstedere (CA'er). Det er nødvendigt, fordi mange CA-servere ikke inkluderer CORS-headere i deres svar, hvilket forhindrer direkte hentning fra browseren.

Derudover udleverer mange CA-servere certifikater over almindelig HTTP. Når din BentoPDF-instans hostes over HTTPS, blokerer browsere disse HTTP-forespørgsler (mixed content-politik). CORS-proxyen løser begge problemer ved at route forespørgsler gennem et HTTPS-endpoint med de rette headere.

## Sådan fungerer det

Når du signerer en PDF med et certifikat:

1. Biblioteket `zgapdfsigner` forsøger at bygge en komplet certifikatkæde
2. Det henter udstedercertifikater fra URL'er indlejret i dit certifikats AIA-udvidelse (Authority Information Access)
3. Disse forespørgsler routes gennem en CORS-proxy, der tilføjer de nødvendige `Access-Control-Allow-Origin`-headere
4. Proxyen returnerer certifikatdata til browseren

## Selvhosting af CORS-proxyen

Hvis du selvhoster BentoPDF, skal du installere din egen CORS-proxy, for at digitale signaturer virker med certifikater, der kræver hentning af kæden.

### Mulighed 1: Cloudflare Workers (anbefales)

1. **Installer Wrangler CLI**:

   ```bash
   npm install -g wrangler
   ```

2. **Log ind på Cloudflare**:

   ```bash
   wrangler login
   ```

3. **Klon BentoPDF og opdater tilladte origins**:

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   Åbn `cors-proxy-worker.js` og ret arrayet `ALLOWED_ORIGINS` til dit domæne:

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning Vigtigt
   Uden denne ændring afviser proxyen alle forespørgsler fra dit site med fejlen **403 Forbidden**. Standarden tillader kun forespørgsler fra `bentopdf.com`.
   :::

4. **Installer proxyen**:

   ```bash
   wrangler deploy
   ```

   Notér din worker-URL (f.eks. `https://bentopdf-cors-proxy.your-subdomain.workers.dev`).

5. **Genbyg BentoPDF med proxy-URL'en**:

   Hvis du bruger Docker:

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   Hvis du bygger fra kildekode:

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### Mulighed 2: Egen backend-proxy

Du kan også oprette dit eget proxy-endpoint. Kravene er:

1. Acceptér GET-forespørgsler med en `url`-forespørgselsparameter
2. Hent URL'en fra din server (ingen CORS-begrænsninger på serversiden)
3. Returnér svaret med disse headere:
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

Eksempel på en implementering i Express.js:

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

## Sikkerhedsovervejelser

Den medfølgende Cloudflare Worker har flere sikkerhedsforanstaltninger:

| Funktion                       | Beskrivelse                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| **Origin-validering**          | Tillader kun forespørgsler fra domæner på listen `ALLOWED_ORIGINS`                               |
| **URL-begrænsninger**          | Tillader kun certifikat-URL'er (`.crt`, `.cer`, `.pem`, `/certs/`, `/ocsp`, `/crl`)              |
| **Blokering af private IP'er** | Blokerer private IPv4/IPv6-områder, link-local, loopback, decimale IP'er og cloud-metadata       |
| **Content-Type-sikkerhed**     | Returnerer kun sikre MIME-typer for certifikater og blokerer content-type-injektion fra upstream |
| **Filstørrelsesgrænse**        | Streamer svaret med en grænse på 10MB og afbryder midt i overførslen, hvis den overskrides       |
| **Rate limiting**              | 60 forespørgsler pr. minut pr. IP eller IPv6 /64 (kræver KV, fejler åbent ved KV-fejl)           |
| **HMAC-signaturer**            | Valgfri signering på klientsiden (afskrækker tilfældigt misbrug)                                 |

### DNS rebinding (selvhosting uden for Cloudflare)

Workeren afviser enhver URL, der resolver til en privat eller intern IP. Den kan ikke bruge en fast tilladelsesliste over værter, fordi URL'er i certifikatkæder peger på den CA, der har udstedt certifikatet (FNMT, virksomheders CA'er og så videre), så destinationerne kendes ikke på forhånd. Det efterlader et lille rebinding-vindue: en person, der driver DNS for sit eget domæne, kan give sikkerhedstjekket en offentlig IP og den egentlige forespørgsel en privat lidt senere.

På Cloudflare kan det ikke udnyttes: Workers kan ikke nå private IP'er eller metadata-endpointet `169.254.169.254`, så en rebind rammer ingenting. Giv bare ikke workeren en vej ind: tilknyt ikke en Tunnel, Service eller binding til et privat netværk (den behøver kun `RATE_LIMIT_KV`).

Hvis du kører den uden for Cloudflare (workerd, Node og lignende) i en VPC, _kan_ runtime'en nå interne IP'er. Sæt en egress-firewall foran, og bloker de private områder: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16` og deres IPv6-ækvivalenter. Det kan applikationskode ikke håndhæve, når du er uden for Cloudflare.

## Deaktivering af proxyen

Hvis du ikke vil bruge en CORS-proxy, så sæt miljøvariablen til en tom streng:

```
VITE_CORS_PROXY_URL=
```

**Bemærk**: Uden proxyen mislykkes signering med certifikater, der kræver ekstern hentning af kæden (som FNMT eller nogle virksomheders CA'er), med fejlen "Failed to fetch".

## Fejlfinding

### "Signing error: TypeError: Failed to fetch"

Det betyder normalt enten:

1. **Ingen CORS-proxy konfigureret**: Sæt `VITE_CORS_PROXY_URL` og genbyg
2. **Mixed content blokeret**: Dit site bruger HTTPS, men certifikatets udsteder-URL er HTTP. CORS-proxyen løser dette.
3. **CORS-proxyen afviser din origin**: Tjek, at dit domæne står i arrayet `ALLOWED_ORIGINS` i `cors-proxy-worker.js`

### "403 Forbidden" fra proxyen

Dit domæne står ikke på listen `ALLOWED_ORIGINS`. Rediger `cors-proxy-worker.js`:

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

Installer derefter igen: `npx wrangler deploy`

### Test af proxyen

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### Certifikater, der virker uden proxy

Nogle certifikater indeholder hele kæden i P12/PFX-filen og kræver ikke ekstern hentning:

- Selvsignerede certifikater
- Nogle kommercielle CA'er, der medsender mellemliggende certifikater
- Certifikater, du selv har samlet med hele kæden
