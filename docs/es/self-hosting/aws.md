# Desplegar en AWS S3 + CloudFront

Aloja BentoPDF en AWS para obtener el máximo control y escalabilidad.

## Arquitectura

```
User → CloudFront (CDN) → S3 (Static Files)
```

## Paso 1: Crear el bucket de S3

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## Paso 2: Compilar y subir

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

## Paso 3: Crear la distribución de CloudFront

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

O usa la consola de AWS:

1. Ve a CloudFront → Create distribution
2. Origin domain: selecciona tu bucket de S3
3. Activa "Origin Access Control"
4. Default root object: `index.html`
5. Crea la distribución

## Paso 3b: Política de cabeceras de respuesta (necesaria para LibreOffice WASM)

Las conversiones basadas en LibreOffice (Word, Excel, PowerPoint a PDF) requieren `SharedArrayBuffer`, que necesita cabeceras de respuesta específicas. Crea una Response Headers Policy de CloudFront:

1. Ve a CloudFront → Policies → Response headers
2. Crea una política personalizada con estas cabeceras:

| Cabecera                       | Valor          |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. Asocia la política al comportamiento de caché predeterminado de tu distribución

O mediante la CLI:

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

## Paso 3c: Metadatos de S3 para los archivos WASM precomprimidos

Los archivos WASM de LibreOffice están precomprimidos (`.wasm.gz`, `.data.gz`). Define el Content-Type y el Content-Encoding correctos para que los navegadores los descompriman:

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
Sin la política de cabeceras de respuesta, `SharedArrayBuffer` no está disponible y las conversiones de LibreOffice WASM se quedarán colgadas en torno al 55 %. Sin el Content-Encoding correcto en los archivos `.gz`, el navegador recibe bytes gzip sin procesar y la compilación de WASM falla.
:::

## Paso 4: Política del bucket de S3

Permite que CloudFront acceda al bucket:

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

## Paso 5: Páginas de error personalizadas

Configura el 404 para que devuelva `index.html` y funcione el enrutamiento SPA:

1. CloudFront → Error pages
2. Crea una respuesta de error personalizada:
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200

## Estimación de costes

| Recurso                            | Coste estimado |
| ---------------------------------- | -------------- |
| Almacenamiento S3 (~500MB)         | ~$0.01/mes     |
| CloudFront (1TB de transferencia)  | ~$85/mes       |
| CloudFront (10GB de transferencia) | ~$0.85/mes     |

::: tip
Usa S3 Intelligent Tiering para optimizar costes en archivos a los que se accede con poca frecuencia.
:::

## Automatización con Terraform

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
