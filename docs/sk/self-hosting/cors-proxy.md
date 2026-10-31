# CORS proxy na získavanie certifikátov

Nástroj na digitálny podpis používa CORS proxy na získavanie certifikátov vydavateľov od externých certifikačných autorít (CA). Je to potrebné, pretože mnohé servery CA vo svojich odpovediach neuvádzajú hlavičky CORS, čo bráni priamemu získaniu v prehliadači.

Mnohé servery CA navyše poskytujú certifikáty cez obyčajné HTTP. Keď je vaša inštancia BentoPDF hosťovaná cez HTTPS, prehliadače tieto HTTP požiadavky blokujú (politika zmiešaného obsahu). CORS proxy rieši oba problémy tým, že požiadavky smeruje cez HTTPS endpoint so správnymi hlavičkami.

## Ako to funguje

Pri podpisovaní PDF certifikátom:

1. Knižnica `zgapdfsigner` sa pokúsi zostaviť úplný reťazec certifikátov
2. Získava certifikáty vydavateľov z URL vložených v rozšírení AIA (Authority Information Access) vášho certifikátu
3. Tieto požiadavky idú cez CORS proxy, ktorá pridá potrebné hlavičky `Access-Control-Allow-Origin`
4. Proxy vráti údaje certifikátu prehliadaču

## Vlastné hosťovanie CORS proxy

Ak BentoPDF hosťujete sami, musíte nasadiť vlastnú CORS proxy, aby digitálne podpisy fungovali s certifikátmi, ktoré vyžadujú získanie reťazca.

### Možnosť 1: Cloudflare Workers (odporúčané)

1. **Nainštalujte Wrangler CLI**:

   ```bash
   npm install -g wrangler
   ```

2. **Prihláste sa do Cloudflare**:

   ```bash
   wrangler login
   ```

3. **Naklonujte BentoPDF a upravte povolené pôvody**:

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   Otvorte `cors-proxy-worker.js` a zmeňte pole `ALLOWED_ORIGINS` na svoju doménu:

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning Dôležité
   Bez tejto zmeny proxy odmietne všetky požiadavky z vašej stránky s chybou **403 Forbidden**. Predvolene povoľuje len požiadavky z `bentopdf.com`.
   :::

4. **Nasaďte proxy**:

   ```bash
   wrangler deploy
   ```

   Poznačte si URL svojho workera (napr. `https://bentopdf-cors-proxy.your-subdomain.workers.dev`).

5. **Znovu zostavte BentoPDF s URL proxy**:

   Ak používate Docker:

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   Ak zostavujete zo zdrojového kódu:

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### Možnosť 2: Vlastná backendová proxy

Môžete si vytvoriť aj vlastný proxy endpoint. Požiadavky sú:

1. Prijíma GET požiadavky s parametrom dotazu `url`
2. Získa URL zo servera (na strane servera neplatia obmedzenia CORS)
3. Vráti odpoveď s týmito hlavičkami:
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

Príklad implementácie v Express.js:

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

## Bezpečnostné hľadiská

Priložený Cloudflare Worker má niekoľko bezpečnostných opatrení:

| Funkcia                      | Popis                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| **Overenie pôvodu**          | Povoľuje len požiadavky z domén uvedených v `ALLOWED_ORIGINS`                               |
| **Obmedzenia URL**           | Povoľuje len URL certifikátov (`.crt`, `.cer`, `.pem`, `/certs/`, `/ocsp`, `/crl`)          |
| **Blokovanie súkromných IP** | Blokuje súkromné rozsahy IPv4/IPv6, link-local, loopback, desiatkové IP a cloudové metadáta |
| **Bezpečnosť Content-Type**  | Vracia len bezpečné MIME typy certifikátov, blokuje vloženie content-type zo zdroja         |
| **Limit veľkosti súboru**    | Streamuje odpoveď s limitom 10MB, pri prekročení preruší sťahovanie                         |
| **Obmedzenie frekvencie**    | 60 požiadaviek za minútu na IP alebo IPv6 /64 (vyžaduje KV, pri chybách KV prepúšťa)        |
| **HMAC podpisy**             | Voliteľné podpisovanie na strane klienta (odrádza od bežného zneužitia)                     |

### DNS rebinding (vlastné hosťovanie mimo Cloudflare)

Worker odmietne každú URL, ktorá sa preloží na súkromnú alebo internú IP. Nemôže použiť pevný zoznam povolených hostiteľov, pretože URL reťazca certifikátov smerujú na CA, ktorá certifikát vydala (FNMT, firemné CA a podobne), takže ciele nie sú vopred známe. Zostáva tak malé okno pre rebinding: niekto, kto spravuje DNS svojej domény, môže bezpečnostnej kontrole vrátiť verejnú IP a o chvíľu neskôr skutočnej požiadavke súkromnú.

Na Cloudflare sa to nedá zneužiť: Workers nedosiahnu súkromné IP ani metadátový endpoint `169.254.169.254`, takže rebind nikam nevedie. Len workerovi neotvárajte cestu dnu: nepripájajte Tunnel, Service ani väzbu na súkromnú sieť (potrebuje iba `RATE_LIMIT_KV`).

Ak ho prevádzkujete mimo Cloudflare (workerd, Node a podobne) vo VPC, runtime _môže_ dosiahnuť interné IP. Predraďte mu firewall pre odchádzajúcu prevádzku a zablokujte súkromné rozsahy: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16` a ich IPv6 ekvivalenty. Mimo Cloudflare to kód aplikácie vynútiť nedokáže.

## Vypnutie proxy

Ak nechcete používať CORS proxy, nastavte premennú prostredia na prázdny reťazec:

```
VITE_CORS_PROXY_URL=
```

**Poznámka**: Bez proxy zlyhá podpisovanie certifikátmi, ktoré vyžadujú externé získanie reťazca (napríklad FNMT alebo niektoré firemné CA), s chybou „Failed to fetch“.

## Riešenie problémov

### "Signing error: TypeError: Failed to fetch"

Zvyčajne to znamená jedno z toho:

1. **Nie je nastavená CORS proxy**: nastavte `VITE_CORS_PROXY_URL` a znovu zostavte
2. **Zablokovaný zmiešaný obsah**: vaša stránka je na HTTPS, ale URL vydavateľa certifikátu je HTTP. CORS proxy to rieši.
3. **CORS proxy odmieta váš pôvod**: skontrolujte, či je vaša doména v poli `ALLOWED_ORIGINS` v `cors-proxy-worker.js`

### "403 Forbidden" z proxy

Vaša doména nie je v zozname `ALLOWED_ORIGINS`. Upravte `cors-proxy-worker.js`:

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

Potom znovu nasaďte: `npx wrangler deploy`

### Testovanie proxy

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### Certifikáty, ktoré fungujú bez proxy

Niektoré certifikáty obsahujú úplný reťazec v súbore P12/PFX a nevyžadujú externé získavanie:

- Certifikáty podpísané samým sebou
- Niektoré komerčné CA, ktoré pribaľujú medziľahlé certifikáty
- Certifikáty, ktoré ste ručne zostavili s úplným reťazcom
