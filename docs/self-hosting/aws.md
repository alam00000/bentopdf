# Deploy to AWS S3 + CloudFront

Host BentoPDF on AWS for maximum control and scalability.

## Architecture

```
User → CloudFront (CDN) → S3 (Static Files)
```

## Step 1: Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://your-bentopdf-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bentopdf-bucket \
  --index-document index.html \
  --error-document index.html
```

## Step 2: Build and Upload

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
```

## Step 3: Create CloudFront Distribution

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bentopdf-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

Or use the AWS Console:

1. Go to CloudFront → Create distribution
2. Origin domain: Select your S3 bucket
3. Enable "Origin Access Control"
4. Default root object: `index.html`
5. Create distribution

## Step 3b: Response Headers Policy (Required for LibreOffice WASM)

LibreOffice-based conversions (Word, Excel, PowerPoint to PDF) require `SharedArrayBuffer`, which needs specific response headers. Create a CloudFront Response Headers Policy:

1. Go to CloudFront → Policies → Response headers
2. Create a custom policy with these headers:

| Header                         | Value          |
| ------------------------------ | -------------- |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy`   | `same-origin`  |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

3. Attach the policy to your distribution's default cache behavior

Or via CLI:

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

## Step 3c: S3 Metadata for Pre-Compressed WASM Files

The LibreOffice WASM files are pre-compressed (`.wasm.gz`, `.data.gz`). Set the correct Content-Type and Content-Encoding so browsers decompress them:

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
Without the response headers policy, `SharedArrayBuffer` is unavailable and LibreOffice WASM conversions will hang at ~55%. Without the correct Content-Encoding on the `.gz` files, the browser receives raw gzip bytes and WASM compilation fails.
:::

## Step 4: S3 Bucket Policy

Allow CloudFront to access the bucket:

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

## Step 5: Custom Error Pages

Configure 404 to return `index.html` for SPA routing:

1. CloudFront → Error pages
2. Create custom error response:
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200

## Cost Estimation

| Resource                   | Estimated Cost |
| -------------------------- | -------------- |
| S3 Storage (~500MB)        | ~$0.01/month   |
| CloudFront (1TB transfer)  | ~$85/month     |
| CloudFront (10GB transfer) | ~$0.85/month   |

::: tip
Use S3 Intelligent Tiering for cost optimization on infrequently accessed files.
:::

## Automation with Terraform

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
