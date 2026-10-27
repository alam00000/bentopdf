# Развёртывание на AWS S3 + CloudFront

Размещение BentoPDF на AWS для максимального контроля и масштабируемости.

## Архитектура

```
User → CloudFront (CDN) → S3 (Static Files)
```

## Шаг 1: создайте S3-бакет

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## Шаг 2: сборка и загрузка

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

## Шаг 3: создайте дистрибутив CloudFront

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

Или воспользуйтесь консолью AWS:

1. Откройте CloudFront → Create distribution
2. Origin domain: выберите свой S3-бакет
3. Включите "Origin Access Control"
4. Default root object: `index.html`
5. Создайте дистрибутив

## Шаг 3b: политика заголовков ответа (обязательна для LibreOffice WASM)

Конвертации на основе LibreOffice (Word, Excel, PowerPoint в PDF) требуют `SharedArrayBuffer`, для которого нужны определённые заголовки ответа. Создайте политику заголовков ответа CloudFront (Response Headers Policy):

1. Откройте CloudFront → Policies → Response headers
2. Создайте собственную политику с такими заголовками:

| Заголовок                      | Значение       |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. Привяжите политику к default cache behavior вашего дистрибутива

Или через CLI:

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

## Шаг 3c: метаданные S3 для предварительно сжатых файлов WASM

Файлы LibreOffice WASM предварительно сжаты (`.wasm.gz`, `.data.gz`). Задайте правильные Content-Type и Content-Encoding, чтобы браузеры их распаковывали:

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

::: warning Важно
Без политики заголовков ответа `SharedArrayBuffer` недоступен, и конвертации LibreOffice WASM зависнут примерно на 55%. Без правильного Content-Encoding у файлов `.gz` браузер получает необработанные байты gzip, и компиляция WASM завершается ошибкой.
:::

## Шаг 4: политика S3-бакета

Разрешите CloudFront доступ к бакету:

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

## Шаг 5: собственные страницы ошибок

Настройте возврат `index.html` при 404 для маршрутизации SPA:

1. CloudFront → Error pages
2. Создайте собственный ответ на ошибку:
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200

## Оценка стоимости

| Ресурс                     | Ориентировочная стоимость |
| -------------------------- | ------------------------- |
| S3 Storage (~500MB)        | ~$0.01/мес.               |
| CloudFront (1TB transfer)  | ~$85/мес.                 |
| CloudFront (10GB transfer) | ~$0.85/мес.               |

::: tip
Используйте S3 Intelligent Tiering, чтобы снизить расходы на редко запрашиваемые файлы.
:::

## Автоматизация с Terraform

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
