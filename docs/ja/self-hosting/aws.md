# AWS S3 + CloudFrontにデプロイする

最大限の制御とスケーラビリティを求めて、AWS上にBentoPDFをホストします。

## アーキテクチャ

```
User → CloudFront (CDN) → S3 (Static Files)
```

## ステップ1：S3バケットを作成する

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## ステップ2：ビルドしてアップロードする

```bash
# Build the project (optionally with custom branding)
# VITE_BRAND_NAME="AcmePDF" VITE_BRAND_LOGO="images/acme-logo.svg" npm run build
npm run build

# Sync to S3
aws s3 sync dist/ s3://your-bentopdf-bucket \
  --delete \
  --cache-control "max-age=31536000"

# Set correct MIME types for WASM
aws s3 cp s3://your-bentopdf-bucket/ s3://your-bentopdf-bucket/ \
  --recursive \
  --exclude "*" \
  --include "*.wasm" \
  --content-type "application/wasm" \
  --metadata-directive REPLACE

# Set correct MIME type for ES module files (.mjs)
# S3 defaults .mjs to application/octet-stream, which browsers refuse to
# execute as ES modules. The bundled PDF viewer (Sign PDF, Form Filler)
# ships ES modules with .mjs extensions and will fail without this step.
aws s3 cp s3://your-bentopdf-bucket/ s3://your-bentopdf-bucket/ \
  --recursive \
  --exclude "*" \
  --include "*.mjs" \
  --content-type "application/javascript" \
  --metadata-directive REPLACE
```

## ステップ3：CloudFrontディストリビューションを作成する

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

またはAWSコンソールを使います。

1. CloudFront → ディストリビューションを作成 に移動します
2. オリジンドメイン：S3バケットを選択します
3. 「Origin Access Control」を有効にします
4. デフォルトルートオブジェクト：`index.html`
5. ディストリビューションを作成します

## ステップ3b：レスポンスヘッダーポリシー（LibreOffice WASMに必須）

LibreOfficeベースの変換（Word、Excel、PowerPointからPDFへ）には `SharedArrayBuffer` が必要で、特定のレスポンスヘッダーが求められます。CloudFrontのレスポンスヘッダーポリシーを作成します。

1. CloudFront → ポリシー → レスポンスヘッダー に移動します
2. 次のヘッダーでカスタムポリシーを作成します。

| ヘッダー                       | 値             |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. ポリシーをディストリビューションのデフォルトキャッシュビヘイビアにアタッチします

CLIを使う場合：

```bash
aws cloudfront create-response-headers-policy \
  --response-headers-policy-config '{
    "Name": "BentoPDF-COEP-COOP",
    "CustomHeadersConfig": {
      "Quantity": 3,
      "Items": [
        {"Header": "Cross-Origin-Embedder-Policy", "Value": "require-corp", "Override": true},
        {"Header": "Cross-Origin-Opener-Policy", "Value": "same-origin", "Override": true},
        {"Header": "Cross-Origin-Resource-Policy", "Value": "cross-origin", "Override": true}
      ]
    }
  }'
```

## ステップ3c：事前圧縮されたWASMファイルのS3メタデータ

LibreOffice WASMファイルは事前圧縮されています（`.wasm.gz`、`.data.gz`）。ブラウザが展開できるように、正しいContent-TypeとContent-Encodingを設定します。

```bash
# Set correct headers for soffice.wasm.gz
aws s3 cp s3://your-bentopdf-bucket/libreoffice-wasm/soffice.wasm.gz \
  s3://your-bentopdf-bucket/libreoffice-wasm/soffice.wasm.gz \
  --content-type "application/wasm" \
  --content-encoding "gzip" \
  --metadata-directive REPLACE

# Set correct headers for soffice.data.gz
aws s3 cp s3://your-bentopdf-bucket/libreoffice-wasm/soffice.data.gz \
  s3://your-bentopdf-bucket/libreoffice-wasm/soffice.data.gz \
  --content-type "application/octet-stream" \
  --content-encoding "gzip" \
  --metadata-directive REPLACE
```

::: warning 重要
レスポンスヘッダーポリシーがないと `SharedArrayBuffer` が使えず、LibreOffice WASMの変換は約55%で止まります。`.gz` ファイルに正しいContent-Encodingがないと、ブラウザは生のgzipバイトを受け取り、WASMのコンパイルに失敗します。
:::

## ステップ4：S3バケットポリシー

CloudFrontがバケットにアクセスできるようにします。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontAccess",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bentopdf-bucket/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

## ステップ5：カスタムエラーページ

SPAのルーティングのため、404で `index.html` を返すように設定します。

1. CloudFront → エラーページ
2. カスタムエラーレスポンスを作成します。
   - HTTPエラーコード：404
   - レスポンスページのパス：`/index.html`
   - HTTPレスポンスコード：200

## コストの目安

| リソース                | 概算コスト |
| ----------------------- | ---------- |
| S3ストレージ（約500MB） | 約$0.01/月 |
| CloudFront（1TB転送）   | 約$85/月   |
| CloudFront（10GB転送）  | 約$0.85/月 |

::: tip
アクセス頻度の低いファイルには、S3 Intelligent-Tieringを使うとコストを最適化できます。
:::

## Terraformによる自動化

```hcl
# main.tf
resource "aws_s3_bucket" "bentopdf" {
  bucket = "your-bentopdf-bucket"
}

resource "aws_cloudfront_distribution" "bentopdf" {
  origin {
    domain_name = aws_s3_bucket.bentopdf.bucket_regional_domain_name
    origin_id   = "S3Origin"
  }

  enabled             = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Origin"

    viewer_protocol_policy = "redirect-to-https"
  }
}
```
