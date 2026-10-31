# Distribuzione su AWS S3 + CloudFront

Ospita BentoPDF su AWS per il massimo controllo e la massima scalabilità.

## Architettura

```
User → CloudFront (CDN) → S3 (Static Files)
```

## Passaggio 1: crea il bucket S3

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## Passaggio 2: compila e carica

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

## Passaggio 3: crea la distribuzione CloudFront

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

Oppure usa la console AWS:

1. Vai su CloudFront → Create distribution
2. Origin domain: seleziona il tuo bucket S3
3. Abilita "Origin Access Control"
4. Default root object: `index.html`
5. Crea la distribuzione

## Passaggio 3b: policy degli header di risposta (necessaria per LibreOffice WASM)

Le conversioni basate su LibreOffice (da Word, Excel, PowerPoint a PDF) richiedono `SharedArrayBuffer`, che necessita di specifici header di risposta. Crea una Response Headers Policy di CloudFront:

1. Vai su CloudFront → Policies → Response headers
2. Crea una policy personalizzata con questi header:

| Header                         | Valore         |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. Associa la policy al default cache behavior della tua distribuzione

Oppure tramite CLI:

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

## Passaggio 3c: metadati S3 per i file WASM precompressi

I file WASM di LibreOffice sono precompressi (`.wasm.gz`, `.data.gz`). Imposta Content-Type e Content-Encoding corretti in modo che i browser li decomprimano:

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

::: warning Importante
Senza la policy degli header di risposta, `SharedArrayBuffer` non è disponibile e le conversioni LibreOffice WASM si bloccheranno intorno al 55%. Senza il Content-Encoding corretto sui file `.gz`, il browser riceve i byte gzip grezzi e la compilazione WASM fallisce.
:::

## Passaggio 4: policy del bucket S3

Consenti a CloudFront di accedere al bucket:

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

## Passaggio 5: pagine di errore personalizzate

Configura il 404 in modo che restituisca `index.html` per il routing SPA:

1. CloudFront → Error pages
2. Crea una risposta di errore personalizzata:
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200

## Stima dei costi

| Risorsa                    | Costo stimato |
| -------------------------- | ------------- |
| S3 Storage (~500MB)        | ~$0,01/mese   |
| CloudFront (1TB transfer)  | ~$85/mese     |
| CloudFront (10GB transfer) | ~$0,85/mese   |

::: tip
Usa S3 Intelligent Tiering per ottimizzare i costi dei file a cui si accede di rado.
:::

## Automazione con Terraform

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
