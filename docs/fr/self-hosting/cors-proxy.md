# Proxy CORS pour la récupération des certificats

L'outil de signature numérique utilise un proxy CORS pour récupérer les certificats des émetteurs auprès d'autorités de certification (AC) externes. C'est nécessaire, car de nombreux serveurs d'AC n'incluent pas d'en-têtes CORS dans leurs réponses, ce qui empêche la récupération directe depuis le navigateur.

De plus, de nombreux serveurs d'AC diffusent leurs certificats en HTTP simple. Lorsque votre instance BentoPDF est servie en HTTPS, les navigateurs bloquent ces requêtes HTTP (politique de contenu mixte). Le proxy CORS résout ces deux problèmes en faisant transiter les requêtes par un point de terminaison HTTPS avec les bons en-têtes.

## Fonctionnement

Lors de la signature d'un PDF avec un certificat :

1. La bibliothèque `zgapdfsigner` tente de construire une chaîne de certificats complète
2. Elle récupère les certificats des émetteurs à partir des URL intégrées à l'extension AIA (Authority Information Access) de votre certificat
3. Ces requêtes passent par un proxy CORS qui ajoute les en-têtes `Access-Control-Allow-Origin` nécessaires
4. Le proxy renvoie les données du certificat au navigateur

## Auto-héberger le proxy CORS

Si vous auto-hébergez BentoPDF, vous devrez déployer votre propre proxy CORS pour que les signatures numériques fonctionnent avec les certificats qui nécessitent la récupération de la chaîne.

### Option 1 : Cloudflare Workers (recommandé)

1. **Installez la CLI Wrangler** :

   ```bash
   npm install -g wrangler
   ```

2. **Connectez-vous à Cloudflare** :

   ```bash
   wrangler login
   ```

3. **Clonez BentoPDF et mettez à jour les origines autorisées** :

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   Ouvrez `cors-proxy-worker.js` et remplacez le tableau `ALLOWED_ORIGINS` par votre domaine :

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning Important
   Sans cette modification, le proxy rejettera toutes les requêtes de votre site avec une erreur **403 Forbidden**. Par défaut, seules les requêtes provenant de `bentopdf.com` sont autorisées.
   :::

4. **Déployez le proxy** :

   ```bash
   wrangler deploy
   ```

   Notez l'URL de votre worker (p. ex. `https://bentopdf-cors-proxy.your-subdomain.workers.dev`).

5. **Recompilez BentoPDF avec l'URL du proxy** :

   Avec Docker :

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   Avec une compilation depuis les sources :

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### Option 2 : proxy backend personnalisé

Vous pouvez aussi créer votre propre point de terminaison proxy. Les exigences sont les suivantes :

1. Accepter les requêtes GET avec un paramètre de requête `url`
2. Récupérer l'URL depuis votre serveur (aucune restriction CORS côté serveur)
3. Renvoyer la réponse avec ces en-têtes :
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

Exemple d'implémentation avec Express.js :

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

## Considérations de sécurité

Le Cloudflare Worker fourni intègre plusieurs mesures de sécurité :

| Fonctionnalité              | Description                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| **Validation de l'origine** | Autorise uniquement les requêtes des domaines listés dans `ALLOWED_ORIGINS`                     |
| **Restrictions d'URL**      | Autorise uniquement les URL de certificats (`.crt`, `.cer`, `.pem`, `/certs/`, `/ocsp`, `/crl`) |
| **Blocage des IP privées**  | Bloque les plages privées IPv4/IPv6, link-local, bouclage, IP décimales et métadonnées cloud    |
| **Sûreté du Content-Type**  | Ne renvoie que des types MIME de certificat sûrs, bloque l'injection de content-type en amont   |
| **Limite de taille**        | Réponse en flux limitée à 10 Mo, interrompue en cours de téléchargement en cas de dépassement   |
| **Limitation de débit**     | 60 requêtes par minute par IP ou IPv6 /64 (nécessite KV, laisse passer en cas d'erreur KV)      |
| **Signatures HMAC**         | Signature côté client facultative (dissuade les abus occasionnels)                              |

### DNS rebinding (auto-hébergement hors Cloudflare)

Le worker rejette toute URL qui se résout vers une IP privée ou interne. Il ne peut pas utiliser une liste fixe d'hôtes autorisés, car les URL des chaînes de certificats pointent vers l'AC qui a émis le certificat (FNMT, AC d'entreprise, etc.), donc les destinations ne sont pas connues à l'avance. Il reste une petite fenêtre de rebinding : une personne qui gère le DNS de son propre domaine pourrait renvoyer une IP publique lors du contrôle de sécurité, puis une IP privée pour la vraie requête un instant plus tard.

Sur Cloudflare, ce n'est pas exploitable : les Workers ne peuvent pas atteindre les IP privées ni le point de terminaison de métadonnées `169.254.169.254`, donc un rebinding n'aboutit à rien. Ne donnez simplement pas au worker de voie d'accès : n'associez ni Tunnel, ni Service, ni binding de réseau privé (il n'a besoin que de `RATE_LIMIT_KV`).

Si vous l'exécutez hors de Cloudflare (workerd, Node, etc.) dans un VPC, le runtime _peut_ atteindre les IP internes. Placez un pare-feu de sortie devant lui et bloquez les plages privées : `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16` et leurs équivalents IPv6. Le code de l'application ne peut pas l'imposer une fois hors de Cloudflare.

## Désactiver le proxy

Si vous ne souhaitez pas utiliser de proxy CORS, définissez la variable d'environnement sur une chaîne vide :

```
VITE_CORS_PROXY_URL=
```

**Remarque** : sans le proxy, la signature avec des certificats qui nécessitent la récupération externe de la chaîne (comme FNMT ou certaines AC d'entreprise) échouera avec une erreur « Failed to fetch ».

## Dépannage

### « Signing error: TypeError: Failed to fetch »

Cela signifie généralement :

1. **Aucun proxy CORS configuré** : définissez `VITE_CORS_PROXY_URL` et recompilez
2. **Contenu mixte bloqué** : votre site est en HTTPS mais l'URL de l'émetteur du certificat est en HTTP. Le proxy CORS résout ce problème.
3. **Le proxy CORS rejette votre origine** : vérifiez que votre domaine figure dans le tableau `ALLOWED_ORIGINS` de `cors-proxy-worker.js`

### « 403 Forbidden » renvoyé par le proxy

Votre domaine ne figure pas dans la liste `ALLOWED_ORIGINS`. Modifiez `cors-proxy-worker.js` :

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

Redéployez ensuite : `npx wrangler deploy`

### Tester le proxy

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### Certificats qui fonctionnent sans proxy

Certains certificats incluent la chaîne complète dans le fichier P12/PFX et ne nécessitent pas de récupération externe :

- Certificats auto-signés
- Certaines AC commerciales qui regroupent les certificats intermédiaires
- Certificats que vous avez assemblés manuellement avec la chaîne complète
