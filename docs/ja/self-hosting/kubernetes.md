# Kubernetes でデプロイする

静的サイトに Kubernetes は大げさかもしれませんが、すでに Helm + GitOps で標準化している場合には最適な選択肢になり得ます。

> [!IMPORTANT]
> **Office ファイル変換に必要なヘッダー**
>
> LibreOffice ベースのツール（Word、Excel、PowerPoint の変換）には、`SharedArrayBuffer` を使うために次の HTTP ヘッダーが必要です。
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> 公式の BentoPDF nginx イメージにはこれらのヘッダーが含まれています。Kubernetes では **Ingress/Gateway コントローラーもリバースプロキシ**であるため、これらのヘッダーが保持されるようにするか、エッジで追加してください。

## 前提条件

- Kubernetes クラスター
- Helm v3
- **ポート 8080** で配信する BentoPDF の nginx イメージ（例: `ghcr.io/alam00000/bentopdf:<tag>`）

## Helm でデプロイする

### このリポジトリからインストールする（ローカルチャート）

```bash
kubectl create namespace bentopdf

helm upgrade --install bentopdf /path/to/bentopdf/chart \
  --namespace bentopdf \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

### GHCR からインストールする（OCI チャート）

チャートが OCI アーティファクトとして GHCR に公開されている場合：

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install bentopdf oci://ghcr.io/$GHCR_USERNAME/charts/bentopdf \
  --namespace bentopdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

## 公開する

### ポートフォワード（簡易テスト）

```bash
kubectl -n bentopdf port-forward deploy/bentopdf 8080:8080
```

### Ingress（任意）

Ingress を有効にします（nginx-ingress の例）。

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

### Gateway API（任意）

このチャートは、Gateway API の `Gateway` と `HTTPRoute` に対応しています。

例（Cloudflare Gateway API operator）：

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

## SharedArrayBuffer ヘッダーが引き続き機能することを確認する（Ingress/Gateway）

### 本来の動作

BentoPDF の nginx 設定が、必要なレスポンスヘッダーを設定します。ほとんどの Ingress/Gateway コントローラーは、**アップストリームのレスポンスヘッダーをそのまま通過させます**。

### 動作しなくなる原因

- レスポンスヘッダーを**上書き**または**削除**するコントローラー/エッジのポリシー
- 異なる COOP/COEP の値を設定する「セキュリティヘッダー」ミドルウェア

### 確認方法

公開エンドポイントに対して次を実行します。

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

次のように表示されるはずです。

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### Ingress コントローラーがヘッダーを保持しない場合

エッジ（コントローラー固有の方法）でヘッダーを追加します。**nginx-ingress** の例：

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## `.mjs` の MIME タイプエラー（PDFへ署名 / Form Filler の iframe が空白になる）

ブラウザーのコンソールに、`.mjs` リクエストに対して `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"` と表示される場合、BentoPDF の nginx の前段にある Ingress/Gateway コントローラーが、アップストリームの `Content-Type` ヘッダーを `application/octet-stream` に置き換えています。

BentoPDF イメージの nginx は、すでに `.mjs` を `application/javascript` として配信しています。修正方法は、コントローラーによる削除や置き換えを止めることです。nginx-ingress の場合：

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

または、Gateway API の `ResponseHeaderModifier` フィルターを使って、`.mjs` パスに `Content-Type: application/javascript` を設定します。DevTools → Network タブで確認してください。失敗していた `.mjs` リクエストに `content-type: application/javascript` と表示されるはずです。

### Gateway API を使っていて、ヘッダーを強制的に追加したい場合

Gateway API は `ResponseHeaderModifier` フィルターに対応しています。`httpRoute.rules[*].filters` に追加できます。

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

対応するフィルターは Gateway コントローラーによって異なります。フィルターが無視される場合は、代わりにエッジ/コントローラー層でヘッダーを追加してください。

## 特定のツールを無効にする

ConfigMap を使うと、イメージを再ビルドせずに、実行時にツールを無効にできます。

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

配信されるディレクトリにマウントします。

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

ツール ID は、`.html` を除いたページの URL です。任意のツールを開いて URL を確認してください（例: `edit-pdf`、`merge-pdf`、`compress-pdf`）。無効にしたツールは、ホームページ、検索、ショートカット、ワークフロービルダー、直接の URL アクセスから非表示になります。すべてのオプションについては、[Docker ガイド](/ja/self-hosting/docker#特定のツールを無効にする)を参照してください。
