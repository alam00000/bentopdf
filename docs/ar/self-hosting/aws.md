# النشر على AWS S3 + CloudFront

استضف BentoPDF على AWS للحصول على أقصى تحكم وقابلية للتوسع.

## البنية

```
User → CloudFront (CDN) → S3 (Static Files)
```

## الخطوة 1: إنشاء حاوية S3

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## الخطوة 2: البناء والرفع

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

## الخطوة 3: إنشاء توزيع CloudFront

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

أو استخدم وحدة تحكم AWS:

1. انتقل إلى CloudFront ← Create distribution
2. Origin domain: اختر حاوية S3 الخاصة بك
3. فعّل "Origin Access Control"
4. Default root object: `index.html`
5. أنشئ التوزيع (Create distribution)

## الخطوة 3b: سياسة ترويسات الاستجابة (مطلوبة لـ LibreOffice WASM)

تتطلب التحويلات المعتمدة على LibreOffice (من Word وExcel وPowerPoint إلى PDF) وجود `SharedArrayBuffer`، وهذا يحتاج إلى ترويسات استجابة محددة. أنشئ سياسة ترويسات استجابة في CloudFront:

1. انتقل إلى CloudFront ← Policies ← Response headers
2. أنشئ سياسة مخصصة بهذه الترويسات:

| الترويسة                       | القيمة         |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. اربط السياسة بسلوك التخزين المؤقت الافتراضي لتوزيعك

أو عبر سطر الأوامر:

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

## الخطوة 3c: بيانات S3 الوصفية لملفات WASM المضغوطة مسبقًا

ملفات LibreOffice WASM مضغوطة مسبقًا (`.wasm.gz` و`.data.gz`). اضبط Content-Type وContent-Encoding الصحيحين لكي تفك المتصفحات ضغطها:

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
بدون سياسة ترويسات الاستجابة، لن يتوفر `SharedArrayBuffer` وستتوقف تحويلات LibreOffice WASM عند نحو 55%. وبدون Content-Encoding الصحيح على ملفات `.gz`، يستلم المتصفح بايتات gzip الخام ويفشل تجميع WASM.
:::

## الخطوة 4: سياسة حاوية S3

اسمح لـ CloudFront بالوصول إلى الحاوية:

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

## الخطوة 5: صفحات الخطأ المخصصة

اضبط الخطأ 404 ليعيد `index.html` لتوجيه تطبيق الصفحة الواحدة (SPA):

1. CloudFront ← Error pages
2. أنشئ استجابة خطأ مخصصة:
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200

## تقدير التكلفة

| المورد                | التكلفة التقديرية |
| --------------------- | ----------------- |
| تخزين S3 (~500MB)     | ~$0.01/شهريًا     |
| CloudFront (نقل 1TB)  | ~$85/شهريًا       |
| CloudFront (نقل 10GB) | ~$0.85/شهريًا     |

::: tip
استخدم S3 Intelligent Tiering لتحسين التكلفة للملفات التي نادرًا ما يُوصل إليها.
:::

## الأتمتة باستخدام Terraform

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
