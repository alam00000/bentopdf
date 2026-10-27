# Installer på AWS S3 + CloudFront

Host BentoPDF på AWS for maksimal kontrol og skalerbarhed.

## Arkitektur

```
User → CloudFront (CDN) → S3 (Static Files)
```

## Trin 1: Opret S3-bucket

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## Trin 2: Byg og upload

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

## Trin 3: Opret CloudFront-distribution

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

Eller brug AWS Console:

1. Gå til CloudFront → Create distribution
2. Origin domain: Vælg din S3-bucket
3. Aktivér "Origin Access Control"
4. Default root object: `index.html`
5. Opret distributionen

## Trin 3b: Response Headers Policy (påkrævet til LibreOffice WASM)

LibreOffice-baserede konverteringer (Word, Excel, PowerPoint til PDF) kræver `SharedArrayBuffer`, som kræver bestemte svarheadere. Opret en CloudFront Response Headers Policy:

1. Gå til CloudFront → Policies → Response headers
2. Opret en brugerdefineret policy med disse headere:

| Header                         | Værdi          |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. Tilknyt policyen til din distributions standard-cache behavior

Eller via CLI:

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

## Trin 3c: S3-metadata til forkomprimerede WASM-filer

LibreOffice WASM-filerne er forkomprimerede (`.wasm.gz`, `.data.gz`). Sæt den korrekte Content-Type og Content-Encoding, så browsere dekomprimerer dem:

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

::: warning Vigtigt
Uden response headers policy er `SharedArrayBuffer` ikke tilgængelig, og LibreOffice WASM-konverteringer hænger ved ca. 55 %. Uden den korrekte Content-Encoding på `.gz`-filerne modtager browseren rå gzip-bytes, og WASM-kompilering mislykkes.
:::

## Trin 4: S3 bucket policy

Giv CloudFront adgang til bucketten:

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

## Trin 5: Brugerdefinerede fejlsider

Konfigurer 404 til at returnere `index.html` til SPA-routing:

1. CloudFront → Error pages
2. Opret et brugerdefineret fejlsvar:
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200

## Omkostningsestimat

| Ressource                  | Estimeret pris |
| -------------------------- | -------------- |
| S3 Storage (~500MB)        | ~$0.01/måned   |
| CloudFront (1TB transfer)  | ~$85/måned     |
| CloudFront (10GB transfer) | ~$0.85/måned   |

::: tip
Brug S3 Intelligent Tiering til at spare penge på filer, der sjældent tilgås.
:::

## Automatisering med Terraform

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
