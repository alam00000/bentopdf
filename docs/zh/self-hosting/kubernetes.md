# 使用 Kubernetes 部署

对于静态站点来说，Kubernetes 可能有些大材小用，但如果您已经统一采用 Helm + GitOps，它会非常合适。

> [!IMPORTANT]
> **Office 文件转换所需的标头**
>
> 基于 LibreOffice 的工具（Word、Excel、PowerPoint 转换）需要以下 HTTP 标头来支持 `SharedArrayBuffer`：
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> 官方 BentoPDF nginx 镜像已包含这些标头。在 Kubernetes 中，**Ingress/Gateway 控制器同样是反向代理**，因此请确保这些标头被保留（或在边缘层添加）。

## 前置条件

- Kubernetes 集群
- Helm v3
- 一个 BentoPDF nginx 镜像（例如 `ghcr.io/alam00000/bentopdf:<tag>`），监听 **8080 端口**

## 使用 Helm 部署

### 从本仓库安装（本地 chart）

```bash
kubectl create namespace bentopdf

helm upgrade --install bentopdf /path/to/bentopdf/chart \
  --namespace bentopdf \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

### 从 GHCR 安装（OCI chart）

如果 chart 已作为 OCI 制品发布到 GHCR：

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install bentopdf oci://ghcr.io/$GHCR_USERNAME/charts/bentopdf \
  --namespace bentopdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

## 对外暴露

### Port-forward（快速测试）

```bash
kubectl -n bentopdf port-forward deploy/bentopdf 8080:8080
```

### Ingress（可选）

启用 Ingress（以 nginx-ingress 为例）：

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

### Gateway API（可选）

此 chart 支持 Gateway API 的 `Gateway` 和 `HTTPRoute`。

示例（Cloudflare Gateway API operator）：

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

## 确保 SharedArrayBuffer 标头仍然有效（Ingress/Gateway）

### 正常情况下会发生什么

BentoPDF 的 nginx 配置会设置所需的响应标头。大多数 Ingress/Gateway 控制器会**原样透传上游响应标头**。

### 什么情况会导致失效

- 控制器或边缘策略**覆盖**或**移除**了响应标头
- “安全标头”中间件设置了不同的 COOP/COEP 值

### 如何验证

针对您的公开端点运行：

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

您应该看到：

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### 如果您的 Ingress 控制器没有保留这些标头

在边缘层添加标头（具体做法取决于控制器）。**nginx-ingress** 示例：

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## `.mjs` MIME 类型错误（签署 PDF / Form Filler iframe 空白）

如果浏览器控制台在 `.mjs` 请求上显示 `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"`，说明 BentoPDF nginx 前面的 Ingress/Gateway 控制器把上游的 `Content-Type` 标头替换成了 `application/octet-stream`。

BentoPDF 镜像中的 nginx 本身已将 `.mjs` 作为 `application/javascript` 提供。解决方法是阻止控制器移除或替换它。对于 nginx-ingress：

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

或者在 Gateway API 中使用 `ResponseHeaderModifier` 过滤器，为 `.mjs` 路径设置 `Content-Type: application/javascript`。使用开发者工具的 Network 标签验证：失败的 `.mjs` 请求现在应显示 `content-type: application/javascript`。

### 如果您使用 Gateway API 并想强制添加标头

Gateway API 支持 `ResponseHeaderModifier` 过滤器。您可以将其附加到 `httpRoute.rules[*].filters`：

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

对特定过滤器的支持取决于您的 Gateway 控制器；如果某个过滤器被忽略，请改为在边缘或控制器层添加标头。

## 禁用特定工具

使用 ConfigMap 在运行时禁用工具，无需重新构建镜像：

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

将其挂载到提供服务的目录中：

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

工具 ID 即页面 URL 去掉 `.html` 的部分，打开任意工具并查看 URL 即可（例如 `edit-pdf`、`merge-pdf`、`compress-pdf`）。被禁用的工具会从首页、搜索、快捷键、工作流构建器以及直接 URL 访问中隐藏。完整选项请参阅 [Docker 指南](/zh/self-hosting/docker#禁用特定工具)。
