# hiiirePDF Helm Chart

Deploys **hiiirePDF** as a **single NGINX container** serving the static frontend.

## Quickstart

### Option 1: Port-forward (testing)

```bash
helm install hiiirepdf ./chart
kubectl port-forward deploy/hiiirepdf 8080:8080
# open http://127.0.0.1:8080
```

### Option 2: Ingress

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: hiiirepdf.example.com
      paths:
        - path: /
          pathType: Prefix
```

### Option 3: Gateway API (Gateway + HTTPRoute)

```yaml
gateway:
  enabled: true
  gatewayClassName: 'cloudflare' # or your gateway class

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

- **`image.repository`**: container image repo (default: `ghcr.io/alam00000/hiiirepdf-simple`)
- **`image.tag`**: image tag (default: `Chart.appVersion`)
- **`image.pullPolicy`**: default `IfNotPresent`

### Ports

- **`containerPort`**: container listen port (**8080** for the hiiirePDF nginx image)
- **`service.port`**: Service port exposed in-cluster (default **80**)

### Environment Variables

```yaml
env:
  - name: DISABLE_IPV6
    value: 'true'
```

## Publish this chart to GHCR (OCI) for testing/deploying

### Build And Push OCI

```bash
echo "$GHCR_TOKEN" | helm registry login ghcr.io -u "$GHCR_USERNAME" --password-stdin

cd chart
helm package .

# produces hiiirepdf-<version>.tgz
helm push hiiirepdf-*.tgz oci://ghcr.io/$GHCR_USERNAME/charts
```

This could be automated as part of a Github workflow.

### Deploy

```bash
helm upgrade --install hiiirepdf oci://ghcr.io/$GHCR_USERNAME/charts/hiiirepdf --version 1.0.0
```
