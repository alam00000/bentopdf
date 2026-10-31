# Implantar com Kubernetes

O Kubernetes pode ser exagero para um site estático, mas pode ser uma ótima opção se você já padroniza em Helm + GitOps.

> [!IMPORTANT]
> **Cabeçalhos Necessários para a Conversão de Arquivos do Office**
>
> As ferramentas baseadas em LibreOffice (conversão de Word, Excel, PowerPoint) exigem estes cabeçalhos HTTP para o suporte a `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> As imagens nginx oficiais do BentoPDF incluem esses cabeçalhos. No Kubernetes, **os controladores de Ingress/Gateway também são proxies reversos**, então garanta que esses cabeçalhos sejam preservados (ou adicione-os na borda).

## Pré-requisitos

- Cluster Kubernetes
- Helm v3
- Uma imagem nginx do BentoPDF (ex.: `ghcr.io/alam00000/bentopdf:<tag>`) que atenda na **porta 8080**

## Implantar com Helm

### Instalar a partir deste repositório (chart local)

```bash
kubectl create namespace bentopdf

helm upgrade --install bentopdf /path/to/bentopdf/chart \
  --namespace bentopdf \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

### Instalar a partir do GHCR (chart OCI)

Se o chart for publicado no GHCR como um artefato OCI:

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install bentopdf oci://ghcr.io/$GHCR_USERNAME/charts/bentopdf \
  --namespace bentopdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

## Exponha o Serviço

### Port-forward (teste rápido)

```bash
kubectl -n bentopdf port-forward deploy/bentopdf 8080:8080
```

### Ingress (opcional)

Ative o Ingress (exemplo para nginx-ingress):

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

Este chart oferece suporte a `Gateway` + `HTTPRoute` da Gateway API.

Exemplo (operador Cloudflare Gateway API):

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

## Garantindo que os cabeçalhos do SharedArrayBuffer continuem funcionando (Ingress/Gateway)

### O que "deveria" acontecer

A configuração do nginx do BentoPDF define os cabeçalhos de resposta necessários. A maioria dos controladores de Ingress/Gateway **repassa os cabeçalhos de resposta do upstream sem alterá-los**.

### O que pode quebrar isso

- Uma política do controlador/borda que **sobrescreve** ou **remove** cabeçalhos de resposta
- Um middleware de "cabeçalhos de segurança" que define valores diferentes de COOP/COEP

### Como verificar

Execute isto no seu endpoint público:

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

Você deve ver:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### Se o seu controlador de Ingress não os preservar

Adicione os cabeçalhos na borda (específico de cada controlador). Exemplo para o **nginx-ingress**:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## Erros de tipo MIME de `.mjs` (iframe em branco no Sign PDF / Form Filler)

Se o console do navegador mostrar `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"` em uma requisição `.mjs`, um controlador de Ingress/Gateway na frente do nginx do BentoPDF está substituindo o cabeçalho `Content-Type` do upstream por `application/octet-stream`.

O nginx da imagem do BentoPDF já serve `.mjs` como `application/javascript`. A correção é impedir que o controlador o remova ou substitua. Para o nginx-ingress:

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

Ou use um filtro `ResponseHeaderModifier` na Gateway API para definir `Content-Type: application/javascript` nos caminhos `.mjs`. Verifique no DevTools → aba Network: a requisição `.mjs` que falhou agora deve mostrar `content-type: application/javascript`.

### Se você usa a Gateway API e quer forçar a adição de cabeçalhos

A Gateway API oferece suporte a um filtro `ResponseHeaderModifier`. Você pode anexá-lo em `httpRoute.rules[*].filters`:

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

O suporte a filtros específicos depende do seu controlador Gateway; se um filtro for ignorado, adicione os cabeçalhos na camada de borda/controlador.

## Desativando Ferramentas Específicas

Use um ConfigMap para desativar ferramentas em tempo de execução, sem recompilar a imagem:

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

Monte-o no diretório servido:

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

Os IDs das ferramentas são a URL da página sem `.html`: abra qualquer ferramenta e veja a URL (ex.: `edit-pdf`, `merge-pdf`, `compress-pdf`). As ferramentas desativadas ficam ocultas na página inicial, na busca, nos atalhos, no construtor de fluxos e no acesso direto por URL. Veja o [guia do Docker](/pt/self-hosting/docker#desativando-ferramentas-especificas) para a lista completa de opções.
