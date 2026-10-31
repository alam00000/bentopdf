# Déployer sur AWS S3 + CloudFront

Hébergez BentoPDF sur AWS pour un contrôle et une évolutivité maximaux.

## Architecture

```
User → CloudFront (CDN) → S3 (Static Files)
```

## Étape 1 : créer le bucket S3

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## Étape 2 : compiler et téléverser

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

## Étape 3 : créer la distribution CloudFront

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

Ou utilisez la console AWS :

1. Allez dans CloudFront → Create distribution
2. Origin domain : sélectionnez votre bucket S3
3. Activez « Origin Access Control »
4. Default root object : `index.html`
5. Créez la distribution

## Étape 3b : politique d'en-têtes de réponse (requise pour LibreOffice WASM)

Les conversions basées sur LibreOffice (Word, Excel, PowerPoint vers PDF) nécessitent `SharedArrayBuffer`, qui exige des en-têtes de réponse spécifiques. Créez une politique d'en-têtes de réponse CloudFront :

1. Allez dans CloudFront → Policies → Response headers
2. Créez une politique personnalisée avec ces en-têtes :

| Header                         | Value          |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. Associez la politique au comportement de cache par défaut de votre distribution

Ou via la CLI :

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

## Étape 3c : métadonnées S3 pour les fichiers WASM précompressés

Les fichiers WASM de LibreOffice sont précompressés (`.wasm.gz`, `.data.gz`). Définissez le bon Content-Type et le bon Content-Encoding pour que les navigateurs les décompressent :

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
Sans la politique d'en-têtes de réponse, `SharedArrayBuffer` n'est pas disponible et les conversions LibreOffice WASM resteront bloquées à environ 55 %. Sans le bon Content-Encoding sur les fichiers `.gz`, le navigateur reçoit des octets gzip bruts et la compilation WASM échoue.
:::

## Étape 4 : politique du bucket S3

Autorisez CloudFront à accéder au bucket :

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

## Étape 5 : pages d'erreur personnalisées

Configurez la 404 pour renvoyer `index.html` afin de gérer le routage SPA :

1. CloudFront → Error pages
2. Créez une réponse d'erreur personnalisée :
   - HTTP error code : 404
   - Response page path : `/index.html`
   - HTTP response code : 200

## Estimation des coûts

| Ressource                     | Coût estimé  |
| ----------------------------- | ------------ |
| Stockage S3 (~500 Mo)         | ~0,01 $/mois |
| CloudFront (1 To transféré)   | ~85 $/mois   |
| CloudFront (10 Go transférés) | ~0,85 $/mois |

::: tip
Utilisez S3 Intelligent Tiering pour optimiser les coûts des fichiers rarement consultés.
:::

## Automatisation avec Terraform

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
