# Deploy to Pethost

[Pethost](https://pethost.dev) has a one-click template for BentoPDF. It runs the `bentopdf-simple` Docker image at its own address with HTTPS.

## Deploy

1. Open the [BentoPDF template on Pethost](https://pethost.dev/templates/bentopdf/) and click **Deploy on Pethost**.
2. Sign in and click **Create project**. The template asks for nothing.
3. Open the project's address once the deploy finishes, usually within a minute.

## What the Template Runs

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:v2.8.8
    restart: unless-stopped
```

The image serves the self-hosted build on port 8080 with the `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers the tools need, and Pethost's proxy passes them through unchanged. Files are processed in the visitor's browser and never reach the server.

To update BentoPDF, change the image tag in the project's `compose.yaml` and deploy the project again.
