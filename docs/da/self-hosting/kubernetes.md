# Deploy med Kubernetes

Kubernetes er måske overkill til et statisk site, men det kan passe godt, hvis du allerede standardiserer på Helm + GitOps.

> [!IMPORTANT]
> **Påkrævede headere til konvertering af Office-filer**
>
> LibreOffice-baserede værktøjer (konvertering af Word, Excel, PowerPoint) kræver disse HTTP-headere for at understøtte `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> De officielle BentoPDF nginx-images indeholder disse headere. I Kubernetes er **Ingress-/Gateway-controllere også reverse proxies**, så sørg for, at disse headere bevares (eller tilføj dem i kanten).

## Forudsætninger

- Kubernetes-klynge
- Helm v3
- Et BentoPDF nginx-image (f.eks. `ghcr.io/alam00000/bentopdf:<tag>`), der serverer på **port 8080**

## Deploy med Helm

### Installér fra dette repo (lokalt chart)

```bash
kubectl create namespace bentopdf

helm upgrade --install bentopdf /path/to/bentopdf/chart \
  --namespace bentopdf \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

### Installér fra GHCR (OCI-chart)

Hvis chartet er udgivet til GHCR som et OCI-artefakt:

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install bentopdf oci://ghcr.io/$GHCR_USERNAME/charts/bentopdf \
  --namespace bentopdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

## Gør det tilgængeligt

### Port-forward (hurtig test)

```bash
kubectl -n bentopdf port-forward deploy/bentopdf 8080:8080
```

### Ingress (valgfrit)

Aktivér Ingress (eksempel til nginx-ingress):

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

### Gateway API (valgfrit)

Dette chart understøtter Gateway API `Gateway` + `HTTPRoute`.

Eksempel (Cloudflare Gateway API-operator):

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

## Sørg for, at SharedArrayBuffer-headerne stadig virker (Ingress/Gateway)

### Hvad der "burde" ske

BentoPDF's nginx-konfiguration sætter de nødvendige svarheadere. De fleste Ingress-/Gateway-controllere **sender upstream-svarheadere videre uændret**.

### Hvad der kan gå galt

- En controller- eller edge-politik, der **overskriver** eller **fjerner** svarheadere
- En "security headers"-middleware, der sætter andre COOP/COEP-værdier

### Sådan kontrollerer du det

Kør dette mod dit offentlige endpoint:

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

Du skal se:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### Hvis din Ingress-controller ikke bevarer dem

Tilføj headerne i kanten (afhænger af controlleren). Eksempel til **nginx-ingress**:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## `.mjs` MIME-typefejl (Underskriv PDF / Formularudfylder, tom iframe)

Hvis browserens konsol viser `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"` på en `.mjs`-anmodning, erstatter en Ingress-/Gateway-controller foran BentoPDF's nginx den upstream `Content-Type`-header med `application/octet-stream`.

BentoPDF-imagets nginx serverer allerede `.mjs` som `application/javascript`. Løsningen er at stoppe controlleren i at fjerne eller erstatte den. For nginx-ingress:

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

Eller brug et `ResponseHeaderModifier`-filter i Gateway API til at sætte `Content-Type: application/javascript` for `.mjs`-stier. Kontrollér i DevTools → fanen Network: Den mislykkede `.mjs`-anmodning skulle nu vise `content-type: application/javascript`.

### Hvis du bruger Gateway API og vil tvinge headere på

Gateway API understøtter et `ResponseHeaderModifier`-filter. Du kan knytte det til i `httpRoute.rules[*].filters`:

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

Understøttelse af bestemte filtre afhænger af din Gateway-controller. Hvis et filter ignoreres, så tilføj headerne i kanten eller i controller-laget i stedet.

## Deaktivering af bestemte værktøjer

Brug en ConfigMap til at deaktivere værktøjer under kørsel uden at genopbygge imaget:

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

Montér den i den serverede mappe:

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

Værktøjs-id'er er sidens URL uden `.html`. Åbn et værktøj, og se på URL'en (f.eks. `edit-pdf`, `merge-pdf`, `compress-pdf`). Deaktiverede værktøjer skjules fra startsiden, søgning, genveje, workflow-builderen og direkte URL-adgang. Se [Docker-guiden](/da/self-hosting/docker#deaktivering-af-bestemte-værktøjer) for den fulde liste over indstillinger.
