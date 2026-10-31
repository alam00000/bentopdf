# Implantação na AWS S3 + CloudFront

Hospede o BentoPDF na AWS para ter o máximo de controle e escalabilidade.

## Arquitetura

```
User → CloudFront (CDN) → S3 (Static Files)
```

## Passo 1: Crie o Bucket S3

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## Passo 2: Compile e Envie

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

## Passo 3: Crie a Distribuição do CloudFront

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

Ou use o Console da AWS:

1. Vá para CloudFront → Create distribution
2. Origin domain: selecione seu bucket S3
3. Ative "Origin Access Control"
4. Default root object: `index.html`
5. Crie a distribuição

## Passo 3b: Política de Cabeçalhos de Resposta (Necessária para o LibreOffice WASM)

As conversões baseadas no LibreOffice (Word, Excel e PowerPoint para PDF) exigem `SharedArrayBuffer`, que precisa de cabeçalhos de resposta específicos. Crie uma Response Headers Policy no CloudFront:

1. Vá para CloudFront → Policies → Response headers
2. Crie uma política personalizada com estes cabeçalhos:

| Cabeçalho                      | Valor          |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. Anexe a política ao comportamento de cache padrão da sua distribuição

Ou pela CLI:

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

## Passo 3c: Metadados do S3 para Arquivos WASM Pré-Comprimidos

Os arquivos WASM do LibreOffice são pré-comprimidos (`.wasm.gz`, `.data.gz`). Defina o Content-Type e o Content-Encoding corretos para que os navegadores os descomprimam:

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
Sem a política de cabeçalhos de resposta, o `SharedArrayBuffer` fica indisponível e as conversões do LibreOffice WASM travam em ~55%. Sem o Content-Encoding correto nos arquivos `.gz`, o navegador recebe bytes gzip brutos e a compilação do WASM falha.
:::

## Passo 4: Política do Bucket S3

Permita que o CloudFront acesse o bucket:

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

## Passo 5: Páginas de Erro Personalizadas

Configure o 404 para retornar `index.html` no roteamento SPA:

1. CloudFront → Error pages
2. Crie uma resposta de erro personalizada:
   - Código de erro HTTP: 404
   - Caminho da página de resposta: `/index.html`
   - Código de resposta HTTP: 200

## Estimativa de Custos

| Recurso                            | Custo Estimado |
| ---------------------------------- | -------------- |
| Armazenamento S3 (~500MB)          | ~$0,01/mês     |
| CloudFront (1TB de transferência)  | ~$85/mês       |
| CloudFront (10GB de transferência) | ~$0,85/mês     |

::: tip
Use o S3 Intelligent Tiering para otimizar custos de arquivos acessados com pouca frequência.
:::

## Automação com Terraform

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
