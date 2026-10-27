# Nasadenie pomocou Kubernetes

Kubernetes môže byť pre statický web zbytočne veľa, no môže sa výborne hodiť, ak už štandardne používate Helm + GitOps.

> [!IMPORTANT]
> **Povinné hlavičky pre konverziu súborov Office**
>
> Nástroje založené na LibreOffice (konverzia Word, Excel, PowerPoint) vyžadujú pre podporu `SharedArrayBuffer` tieto HTTP hlavičky:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Oficiálne nginx obrazy BentoPDF tieto hlavičky obsahujú. V Kubernetes sú **kontroléry Ingress/Gateway tiež reverzné proxy**, preto sa uistite, že sa tieto hlavičky zachovajú (alebo ich pridajte na okraji siete).

## Predpoklady

- Klaster Kubernetes
- Helm v3
- Nginx obraz BentoPDF (napr. `ghcr.io/alam00000/bentopdf:<tag>`), ktorý počúva na **porte 8080**

## Nasadenie pomocou Helm

### Inštalácia z tohto repozitára (lokálny chart)

```bash
kubectl create namespace bentopdf

helm upgrade --install bentopdf /path/to/bentopdf/chart \
  --namespace bentopdf \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

### Inštalácia z GHCR (OCI chart)

Ak je chart publikovaný v GHCR ako OCI artefakt:

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install bentopdf oci://ghcr.io/$GHCR_USERNAME/charts/bentopdf \
  --namespace bentopdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

## Sprístupnenie

### Port-forward (rýchly test)

```bash
kubectl -n bentopdf port-forward deploy/bentopdf 8080:8080
```

### Ingress (voliteľné)

Zapnite Ingress (príklad pre nginx-ingress):

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

### Gateway API (voliteľné)

Tento chart podporuje Gateway API `Gateway` + `HTTPRoute`.

Príklad (operátor Cloudflare Gateway API):

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

## Ako zabezpečiť, aby hlavičky SharedArrayBuffer stále fungovali (Ingress/Gateway)

### Čo by sa „malo“ diať

Konfigurácia nginx v BentoPDF nastavuje potrebné hlavičky odpovede. Väčšina kontrolérov Ingress/Gateway **odovzdáva hlavičky odpovede z upstreamu bez zmeny**.

### Čo to môže pokaziť

- Politika kontroléra alebo okraja siete, ktorá hlavičky odpovede **prepisuje** alebo **odstraňuje**
- Middleware „bezpečnostných hlavičiek“, ktorý nastavuje iné hodnoty COOP/COEP

### Ako overiť

Spustite toto proti svojmu verejnému endpointu:

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

Mali by ste vidieť:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### Ak ich váš kontrolér Ingress nezachováva

Pridajte hlavičky na okraji siete (podľa konkrétneho kontroléra). Príklad pre **nginx-ingress**:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## Chyby MIME typu `.mjs` (prázdny iframe v Podpísať PDF / Vyplňovač formulárov)

Ak konzola prehliadača pri požiadavke `.mjs` zobrazí `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"`, kontrolér Ingress/Gateway pred nginx BentoPDF nahrádza hlavičku `Content-Type` z upstreamu hodnotou `application/octet-stream`.

Nginx v obraze BentoPDF už poskytuje `.mjs` ako `application/javascript`. Riešením je zabrániť kontroléru, aby ju odstraňoval alebo nahrádzal. Pre nginx-ingress:

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

Alebo v Gateway API použite filter `ResponseHeaderModifier` na nastavenie `Content-Type: application/javascript` pre cesty `.mjs`. Overte to v DevTools → karta Network: zlyhaná požiadavka `.mjs` by teraz mala zobrazovať `content-type: application/javascript`.

### Ak používate Gateway API a chcete hlavičky pridať vynútene

Gateway API podporuje filter `ResponseHeaderModifier`. Môžete ho pripojiť v `httpRoute.rules[*].filters`:

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

Podpora konkrétnych filtrov závisí od vášho kontroléra Gateway; ak sa filter ignoruje, pridajte hlavičky na vrstve okraja siete alebo kontroléra.

## Vypnutie konkrétnych nástrojov

Na vypnutie nástrojov za behu bez nového zostavenia obrazu použite ConfigMap:

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

Pripojte ho do poskytovaného adresára:

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

ID nástroja je URL stránky bez `.html`: otvorte ľubovoľný nástroj a pozrite sa na URL (napr. `edit-pdf`, `merge-pdf`, `compress-pdf`). Vypnuté nástroje sa skryjú z domovskej stránky, vyhľadávania, skratiek, nástroja na tvorbu workflow aj z priameho prístupu cez URL. Úplný zoznam možností nájdete v [príručke Docker](/sk/self-hosting/docker#vypnutie-konkretnych-nastrojov).
