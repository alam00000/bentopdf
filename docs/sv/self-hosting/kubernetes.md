# Distribuera med Kubernetes

Kubernetes kan vara överdrivet för en statisk webbplats, men det kan passa utmärkt om du redan standardiserar på Helm + GitOps.

> [!IMPORTANT]
> **Obligatoriska huvuden för konvertering av Office-filer**
>
> LibreOffice-baserade verktyg (konvertering av Word, Excel, PowerPoint) kräver dessa HTTP-huvuden för stöd för `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> De officiella nginx-avbildningarna för BentoPDF innehåller dessa huvuden. I Kubernetes är **Ingress-/Gateway-kontrollerare också omvända proxyservrar**, så se till att huvudena bevaras (eller lägg till dem vid kanten).

## Förutsättningar

- Kubernetes-kluster
- Helm v3
- En nginx-avbildning för BentoPDF (t.ex. `ghcr.io/alam00000/bentopdf:<tag>`) som levererar på **port 8080**

## Distribuera med Helm

### Installera från det här repositoryt (lokalt chart)

```bash
kubectl create namespace bentopdf

helm upgrade --install bentopdf /path/to/bentopdf/chart \
  --namespace bentopdf \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

### Installera från GHCR (OCI-chart)

Om chartet är publicerat på GHCR som en OCI-artefakt:

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install bentopdf oci://ghcr.io/$GHCR_USERNAME/charts/bentopdf \
  --namespace bentopdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

## Exponera tjänsten

### Port-forward (snabbtest)

```bash
kubectl -n bentopdf port-forward deploy/bentopdf 8080:8080
```

### Ingress (valfritt)

Aktivera Ingress (exempel för nginx-ingress):

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

### Gateway API (valfritt)

Det här chartet stöder Gateway API `Gateway` + `HTTPRoute`.

Exempel (Cloudflare Gateway API operator):

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

## Se till att SharedArrayBuffer-huvudena fortfarande fungerar (Ingress/Gateway)

### Vad som "borde" hända

BentoPDF:s nginx-konfiguration sätter de nödvändiga svarshuvudena. De flesta Ingress-/Gateway-kontrollerare **skickar vidare uppströmssvarens huvuden oförändrade**.

### Vad som kan gå sönder

- En kontrollerare eller kantpolicy som **skriver över** eller **tar bort** svarshuvuden
- Ett mellanlager för "säkerhetshuvuden" som sätter andra COOP/COEP-värden

### Så verifierar du

Kör detta mot din publika slutpunkt:

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

Du bör se:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### Om din Ingress-kontrollerare inte bevarar dem

Lägg till huvudena vid kanten (kontrollerarspecifikt). Exempel för **nginx-ingress**:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## MIME-typfel för `.mjs` (tom iframe i Signera PDF / Formulärifyllare)

Om webbläsarkonsolen visar `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"` för en `.mjs`-begäran ersätter en Ingress-/Gateway-kontrollerare framför BentoPDF:s nginx huvudet `Content-Type` från uppströmsservern med `application/octet-stream`.

Nginx i BentoPDF-avbildningen levererar redan `.mjs` som `application/javascript`. Lösningen är att hindra kontrollern från att ta bort eller ersätta det. För nginx-ingress:

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

Eller använd ett `ResponseHeaderModifier`-filter i Gateway API för att sätta `Content-Type: application/javascript` för `.mjs`-sökvägar. Verifiera med DevTools → fliken Network: den misslyckade `.mjs`-begäran ska nu visa `content-type: application/javascript`.

### Om du använder Gateway API och vill tvinga fram huvuden

Gateway API stöder ett `ResponseHeaderModifier`-filter. Du kan koppla det i `httpRoute.rules[*].filters`:

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

Stödet för specifika filter beror på din Gateway-kontrollerare. Om ett filter ignoreras lägger du till huvudena i kant- eller kontrollerarlagret i stället.

## Inaktivera specifika verktyg

Använd en ConfigMap för att inaktivera verktyg vid körning utan att bygga om avbildningen:

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

Montera den i den levererade mappen:

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

Verktygs-ID:n är sidans URL utan `.html`: öppna ett verktyg och titta på URL:en (t.ex. `edit-pdf`, `merge-pdf`, `compress-pdf`). Inaktiverade verktyg döljs från startsidan, sökningen, genvägarna, arbetsflödesbyggaren och direkt URL-åtkomst. Se [Docker-guiden](/sv/self-hosting/docker#inaktivera-specifika-verktyg) för en fullständig lista över alternativ.
