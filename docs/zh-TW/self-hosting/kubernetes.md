# 使用 Kubernetes 部署

對靜態網站來說，Kubernetes 可能有些大材小用，但如果您已經以 Helm + GitOps 為標準，它會是很好的選擇。

> [!IMPORTANT]
> **Office 檔案轉換所需的標頭**
>
> 以 LibreOffice 為基礎的工具（Word、Excel、PowerPoint 轉換）需要以下 HTTP 標頭才能支援 `SharedArrayBuffer`：
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> 官方 BentoPDF nginx 映像檔已包含這些標頭。在 Kubernetes 中，**Ingress/Gateway 控制器同時也是反向代理**，因此請確保這些標頭被保留（或在邊緣層加上）。

## 先決條件

- Kubernetes 叢集
- Helm v3
- 在 **8080 連接埠**提供服務的 BentoPDF nginx 映像檔（例如 `ghcr.io/alam00000/bentopdf:<tag>`）

## 使用 Helm 部署

### 從此儲存庫安裝（本機 chart）

```bash
kubectl create namespace bentopdf

helm upgrade --install bentopdf /path/to/bentopdf/chart \
  --namespace bentopdf \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

### 從 GHCR 安裝（OCI chart）

如果 chart 已以 OCI 成品形式發佈至 GHCR：

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install bentopdf oci://ghcr.io/$GHCR_USERNAME/charts/bentopdf \
  --namespace bentopdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

## 對外公開

### 連接埠轉發（快速測試）

```bash
kubectl -n bentopdf port-forward deploy/bentopdf 8080:8080
```

### Ingress（選用）

啟用 Ingress（以 nginx-ingress 為例）：

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

### Gateway API（選用）

此 chart 支援 Gateway API 的 `Gateway` + `HTTPRoute`。

範例（Cloudflare Gateway API operator）：

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

## 確保 SharedArrayBuffer 標頭仍然有效（Ingress/Gateway）

### 「應該」發生的情況

BentoPDF 的 nginx 設定會設置所需的回應標頭。大多數 Ingress/Gateway 控制器會**原封不動地傳遞上游回應標頭**。

### 可能造成問題的情況

- 控制器或邊緣政策**覆寫**或**移除**回應標頭
- 「安全標頭」中介軟體設定了不同的 COOP/COEP 值

### 如何驗證

對您的公開端點執行：

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

您應該會看到：

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### 如果您的 Ingress 控制器沒有保留這些標頭

在邊緣層加上標頭（依控制器而定）。以 **nginx-ingress** 為例：

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## `.mjs` MIME 類型錯誤（簽署 PDF / 表單填寫器 iframe 空白）

如果瀏覽器主控台在 `.mjs` 請求上顯示 `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"`，表示 BentoPDF nginx 前方的 Ingress/Gateway 控制器將上游的 `Content-Type` 標頭替換成了 `application/octet-stream`。

BentoPDF 映像檔的 nginx 已將 `.mjs` 以 `application/javascript` 提供。修正方法是阻止控制器移除或替換它。對於 nginx-ingress：

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

或在 Gateway API 中使用 `ResponseHeaderModifier` 篩選器，為 `.mjs` 路徑設定 `Content-Type: application/javascript`。使用開發者工具 → 網路分頁驗證：原本失敗的 `.mjs` 請求現在應顯示 `content-type: application/javascript`。

### 如果您使用 Gateway API 並想強制加上標頭

Gateway API 支援 `ResponseHeaderModifier` 篩選器。您可以將它加在 `httpRoute.rules[*].filters` 中：

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

是否支援特定篩選器取決於您的 Gateway 控制器；如果篩選器被忽略，請改在邊緣或控制器層加上標頭。

## 停用特定工具

使用 ConfigMap 在執行時停用工具，無需重新建置映像檔：

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

將它掛載到提供服務的目錄中：

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

工具 ID 是去掉 `.html` 的頁面 URL：開啟任一工具並查看 URL（例如 `edit-pdf`、`merge-pdf`、`compress-pdf`）。停用的工具會從首頁、搜尋、快捷鍵、工作流程建構器以及直接 URL 存取中隱藏。完整選項清單請參閱 [Docker 指南](/zh-TW/self-hosting/docker#停用特定工具)。
