# BentoPDF Helm Chart

Deploys **BentoPDF** as a **single NGINX container** serving the static frontend.

## Quickstart

### Option 1: Port-forward (testing)

```bash
helm install bentopdf ./chart
kubectl port-forward deploy/bentopdf 8080:8080
# open http://127.0.0.1:8080
```

### Option 2: Ingress

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: bentopdf.example.com
      paths:
        - path: /
          pathType: Prefix
```

### Option 3: Gateway API (Gateway + HTTPRoute)

```yaml
gateway:
  enabled: true
  gatewayClassName: "cloudflare"  # or your gateway class

httpRoute:
  enabled: true
  hostnames:
    - pdfs.example.com
```

**Note:** Both Gateway and HTTPRoute default to the release namespace. Omit `namespace` fields to use the release namespace automatically.

If you have an existing Gateway, set `gateway.enabled=false` and configure `httpRoute.parentRefs`:

```yaml
gateway:
  enabled: false

httpRoute:
  enabled: true
  parentRefs:
    - name: existing-gateway
      namespace: gateway-namespace
      sectionName: http
  hostnames:
    - pdfs.example.com
```

## Configuration

### Image

- **`image.repository`**: container image repo (default: `ghcr.io/alam00000/bentopdf-simple`)
- **`image.tag`**: image tag (default: `Chart.appVersion`)
- **`image.pullPolicy`**: default `IfNotPresent`

### Ports

- **`containerPort`**: container listen port (**8080** for the BentoPDF nginx image)
- **`service.port`**: Service port exposed in-cluster (default **80**)

### Environment Variables

```yaml
env:
  - name: DISABLE_IPV6
    value: "true"
```

## Publish this chart to GHCR (OCI) for testing/deploying

### Build And Push OCI

```bash
echo "$GHCR_TOKEN" | helm registry login ghcr.io -u "$GHCR_USERNAME" --password-stdin

cd chart
helm package .

# produces bentopdf-<version>.tgz
helm push bentopdf-*.tgz oci://ghcr.io/$GHCR_USERNAME/charts
```

This could be automated as part of a Github workflow.

### Deploy

```bash
helm upgrade --install bentopdf oci://ghcr.io/$GHCR_USERNAME/charts/bentopdf --version 1.0.0
```
