# Nasadenie na AWS S3 + CloudFront

Hosťujte BentoPDF na AWS pre maximálnu kontrolu a škálovateľnosť.

## Architektúra

```
User → CloudFront (CDN) → S3 (Static Files)
```

## Krok 1: Vytvorenie S3 bucketu

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## Krok 2: Zostavenie a nahranie

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

## Krok 3: Vytvorenie CloudFront distribúcie

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

Alebo použite AWS Console:

1. Prejdite do CloudFront → Create distribution
2. Origin domain: vyberte svoj S3 bucket
3. Zapnite „Origin Access Control“
4. Default root object: `index.html`
5. Vytvorte distribúciu

## Krok 3b: Politika hlavičiek odpovede (potrebná pre LibreOffice WASM)

Prevody založené na LibreOffice (Word, Excel, PowerPoint do PDF) vyžadujú `SharedArrayBuffer`, ktorý potrebuje konkrétne hlavičky odpovede. Vytvorte CloudFront Response Headers Policy:

1. Prejdite do CloudFront → Policies → Response headers
2. Vytvorte vlastnú politiku s týmito hlavičkami:

| Hlavička                       | Hodnota        |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. Pripojte politiku k predvolenému správaniu cache vašej distribúcie

Alebo cez CLI:

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

## Krok 3c: S3 metadáta pre predkomprimované WASM súbory

Súbory LibreOffice WASM sú predkomprimované (`.wasm.gz`, `.data.gz`). Nastavte správne Content-Type a Content-Encoding, aby ich prehliadače dekomprimovali:

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

::: warning Dôležité
Bez politiky hlavičiek odpovede nie je `SharedArrayBuffer` dostupný a prevody cez LibreOffice WASM sa zaseknú na ~55 %. Bez správneho Content-Encoding na súboroch `.gz` dostane prehliadač surové gzip bajty a kompilácia WASM zlyhá.
:::

## Krok 4: Politika S3 bucketu

Povoľte CloudFront prístup k bucketu:

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

## Krok 5: Vlastné chybové stránky

Nastavte, aby 404 vracala `index.html` pre smerovanie SPA:

1. CloudFront → Error pages
2. Vytvorte vlastnú chybovú odpoveď:
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200

## Odhad nákladov

| Zdroj                     | Odhadované náklady |
| ------------------------- | ------------------ |
| Úložisko S3 (~500MB)      | ~$0.01/mesiac      |
| CloudFront (1TB prenosu)  | ~$85/mesiac        |
| CloudFront (10GB prenosu) | ~$0.85/mesiac      |

::: tip
Na optimalizáciu nákladov pri zriedka používaných súboroch použite S3 Intelligent Tiering.
:::

## Automatizácia s Terraform

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
