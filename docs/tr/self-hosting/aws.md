# AWS S3 + CloudFront'a Dağıtım

Azami kontrol ve ölçeklenebilirlik için BentoPDF'i AWS üzerinde barındırın.

## Mimari

```
User → CloudFront (CDN) → S3 (Static Files)
```

## Adım 1: S3 Bucket Oluşturun

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## Adım 2: Derleyin ve Yükleyin

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

## Adım 3: CloudFront Dağıtımı Oluşturun

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

Veya AWS Console'u kullanın:

1. CloudFront → Create distribution bölümüne gidin
2. Origin domain: S3 bucket'ınızı seçin
3. "Origin Access Control" seçeneğini etkinleştirin
4. Default root object: `index.html`
5. Dağıtımı oluşturun

## Adım 3b: Response Headers Policy (LibreOffice WASM için Gerekli)

LibreOffice tabanlı dönüştürmeler (Word, Excel, PowerPoint'ten PDF'e) `SharedArrayBuffer` gerektirir ve bunun için belirli yanıt başlıkları gerekir. Bir CloudFront Response Headers Policy oluşturun:

1. CloudFront → Policies → Response headers bölümüne gidin
2. Şu başlıklarla özel bir politika oluşturun:

| Başlık                         | Değer          |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. Politikayı dağıtımınızın varsayılan önbellek davranışına bağlayın

Veya CLI ile:

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

## Adım 3c: Önceden Sıkıştırılmış WASM Dosyaları için S3 Metadata

LibreOffice WASM dosyaları önceden sıkıştırılmıştır (`.wasm.gz`, `.data.gz`). Tarayıcıların bunları açabilmesi için doğru Content-Type ve Content-Encoding değerlerini ayarlayın:

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

::: warning Önemli
Response headers policy olmadan `SharedArrayBuffer` kullanılamaz ve LibreOffice WASM dönüştürmeleri yaklaşık %55'te takılır. `.gz` dosyalarında doğru Content-Encoding yoksa tarayıcı ham gzip baytlarını alır ve WASM derlemesi başarısız olur.
:::

## Adım 4: S3 Bucket Policy

CloudFront'un bucket'a erişmesine izin verin:

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

## Adım 5: Özel Hata Sayfaları

SPA yönlendirmesi için 404'ün `index.html` döndürmesini yapılandırın:

1. CloudFront → Error pages
2. Özel hata yanıtı oluşturun:
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200

## Maliyet Tahmini

| Kaynak                    | Tahmini Maliyet |
| ------------------------- | --------------- |
| S3 Depolama (~500MB)      | ~$0.01/ay       |
| CloudFront (1TB aktarım)  | ~$85/ay         |
| CloudFront (10GB aktarım) | ~$0.85/ay       |

::: tip
Seyrek erişilen dosyalarda maliyet optimizasyonu için S3 Intelligent Tiering kullanın.
:::

## Terraform ile Otomasyon

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
