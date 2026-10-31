# Implementeren op AWS S3 + CloudFront

Host BentoPDF op AWS voor maximale controle en schaalbaarheid.

## Architectuur

```
User → CloudFront (CDN) → S3 (Static Files)
```

## Stap 1: Maak een S3-bucket

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## Stap 2: Bouwen en uploaden

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

## Stap 3: Maak een CloudFront-distributie

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

Of gebruik de AWS Console:

1. Ga naar CloudFront → Create distribution
2. Origin domain: selecteer je S3-bucket
3. Schakel "Origin Access Control" in
4. Default root object: `index.html`
5. Maak de distributie aan

## Stap 3b: Response Headers Policy (vereist voor LibreOffice WASM)

Conversies met LibreOffice (Word, Excel, PowerPoint naar PDF) vereisen `SharedArrayBuffer`, waarvoor specifieke responsheaders nodig zijn. Maak een CloudFront Response Headers Policy aan:

1. Ga naar CloudFront → Policies → Response headers
2. Maak een aangepaste policy met deze headers:

| Header                         | Waarde         |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. Koppel de policy aan het standaard cachegedrag van je distributie

Of via de CLI:

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

## Stap 3c: S3-metadata voor vooraf gecomprimeerde WASM-bestanden

De LibreOffice WASM-bestanden zijn vooraf gecomprimeerd (`.wasm.gz`, `.data.gz`). Stel de juiste Content-Type en Content-Encoding in, zodat browsers ze decomprimeren:

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

::: warning Belangrijk
Zonder de response headers policy is `SharedArrayBuffer` niet beschikbaar en blijven LibreOffice WASM-conversies hangen op ~55%. Zonder de juiste Content-Encoding op de `.gz`-bestanden ontvangt de browser onbewerkte gzip-bytes en mislukt de WASM-compilatie.
:::

## Stap 4: S3-bucketbeleid

Geef CloudFront toegang tot de bucket:

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

## Stap 5: Aangepaste foutpagina's

Configureer 404 zo dat `index.html` wordt geretourneerd voor SPA-routing:

1. CloudFront → Error pages
2. Maak een aangepaste foutrespons:
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200

## Kostenraming

| Resource                   | Geschatte kosten |
| -------------------------- | ---------------- |
| S3-opslag (~500MB)         | ~$0,01/maand     |
| CloudFront (1TB transfer)  | ~$85/maand       |
| CloudFront (10GB transfer) | ~$0,85/maand     |

::: tip
Gebruik S3 Intelligent Tiering voor kostenoptimalisatie bij bestanden die zelden worden geopend.
:::

## Automatisering met Terraform

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
