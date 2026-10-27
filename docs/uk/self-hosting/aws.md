# Розгортання на AWS S3 + CloudFront

Розмістіть BentoPDF на AWS для максимального контролю та масштабованості.

## Архітектура

```
User → CloudFront (CDN) → S3 (Static Files)
```

## Крок 1: створіть бакет S3

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## Крок 2: зберіть і завантажте

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

## Крок 3: створіть дистрибуцію CloudFront

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

Або скористайтеся консоллю AWS:

1. Перейдіть до CloudFront → Create distribution
2. Origin domain: виберіть свій бакет S3
3. Увімкніть "Origin Access Control"
4. Default root object: `index.html`
5. Створіть дистрибуцію

## Крок 3b: політика заголовків відповіді (обов'язково для LibreOffice WASM)

Конвертація на основі LibreOffice (Word, Excel, PowerPoint у PDF) потребує `SharedArrayBuffer`, для чого потрібні певні заголовки відповіді. Створіть CloudFront Response Headers Policy:

1. Перейдіть до CloudFront → Policies → Response headers
2. Створіть власну політику з такими заголовками:

| Заголовок                      | Значення       |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. Прикріпіть політику до стандартної поведінки кешу (default cache behavior) вашої дистрибуції

Або через CLI:

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

## Крок 3c: метадані S3 для попередньо стиснутих файлів WASM

Файли LibreOffice WASM попередньо стиснуті (`.wasm.gz`, `.data.gz`). Задайте правильні Content-Type і Content-Encoding, щоб браузери розпаковували їх:

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

::: warning Важливо
Без політики заголовків відповіді `SharedArrayBuffer` недоступний, і конвертація LibreOffice WASM зависатиме приблизно на 55%. Без правильного Content-Encoding для файлів `.gz` браузер отримує необроблені байти gzip, і компіляція WASM завершується помилкою.
:::

## Крок 4: політика бакета S3

Дозвольте CloudFront доступ до бакета:

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

## Крок 5: власні сторінки помилок

Налаштуйте повернення `index.html` для 404 для маршрутизації SPA:

1. CloudFront → Error pages
2. Створіть власну відповідь на помилку:
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200

## Оцінка вартості

| Ресурс                    | Орієнтовна вартість |
| ------------------------- | ------------------- |
| Сховище S3 (~500MB)       | ~$0.01/міс.         |
| CloudFront (1TB трафіку)  | ~$85/міс.           |
| CloudFront (10GB трафіку) | ~$0.85/міс.         |

::: tip
Використовуйте S3 Intelligent Tiering, щоб оптимізувати витрати на файли, до яких звертаються нечасто.
:::

## Автоматизація за допомогою Terraform

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
