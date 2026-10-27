# Deploy ke AWS S3 + CloudFront

Hosting BentoPDF di AWS untuk kontrol dan skalabilitas maksimum.

## Arsitektur

```
User → CloudFront (CDN) → S3 (Static Files)
```

## Langkah 1: Buat Bucket S3

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## Langkah 2: Build dan Unggah

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

## Langkah 3: Buat Distribusi CloudFront

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

Atau gunakan AWS Console:

1. Buka CloudFront → Create distribution
2. Origin domain: pilih bucket S3 Anda
3. Aktifkan "Origin Access Control"
4. Default root object: `index.html`
5. Buat distribusi

## Langkah 3b: Response Headers Policy (Diperlukan untuk LibreOffice WASM)

Konversi berbasis LibreOffice (Word, Excel, PowerPoint ke PDF) memerlukan `SharedArrayBuffer`, yang membutuhkan header respons tertentu. Buat CloudFront Response Headers Policy:

1. Buka CloudFront → Policies → Response headers
2. Buat kebijakan kustom dengan header berikut:

| Header                         | Nilai          |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. Lampirkan kebijakan ke default cache behavior distribusi Anda

Atau melalui CLI:

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

## Langkah 3c: Metadata S3 untuk File WASM yang Sudah Terkompresi

File LibreOffice WASM sudah terkompresi (`.wasm.gz`, `.data.gz`). Atur Content-Type dan Content-Encoding yang benar agar browser dapat mendekompresinya:

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

::: warning Penting
Tanpa response headers policy, `SharedArrayBuffer` tidak tersedia dan konversi LibreOffice WASM akan macet di sekitar 55%. Tanpa Content-Encoding yang benar pada file `.gz`, browser menerima byte gzip mentah dan kompilasi WASM gagal.
:::

## Langkah 4: Bucket Policy S3

Izinkan CloudFront mengakses bucket:

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

## Langkah 5: Halaman Error Kustom

Konfigurasikan 404 agar mengembalikan `index.html` untuk routing SPA:

1. CloudFront → Error pages
2. Buat custom error response:
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200

## Perkiraan Biaya

| Sumber Daya                | Perkiraan Biaya |
| -------------------------- | --------------- |
| S3 Storage (~500MB)        | ~$0.01/bulan    |
| CloudFront (1TB transfer)  | ~$85/bulan      |
| CloudFront (10GB transfer) | ~$0.85/bulan    |

::: tip
Gunakan S3 Intelligent Tiering untuk mengoptimalkan biaya pada file yang jarang diakses.
:::

## Otomatisasi dengan Terraform

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
