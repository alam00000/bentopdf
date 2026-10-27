# Despliegue con Kubernetes

Kubernetes puede ser excesivo para un sitio estático, pero puede encajar muy bien si ya estandarizas con Helm + GitOps.

> [!IMPORTANT]
> **Cabeceras necesarias para la conversión de archivos de Office**
>
> Las herramientas basadas en LibreOffice (conversión de Word, Excel y PowerPoint) requieren estas cabeceras HTTP para la compatibilidad con `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Las imágenes oficiales de BentoPDF con nginx incluyen estas cabeceras. En Kubernetes, **los controladores de Ingress/Gateway también son proxies inversos**, así que asegúrate de que estas cabeceras se conserven (o añádelas en el borde).

## Requisitos previos

- Clúster de Kubernetes
- Helm v3
- Una imagen de BentoPDF con nginx (p. ej. `ghcr.io/alam00000/bentopdf:<tag>`) que sirva en el **puerto 8080**

## Despliegue con Helm

### Instalar desde este repositorio (chart local)

```bash
kubectl create namespace bentopdf

helm upgrade --install bentopdf /path/to/bentopdf/chart \
  --namespace bentopdf \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

### Instalar desde GHCR (chart OCI)

Si el chart está publicado en GHCR como artefacto OCI:

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install bentopdf oci://ghcr.io/$GHCR_USERNAME/charts/bentopdf \
  --namespace bentopdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

## Exponerlo

### Port-forward (prueba rápida)

```bash
kubectl -n bentopdf port-forward deploy/bentopdf 8080:8080
```

### Ingress (opcional)

Activa Ingress (ejemplo para nginx-ingress):

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

Este chart es compatible con `Gateway` + `HTTPRoute` de Gateway API.

Ejemplo (operador de Gateway API de Cloudflare):

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

## Cómo comprobar que las cabeceras de SharedArrayBuffer siguen funcionando (Ingress/Gateway)

### Lo que "debería" pasar

La configuración de nginx de BentoPDF establece las cabeceras de respuesta necesarias. La mayoría de los controladores de Ingress/Gateway **pasan las cabeceras de respuesta del upstream sin modificarlas**.

### Qué puede romperlo

- Una política del controlador o del borde que **sobrescriba** o **elimine** cabeceras de respuesta
- Un middleware de "cabeceras de seguridad" que establezca valores de COOP/COEP distintos

### Cómo verificarlo

Ejecuta esto contra tu endpoint público:

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

Deberías ver:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### Si tu controlador de Ingress no las conserva

Añade las cabeceras en el borde (depende del controlador). Ejemplo para **nginx-ingress**:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## Errores de tipo MIME de `.mjs` (iframe en blanco en Firmar PDF / Rellenar formularios)

Si la consola del navegador muestra `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"` en una petición `.mjs`, un controlador de Ingress/Gateway situado delante del nginx de BentoPDF está reemplazando la cabecera `Content-Type` del upstream por `application/octet-stream`.

El nginx de la imagen de BentoPDF ya sirve `.mjs` como `application/javascript`. La solución es evitar que el controlador la elimine o la reemplace. Para nginx-ingress:

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

O bien usa un filtro `ResponseHeaderModifier` en Gateway API para establecer `Content-Type: application/javascript` en las rutas `.mjs`. Verifica con DevTools → pestaña Network: la petición `.mjs` que fallaba ahora debería mostrar `content-type: application/javascript`.

### Si usas Gateway API y quieres forzar la adición de cabeceras

Gateway API admite un filtro `ResponseHeaderModifier`. Puedes asociarlo en `httpRoute.rules[*].filters`:

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

La compatibilidad con filtros concretos depende de tu controlador de Gateway; si se ignora un filtro, añade las cabeceras en la capa del borde o del controlador.

## Desactivar herramientas específicas

Usa un ConfigMap para desactivar herramientas en tiempo de ejecución sin reconstruir la imagen:

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

Móntalo en el directorio servido:

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

Los ID de las herramientas son la URL de la página sin `.html`: abre cualquier herramienta y mira la URL (p. ej., `edit-pdf`, `merge-pdf`, `compress-pdf`). Las herramientas desactivadas se ocultan en la página de inicio, la búsqueda, los atajos, el generador de flujos de trabajo y el acceso directo por URL. Consulta la [guía de Docker](/es/self-hosting/docker#desactivar-herramientas-concretas) para ver la lista completa de opciones.
