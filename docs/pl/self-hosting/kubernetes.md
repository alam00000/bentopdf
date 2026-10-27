# Wdrożenie na Kubernetes

Kubernetes może być przesadą dla statycznej strony, ale świetnie sprawdzi się, jeśli standaryzujesz wszystko na Helm + GitOps.

> [!IMPORTANT]
> **Wymagane nagłówki dla konwersji plików Office**
>
> Narzędzia oparte na LibreOffice (konwersja Word, Excel, PowerPoint) wymagają tych nagłówków HTTP dla obsługi `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Oficjalne obrazy nginx BentoPDF zawierają te nagłówki. W Kubernetes **kontrolery Ingress/Gateway także są reverse proxy**, więc upewnij się, że nagłówki są zachowywane (lub dodaj je na brzegu).

## Wymagania wstępne

- Klaster Kubernetes
- Helm v3
- Obraz nginx BentoPDF (np. `ghcr.io/alam00000/bentopdf:<tag>`) serwujący na **porcie 8080**

## Wdrożenie z Helm

### Instalacja z tego repozytorium (lokalny chart)

```bash
kubectl create namespace bentopdf

helm upgrade --install bentopdf /path/to/bentopdf/chart \
  --namespace bentopdf \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

### Instalacja z GHCR (chart OCI)

Jeśli chart jest opublikowany w GHCR jako artefakt OCI:

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install bentopdf oci://ghcr.io/$GHCR_USERNAME/charts/bentopdf \
  --namespace bentopdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

## Udostępnianie

### Port-forward (szybki test)

```bash
kubectl -n bentopdf port-forward deploy/bentopdf 8080:8080
```

### Ingress (opcjonalnie)

Włącz Ingress (przykład dla nginx-ingress):

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: pdf.example.com
      paths:
        - path: /
          pathType: Prefix
```

### Gateway API (opcjonalnie)

Ten chart obsługuje Gateway API `Gateway` + `HTTPRoute`.

Przykład (operator Cloudflare Gateway API):

```yaml
gateway:
  enabled: true
  name: bento-tunnel
  namespace: bentopdf
  gatewayClassName: cloudflare

httpRoute:
  enabled: true
  parentRefs:
    - name: bento-tunnel
      namespace: bentopdf
      sectionName: http
  hostnames:
    - pdfs.example.com
```

## Upewnianie się, że nagłówki SharedArrayBuffer nadal działają (Ingress/Gateway)

### Co "powinno" się dziać

Konfiguracja nginx BentoPDF ustawia wymagane nagłówki odpowiedzi. Większość kontrolerów Ingress/Gateway **przekazuje nagłówki odpowiedzi z upstreamu bez zmian**.

### Co może to zepsuć

- Polityka kontrolera lub brzegu, która **nadpisuje** lub **usuwa** nagłówki odpowiedzi
- Middleware "security headers", które ustawia inne wartości COOP/COEP

### Jak sprawdzić

Uruchom to na swoim publicznym adresie:

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

Powinieneś zobaczyć:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### Jeśli Twój kontroler Ingress ich nie zachowuje

Dodaj nagłówki na brzegu (zależnie od kontrolera). Przykład dla **nginx-ingress**:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## Błędy typu MIME dla `.mjs` (pusty iframe Podpisz PDF / Wypełnianie formularzy PDF)

Jeśli konsola przeglądarki pokazuje `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"` przy żądaniu `.mjs`, kontroler Ingress/Gateway przed nginx BentoPDF zastępuje nagłówek `Content-Type` z upstreamu wartością `application/octet-stream`.

Nginx w obrazie BentoPDF już serwuje `.mjs` jako `application/javascript`. Rozwiązaniem jest powstrzymanie kontrolera przed usuwaniem lub zastępowaniem tego nagłówka. Dla nginx-ingress:

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

Możesz też użyć filtra `ResponseHeaderModifier` w Gateway API, aby ustawić `Content-Type: application/javascript` dla ścieżek `.mjs`. Zweryfikuj w DevTools → karta Network: nieudane żądanie `.mjs` powinno teraz pokazywać `content-type: application/javascript`.

### Jeśli używasz Gateway API i chcesz wymusić dodanie nagłówków

Gateway API obsługuje filtr `ResponseHeaderModifier`. Możesz go dołączyć w `httpRoute.rules[*].filters`:

```yaml
httpRoute:
  enabled: true
  hostnames: [pdf.example.com]
  parentRefs:
    - name: bento-tunnel
      namespace: misc
      sectionName: http
  rules:
    - matches:
        - path: { type: PathPrefix, value: / }
      filters:
        - type: ResponseHeaderModifier
          responseHeaderModifier:
            set:
              - name: Cross-Origin-Opener-Policy
                value: same-origin
              - name: Cross-Origin-Embedder-Policy
                value: require-corp
```

Obsługa konkretnych filtrów zależy od Twojego kontrolera Gateway. Jeśli filtr jest ignorowany, dodaj nagłówki na warstwie brzegu/kontrolera.

## Wyłączanie wybranych narzędzi

Użyj ConfigMap, aby wyłączyć narzędzia w czasie działania, bez przebudowywania obrazu:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: bentopdf-config
  namespace: bentopdf
data:
  config.json: |
    {
      "disabledTools": ["edit-pdf", "sign-pdf", "encrypt-pdf"]
    }
```

Zamontuj go w serwowanym katalogu:

```yaml
spec:
  containers:
    - name: bentopdf
      volumeMounts:
        - name: config
          mountPath: /usr/share/nginx/html/config.json
          subPath: config.json
          readOnly: true
  volumes:
    - name: config
      configMap:
        name: bentopdf-config
```

Identyfikatory narzędzi to adres strony bez `.html`. Otwórz dowolne narzędzie i spójrz na adres URL (np. `edit-pdf`, `merge-pdf`, `compress-pdf`). Wyłączone narzędzia są ukryte na stronie głównej, w wyszukiwarce, skrótach, kreatorze przepływów i przy bezpośrednim dostępie przez URL. Pełną listę opcji znajdziesz w [przewodniku Docker](/pl/self-hosting/docker#wyłaczanie-wybranych-narzedzi).
