# Proxy CORS per il recupero dei certificati

Lo strumento di firma digitale usa un proxy CORS per recuperare i certificati degli emittenti da Certificate Authority (CA) esterne. È necessario perché molti server delle CA non includono header CORS nelle risposte, il che impedisce il recupero diretto dal browser.

Inoltre, molti server delle CA distribuiscono i certificati tramite HTTP semplice. Quando la tua istanza di BentoPDF è ospitata su HTTPS, i browser bloccano queste richieste HTTP (policy sui contenuti misti). Il proxy CORS risolve entrambi i problemi instradando le richieste attraverso un endpoint HTTPS con gli header corretti.

## Come funziona

Quando firmi un PDF con un certificato:

1. La libreria `zgapdfsigner` cerca di costruire una catena di certificati completa
2. Recupera i certificati degli emittenti dagli URL incorporati nell'estensione AIA (Authority Information Access) del tuo certificato
3. Queste richieste passano attraverso un proxy CORS che aggiunge gli header `Access-Control-Allow-Origin` necessari
4. Il proxy restituisce al browser i dati del certificato

## Self-hosting del proxy CORS

Se ospiti BentoPDF in autonomia, dovrai distribuire un tuo proxy CORS affinché le firme digitali funzionino con i certificati che richiedono il recupero della catena.

### Opzione 1: Cloudflare Workers (consigliata)

1. **Installa la CLI di Wrangler**:

   ```bash
   npm install -g wrangler
   ```

2. **Accedi a Cloudflare**:

   ```bash
   wrangler login
   ```

3. **Clona BentoPDF e aggiorna le origini consentite**:

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   Apri `cors-proxy-worker.js` e modifica l'array `ALLOWED_ORIGINS` con il tuo dominio:

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning Importante
   Senza questa modifica, il proxy rifiuterà tutte le richieste dal tuo sito con un errore **403 Forbidden**. L'impostazione predefinita consente solo le richieste da `bentopdf.com`.
   :::

4. **Distribuisci il proxy**:

   ```bash
   wrangler deploy
   ```

   Annota l'URL del tuo worker (es. `https://bentopdf-cors-proxy.your-subdomain.workers.dev`).

5. **Ricompila BentoPDF con l'URL del proxy**:

   Se usi Docker:

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   Se compili dai sorgenti:

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### Opzione 2: proxy backend personalizzato

Puoi anche creare un tuo endpoint proxy. I requisiti sono:

1. Accettare richieste GET con un parametro di query `url`
2. Recuperare l'URL dal tuo server (nessuna restrizione CORS lato server)
3. Restituire la risposta con questi header:
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

Esempio di implementazione con Express.js:

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

## Considerazioni sulla sicurezza

Il Cloudflare Worker incluso adotta diverse misure di sicurezza:

| Funzionalità                   | Descrizione                                                                                        |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| **Convalida dell'origine**     | Consente solo richieste dai domini elencati in `ALLOWED_ORIGINS`                                   |
| **Restrizioni sugli URL**      | Consente solo URL di certificati (`.crt`, `.cer`, `.pem`, `/certs/`, `/ocsp`, `/crl`)              |
| **Blocco degli IP privati**    | Blocca intervalli privati IPv4/IPv6, link-local, loopback, IP decimali e metadati cloud            |
| **Sicurezza del Content-Type** | Restituisce solo tipi MIME di certificati sicuri, blocca l'iniezione di content-type dall'upstream |
| **Limite di dimensione**       | Trasmette la risposta in streaming con limite di 10MB, interrompe il download se superato          |
| **Limitazione di frequenza**   | 60 richieste al minuto per IP o IPv6 /64 (richiede KV, nessun blocco in caso di errori di KV)      |
| **Firme HMAC**                 | Firma facoltativa lato client (scoraggia gli abusi occasionali)                                    |

### DNS rebinding (self-hosting fuori da Cloudflare)

Il worker rifiuta qualsiasi URL che si risolve in un IP privato o interno. Non può usare un elenco fisso di host consentiti, perché gli URL della catena di certificati puntano a qualunque CA abbia emesso il certificato (FNMT, CA aziendali e così via), quindi le destinazioni non sono note in anticipo. Resta così una piccola finestra di rebinding: chi gestisce il DNS del proprio dominio potrebbe restituire un IP pubblico al controllo di sicurezza e uno privato alla richiesta vera e propria un istante dopo.

Su Cloudflare non è sfruttabile: i Workers non possono raggiungere IP privati né l'endpoint di metadati `169.254.169.254`, quindi un rebind non porta a nulla. Basta non dare al worker una via d'accesso: non associare un Tunnel, un Service o un binding di rete privata (gli serve solo `RATE_LIMIT_KV`).

Se lo esegui fuori da Cloudflare (workerd, Node e simili) all'interno di una VPC, il runtime _può_ raggiungere gli IP interni. Metti davanti un firewall in uscita e blocca gli intervalli privati: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16` e i rispettivi equivalenti IPv6. Il codice dell'app non può imporlo una volta fuori da Cloudflare.

## Disattivare il proxy

Se non vuoi usare un proxy CORS, imposta la variabile d'ambiente su una stringa vuota:

```
VITE_CORS_PROXY_URL=
```

**Nota**: senza il proxy, la firma con certificati che richiedono il recupero esterno della catena (come FNMT o alcune CA aziendali) fallirà con l'errore "Failed to fetch".

## Risoluzione dei problemi

### "Signing error: TypeError: Failed to fetch"

Di solito significa una di queste cose:

1. **Nessun proxy CORS configurato**: imposta `VITE_CORS_PROXY_URL` e ricompila
2. **Contenuti misti bloccati**: il tuo sito è in HTTPS ma l'URL dell'emittente del certificato è in HTTP. Il proxy CORS risolve il problema.
3. **Il proxy CORS rifiuta la tua origine**: verifica che il tuo dominio sia nell'array `ALLOWED_ORIGINS` in `cors-proxy-worker.js`

### "403 Forbidden" dal proxy

Il tuo dominio non è nell'elenco `ALLOWED_ORIGINS`. Modifica `cors-proxy-worker.js`:

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

Poi ridistribuisci: `npx wrangler deploy`

### Testare il proxy

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### Certificati che funzionano senza proxy

Alcuni certificati includono la catena completa nel file P12/PFX e non richiedono recuperi esterni:

- Certificati autofirmati
- Alcune CA commerciali che includono i certificati intermedi
- Certificati che hai assemblato manualmente con la catena completa
