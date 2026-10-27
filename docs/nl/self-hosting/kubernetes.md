# Implementeren met Kubernetes

Kubernetes is misschien overdreven voor een statische site, maar het kan een goede keuze zijn als je al standaardiseert op Helm + GitOps.

> [!IMPORTANT]
> **Vereiste headers voor Office-bestandsconversie**
>
> Tools op basis van LibreOffice (conversie van Word, Excel, PowerPoint) vereisen deze HTTP-headers voor `SharedArrayBuffer`-ondersteuning:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> De officiële BentoPDF nginx-images bevatten deze headers. In Kubernetes zijn **Ingress-/Gateway-controllers ook reverse proxies**, dus zorg dat deze headers behouden blijven (of voeg ze toe aan de edge).

## Vereisten

- Kubernetes-cluster
- Helm v3
- Een BentoPDF nginx-image (bijv. `ghcr.io/alam00000/bentopdf:<tag>`) die op **poort 8080** draait

## Implementeren met Helm

### Installeren vanuit deze repo (lokale chart)

```bash
kubectl create namespace bentopdf

helm upgrade --install bentopdf /path/to/bentopdf/chart \
  --namespace bentopdf \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

### Installeren vanuit GHCR (OCI-chart)

Als de chart als OCI-artefact op GHCR is gepubliceerd:

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install bentopdf oci://ghcr.io/$GHCR_USERNAME/charts/bentopdf \
  --namespace bentopdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

## Beschikbaar maken

### Port-forward (snelle test)

```bash
kubectl -n bentopdf port-forward deploy/bentopdf 8080:8080
```

### Ingress (optioneel)

Schakel Ingress in (voorbeeld voor nginx-ingress):

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

### Gateway API (optioneel)

Deze chart ondersteunt Gateway API `Gateway` + `HTTPRoute`.

Voorbeeld (Cloudflare Gateway API-operator):

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

## Zorgen dat de SharedArrayBuffer-headers blijven werken (Ingress/Gateway)

### Wat er hoort te gebeuren

De nginx-configuratie van BentoPDF stelt de vereiste responsheaders in. De meeste Ingress-/Gateway-controllers **laten responsheaders van de upstream ongewijzigd door**.

### Wat het kan breken

- Een controller- of edge-beleid dat responsheaders **overschrijft** of **verwijdert**
- Een "security headers"-middleware die andere COOP/COEP-waarden instelt

### Hoe te controleren

Voer dit uit tegen je openbare endpoint:

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

Je zou moeten zien:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### Als je Ingress-controller ze niet behoudt

Voeg de headers toe aan de edge (afhankelijk van de controller). Voorbeeld voor **nginx-ingress**:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## `.mjs` MIME-typefouten (iframe van PDF ondertekenen / PDF-formulier invullen leeg)

Als de browserconsole `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"` toont bij een `.mjs`-verzoek, vervangt een Ingress-/Gateway-controller vóór de BentoPDF nginx de upstream `Content-Type`-header door `application/octet-stream`.

De nginx van de BentoPDF-image levert `.mjs` al als `application/javascript`. De oplossing is te voorkomen dat de controller de header verwijdert of vervangt. Voor nginx-ingress:

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

Of gebruik een `ResponseHeaderModifier`-filter in Gateway API om `Content-Type: application/javascript` in te stellen voor `.mjs`-paden. Controleer met DevTools → tabblad Netwerk: het mislukte `.mjs`-verzoek zou nu `content-type: application/javascript` moeten tonen.

### Gebruik je Gateway API en wil je headers afdwingen

Gateway API ondersteunt een `ResponseHeaderModifier`-filter. Je kunt dit koppelen in `httpRoute.rules[*].filters`:

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

Ondersteuning voor specifieke filters hangt af van je Gateway-controller. Wordt een filter genegeerd, voeg de headers dan toe aan de edge of controllerlaag.

## Specifieke tools uitschakelen

Gebruik een ConfigMap om tools tijdens runtime uit te schakelen zonder de image opnieuw te bouwen:

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

Koppel het in de aangeboden map:

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

Tool-ID's zijn de pagina-URL zonder `.html`: open een tool en kijk naar de URL (bijv. `edit-pdf`, `merge-pdf`, `compress-pdf`). Uitgeschakelde tools worden verborgen op de startpagina, in zoeken, sneltoetsen, de workflowbouwer en bij directe URL-toegang. Zie de [Docker-gids](/nl/self-hosting/docker#specifieke-tools-uitschakelen) voor de volledige lijst met opties.
