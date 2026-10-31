# Wdrożenie na AWS S3 + CloudFront

Hostuj BentoPDF na AWS, aby uzyskać maksymalną kontrolę i skalowalność.

## Architektura

```
User → CloudFront (CDN) → S3 (Static Files)
```

## Krok 1: Utwórz bucket S3

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## Krok 2: Zbuduj i wyślij

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

## Krok 3: Utwórz dystrybucję CloudFront

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

Albo użyj konsoli AWS:

1. Przejdź do CloudFront → Create distribution
2. Origin domain: wybierz swój bucket S3
3. Włącz „Origin Access Control”
4. Default root object: `index.html`
5. Utwórz dystrybucję

## Krok 3b: Polityka nagłówków odpowiedzi (wymagana dla LibreOffice WASM)

Konwersje oparte na LibreOffice (Word, Excel, PowerPoint do PDF) wymagają `SharedArrayBuffer`, a to wymaga określonych nagłówków odpowiedzi. Utwórz politykę nagłówków odpowiedzi CloudFront (Response Headers Policy):

1. Przejdź do CloudFront → Policies → Response headers
2. Utwórz własną politykę z tymi nagłówkami:

| Nagłówek                       | Wartość        |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. Dołącz politykę do domyślnego zachowania pamięci podręcznej (default cache behavior) swojej dystrybucji

Albo przez CLI:

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

## Krok 3c: Metadane S3 dla wstępnie skompresowanych plików WASM

Pliki LibreOffice WASM są wstępnie skompresowane (`.wasm.gz`, `.data.gz`). Ustaw poprawny Content-Type i Content-Encoding, aby przeglądarki je rozpakowywały:

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

::: warning Ważne
Bez polityki nagłówków odpowiedzi `SharedArrayBuffer` jest niedostępny, a konwersje LibreOffice WASM zawieszą się na ok. 55%. Bez poprawnego Content-Encoding dla plików `.gz` przeglądarka otrzymuje surowe bajty gzip i kompilacja WASM kończy się błędem.
:::

## Krok 4: Polityka bucketu S3

Zezwól CloudFront na dostęp do bucketu:

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

## Krok 5: Własne strony błędów

Skonfiguruj 404 tak, aby zwracał `index.html` na potrzeby routingu SPA:

1. CloudFront → Error pages
2. Utwórz własną odpowiedź błędu:
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200

## Szacunkowe koszty

| Zasób                       | Szacunkowy koszt |
| --------------------------- | ---------------- |
| Magazyn S3 (~500MB)         | ~$0.01/mies.     |
| CloudFront (1TB transferu)  | ~$85/mies.       |
| CloudFront (10GB transferu) | ~$0.85/mies.     |

::: tip
Użyj S3 Intelligent Tiering, aby obniżyć koszty plików rzadko używanych.
:::

## Automatyzacja z Terraform

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
