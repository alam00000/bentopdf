# Triển khai lên AWS S3 + CloudFront

Lưu trữ BentoPDF trên AWS để kiểm soát và mở rộng tối đa.

## Kiến trúc

```
User → CloudFront (CDN) → S3 (Static Files)
```

## Bước 1: Tạo S3 bucket

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## Bước 2: Build và tải lên

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

## Bước 3: Tạo bản phân phối CloudFront

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

Hoặc dùng AWS Console:

1. Vào CloudFront → Create distribution
2. Origin domain: chọn S3 bucket của bạn
3. Bật "Origin Access Control"
4. Default root object: `index.html`
5. Tạo distribution

## Bước 3b: Chính sách header phản hồi (bắt buộc cho LibreOffice WASM)

Các chuyển đổi dựa trên LibreOffice (Word, Excel, PowerPoint sang PDF) cần `SharedArrayBuffer`, và điều này đòi hỏi các header phản hồi cụ thể. Hãy tạo một CloudFront Response Headers Policy:

1. Vào CloudFront → Policies → Response headers
2. Tạo chính sách tùy chỉnh với các header sau:

| Header                         | Giá trị        |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. Gắn chính sách vào default cache behavior của distribution

Hoặc qua CLI:

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

## Bước 3c: Metadata S3 cho tệp WASM nén sẵn

Các tệp WASM của LibreOffice được nén sẵn (`.wasm.gz`, `.data.gz`). Hãy đặt Content-Type và Content-Encoding đúng để trình duyệt giải nén chúng:

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

::: warning Quan trọng
Nếu thiếu chính sách header phản hồi, `SharedArrayBuffer` sẽ không khả dụng và các chuyển đổi LibreOffice WASM sẽ bị treo ở khoảng 55%. Nếu thiếu Content-Encoding đúng trên các tệp `.gz`, trình duyệt sẽ nhận byte gzip thô và việc biên dịch WASM sẽ thất bại.
:::

## Bước 4: Chính sách S3 bucket

Cho phép CloudFront truy cập bucket:

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

## Bước 5: Trang lỗi tùy chỉnh

Cấu hình 404 trả về `index.html` cho định tuyến SPA:

1. CloudFront → Error pages
2. Tạo phản hồi lỗi tùy chỉnh:
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200

## Ước tính chi phí

| Tài nguyên               | Chi phí ước tính |
| ------------------------ | ---------------- |
| Lưu trữ S3 (~500MB)      | ~$0.01/tháng     |
| CloudFront (truyền 1TB)  | ~$85/tháng       |
| CloudFront (truyền 10GB) | ~$0.85/tháng     |

::: tip
Dùng S3 Intelligent Tiering để tối ưu chi phí cho các tệp ít được truy cập.
:::

## Tự động hóa với Terraform

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
