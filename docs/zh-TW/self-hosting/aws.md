# 部署到 AWS S3 + CloudFront

在 AWS 上架設 BentoPDF，取得最大的控制權與擴充性。

## 架構

```
User → CloudFront (CDN) → S3 (Static Files)
```

## 步驟 1：建立 S3 儲存貯體

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## 步驟 2：建置並上傳

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

## 步驟 3：建立 CloudFront 分配

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

或使用 AWS 主控台：

1. 前往 CloudFront → Create distribution
2. Origin domain：選擇您的 S3 儲存貯體
3. 啟用「Origin Access Control」
4. Default root object：`index.html`
5. 建立分配

## 步驟 3b：回應標頭政策（LibreOffice WASM 必需）

以 LibreOffice 為基礎的轉換（Word、Excel、PowerPoint 轉 PDF）需要 `SharedArrayBuffer`，而它需要特定的回應標頭。請建立 CloudFront 回應標頭政策：

1. 前往 CloudFront → Policies → Response headers
2. 建立包含以下標頭的自訂政策：

| 標頭                           | 值             |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. 將政策套用到您分配的預設快取行為

或透過 CLI：

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

## 步驟 3c：預先壓縮 WASM 檔案的 S3 中繼資料

LibreOffice WASM 檔案已預先壓縮（`.wasm.gz`、`.data.gz`）。請設定正確的 Content-Type 與 Content-Encoding，讓瀏覽器能解壓縮：

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
若沒有回應標頭政策，`SharedArrayBuffer` 將無法使用，LibreOffice WASM 轉換會停在約 55%。若 `.gz` 檔案沒有正確的 Content-Encoding，瀏覽器會收到原始 gzip 位元組，導致 WASM 編譯失敗。
:::

## 步驟 4：S3 儲存貯體政策

允許 CloudFront 存取儲存貯體：

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

## 步驟 5：自訂錯誤頁面

將 404 設定為回傳 `index.html` 以支援 SPA 路由：

1. CloudFront → Error pages
2. 建立自訂錯誤回應：
   - HTTP 錯誤代碼：404
   - 回應頁面路徑：`/index.html`
   - HTTP 回應代碼：200

## 費用估算

| 資源                      | 預估費用    |
| ------------------------- | ----------- |
| S3 儲存空間（約 500MB）   | 約 $0.01/月 |
| CloudFront（1TB 傳輸量）  | 約 $85/月   |
| CloudFront（10GB 傳輸量） | 約 $0.85/月 |

::: tip
對不常存取的檔案使用 S3 Intelligent Tiering 以最佳化成本。
:::

## 使用 Terraform 自動化

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
