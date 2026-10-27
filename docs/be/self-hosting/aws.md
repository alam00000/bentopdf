# Разгортванне на AWS S3 + CloudFront

Размясціце BentoPDF на AWS для максімальнага кантролю і маштабаванасці.

## Архітэктура

```
User → CloudFront (CDN) → S3 (Static Files)
```

## Крок 1: Стварыце бакет S3

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## Крок 2: Зборка і загрузка

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

## Крок 3: Стварыце дыстрыбуцыю CloudFront

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

Або выкарыстайце AWS Console:

1. Перайдзіце ў CloudFront → Create distribution
2. Origin domain: выберыце ваш бакет S3
3. Уключыце "Origin Access Control"
4. Default root object: `index.html`
5. Стварыце дыстрыбуцыю

## Крок 3b: Палітыка загалоўкаў адказу (абавязкова для LibreOffice WASM)

Канвертацыі на аснове LibreOffice (Word, Excel, PowerPoint у PDF) патрабуюць `SharedArrayBuffer`, для якога патрэбныя пэўныя загалоўкі адказу. Стварыце CloudFront Response Headers Policy:

1. Перайдзіце ў CloudFront → Policies → Response headers
2. Стварыце ўласную палітыку з гэтымі загалоўкамі:

| Загаловак                      | Значэнне       |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. Прымацуйце палітыку да default cache behavior вашай дыстрыбуцыі

Або праз CLI:

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

## Крок 3c: Метаданыя S3 для папярэдне сціснутых файлаў WASM

Файлы LibreOffice WASM папярэдне сціснутыя (`.wasm.gz`, `.data.gz`). Задайце правільныя Content-Type і Content-Encoding, каб браўзеры іх распакоўвалі:

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

::: warning Важна
Без палітыкі загалоўкаў адказу `SharedArrayBuffer` недаступны, і канвертацыі LibreOffice WASM завісаюць на ~55%. Без правільнага Content-Encoding для файлаў `.gz` браўзер атрымлівае сырыя байты gzip, і кампіляцыя WASM не ўдаецца.
:::

## Крок 4: Палітыка бакета S3

Дазвольце CloudFront доступ да бакета:

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

## Крок 5: Уласныя старонкі памылак

Наладзьце 404 так, каб вяртаўся `index.html` для SPA-маршрутызацыі:

1. CloudFront → Error pages
2. Стварыце custom error response:
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200

## Ацэнка кошту

| Рэсурс                    | Прыблізны кошт |
| ------------------------- | -------------- |
| Сховішча S3 (~500MB)      | ~$0.01/месяц   |
| CloudFront (1TB трафіку)  | ~$85/месяц     |
| CloudFront (10GB трафіку) | ~$0.85/месяц   |

::: tip
Выкарыстоўвайце S3 Intelligent Tiering, каб зэканоміць на файлах, да якіх рэдка звяртаюцца.
:::

## Аўтаматызацыя з Terraform

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
