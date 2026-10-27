# 部署到 AWS S3 + CloudFront

在 AWS 上托管 BentoPDF，获得最大的控制力和可扩展性。

## 架构

```
User → CloudFront (CDN) → S3 (Static Files)
```

## 第 1 步：创建 S3 存储桶

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## 第 2 步：构建并上传

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

## 第 3 步：创建 CloudFront 分配

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

或者使用 AWS 控制台：

1. 前往 CloudFront → Create distribution
2. Origin domain：选择您的 S3 存储桶
3. 启用 "Origin Access Control"
4. Default root object：`index.html`
5. 创建分配

## 第 3b 步：响应头策略（LibreOffice WASM 必需）

基于 LibreOffice 的转换（Word、Excel、PowerPoint 转 PDF）需要 `SharedArrayBuffer`，而这需要特定的响应头。请创建一个 CloudFront 响应头策略（Response Headers Policy）：

1. 前往 CloudFront → Policies → Response headers
2. 创建包含以下响应头的自定义策略：

| 响应头                         | 值             |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. 将该策略附加到分配的默认缓存行为

或者通过 CLI：

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

## 第 3c 步：预压缩 WASM 文件的 S3 元数据

LibreOffice WASM 文件是预压缩的（`.wasm.gz`、`.data.gz`）。请设置正确的 Content-Type 和 Content-Encoding，让浏览器能够正确解压：

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
如果没有响应头策略，`SharedArrayBuffer` 将不可用，LibreOffice WASM 转换会卡在约 55%。如果 `.gz` 文件没有正确的 Content-Encoding，浏览器会收到原始的 gzip 字节，WASM 编译将失败。
:::

## 第 4 步：S3 存储桶策略

允许 CloudFront 访问存储桶：

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

## 第 5 步：自定义错误页面

将 404 配置为返回 `index.html`，以支持 SPA 路由：

1. CloudFront → Error pages
2. 创建自定义错误响应：
   - HTTP error code：404
   - Response page path：`/index.html`
   - HTTP response code：200

## 成本估算

| 资源                    | 预估成本    |
| ----------------------- | ----------- |
| S3 存储（约 500MB）     | 约 $0.01/月 |
| CloudFront（1TB 流量）  | 约 $85/月   |
| CloudFront（10GB 流量） | 约 $0.85/月 |

::: tip
对于不常访问的文件，可使用 S3 Intelligent Tiering 来优化成本。
:::

## 使用 Terraform 自动化

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
