# Proxy CORS do pobierania certyfikatów

Narzędzie podpisu cyfrowego używa proxy CORS do pobierania certyfikatów wystawców z zewnętrznych urzędów certyfikacji (CA). Jest to konieczne, ponieważ wiele serwerów CA nie dołącza nagłówków CORS do odpowiedzi, co uniemożliwia bezpośrednie pobieranie z poziomu przeglądarki.

Ponadto wiele serwerów CA udostępnia certyfikaty przez zwykłe HTTP. Gdy Twoja instancja BentoPDF jest hostowana przez HTTPS, przeglądarki blokują takie żądania HTTP (zasada mixed content). Proxy CORS rozwiązuje oba problemy, kierując żądania przez punkt końcowy HTTPS z odpowiednimi nagłówkami.

## Jak to działa

Podczas podpisywania pliku PDF certyfikatem:

1. Biblioteka `zgapdfsigner` próbuje zbudować pełny łańcuch certyfikatów
2. Pobiera certyfikaty wystawców z adresów URL zapisanych w rozszerzeniu AIA (Authority Information Access) Twojego certyfikatu
3. Te żądania są kierowane przez proxy CORS, które dodaje wymagane nagłówki `Access-Control-Allow-Origin`
4. Proxy zwraca dane certyfikatu do przeglądarki

## Samodzielny hosting proxy CORS

Jeśli hostujesz BentoPDF samodzielnie, musisz wdrożyć własne proxy CORS, aby podpisy cyfrowe działały z certyfikatami wymagającymi pobrania łańcucha.

### Opcja 1: Cloudflare Workers (zalecana)

1. **Zainstaluj Wrangler CLI**:

   ```bash
   npm install -g wrangler
   ```

2. **Zaloguj się do Cloudflare**:

   ```bash
   wrangler login
   ```

3. **Sklonuj BentoPDF i zaktualizuj dozwolone źródła**:

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   Otwórz `cors-proxy-worker.js` i zmień tablicę `ALLOWED_ORIGINS` na swoją domenę:

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning Ważne
   Bez tej zmiany proxy odrzuci wszystkie żądania z Twojej witryny z błędem **403 Forbidden**. Domyślnie dozwolone są tylko żądania z `bentopdf.com`.
   :::

4. **Wdróż proxy**:

   ```bash
   wrangler deploy
   ```

   Zapisz adres URL swojego workera (np. `https://bentopdf-cors-proxy.your-subdomain.workers.dev`).

5. **Zbuduj BentoPDF ponownie z adresem URL proxy**:

   Jeśli używasz Dockera:

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   Jeśli budujesz ze źródeł:

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### Opcja 2: Własne proxy backendowe

Możesz też utworzyć własny punkt końcowy proxy. Wymagania:

1. Przyjmuj żądania GET z parametrem zapytania `url`
2. Pobieraj adres URL ze swojego serwera (po stronie serwera nie ma ograniczeń CORS)
3. Zwracaj odpowiedź z tymi nagłówkami:
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

Przykładowa implementacja w Express.js:

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

## Kwestie bezpieczeństwa

Dołączony Cloudflare Worker ma kilka zabezpieczeń:

| Funkcja                         | Opis                                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Walidacja źródła**            | Zezwala tylko na żądania z domen z listy `ALLOWED_ORIGINS`                                     |
| **Ograniczenia URL**            | Zezwala tylko na adresy certyfikatów (`.crt`, `.cer`, `.pem`, `/certs/`, `/ocsp`, `/crl`)      |
| **Blokada prywatnych IP**       | Blokuje prywatne zakresy IPv4/IPv6, link-local, loopback, adresy dziesiętne i metadane chmury  |
| **Bezpieczeństwo Content-Type** | Zwraca tylko bezpieczne typy MIME certyfikatów, blokuje wstrzykiwanie content-type z upstreamu |
| **Limit rozmiaru pliku**        | Strumieniuje odpowiedź z limitem 10MB, przerywa pobieranie w trakcie po jego przekroczeniu     |
| **Limit żądań**                 | 60 żądań na minutę na IP lub IPv6 /64 (wymaga KV, przy błędach KV przepuszcza ruch)            |
| **Podpisy HMAC**                | Opcjonalne podpisywanie po stronie klienta (zniechęca do przypadkowych nadużyć)                |

### DNS rebinding (hosting poza Cloudflare)

Worker odrzuca każdy adres URL, który wskazuje na prywatny lub wewnętrzny adres IP. Nie może użyć stałej listy dozwolonych hostów, ponieważ adresy łańcucha certyfikatów wskazują na dowolne CA, które wystawiło certyfikat (FNMT, korporacyjne CA itd.), więc miejsca docelowe nie są znane z góry. Zostaje małe okno na rebinding: osoba zarządzająca DNS własnej domeny mogłaby podać publiczny adres IP przy sprawdzaniu bezpieczeństwa, a chwilę później prywatny przy właściwym żądaniu.

W Cloudflare nie da się tego wykorzystać: Workers nie mają dostępu do prywatnych adresów IP ani do punktu metadanych `169.254.169.254`, więc rebinding trafia w pustkę. Nie dawaj tylko workerowi drogi do środka: nie podłączaj Tunnel, Service ani powiązania z siecią prywatną (potrzebuje wyłącznie `RATE_LIMIT_KV`).

Jeśli uruchamiasz to poza Cloudflare (workerd, Node itp.) wewnątrz VPC, środowisko _może_ docierać do adresów wewnętrznych. Postaw przed nim zaporę ruchu wychodzącego i zablokuj zakresy prywatne: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16` oraz ich odpowiedniki IPv6. Kod aplikacji nie wymusi tego poza Cloudflare.

## Wyłączanie proxy

Jeśli nie chcesz używać proxy CORS, ustaw zmienną środowiskową na pusty ciąg:

```
VITE_CORS_PROXY_URL=
```

**Uwaga**: Bez proxy podpisywanie certyfikatami wymagającymi zewnętrznego pobrania łańcucha (jak FNMT lub niektóre korporacyjne CA) zakończy się błędem „Failed to fetch”.

## Rozwiązywanie problemów

### "Signing error: TypeError: Failed to fetch"

Zwykle oznacza to jedno z poniższych:

1. **Nie skonfigurowano proxy CORS**: ustaw `VITE_CORS_PROXY_URL` i zbuduj ponownie
2. **Zablokowana zawartość mieszana**: Twoja witryna używa HTTPS, a adres wystawcy certyfikatu to HTTP. Proxy CORS to rozwiązuje.
3. **Proxy CORS odrzuca Twoje źródło**: sprawdź, czy Twoja domena jest w tablicy `ALLOWED_ORIGINS` w `cors-proxy-worker.js`

### Błąd "403 Forbidden" z proxy

Twojej domeny nie ma na liście `ALLOWED_ORIGINS`. Edytuj `cors-proxy-worker.js`:

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

Następnie wdróż ponownie: `npx wrangler deploy`

### Testowanie proxy

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### Certyfikaty działające bez proxy

Niektóre certyfikaty zawierają pełny łańcuch w pliku P12/PFX i nie wymagają zewnętrznego pobierania:

- Certyfikaty z podpisem własnym
- Niektóre komercyjne CA dołączające certyfikaty pośrednie
- Certyfikaty, w których ręcznie złożyłeś pełny łańcuch
