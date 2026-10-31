# Desplega a AWS S3 + CloudFront

Allotja BentoPDF a AWS per tenir el màxim control i escalabilitat.

## Arquitectura

```
User → CloudFront (CDN) → S3 (Static Files)
```

## Pas 1: crea el bucket d'S3

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## Pas 2: compila i puja

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

## Pas 3: crea la distribució de CloudFront

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

O utilitza la consola d'AWS:

1. Ves a CloudFront → Create distribution
2. Origin domain: selecciona el teu bucket d'S3
3. Activa "Origin Access Control"
4. Default root object: `index.html`
5. Crea la distribució

## Pas 3b: política de capçaleres de resposta (obligatòria per a LibreOffice WASM)

Les conversions basades en LibreOffice (Word, Excel i PowerPoint a PDF) requereixen `SharedArrayBuffer`, que necessita unes capçaleres de resposta concretes. Crea una Response Headers Policy de CloudFront:

1. Ves a CloudFront → Policies → Response headers
2. Crea una política personalitzada amb aquestes capçaleres:

| Capçalera                      | Valor          |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. Associa la política al comportament de memòria cau per defecte de la distribució

O per CLI:

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

## Pas 3c: metadades d'S3 per als fitxers WASM precomprimits

Els fitxers WASM de LibreOffice estan precomprimits (`.wasm.gz`, `.data.gz`). Defineix el Content-Type i el Content-Encoding correctes perquè els navegadors els descomprimeixin:

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

::: warning Important
Sense la política de capçaleres de resposta, `SharedArrayBuffer` no està disponible i les conversions de LibreOffice WASM es quedaran bloquejades al ~55 %. Sense el Content-Encoding correcte als fitxers `.gz`, el navegador rep bytes gzip en brut i la compilació de WASM falla.
:::

## Pas 4: política del bucket d'S3

Permet que CloudFront accedeixi al bucket:

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

## Pas 5: pàgines d'error personalitzades

Configura el 404 perquè retorni `index.html` per a l'encaminament SPA:

1. CloudFront → Error pages
2. Crea una resposta d'error personalitzada:
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200

## Estimació de costos

| Recurs                      | Cost estimat |
| --------------------------- | ------------ |
| Emmagatzematge S3 (~500MB)  | ~0,01 $/mes  |
| CloudFront (1TB transfer.)  | ~85 $/mes    |
| CloudFront (10GB transfer.) | ~0,85 $/mes  |

::: tip
Utilitza S3 Intelligent Tiering per optimitzar costos en fitxers d'accés poc freqüent.
:::

## Automatització amb Terraform

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
