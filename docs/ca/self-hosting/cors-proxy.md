# Proxy CORS per obtenir certificats

L'eina de signatura digital utilitza un proxy CORS per obtenir els certificats dels emissors a les autoritats de certificació (CA) externes. Això és necessari perquè molts servidors de CA no inclouen capçaleres CORS a les respostes, cosa que impedeix la consulta directa des del navegador.

A més, molts servidors de CA serveixen els certificats per HTTP sense xifrar. Quan la teva instància de BentoPDF s'allotja per HTTPS, els navegadors bloquegen aquestes peticions HTTP (política de contingut mixt). El proxy CORS resol tots dos problemes encaminant les peticions per un punt final HTTPS amb les capçaleres adequades.

## Com funciona

Quan signes un PDF amb un certificat:

1. La biblioteca `zgapdfsigner` intenta construir una cadena de certificats completa
2. Obté els certificats dels emissors a partir de les URL incrustades a l'extensió AIA (Authority Information Access) del teu certificat
3. Aquestes peticions passen per un proxy CORS que afegeix les capçaleres `Access-Control-Allow-Origin` necessàries
4. El proxy retorna les dades del certificat al navegador

## Autoallotjar el proxy CORS

Si autoallotges BentoPDF, hauràs de desplegar el teu propi proxy CORS perquè les signatures digitals funcionin amb certificats que requereixen obtenir la cadena.

### Opció 1: Cloudflare Workers (recomanada)

1. **Instal·la la CLI de Wrangler**:

   ```bash
   npm install -g wrangler
   ```

2. **Inicia sessió a Cloudflare**:

   ```bash
   wrangler login
   ```

3. **Clona BentoPDF i actualitza els orígens permesos**:

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   Obre `cors-proxy-worker.js` i canvia l'array `ALLOWED_ORIGINS` pel teu domini:

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning Important
   Sense aquest canvi, el proxy rebutjarà totes les peticions del teu lloc amb un error **403 Forbidden**. Per defecte, només permet peticions de `bentopdf.com`.
   :::

4. **Desplega el proxy**:

   ```bash
   wrangler deploy
   ```

   Anota la URL del worker (p. ex., `https://bentopdf-cors-proxy.your-subdomain.workers.dev`).

5. **Torna a compilar BentoPDF amb la URL del proxy**:

   Si utilitzes Docker:

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   Si compiles des del codi font:

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### Opció 2: proxy de backend propi

També pots crear el teu propi punt final de proxy. Els requisits són:

1. Acceptar peticions GET amb un paràmetre de consulta `url`
2. Obtenir la URL des del teu servidor (sense restriccions CORS al servidor)
3. Retornar la resposta amb aquestes capçaleres:
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

Exemple d'implementació amb Express.js:

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

## Consideracions de seguretat

El Cloudflare Worker inclòs té diverses mesures de seguretat:

| Funció                         | Descripció                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| **Validació d'origen**         | Només permet peticions dels dominis llistats a `ALLOWED_ORIGINS`                                        |
| **Restriccions d'URL**         | Només permet URL de certificats (`.crt`, `.cer`, `.pem`, `/certs/`, `/ocsp`, `/crl`)                    |
| **Bloqueig d'IP privades**     | Bloqueja intervals privats IPv4/IPv6, d'enllaç local, de bucle local, IP decimals i metadades del núvol |
| **Seguretat del Content-Type** | Només retorna tipus MIME de certificats segurs i bloqueja la injecció de content-type des de l'origen   |
| **Límit de mida**              | Transmet la resposta amb un límit de 10MB i l'interromp a mitja descàrrega si se supera                 |
| **Límit de freqüència**        | 60 peticions per minut per IP o IPv6 /64 (requereix KV, no bloqueja si KV falla)                        |
| **Signatures HMAC**            | Signatura opcional al client (dissuadeix l'abús casual)                                                 |

### DNS rebinding (autoallotjament fora de Cloudflare)

El worker rebutja qualsevol URL que es resolgui a una IP privada o interna. No pot utilitzar una llista fixa de servidors permesos, ja que les URL de la cadena de certificats apunten a qualsevol CA que hagi emès el certificat (FNMT, CA corporatives, etc.), de manera que les destinacions no es coneixen per endavant. Això deixa una petita finestra de rebinding: algú que gestioni el DNS del seu propi domini podria donar una IP pública a la comprovació de seguretat i una de privada a la petició real un moment després.

A Cloudflare no es pot explotar: els Workers no poden accedir a IP privades ni al punt final de metadades `169.254.169.254`, així que un rebinding no arriba enlloc. Només cal no donar al worker cap via d'entrada: no hi associïs cap Tunnel, Service ni enllaç de xarxa privada (només necessita `RATE_LIMIT_KV`).

Si l'executes fora de Cloudflare (workerd, Node i similars) dins d'una VPC, l'entorn _sí_ pot accedir a IP internes. Posa-hi al davant un tallafoc de sortida i bloqueja els intervals privats: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16` i els seus equivalents IPv6. El codi de l'aplicació no ho pot garantir un cop fora de Cloudflare.

## Desactivar el proxy

Si no vols utilitzar un proxy CORS, defineix la variable d'entorn amb una cadena buida:

```
VITE_CORS_PROXY_URL=
```

**Nota**: sense el proxy, la signatura amb certificats que requereixen obtenir la cadena externament (com FNMT o algunes CA corporatives) fallarà amb l'error "Failed to fetch".

## Resolució de problemes

### "Signing error: TypeError: Failed to fetch"

Normalment vol dir una d'aquestes coses:

1. **No hi ha cap proxy CORS configurat**: defineix `VITE_CORS_PROXY_URL` i torna a compilar
2. **Contingut mixt bloquejat**: el teu lloc és HTTPS però la URL de l'emissor del certificat és HTTP. El proxy CORS ho resol.
3. **El proxy CORS rebutja el teu origen**: comprova que el teu domini és a l'array `ALLOWED_ORIGINS` de `cors-proxy-worker.js`

### "403 Forbidden" del proxy

El teu domini no és a la llista `ALLOWED_ORIGINS`. Edita `cors-proxy-worker.js`:

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

Després torna a desplegar: `npx wrangler deploy`

### Provar el proxy

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### Certificats que funcionen sense proxy

Alguns certificats inclouen la cadena completa al fitxer P12/PFX i no requereixen obtenir res externament:

- Certificats autosignats
- Algunes CA comercials que inclouen els certificats intermedis
- Certificats que has muntat manualment amb la cadena completa
