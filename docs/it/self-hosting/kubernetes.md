# Deploy con Kubernetes

Kubernetes può essere eccessivo per un sito statico, ma è un'ottima scelta se usi già Helm + GitOps come standard.

> [!IMPORTANT]
> **Header necessari per la conversione dei file Office**
>
> Gli strumenti basati su LibreOffice (conversione di Word, Excel, PowerPoint) richiedono questi header HTTP per il supporto a `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Le immagini nginx ufficiali di Pixel PDF includono questi header. In Kubernetes, **anche i controller Ingress/Gateway sono reverse proxy**, quindi assicurati che questi header vengano preservati (oppure aggiungili al livello edge).

## Prerequisiti

- Cluster Kubernetes
- Helm v3
- Un'immagine nginx di Pixel PDF (ad es. `ghcr.io/mohammedalhinaki-cloud/pixel-pdf:<tag>`) che serve sulla **porta 8080**

## Deploy con Helm

### Installazione da questo repository (chart locale)

```bash
kubectl create namespace pixelpdf

helm upgrade --install pixelpdf /path/to/pixelpdf/chart \
  --namespace pixelpdf \
  --set image.repository=ghcr.io/mohammedalhinaki-cloud/pixel-pdf \
  --set image.tag=latest
```

### Installazione da GHCR (chart OCI)

Se il chart è pubblicato su GHCR come artefatto OCI:

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install pixelpdf oci://ghcr.io/$GHCR_USERNAME/charts/pixelpdf \
  --namespace pixelpdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/mohammedalhinaki-cloud/pixel-pdf \
  --set image.tag=latest
```

## Esporre il servizio

### Port-forward (test rapido)

```bash
kubectl -n pixelpdf port-forward deploy/pixelpdf 8080:8080
```

### Ingress (facoltativo)

Abilita Ingress (esempio per nginx-ingress):

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

### Gateway API (facoltativo)

Questo chart supporta `Gateway` + `HTTPRoute` della Gateway API.

Esempio (operatore Gateway API di Cloudflare):

```yaml
gateway:
  enabled: true
  name: pixel-tunnel
  namespace: pixelpdf
  gatewayClassName: cloudflare

httpRoute:
  enabled: true
  parentRefs:
    - name: pixel-tunnel
      namespace: pixelpdf
      sectionName: http
  hostnames:
    - pdfs.example.com
```

## Verificare che gli header SharedArrayBuffer funzionino ancora (Ingress/Gateway)

### Cosa "dovrebbe" succedere

La configurazione nginx di Pixel PDF imposta gli header di risposta necessari. La maggior parte dei controller Ingress/Gateway **inoltra invariati gli header di risposta dell'upstream**.

### Cosa può romperlo

- Una policy del controller o dell'edge che **sovrascrive** o **rimuove** gli header di risposta
- Un middleware di "security headers" che imposta valori COOP/COEP diversi

### Come verificare

Esegui questo comando sul tuo endpoint pubblico:

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

Dovresti vedere:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### Se il tuo controller Ingress non li preserva

Aggiungi gli header al livello edge (dipende dal controller). Esempio per **nginx-ingress**:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## Errori di tipo MIME per `.mjs` (iframe di Firma PDF / Compilazione moduli vuoto)

Se la console del browser mostra `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"` su una richiesta `.mjs`, un controller Ingress/Gateway davanti all'nginx di Pixel PDF sta sostituendo l'header `Content-Type` dell'upstream con `application/octet-stream`.

L'nginx dell'immagine di Pixel PDF serve già i file `.mjs` come `application/javascript`. La soluzione è impedire al controller di rimuoverlo o sostituirlo. Per nginx-ingress:

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

Oppure usa un filtro `ResponseHeaderModifier` nella Gateway API per impostare `Content-Type: application/javascript` sui percorsi `.mjs`. Verifica con DevTools → scheda Network: la richiesta `.mjs` che falliva dovrebbe ora mostrare `content-type: application/javascript`.

### Se usi la Gateway API e vuoi aggiungere gli header in modo forzato

La Gateway API supporta un filtro `ResponseHeaderModifier`. Puoi associarlo in `httpRoute.rules[*].filters`:

```yaml
httpRoute:
  enabled: true
  hostnames: [pdf.example.com]
  parentRefs:
    - name: pixel-tunnel
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

Il supporto per filtri specifici dipende dal tuo controller Gateway; se un filtro viene ignorato, aggiungi gli header al livello edge/controller.

## Disabilitare strumenti specifici

Usa una ConfigMap per disabilitare gli strumenti a runtime senza ricostruire l'immagine:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: pixelpdf-config
  namespace: pixelpdf
data:
  config.json: |
    {
      "disabledTools": ["edit-pdf", "sign-pdf", "encrypt-pdf"]
    }
```

Montala nella directory servita:

```yaml
spec:
  containers:
    - name: pixelpdf
      volumeMounts:
        - name: config
          mountPath: /usr/share/nginx/html/config.json
          subPath: config.json
          readOnly: true
  volumes:
    - name: config
      configMap:
        name: pixelpdf-config
```

Gli ID degli strumenti sono l'URL della pagina senza `.html`: apri uno strumento qualsiasi e guarda l'URL (ad es. `edit-pdf`, `merge-pdf`, `compress-pdf`). Gli strumenti disabilitati sono nascosti dalla homepage, dalla ricerca, dalle scorciatoie, dal workflow builder e dall'accesso diretto tramite URL. Consulta la [guida Docker](/it/self-hosting/docker#disattivare-strumenti-specifici) per l'elenco completo delle opzioni.
