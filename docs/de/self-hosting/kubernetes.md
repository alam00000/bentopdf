# Mit Kubernetes bereitstellen

Kubernetes ist für eine statische Website vielleicht überdimensioniert, kann aber gut passen, wenn Sie ohnehin auf Helm + GitOps setzen.

> [!IMPORTANT]
> **Erforderliche Header für die Office-Dateikonvertierung**
>
> LibreOffice-basierte Werkzeuge (Word-, Excel-, PowerPoint-Konvertierung) benötigen diese HTTP-Header für die `SharedArrayBuffer`-Unterstützung:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Die offiziellen BentoPDF-Nginx-Images enthalten diese Header. In Kubernetes sind **Ingress-/Gateway-Controller ebenfalls Reverse-Proxys**. Stellen Sie daher sicher, dass diese Header erhalten bleiben (oder fügen Sie sie am Edge hinzu).

## Voraussetzungen

- Kubernetes-Cluster
- Helm v3
- Ein BentoPDF-Nginx-Image (z. B. `ghcr.io/alam00000/bentopdf:<tag>`), das auf **Port 8080** läuft

## Mit Helm bereitstellen

### Aus diesem Repo installieren (lokales Chart)

```bash
kubectl create namespace bentopdf

helm upgrade --install bentopdf /path/to/bentopdf/chart \
  --namespace bentopdf \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

### Aus GHCR installieren (OCI-Chart)

Wenn das Chart als OCI-Artefakt in GHCR veröffentlicht ist:

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install bentopdf oci://ghcr.io/$GHCR_USERNAME/charts/bentopdf \
  --namespace bentopdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

## Verfügbar machen

### Port-Forward (schneller Test)

```bash
kubectl -n bentopdf port-forward deploy/bentopdf 8080:8080
```

### Ingress (optional)

Aktivieren Sie Ingress (Beispiel für nginx-ingress):

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

### Gateway API (optional)

Dieses Chart unterstützt Gateway API `Gateway` + `HTTPRoute`.

Beispiel (Cloudflare-Gateway-API-Operator):

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

## Sicherstellen, dass die SharedArrayBuffer-Header weiterhin funktionieren (Ingress/Gateway)

### Was passieren "sollte"

Die Nginx-Konfiguration von BentoPDF setzt die erforderlichen Response-Header. Die meisten Ingress-/Gateway-Controller **leiten Response-Header des Upstreams unverändert weiter**.

### Was das verhindern kann

- Eine Controller-/Edge-Richtlinie, die Response-Header **überschreibt** oder **entfernt**
- Eine "Security-Header"-Middleware, die andere COOP/COEP-Werte setzt

### So überprüfen Sie es

Führen Sie dies gegen Ihren öffentlichen Endpunkt aus:

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

Sie sollten Folgendes sehen:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### Wenn Ihr Ingress-Controller sie nicht beibehält

Fügen Sie die Header am Edge hinzu (controllerspezifisch). Beispiel für **nginx-ingress**:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## `.mjs`-MIME-Type-Fehler (PDF unterschreiben / PDF-Formular ausfüllen, leerer iframe)

Wenn die Browserkonsole bei einer `.mjs`-Anfrage `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"` anzeigt, ersetzt ein Ingress-/Gateway-Controller vor dem BentoPDF-Nginx den Upstream-Header `Content-Type` durch `application/octet-stream`.

Der Nginx im BentoPDF-Image liefert `.mjs` bereits als `application/javascript` aus. Die Lösung besteht darin, den Controller daran zu hindern, den Header zu entfernen oder zu ersetzen. Für nginx-ingress:

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

Oder verwenden Sie in der Gateway API einen `ResponseHeaderModifier`-Filter, um `Content-Type: application/javascript` für `.mjs`-Pfade zu setzen. Überprüfen Sie es im DevTools-Tab Network: Die fehlgeschlagene `.mjs`-Anfrage sollte nun `content-type: application/javascript` zeigen.

### Wenn Sie die Gateway API nutzen und Header erzwingen möchten

Die Gateway API unterstützt einen `ResponseHeaderModifier`-Filter. Sie können ihn in `httpRoute.rules[*].filters` einbinden:

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

Die Unterstützung bestimmter Filter hängt von Ihrem Gateway-Controller ab. Wenn ein Filter ignoriert wird, fügen Sie die Header stattdessen am Edge bzw. im Controller hinzu.

## Bestimmte Werkzeuge deaktivieren

Verwenden Sie eine ConfigMap, um Werkzeuge zur Laufzeit zu deaktivieren, ohne das Image neu zu bauen:

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

Binden Sie sie in das ausgelieferte Verzeichnis ein:

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

Werkzeug-IDs entsprechen der Seiten-URL ohne `.html`: Öffnen Sie ein beliebiges Werkzeug und sehen Sie sich die URL an (z. B. `edit-pdf`, `merge-pdf`, `compress-pdf`). Deaktivierte Werkzeuge werden auf der Startseite, in der Suche, in den Tastenkürzeln, im Workflow-Builder und beim direkten URL-Zugriff ausgeblendet. Die vollständige Liste der Optionen finden Sie im [Docker-Leitfaden](/de/self-hosting/docker#bestimmte-werkzeuge-deaktivieren).
