# AWS S3 + CloudFront에 배포하기

최대한의 제어와 확장성을 위해 AWS에서 BentoPDF를 호스팅하세요.

## 아키텍처

```
User → CloudFront (CDN) → S3 (Static Files)
```

## 1단계: S3 버킷 만들기

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## 2단계: 빌드 및 업로드

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

## 3단계: CloudFront 배포 만들기

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

또는 AWS 콘솔을 사용하세요:

1. CloudFront → Create distribution으로 이동합니다
2. Origin domain: S3 버킷을 선택합니다
3. "Origin Access Control"을 활성화합니다
4. Default root object: `index.html`
5. 배포를 만듭니다

## 3b단계: 응답 헤더 정책 (LibreOffice WASM에 필수)

LibreOffice 기반 변환(Word, Excel, PowerPoint를 PDF로)에는 `SharedArrayBuffer`가 필요하며, 이를 위해 특정 응답 헤더가 필요합니다. CloudFront 응답 헤더 정책을 만드세요:

1. CloudFront → Policies → Response headers로 이동합니다
2. 다음 헤더로 사용자 지정 정책을 만듭니다:

| 헤더                           | 값             |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. 정책을 배포의 기본 캐시 동작에 연결합니다

또는 CLI로:

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

## 3c단계: 미리 압축된 WASM 파일의 S3 메타데이터

LibreOffice WASM 파일은 미리 압축되어 있습니다 (`.wasm.gz`, `.data.gz`). 브라우저가 압축을 풀 수 있도록 올바른 Content-Type과 Content-Encoding을 설정하세요:

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

::: warning 중요
응답 헤더 정책이 없으면 `SharedArrayBuffer`를 사용할 수 없고 LibreOffice WASM 변환이 약 55%에서 멈춥니다. `.gz` 파일에 올바른 Content-Encoding이 없으면 브라우저가 원시 gzip 바이트를 받게 되어 WASM 컴파일이 실패합니다.
:::

## 4단계: S3 버킷 정책

CloudFront가 버킷에 접근할 수 있도록 허용합니다:

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

## 5단계: 사용자 지정 오류 페이지

SPA 라우팅을 위해 404가 `index.html`을 반환하도록 설정하세요:

1. CloudFront → Error pages
2. 사용자 지정 오류 응답을 만듭니다:
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200

## 비용 예상

| 리소스                 | 예상 비용 |
| ---------------------- | --------- |
| S3 스토리지 (~500MB)   | ~$0.01/월 |
| CloudFront (1TB 전송)  | ~$85/월   |
| CloudFront (10GB 전송) | ~$0.85/월 |

::: tip
자주 접근하지 않는 파일의 비용을 최적화하려면 S3 Intelligent Tiering을 사용하세요.
:::

## Terraform으로 자동화

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
