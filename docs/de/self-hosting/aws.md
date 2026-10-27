# Auf AWS S3 + CloudFront bereitstellen

Hosten Sie BentoPDF auf AWS für maximale Kontrolle und Skalierbarkeit.

## Architektur

```
User → CloudFront (CDN) → S3 (Static Files)
```

## Schritt 1: S3-Bucket erstellen

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## Schritt 2: Bauen und hochladen

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

## Schritt 3: CloudFront-Distribution erstellen

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

Oder nutzen Sie die AWS-Konsole:

1. Gehen Sie zu CloudFront → Create distribution
2. Origin domain: Wählen Sie Ihren S3-Bucket aus
3. Aktivieren Sie "Origin Access Control"
4. Default root object: `index.html`
5. Erstellen Sie die Distribution

## Schritt 3b: Response Headers Policy (erforderlich für LibreOffice WASM)

LibreOffice-basierte Konvertierungen (Word, Excel, PowerPoint zu PDF) benötigen `SharedArrayBuffer`, wofür bestimmte Response-Header nötig sind. Erstellen Sie eine CloudFront Response Headers Policy:

1. Gehen Sie zu CloudFront → Policies → Response headers
2. Erstellen Sie eine eigene Policy mit diesen Headern:

| Header                         | Wert           |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. Weisen Sie die Policy dem Default Cache Behavior Ihrer Distribution zu

Oder per CLI:

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

## Schritt 3c: S3-Metadaten für vorkomprimierte WASM-Dateien

Die LibreOffice-WASM-Dateien sind vorkomprimiert (`.wasm.gz`, `.data.gz`). Setzen Sie den richtigen Content-Type und das richtige Content-Encoding, damit Browser sie entpacken:

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

::: warning Wichtig
Ohne die Response Headers Policy ist `SharedArrayBuffer` nicht verfügbar, und LibreOffice-WASM-Konvertierungen bleiben bei ca. 55% hängen. Ohne das richtige Content-Encoding für die `.gz`-Dateien erhält der Browser rohe gzip-Bytes, und die WASM-Kompilierung schlägt fehl.
:::

## Schritt 4: S3-Bucket-Policy

Erlauben Sie CloudFront den Zugriff auf den Bucket:

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

## Schritt 5: Eigene Fehlerseiten

Konfigurieren Sie 404 so, dass für das SPA-Routing `index.html` zurückgegeben wird:

1. CloudFront → Error pages
2. Erstellen Sie eine eigene Fehlerantwort:
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200

## Kostenschätzung

| Ressource                  | Geschätzte Kosten |
| -------------------------- | ----------------- |
| S3 Storage (~500MB)        | ~$0.01/Monat      |
| CloudFront (1TB transfer)  | ~$85/Monat        |
| CloudFront (10GB transfer) | ~$0.85/Monat      |

::: tip
Nutzen Sie S3 Intelligent Tiering zur Kostenoptimierung bei selten abgerufenen Dateien.
:::

## Automatisierung mit Terraform

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
