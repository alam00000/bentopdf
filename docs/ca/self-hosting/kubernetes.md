# Desplega amb Kubernetes

Kubernetes pot ser excessiu per a un lloc estàtic, però pot encaixar molt bé si ja estandarditzes amb Helm + GitOps.

> [!IMPORTANT]
> **Capçaleres necessàries per a la conversió de fitxers d'Office**
>
> Les eines basades en LibreOffice (conversió de Word, Excel i PowerPoint) requereixen aquestes capçaleres HTTP per a la compatibilitat amb `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Les imatges nginx oficials de Pixel PDF inclouen aquestes capçaleres. A Kubernetes, **els controladors d'Ingress/Gateway també són servidors intermediaris inversos**, així que assegura't que aquestes capçaleres es conservin (o afegeix-les a l'edge).

## Requisits previs

- Clúster de Kubernetes
- Helm v3
- Una imatge nginx de Pixel PDF (per exemple, `ghcr.io/mohammedalhinaki-cloud/pixel-pdf:<tag>`) que serveixi pel **port 8080**

## Desplega amb Helm

### Instal·la des d'aquest repositori (chart local)

```bash
kubectl create namespace pixelpdf

helm upgrade --install pixelpdf /path/to/pixelpdf/chart \
  --namespace pixelpdf \
  --set image.repository=ghcr.io/mohammedalhinaki-cloud/pixel-pdf \
  --set image.tag=latest
```

### Instal·la des de GHCR (chart OCI)

Si el chart es publica a GHCR com a artefacte OCI:

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install pixelpdf oci://ghcr.io/$GHCR_USERNAME/charts/pixelpdf \
  --namespace pixelpdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/mohammedalhinaki-cloud/pixel-pdf \
  --set image.tag=latest
```

## Exposa'l

### Port-forward (prova ràpida)

```bash
kubectl -n pixelpdf port-forward deploy/pixelpdf 8080:8080
```

### Ingress (opcional)

Activa l'Ingress (exemple per a nginx-ingress):

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

### Gateway API (opcional)

Aquest chart admet `Gateway` + `HTTPRoute` de Gateway API.

Exemple (operador de Gateway API de Cloudflare):

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

## Comprova que les capçaleres de SharedArrayBuffer continuen funcionant (Ingress/Gateway)

### Què hauria de passar

La configuració de nginx de Pixel PDF estableix les capçaleres de resposta necessàries. La majoria de controladors d'Ingress/Gateway **deixen passar les capçaleres de resposta de l'origen sense canvis**.

### Què ho pot trencar

- Una política del controlador o de l'edge que **sobreescrigui** o **elimini** capçaleres de resposta
- Un middleware de "capçaleres de seguretat" que estableixi valors de COOP/COEP diferents

### Com verificar-ho

Executa això contra el teu punt d'accés públic:

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

Hauries de veure:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### Si el teu controlador d'Ingress no les conserva

Afegeix les capçaleres a l'edge (depèn del controlador). Exemple per a **nginx-ingress**:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## Errors de tipus MIME de `.mjs` (iframe en blanc a Signa PDF / Emplenador de formularis)

Si la consola del navegador mostra `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"` en una petició `.mjs`, un controlador d'Ingress/Gateway situat davant del nginx de Pixel PDF està substituint la capçalera `Content-Type` de l'origen per `application/octet-stream`.

El nginx de la imatge de Pixel PDF ja serveix `.mjs` com a `application/javascript`. La solució és evitar que el controlador l'elimini o la substitueixi. Per a nginx-ingress:

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

O utilitza un filtre `ResponseHeaderModifier` a Gateway API per establir `Content-Type: application/javascript` per a les rutes `.mjs`. Verifica-ho amb DevTools → pestanya Network: la petició `.mjs` que fallava ara hauria de mostrar `content-type: application/javascript`.

### Si utilitzes Gateway API i vols forçar l'addició de capçaleres

Gateway API admet un filtre `ResponseHeaderModifier`. Pots afegir-lo a `httpRoute.rules[*].filters`:

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

La compatibilitat amb filtres concrets depèn del teu controlador de Gateway; si un filtre s'ignora, afegeix les capçaleres a la capa d'edge o de controlador.

## Desactiva eines concretes

Utilitza un ConfigMap per desactivar eines en temps d'execució sense reconstruir la imatge:

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

Munta'l al directori servit:

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

Els identificadors d'eina són l'URL de la pàgina sense `.html`: obre qualsevol eina i mira l'URL (per exemple, `edit-pdf`, `merge-pdf`, `compress-pdf`). Les eines desactivades s'amaguen de la pàgina d'inici, la cerca, les dreceres, el constructor de fluxos de treball i l'accés directe per URL. Consulta la [guia de Docker](/ca/self-hosting/docker#desactivar-eines-concretes) per veure la llista completa d'opcions.
