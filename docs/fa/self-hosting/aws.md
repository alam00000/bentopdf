# استقرار روی AWS S3 + CloudFront

BentoPDF را برای حداکثر کنترل و مقیاس‌پذیری روی AWS میزبانی کنید.

## معماری

```
User → CloudFront (CDN) → S3 (Static Files)
```

## گام ۱: ساخت S3 Bucket

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## گام ۲: ساخت و بارگذاری

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

## گام ۳: ساخت CloudFront Distribution

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

یا از AWS Console استفاده کنید:

1. به CloudFront ← Create distribution بروید
2. Origin domain: S3 bucket خود را انتخاب کنید
3. گزینهٔ "Origin Access Control" را فعال کنید
4. Default root object: `index.html`
5. distribution را بسازید

## گام ۳b: سیاست سرآیندهای پاسخ (لازم برای LibreOffice WASM)

تبدیل‌های مبتنی بر LibreOffice (Word، Excel، PowerPoint به PDF) به `SharedArrayBuffer` نیاز دارند که سرآیندهای پاسخ مشخصی را لازم دارد. یک CloudFront Response Headers Policy بسازید:

1. به CloudFront ← Policies ← Response headers بروید
2. یک سیاست سفارشی با این سرآیندها بسازید:

| سرآیند                         | مقدار          |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. سیاست را به default cache behavior مربوط به distribution خود متصل کنید

یا از طریق CLI:

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

## گام ۳c: فرادادهٔ S3 برای فایل‌های WASM از پیش فشرده‌شده

فایل‌های LibreOffice WASM از پیش فشرده شده‌اند (`.wasm.gz`، `.data.gz`). Content-Type و Content-Encoding درست را تنظیم کنید تا مرورگرها آن‌ها را از حالت فشرده خارج کنند:

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

::: warning مهم
بدون سیاست سرآیندهای پاسخ، `SharedArrayBuffer` در دسترس نیست و تبدیل‌های LibreOffice WASM در حدود ۵۵٪ متوقف می‌شوند. بدون Content-Encoding درست روی فایل‌های `.gz`، مرورگر بایت‌های خام gzip را دریافت می‌کند و کامپایل WASM شکست می‌خورد.
:::

## گام ۴: سیاست S3 Bucket

به CloudFront اجازهٔ دسترسی به bucket را بدهید:

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

## گام ۵: صفحات خطای سفارشی

خطای 404 را طوری پیکربندی کنید که برای مسیریابی SPA فایل `index.html` را برگرداند:

1. CloudFront ← Error pages
2. یک پاسخ خطای سفارشی بسازید:
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200

## برآورد هزینه

| منبع                        | هزینهٔ تقریبی |
| --------------------------- | ------------- |
| فضای ذخیره‌سازی S3 (~500MB) | ~$0.01 در ماه |
| CloudFront (انتقال 1TB)     | ~$85 در ماه   |
| CloudFront (انتقال 10GB)    | ~$0.85 در ماه |

::: tip
برای بهینه‌سازی هزینهٔ فایل‌هایی که کمتر به آن‌ها دسترسی می‌شود، از S3 Intelligent Tiering استفاده کنید.
:::

## خودکارسازی با Terraform

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
