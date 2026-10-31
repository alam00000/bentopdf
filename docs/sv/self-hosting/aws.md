# Driftsätt på AWS S3 + CloudFront

Hosta BentoPDF på AWS för maximal kontroll och skalbarhet.

## Arkitektur

```
User → CloudFront (CDN) → S3 (Static Files)
```

## Steg 1: Skapa S3-bucket

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## Steg 2: Bygg och ladda upp

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

## Steg 3: Skapa CloudFront-distribution

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

Eller använd AWS Console:

1. Gå till CloudFront → Create distribution
2. Origin domain: välj din S3-bucket
3. Aktivera "Origin Access Control"
4. Default root object: `index.html`
5. Skapa distributionen

## Steg 3b: Response Headers Policy (krävs för LibreOffice WASM)

LibreOffice-baserade konverteringar (Word, Excel, PowerPoint till PDF) kräver `SharedArrayBuffer`, vilket kräver specifika svarsrubriker. Skapa en CloudFront Response Headers Policy:

1. Gå till CloudFront → Policies → Response headers
2. Skapa en anpassad policy med dessa rubriker:

| Rubrik                         | Värde          |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. Koppla policyn till din distributions standardbeteende för cache

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

## Steg 3c: S3-metadata för förkomprimerade WASM-filer

LibreOffice WASM-filerna är förkomprimerade (`.wasm.gz`, `.data.gz`). Ange rätt Content-Type och Content-Encoding så att webbläsare packar upp dem:

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

::: warning Viktigt
Utan policyn för svarsrubriker är `SharedArrayBuffer` inte tillgängligt och LibreOffice WASM-konverteringar hänger sig vid cirka 55%. Utan rätt Content-Encoding på `.gz`-filerna får webbläsaren råa gzip-byte och WASM-kompileringen misslyckas.
:::

## Steg 4: S3 Bucket Policy

Ge CloudFront åtkomst till bucketen:

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

## Steg 5: Anpassade felsidor

Konfigurera 404 så att den returnerar `index.html` för SPA-routing:

1. CloudFront → Error pages
2. Skapa ett anpassat felsvar:
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200

## Kostnadsuppskattning

| Resurs                       | Uppskattad kostnad |
| ---------------------------- | ------------------ |
| S3-lagring (~500MB)          | ~$0.01/månad       |
| CloudFront (1TB överföring)  | ~$85/månad         |
| CloudFront (10GB överföring) | ~$0.85/månad       |

::: tip
Använd S3 Intelligent Tiering för att optimera kostnaden för filer som sällan används.
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
